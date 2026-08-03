// ============================================================
// O.P.V.I.S. Bridge — Styled Popup Approval Modal Utility
// Renders clean visual Approve/Reject modal box & System GUI Popups
// ============================================================

import readline from 'readline';
import { execSync } from 'child_process';
import os from 'os';
import chalk from 'chalk';

export interface PopupOptions {
  title?: string;
  useGuiFallback?: boolean;
}

/**
 * Display a styled Terminal Approve/Reject Popup Box Modal
 */
export function showApproveRejectPopup(message: string, options: PopupOptions = {}): Promise<boolean> {
  const title = options.title || 'OPVIS AUTHORIZATION POPUP';
  const width = Math.min(Math.max(message.length + 12, 58), 75);

  const topBorder = `  ╔${'═'.repeat(width - 2)}╗`;
  const midBorder = `  ╠${'═'.repeat(width - 2)}╣`;
  const bottomBorder = `  ╚${'═'.repeat(width - 2)}╝`;

  const padLine = (str: string) => {
    const spaceLeft = Math.max(width - 4 - str.length, 0);
    return `  ║ ${str}${' '.repeat(spaceLeft)} ║`;
  };

  const padCenter = (str: string) => {
    const totalPad = Math.max(width - 4 - str.length, 0);
    const padL = Math.floor(totalPad / 2);
    const padR = totalPad - padL;
    return `  ║ ${' '.repeat(padL)}${str}${' '.repeat(padR)} ║`;
  };

  console.log('\n' + chalk.cyan(topBorder));
  console.log(chalk.cyan(padCenter(chalk.bold.yellow(title))));
  console.log(chalk.cyan(midBorder));
  
  // Wrap message lines if long
  const msgLines = message.match(new RegExp(`.{1,${width - 6}}`, 'g')) || [message];
  msgLines.forEach((line) => {
    console.log(chalk.cyan(padLine(chalk.white(line))));
  });

  console.log(chalk.cyan(midBorder));
  
  const optionsLine = `${chalk.bgGreen.black.bold('  [ A ] APPROVE  ')}     ${chalk.bgRed.white.bold('  [ R ] REJECT  ')}`;
  console.log(chalk.cyan(padCenter(optionsLine)));
  console.log(chalk.cyan(bottomBorder));

  // Try System GUI Popup if desktop fallback requested
  if (options.useGuiFallback) {
    try {
      const guiResult = showSystemGuiPopup(title, message);
      if (guiResult !== null) {
        return Promise.resolve(guiResult);
      }
    } catch {}
  }

  // Interactive Readline Prompt
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const promptText = `  ${chalk.yellow('?')} Select Choice ${chalk.gray('(Press A for Approve / R for Reject)')} [A/r]: `;

  return new Promise((resolve) => {
    rl.question(promptText, (answer) => {
      rl.close();
      const clean = answer.trim().toLowerCase();
      if (clean === 'a' || clean === 'approve' || clean === 'y' || clean === 'yes' || clean === '') {
        console.log(`  ${chalk.green.bold('✔ AUTHORIZED:')} Action Approved by user.\n`);
        resolve(true);
      } else {
        console.log(`  ${chalk.red.bold('✖ REJECTED:')} Action Rejected by user.\n`);
        resolve(false);
      }
    });
  });
}

/**
 * Display Native OS Desktop GUI Popup Box (Windows, macOS, Linux)
 */
export function showSystemGuiPopup(title: string, message: string): boolean | null {
  const platform = os.platform();

  try {
    if (platform === 'win32') {
      const psScript = `
        Add-Type -AssemblyName System.Windows.Forms
        $result = [System.Windows.Forms.MessageBox]::Show("${message.replace(/"/g, '`"')}", "${title.replace(/"/g, '`"')}", [System.Windows.Forms.MessageBoxButtons]::YesNo, [System.Windows.Forms.MessageBoxIcon]::Question)
        if ($result -eq [System.Windows.Forms.DialogResult]::Yes) { exit 0 } else { exit 1 }
      `;
      execSync(`powershell -NoProfile -Command "${psScript.replace(/\n/g, ' ')}"`, { stdio: 'ignore' });
      return true;
    } else if (platform === 'darwin') {
      const osaScript = `display dialog "${message.replace(/"/g, '\\"')}" with title "${title.replace(/"/g, '\\"')}" buttons {"Reject", "Approve"} default button "Approve"`;
      const out = execSync(`osascript -e '${osaScript}'`, { encoding: 'utf8' });
      return out.includes('button returned:Approve');
    } else if (platform === 'linux') {
      execSync(`zenity --question --title="${title}" --text="${message}"`, { stdio: 'ignore' });
      return true;
    }
  } catch {
    return false;
  }

  return null;
}

export function confirmAction(question: string, defaultYes = false): Promise<boolean> {
  return showApproveRejectPopup(question, { title: 'OPVIS ACTION CONFIRMATION' });
}
