// ============================================================
// O.P.V.I.S. Bridge — Install Command
// Install applications automatically on Windows, macOS, or Linux
// ============================================================

import chalk from 'chalk';
import ora from 'ora';
import { logger } from '../utils/logger.js';
import { executeInstall, detectPackageManager, APP_DICTIONARY } from '../utils/installer.js';

export async function installCommand(appName: string) {
  logger.header('OPVIS Bridge — Install Application');
  logger.keyValue('Target Application', appName);
  
  const key = appName.toLowerCase().trim();
  if (APP_DICTIONARY[key]) {
    logger.keyValue('Known App Preset', APP_DICTIONARY[key].label);
  }
  
  const pm = detectPackageManager();
  if (pm) {
    logger.keyValue('Detected Package Engine', `${pm.name} (${pm.command})`);
  } else {
    logger.error('No supported package manager found (winget, choco, scoop, brew, apt, dnf).');
    logger.footer();
    return;
  }
  
  logger.footer();

  const spinner = ora(`Installing "${appName}" using ${pm.name}...`).start();

  try {
    const result = await executeInstall(appName);
    if (result.success) {
      spinner.succeed(chalk.green(`Successfully installed "${appName}"!`));
      console.log(chalk.gray(`  [✔] ${result.message}`));
    } else {
      spinner.fail(chalk.red(`Failed to install "${appName}"`));
      console.log(chalk.yellow(`  [!] ${result.message}`));
      console.log(chalk.cyan(`  💡 Tip: Try running 'opvis repair ${appName}' to diagnose and fix installation issues.`));
    }
  } catch (err: any) {
    spinner.fail(chalk.red(`Installation error: ${err.message}`));
  }
}
