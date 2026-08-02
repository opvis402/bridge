// ============================================================
// O.P.V.I.S. Bridge — Connect Command
// ============================================================

import os from 'os';
import ora from 'ora';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { saveConfig, getEndpoint } from '../utils/auth.js';

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
    text: chalk.cyan('Establishing secure connection...'),
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

    spinner.succeed(chalk.green('Bridge connected successfully!'));

    // Save config
    saveConfig({
      api_key: options.apiKey,
      endpoint,
      machine_name: machineName,
      bridge_id: data.data?.bridge_id,
    });

    logger.header('Connection Details');
    logger.keyValue('Bridge ID', data.data?.bridge_id || 'N/A');
    logger.keyValue('Status', chalk.green(data.data?.status || 'connected'));
    logger.keyValue('Config saved', '~/.opvis/config.json');
    logger.footer();

    logger.success('Bridge is now online. OPVIS dashboard will show this connection.');

    // Start heartbeat
    logger.info('Starting heartbeat ping... (Ctrl+C to disconnect)');
    
    const heartbeat = setInterval(async () => {
      try {
        await fetch(`${endpoint}/api/bridge/status`, {
          headers: { 'Authorization': `Bearer ${options.apiKey}` },
        });
        process.stdout.write(chalk.cyan('.'));
      } catch {
        process.stdout.write(chalk.red('x'));
      }
    }, 30000);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      clearInterval(heartbeat);
      console.log('');
      logger.warn('Bridge disconnected');
      process.exit(0);
    });

  } catch (err) {
    spinner.fail(chalk.red('Connection failed'));
    logger.error(`Network error: ${err instanceof Error ? err.message : 'Unknown'}`);
    process.exit(1);
  }
}
