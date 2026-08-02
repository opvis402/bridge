// ============================================================
// O.P.V.I.S. Bridge — Connect Command (Interactive Agent + Daemon)
// ============================================================

import os from 'os';
import ora from 'ora';
import chalk from 'chalk';
import readline from 'readline';
import { exec } from 'child_process';
import { logger } from '../utils/logger.js';
import { saveConfig, getEndpoint } from '../utils/auth.js';
import { launchApp } from '../utils/appLauncher.js';

interface ConnectOptions {
  apiKey: string;
  endpoint?: string;
  name?: string;
}

export async function connectCommand(options: ConnectOptions) {
  const endpoint = getEndpoint(options);
  const machineName = options.name || os.hostname();

  logger.header('OPVIS Bridge — Connecting');
  logger.keyValue('Endpoint', endpoint);
  logger.keyValue('Machine', machineName);
  logger.keyValue('OS', `${os.platform()} ${os.arch()}`);
  logger.keyValue('Node.js', process.version);
  logger.footer();

  const spinner = ora({
    text: chalk.cyan('Establishing secure connection to OPVIS Cloud...'),
    spinner: 'dots12',
    color: 'cyan',
  }).start();

  try {
    const res = await fetch(`${endpoint}/api/bridge/connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: options.apiKey,
        machine_name: machineName,
        os_info: `${os.platform()} ${os.arch()} | ${os.cpus()[0]?.model || 'Unknown CPU'} | ${Math.round(os.totalmem() / (1024 * 1024 * 1024))}GB RAM`,
      }),
    });

    const data = await res.json() as { success: boolean; data?: { bridge_id: string; status: string }; error?: string };

    if (!data.success) {
      spinner.fail(chalk.red('Connection failed'));
      logger.error(data.error || 'Unknown error');
      process.exit(1);
    }

    const bridgeId = data.data?.bridge_id || `bridge_${Date.now()}`;

    spinner.succeed(chalk.green('Bridge connected successfully!'));

    // Save config
    saveConfig({
      api_key: options.apiKey,
      endpoint,
      machine_name: machineName,
      bridge_id: bridgeId,
    });

    logger.header('Connection Details');
    logger.keyValue('Bridge ID', bridgeId);
    logger.keyValue('Status', chalk.green('ONLINE (Daemon Active)'));
    logger.keyValue('Config saved', '~/.opvis/config.json');
    logger.footer();

    console.log(chalk.cyan('  [✓] Background listener active — Listening for remote commands from app.opvis.fun'));
    console.log(chalk.gray('  [i] Interactive Chat REPL ready below. Type any question or command (Ctrl+C to disconnect).\n'));

    // 1. Background Remote Command Polling Loop
    let isShuttingDown = false;
    const pollInterval = setInterval(async () => {
      if (isShuttingDown) return;
      try {
        const pollRes = await fetch(`${endpoint}/api/bridge/commands?bridge_id=${bridgeId}`);
        if (pollRes.ok) {
          const json: any = await pollRes.json();
          const commands = json.data?.commands || [];

          for (const item of commands) {
            console.log('\n' + chalk.yellow(`  [⚡ REMOTE COMMAND] `) + chalk.white(item.command));

            const cmdText = item.command.trim();

            if (cmdText.startsWith('open ') || cmdText.startsWith('launch ')) {
              const appTarget = cmdText.replace(/^(open|launch)\s+/, '');
              const launchRes = await launchApp(appTarget);

              await fetch(`${endpoint}/api/bridge/commands`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'update',
                  command_id: item.id,
                  output: launchRes.message,
                  exit_code: launchRes.success ? 0 : 1,
                  status: launchRes.success ? 'completed' : 'failed',
                }),
              });
              continue;
            }

            exec(cmdText, { maxBuffer: 10 * 1024 * 1024 }, async (err, stdout, stderr) => {
              const output = stdout + (stderr ? `\n[STDERR]\n${stderr}` : '');
              const exitCode = err ? (err.code || 1) : 0;
              const status = err ? 'failed' : 'completed';

              if (err) {
                console.log(chalk.red(`  [❌ FAILED] exit code ${exitCode}`));
              } else {
                console.log(chalk.green(`  [✅ COMPLETED]`));
              }

              try {
                await fetch(`${endpoint}/api/bridge/commands`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'update',
                    command_id: item.id,
                    output,
                    exit_code: exitCode,
                    status,
                  }),
                });
              } catch {}
            });
          }
        }
      } catch {}
    }, 2500);

    // 2. Heartbeat Ping Interval (keep alive in cloud)
    const heartbeatInterval = setInterval(async () => {
      if (isShuttingDown) return;
      try {
        await fetch(`${endpoint}/api/bridge/status`, {
          headers: { 'Authorization': `Bearer ${options.apiKey}` },
        });
      } catch {}
    }, 30000);

    // 3. Graceful Disconnect Function
    const handleExit = async () => {
      if (isShuttingDown) return;
      isShuttingDown = true;
      clearInterval(pollInterval);
      clearInterval(heartbeatInterval);

      console.log('\n');
      const disconnectSpinner = ora({
        text: chalk.yellow('Disconnecting bridge agent from OPVIS Cloud...'),
        spinner: 'dots12',
      }).start();

      try {
        await fetch(`${endpoint}/api/bridge/disconnect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bridge_id: bridgeId }),
        });
        disconnectSpinner.succeed(chalk.gray('Bridge agent disconnected gracefully.'));
      } catch {
        disconnectSpinner.stop();
      }

      process.exit(0);
    };

    process.on('SIGINT', handleExit);
    process.on('SIGTERM', handleExit);

    // 4. Interactive Terminal REPL Chat Loop
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.cyan.bold('OPVIS > '),
    });

    rl.prompt();

    rl.on('line', async (line) => {
      const input = line.trim();
      if (!input) {
        rl.prompt();
        return;
      }

      if (input.toLowerCase() === 'exit' || input.toLowerCase() === 'quit') {
        rl.close();
        await handleExit();
        return;
      }

      if (input.toLowerCase() === 'clear') {
        console.clear();
        rl.prompt();
        return;
      }

      // Handle 'open <app>' shortcut locally
      if (input.startsWith('open ') || input.startsWith('launch ')) {
        const appTarget = input.replace(/^(open|launch)\s+/, '');
        const res = await launchApp(appTarget);
        if (res.success) {
          console.log(chalk.green(`  ✓ ${res.message}`));
        } else {
          console.log(chalk.red(`  ✗ ${res.message}`));
        }
        rl.prompt();
        return;
      }

      rl.pause();

      const aiSpinner = ora({
        text: chalk.cyan('OPVIS AI is thinking...'),
        spinner: 'dots12',
        color: 'cyan',
      }).start();

      try {
        const chatRes = await fetch(`${endpoint}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${options.apiKey}`,
          },
          body: JSON.stringify({
            message: input,
            model: '@cf/meta/llama-3.1-70b-instruct',
            session_id: `cli_${bridgeId}`,
          }),
        });

        if (!chatRes.ok) {
          aiSpinner.fail(chalk.red('AI Query Failed'));
          console.log(chalk.red(`  HTTP error ${chatRes.status}`));
          return;
        }

        aiSpinner.stop();
        process.stdout.write(chalk.cyan('  OPVIS: '));

        const reader = chatRes.body?.getReader();
        const decoder = new TextDecoder();

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const l of lines) {
              if (l.startsWith('data: ')) {
                const data = l.slice(6);
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.response) {
                    process.stdout.write(chalk.white(parsed.response));
                  }
                } catch {
                  process.stdout.write(chalk.white(data));
                }
              }
            }
          }
          console.log('\n');
        }
      } catch (err: any) {
        aiSpinner.fail(chalk.red('Network error'));
        console.log(chalk.red(`  ${err.message}`));
      } finally {
        rl.resume();
        rl.prompt();
      }
    });

  } catch (err) {
    spinner.fail(chalk.red('Connection failed'));
    logger.error(`Network error: ${err instanceof Error ? err.message : 'Unknown'}`);
    process.exit(1);
  }
}
