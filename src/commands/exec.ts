// ============================================================
// O.P.V.I.S. Bridge — Exec Command
// ============================================================

import { exec } from 'child_process';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';

interface ExecOptions {
  apiKey?: string;
  endpoint?: string;
}

export async function execCommand(command: string, options: ExecOptions) {
  logger.header('OPVIS Bridge — Execute');
  logger.keyValue('Command', command);
  logger.footer();

  logger.command(command);
  console.log('');

  return new Promise<void>((resolve) => {
    const child = exec(command, { maxBuffer: 10 * 1024 * 1024 });

    child.stdout?.on('data', (data: string) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          console.log(chalk.gray('  │ ') + chalk.white(line));
        }
      }
    });

    child.stderr?.on('data', (data: string) => {
      const lines = data.toString().split('\n');
      for (const line of lines) {
        if (line.trim()) {
          console.log(chalk.red('  │ ') + chalk.red(line));
        }
      }
    });

    child.on('close', (code: number | null) => {
      console.log('');
      if (code === 0) {
        logger.success(`Command completed with exit code ${code}`);
      } else {
        logger.error(`Command failed with exit code ${code}`);
      }
      resolve();
    });

    child.on('error', (err: Error) => {
      logger.error(`Execution error: ${err.message}`);
      resolve();
    });
  });
}
