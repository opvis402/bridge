// ============================================================
// O.P.V.I.S. Bridge — Keys Command
// ============================================================

import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { getEndpoint } from '../utils/auth.js';

interface KeysOptions {
  endpoint?: string;
  name?: string;
}

export async function keysCommand(action: string, options: KeysOptions) {
  const endpoint = getEndpoint(options);

  if (action === 'list') {
    logger.header('OPVIS Bridge — API Keys List');
    try {
      const res = await fetch(`${endpoint}/api/keys`);
      const json: any = await res.json();

      if (json.success && json.data?.keys) {
        const keys = json.data.keys;
        console.log(chalk.cyan(`  Found ${keys.length} API Keys:\n`));

        for (const k of keys) {
          console.log(chalk.yellow(`  • ${k.name}`));
          console.log(chalk.gray(`    Key: `) + chalk.green(k.key || k.key_hash || k.id));
          console.log(chalk.gray(`    Created: `) + new Date(k.created_at).toLocaleString());
          console.log('');
        }
      } else {
        logger.error(json.error || 'Failed to list keys');
      }
    } catch (err: any) {
      logger.error(`Network error: ${err.message}`);
    }
    logger.footer();
    return;
  }

  if (action === 'create') {
    logger.header('OPVIS Bridge — Generate New API Key');
    try {
      const name = options.name || `CLI Key ${Date.now()}`;
      const res = await fetch(`${endpoint}/api/keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const json: any = await res.json();

      if (json.success && json.data?.key) {
        const item = json.data.key;
        logger.success(`API Key generated successfully!`);
        logger.keyValue('Name', item.name);
        logger.keyValue('API Key', item.key);
        console.log(chalk.cyan(`\n  Connect command:`));
        console.log(chalk.green(`  npx @opvis/bridge connect --api-key ${item.key} --endpoint ${endpoint}`));
      } else {
        logger.error(json.error || 'Failed to generate key');
      }
    } catch (err: any) {
      logger.error(`Network error: ${err.message}`);
    }
    logger.footer();
    return;
  }

  console.log(chalk.red(`Unknown action "${action}". Use "opvis keys list" or "opvis keys create".`));
}
