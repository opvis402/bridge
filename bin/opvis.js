#!/usr/bin/env node

// ============================================================
// O.P.V.I.S. Bridge — CLI Entry Point
// Operation Programmable Virtual Intelligence System
// ============================================================

import { Command } from 'commander';
import chalk from 'chalk';
import { connectCommand } from '../dist/commands/connect.js';
import { chatCommand } from '../dist/commands/chat.js';
import { statusCommand } from '../dist/commands/status.js';
import { execCommand } from '../dist/commands/exec.js';
import { listenCommand } from '../dist/commands/listen.js';
import { keysCommand } from '../dist/commands/keys.js';
import { openCommand } from '../dist/commands/open.js';

const program = new Command();

// Dynamic Terminal Responsive Banner
function printBanner() {
  const termWidth = process.stdout.columns || 80;

  if (termWidth < 62) {
    // Compact clean header for narrow mobile/small terminals
    console.log(`
${chalk.cyan.bold('  O.P.V.I.S.')} ${chalk.yellow('— Tactical AI & CLI Machine Bridge')} ${chalk.gray('v1.0.2')}
${chalk.gray('  Operation Programmable Virtual Intelligence System')}
${chalk.cyan('  ' + '─'.repeat(Math.min(termWidth - 4, 52)))}
`);
  } else {
    // Cyberpunk boxed header for desktop/wide terminals
    console.log(`
${chalk.cyan('  ┌──────────────────────────────────────────────────────────┐')}
${chalk.cyan('  │')} ${chalk.cyan.bold('O.P.V.I.S.')} ${chalk.gray('— Operation Programmable Virtual Intelligence System')}  ${chalk.cyan('│')}
${chalk.cyan('  │')} ${chalk.yellow('Bridge Machine Agent')} ${chalk.gray('v1.0.2')} | ${chalk.green('Cloudflare Edge Matrix')}  ${chalk.cyan('│')}
${chalk.cyan('  └──────────────────────────────────────────────────────────┘')}
`);
  }
}

program
  .name('opvis')
  .description('O.P.V.I.S. Bridge — Local agent for connecting to OPVIS cloud')
  .version('1.0.2')
  .hook('preAction', () => {
    printBanner();
  });

// Connect command
program
  .command('connect')
  .description('Connect this machine to OPVIS cloud')
  .requiredOption('--api-key <key>', 'API key for authentication')
  .option('--endpoint <url>', 'OPVIS cloud endpoint', 'https://app.opvis.fun')
  .option('--name <name>', 'Machine name identifier')
  .action(connectCommand);

// Listen / Daemon Mode command
program
  .command('listen')
  .description('Run background daemon listener to receive & execute remote jobs from OPVIS cloud')
  .option('--api-key <key>', 'API key for authentication')
  .option('--endpoint <url>', 'OPVIS cloud endpoint', 'https://app.opvis.fun')
  .action(listenCommand);

// Open / App Launcher command
program
  .command('open')
  .description('Launch any application or URL on Windows, macOS, or Linux')
  .argument('<target>', 'Application name or URL (e.g. notepad, calc, chrome, vscode, explorer)')
  .action(openCommand);

// Keys command
program
  .command('keys')
  .description('Manage API keys directly from terminal')
  .argument('<action>', 'Action to perform: list | create')
  .option('--name <name>', 'Key identifier name')
  .option('--endpoint <url>', 'OPVIS cloud endpoint', 'https://app.opvis.fun')
  .action(keysCommand);

// Chat command
program
  .command('chat')
  .description('Chat with OPVIS Brain from terminal')
  .argument('<message>', 'Message to send to OPVIS')
  .option('--api-key <key>', 'API key for authentication')
  .option('--endpoint <url>', 'OPVIS cloud endpoint', 'https://app.opvis.fun')
  .option('--model <model>', 'AI model to use', '@cf/meta/llama-3.1-70b-instruct')
  .action(chatCommand);

// Status command
program
  .command('status')
  .description('Check OPVIS system and bridge status')
  .option('--api-key <key>', 'API key for authentication')
  .option('--endpoint <url>', 'OPVIS cloud endpoint', 'https://app.opvis.fun')
  .action(statusCommand);

// Exec command
program
  .command('exec')
  .description('Execute a shell command and stream output to OPVIS')
  .argument('<command>', 'Shell command to execute')
  .option('--api-key <key>', 'API key for authentication')
  .option('--endpoint <url>', 'OPVIS cloud endpoint', 'https://app.opvis.fun')
  .action(execCommand);

program.parse();
