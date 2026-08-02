// ============================================================
// O.P.V.I.S. Bridge — Open Command (Launch Applications & URLs)
// ============================================================

import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { launchApp } from '../utils/appLauncher.js';

export async function openCommand(appNameOrUrl: string) {
  logger.header('OPVIS Bridge — Launch Application');
  logger.keyValue('Target App / URL', appNameOrUrl);
  logger.footer();

  console.log(chalk.cyan(`  [🚀 LAUNCHING] ${appNameOrUrl}...\n`));

  const result = await launchApp(appNameOrUrl);

  if (result.success) {
    logger.success(result.message);
  } else {
    logger.error(`Failed to launch "${appNameOrUrl}": ${result.message}`);
  }
}
