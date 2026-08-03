// ============================================================
// O.P.V.I.S. Bridge — Repair Command
// Autonomous problem-solving & application repair engine
// ============================================================

import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { repairApp, diagnoseApp } from '../utils/mindsetEngine.js';
import { confirmAction } from '../utils/prompt.js';

export async function repairCommand(appNameOrOptions?: string | { yes?: boolean }, optionsObj: { yes?: boolean } = {}) {
  let appName: string | undefined;
  let options: { yes?: boolean } = {};

  if (typeof appNameOrOptions === 'object' && appNameOrOptions !== null) {
    options = appNameOrOptions;
    appName = undefined;
  } else {
    appName = appNameOrOptions;
    options = optionsObj || {};
  }

  logger.header('OPVIS Bridge — Problem-Solving Repair Engine');
  const target = appName && appName.trim() ? appName.trim() : 'system';
  logger.keyValue('Repair Target', target);
  logger.footer();

  console.log(chalk.cyan(`\n  [🧠 MINDSET ACTIVATED] Analyzing & Repairing Target: ${target}\n`));

  if (target === 'system') {
    if (!options.yes) {
      const confirmed = await confirmAction('Do you approve running a system-wide diagnostic & repair check on core developer tools?');
      if (!confirmed) {
        console.log(chalk.yellow('\n  [!] System repair operation cancelled by user.\n'));
        return;
      }
    }

    console.log(chalk.yellow(`  [!] System-wide repair mode authorized. Checking core developer tools...\n`));
    const coreTools = ['git', 'node', 'python', 'powershell', 'vscode'];
    
    for (const tool of coreTools) {
      console.log(chalk.cyan(`\n  --- Inspecting ${tool.toUpperCase()} ---`));
      const diag = await diagnoseApp(tool);
      if (!diag.executionWorking) {
        console.log(chalk.yellow(`  [!] Tool ${tool} requires repair. Initiating mindset repair sequence...`));
        await repairApp(tool, options);
      } else {
        console.log(chalk.green(`  [✔] ${tool.toUpperCase()} is healthy (Version: ${diag.version || 'OK'})`));
      }
    }
    
    logger.success('System repair & health check completed!');
    return;
  }

  const result = await repairApp(target, options);

  if (result.success) {
    logger.success(result.message);
  } else {
    logger.error(result.message);
  }
}

