// ============================================================
// O.P.V.I.S. Bridge — Repair Command
// Autonomous problem-solving & application repair engine
// ============================================================

import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { repairApp, diagnoseApp } from '../utils/mindsetEngine.js';

export async function repairCommand(appName?: string) {
  logger.header('OPVIS Bridge — Problem-Solving Repair Engine');
  const target = appName && appName.trim() ? appName.trim() : 'system';
  logger.keyValue('Repair Target', target);
  logger.footer();

  console.log(chalk.cyan(`\n  [🧠 MINDSET ACTIVATED] Analyzing & Repairing Target: ${target}\n`));

  if (target === 'system') {
    console.log(chalk.yellow(`  [!] System-wide repair mode selected. Checking core developer tools...\n`));
    const coreTools = ['git', 'node', 'python', 'powershell', 'vscode'];
    
    for (const tool of coreTools) {
      console.log(chalk.cyan(`\n  --- Inspecting ${tool.toUpperCase()} ---`));
      const diag = await diagnoseApp(tool);
      if (!diag.executionWorking) {
        console.log(chalk.yellow(`  [!] Tool ${tool} requires repair. Initiating mindset repair sequence...`));
        await repairApp(tool);
      } else {
        console.log(chalk.green(`  [✔] ${tool.toUpperCase()} is healthy (Version: ${diag.version || 'OK'})`));
      }
    }
    
    logger.success('System repair & health check completed!');
    return;
  }

  const result = await repairApp(target);

  if (result.success) {
    logger.success(result.message);
  } else {
    logger.error(result.message);
  }
}
