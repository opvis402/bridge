// ============================================================
// O.P.V.I.S. Bridge — System Diagnostic Command
// Scans environment readiness and application health
// ============================================================

import chalk from 'chalk';
import os from 'os';
import { logger } from '../utils/logger.js';
import { diagnoseApp } from '../utils/mindsetEngine.js';
import { detectPackageManager } from '../utils/installer.js';

export async function diagnoseCommand() {
  logger.header('OPVIS Bridge — Environment & System Health Scan');
  logger.keyValue('Host OS', `${os.type()} ${os.release()} (${os.arch()})`);
  logger.keyValue('CPUs', os.cpus().length.toString());
  logger.keyValue('Free Memory', `${(os.freemem() / (1024 * 1024 * 1024)).toFixed(2)} GB / ${(os.totalmem() / (1024 * 1024 * 1024)).toFixed(2)} GB`);
  
  const pm = detectPackageManager();
  logger.keyValue('Package Manager', pm ? `${pm.name} (${pm.command})` : chalk.red('None detected'));
  logger.footer();

  console.log(chalk.cyan(`\n  [🔍 SCANNING ENVIRONMENT] Checking critical developer tools...\n`));

  const appsToScan = ['node', 'git', 'python', 'powershell', 'code', 'docker', 'ffmpeg', 'curl'];
  const summary: Array<{ app: string; status: string; details: string }> = [];

  for (const app of appsToScan) {
    const report = await diagnoseApp(app);
    let statusStr = '';
    let detailsStr = '';

    if (report.executionWorking) {
      statusStr = chalk.green('HEALTHY');
      detailsStr = report.version || 'Operational';
    } else if (report.binaryFound) {
      statusStr = chalk.yellow('PATH / EXEC ERROR');
      detailsStr = `Binary found at ${report.binaryPath}`;
    } else {
      statusStr = chalk.gray('NOT INSTALLED');
      detailsStr = 'Run opvis install ' + app;
    }

    summary.push({ app, status: statusStr, details: detailsStr });
  }

  // Display Table-like summary output
  console.log(`  ${chalk.bold('APP NAME').padEnd(15)} ${chalk.bold('STATUS').padEnd(25)} ${chalk.bold('DETAILS')}`);
  console.log(`  ${'─'.repeat(60)}`);

  for (const item of summary) {
    console.log(`  ${chalk.cyan(item.app.padEnd(13))} ${item.status.padEnd(28)} ${chalk.gray(item.details)}`);
  }

  console.log(`\n  ${chalk.gray('💡 Tip: Run')} ${chalk.cyan('opvis repair <app>')} ${chalk.gray('to repair any broken application.')}\n`);
}
