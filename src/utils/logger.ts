// ============================================================
// O.P.V.I.S. Bridge — Logger Utility
// ============================================================

import chalk from 'chalk';

export const logger = {
  info: (msg: string) => console.log(chalk.cyan('  ▸ ') + chalk.gray(msg)),
  success: (msg: string) => console.log(chalk.green('  ✓ ') + chalk.white(msg)),
  warn: (msg: string) => console.log(chalk.yellow('  ⚠ ') + chalk.yellow(msg)),
  error: (msg: string) => console.log(chalk.red('  ✗ ') + chalk.red(msg)),
  command: (msg: string) => console.log(chalk.hex('#ffb700')('  $ ') + chalk.white(msg)),
  separator: () => console.log(chalk.gray('  ─────────────────────────────────────────')),
  header: (title: string) => {
    console.log('');
    console.log(chalk.cyan('  ┌─ ') + chalk.bold.cyan(title));
    console.log(chalk.cyan('  │'));
  },
  footer: () => {
    console.log(chalk.cyan('  │'));
    console.log(chalk.cyan('  └─────────────────────────────────────'));
    console.log('');
  },
  keyValue: (key: string, value: string) => {
    console.log(chalk.cyan('  │ ') + chalk.gray(key.padEnd(18)) + chalk.white(value));
  },
};
