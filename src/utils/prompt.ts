// ============================================================
// O.P.V.I.S. Bridge — Desktop GUI & Terminal Popup Modal Utility
// Pops up clickable Native Windows/macOS/Linux Desktop Confirmation Window
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
 * Display Native OS Desktop GUI Popup Box (Windows, macOS, Linux)
 * Pops up a real clickable OS dialog window over all applications!
 */
export function showSystemGuiPopup(title: string, message: string): boolean {
  const platform = os.platform();
  const safeTitle = title.replace(/'/g, "''").replace(/[\r\n]+/g, ' ');
  const safeMsg = message.replace(/'/g, "''").replace(/[\r\n]+/g, ' ');

  if (platform === 'win32') {
    try {
      // Native Windows WScript.Shell Popup Window with Yes (6) and No (7) clickable buttons
      const cmd = `powershell -NoProfile -Command "if ((New-Object -ComObject WScript.Shell).Popup('${safeMsg}', 0, '${safeTitle}', 4 + 32) -eq 6) { exit 0 } else { exit 1 }"`;
      execSync(cmd, { stdio: 'ignore' });
      return true; // Clicked YES
    } catch {
      return false; // Clicked NO or closed window
    }
  } else if (platform === 'darwin') {
    try {
      const osaScript = `display dialog "${safeMsg.replace(/"/g, '\\"')}" with title "${safeTitle.replace(/"/g, '\\"')}" buttons {"Reject", "Approve"} default button "Approve"`;
      const out = execSync(`osascript -e '${osaScript}'`, { encoding: 'utf8' });
      return out.includes('button returned:Approve');
    } catch {
      return false;
    }
  } else if (platform === 'linux') {
    try {
      execSync(`zenity --question --title="${safeTitle}" --text="${safeMsg}"`, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Display a styled Terminal Approve/Reject Popup Box Modal or Desktop Window
 */
export function showApproveRejectPopup(message: string, options: PopupOptions = {}): Promise<boolean> {
  const title = options.title || 'OPVIS AUTHORIZATION POPUP';

  // 1. Try Desktop GUI Popup Window first (Windows WScript / macOS osascript / Linux Zenity)
  if (options.useGuiFallback !== false) {
    try {
      console.log(chalk.cyan(`\n  [🔔 DESKTOP POPUP WINDOW] Waiting for user approval on Desktop GUI Dialog...`));
      const approved = showSystemGuiPopup(title, message);
      if (approved) {
        console.log(`  ${chalk.green.bold('✔ AUTHORIZED:')} Action Approved by user via Desktop GUI Window.\n`);
        return Promise.resolve(true);
      } else {
        console.log(`  ${chalk.red.bold('✖ REJECTED:')} Action Rejected by user via Desktop GUI Window.\n`);
        return Promise.resolve(false);
      }
    } catch {}
  }

  // 2. Fallback to Styled Terminal Box if Desktop GUI is unavailable
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
  
  const msgLines = message.match(new RegExp(`.{1,${width - 6}}`, 'g')) || [message];
  msgLines.forEach((line) => {
    console.log(chalk.cyan(padLine(chalk.white(line))));
  });

  console.log(chalk.cyan(midBorder));
  
  const optionsLine = `${chalk.bgGreen.black.bold('  [ A ] APPROVE  ')}     ${chalk.bgRed.white.bold('  [ R ] REJECT  ')}`;
  console.log(chalk.cyan(padCenter(optionsLine)));
  console.log(chalk.cyan(bottomBorder));

  // Interactive Readline Prompt
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const promptText = `  ${chalk.yellow('?')} Select Choice ${chalk.gray('(Type A to Approve / R to Reject)')} [A/r]: `;

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

export function confirmAction(question: string, defaultYes = false): Promise<boolean> {
  return showApproveRejectPopup(question, { title: 'OPVIS ACTION CONFIRMATION', useGuiFallback: true });
}
