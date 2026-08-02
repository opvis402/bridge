// ============================================================
// O.P.V.I.S. Bridge — Status Command
// ============================================================

import os from 'os';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { loadConfig, getApiKey, getEndpoint } from '../utils/auth.js';

interface StatusOptions {
  apiKey?: string;
  endpoint?: string;
}

export async function statusCommand(options: StatusOptions) {
  const config = loadConfig();
  const endpoint = getEndpoint(options);

  logger.header('OPVIS System Status');

  // Local info
  logger.keyValue('Machine', os.hostname());
  logger.keyValue('OS', `${os.platform()} ${os.arch()}`);
  logger.keyValue('CPU', os.cpus()[0]?.model || 'Unknown');
  logger.keyValue('Memory', `${Math.round(os.freemem() / (1024 * 1024 * 1024))}GB free / ${Math.round(os.totalmem() / (1024 * 1024 * 1024))}GB total`);
  logger.keyValue('Uptime', `${Math.round(os.uptime() / 3600)}h ${Math.round((os.uptime() % 3600) / 60)}m`);
  logger.keyValue('Node.js', process.version);

  logger.footer();

  // Config info
  logger.header('Bridge Configuration');
  logger.keyValue('Endpoint', endpoint);
  logger.keyValue('Bridge ID', config.bridge_id || chalk.yellow('Not connected'));
  logger.keyValue('API Key', config.api_key ? chalk.green('Configured') : chalk.red('Not set'));
  logger.keyValue('Machine Name', config.machine_name || chalk.yellow('Not set'));
  logger.footer();

  // Try to ping the server
  const apiKey = getApiKey(options);
  if (apiKey) {
    logger.info('Pinging OPVIS cloud...');

    try {
      const start = Date.now();
      const res = await fetch(`${endpoint}/api/bridge/status`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
      });
      const latency = Date.now() - start;

      if (res.ok) {
        logger.success(`Cloud connection: ${chalk.green('OK')} (${latency}ms)`);
      } else {
        logger.warn(`Cloud returned: HTTP ${res.status} (${latency}ms)`);
      }
    } catch (err) {
      logger.error(`Cloud unreachable: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  } else {
    logger.warn('No API key configured — skipping cloud ping');
  }
}
