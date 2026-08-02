// ============================================================
// O.P.V.I.S. Bridge — Listen Command (Daemon Mode)
// ============================================================

import { exec } from 'child_process';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { loadConfig, getEndpoint } from '../utils/auth.js';
import { launchApp } from '../utils/appLauncher.js';

interface ListenOptions {
  apiKey?: string;
  endpoint?: string;
}

export async function listenCommand(options: ListenOptions) {
  logger.header('OPVIS Bridge — Daemon Listener Active');
  
  const config = loadConfig();
  const endpoint = getEndpoint(options);
  const bridgeId = config.bridge_id;

  if (!bridgeId) {
    logger.error('No bridge_id found in config. Please run `opvis connect` first!');
    return;
  }

  logger.keyValue('Endpoint', endpoint);
  logger.keyValue('Bridge ID', bridgeId);
  logger.keyValue('Machine', config.machine_name || 'Workstation');
  logger.footer();

  console.log(chalk.cyan('  [+] Daemon listener active. Polling for remote execution jobs...\n'));

  // Polling loop
  const pollInterval = 2000;

  const poll = async () => {
    try {
      const res = await fetch(`${endpoint}/api/bridge/commands?bridge_id=${bridgeId}`);
      if (res.ok) {
        const json: any = await res.json();
        const commands = json.data?.commands || [];

        for (const item of commands) {
          console.log(chalk.yellow(`  [⚡ RUNNING REMOTE COMMAND] `) + chalk.white(item.command));

          const cmdText = item.command.trim();

          // If command is an application launch request
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

          // Standard shell command execution
          exec(cmdText, { maxBuffer: 10 * 1024 * 1024 }, async (err, stdout, stderr) => {
            const output = stdout + (stderr ? `\n[STDERR]\n${stderr}` : '');
            const exitCode = err ? (err.code || 1) : 0;
            const status = err ? 'failed' : 'completed';

            if (err) {
              console.log(chalk.red(`  [❌ FAILED] exit code ${exitCode}`));
            } else {
              console.log(chalk.green(`  [✅ COMPLETED]`));
            }

            // Post results back to cloud
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
            } catch (postErr: any) {
              console.log(chalk.red(`  [!] Failed to report status: ${postErr.message}`));
            }
          });
        }
      }
    } catch {
      // silent network retry
    }
  };

  setInterval(poll, pollInterval);
  await poll();
}
