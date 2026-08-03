// ============================================================
// O.P.V.I.S. Bridge — Problem-Solving Mindset Diagnostic & Repair Engine
// Autonomous reasoning & troubleshooting pipeline for system applications
// ============================================================

import { exec, execSync } from 'child_process';
import os from 'os';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import { detectPackageManager, buildRepairCommand, APP_DICTIONARY } from './installer.js';
import { confirmAction, showApproveRejectPopup } from './prompt.js';

export interface DiagnosticReport {

  target: string;
  binaryFound: boolean;
  binaryPath?: string;
  inPath: boolean;
  version?: string;
  executionWorking: boolean;
  detectedIssues: string[];
  recommendedFixes: string[];
}

export interface RepairResult {
  success: boolean;
  stepsExecuted: string[];
  message: string;
}

/**
 * Tactical log formatter for Mindset Reasoning output
 */
export const mindsetLogger = {
  stage: (stageName: string) => {
    console.log(`\n  ${chalk.bgCyan.black.bold(` [MINDSET ENGINE] `)} ${chalk.cyan.bold(stageName)}`);
  },
  hypothesis: (msg: string) => {
    console.log(`  ${chalk.magenta('🧠 HYPOTHESIS:')} ${msg}`);
  },
  analysis: (msg: string) => {
    console.log(`  ${chalk.yellow('🔍 ANALYSIS:')} ${msg}`);
  },
  action: (msg: string) => {
    console.log(`  ${chalk.blue('⚡ ACTION PLAN:')} ${msg}`);
  },
  step: (index: number, msg: string) => {
    console.log(`  ${chalk.gray(`  [${index}]`)} ${msg}`);
  },
  success: (msg: string) => {
    console.log(`  ${chalk.green.bold('✔ SUCCESS:')} ${msg}`);
  },
  failure: (msg: string) => {
    console.log(`  ${chalk.red.bold('✖ REPAIR FAILED:')} ${msg}`);
  },
};

/**
 * Scan standard installation locations on Windows if binary is not in PATH
 */
function searchWindowsBinaryPaths(appName: string): string | null {
  const userHome = os.homedir();
  const programFiles = process.env['ProgramFiles'] || 'C:\\Program Files';
  const programFilesX86 = process.env['ProgramFiles(x86)'] || 'C:\\Program Files (x86)';
  const localAppData = process.env['LOCALAPPDATA'] || path.join(userHome, 'AppData', 'Local');

  const candidates: string[] = [
    path.join(programFiles, appName, `${appName}.exe`),
    path.join(programFilesX86, appName, `${appName}.exe`),
    path.join(localAppData, 'Programs', appName, `${appName}.exe`),
    path.join(localAppData, 'Microsoft', 'WindowsApps', `${appName}.exe`),
  ];

  if (appName.toLowerCase() === 'vscode' || appName.toLowerCase() === 'code') {
    candidates.push(path.join(localAppData, 'Programs', 'Microsoft VS Code', 'Code.exe'));
    candidates.push(path.join(programFiles, 'Microsoft VS Code', 'Code.exe'));
  }
  if (appName.toLowerCase() === 'git') {
    candidates.push(path.join(programFiles, 'Git', 'cmd', 'git.exe'));
    candidates.push(path.join(programFiles, 'Git', 'bin', 'git.exe'));
  }
  if (appName.toLowerCase() === 'node') {
    candidates.push(path.join(programFiles, 'nodejs', 'node.exe'));
  }
  if (appName.toLowerCase() === 'python') {
    candidates.push(path.join(localAppData, 'Programs', 'Python', 'Python312', 'python.exe'));
    candidates.push(path.join(localAppData, 'Programs', 'Python', 'Python311', 'python.exe'));
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

/**
 * Run comprehensive diagnostic scan on target application
 */
export async function diagnoseApp(appName: string): Promise<DiagnosticReport> {
  const platform = os.platform();
  const report: DiagnosticReport = {
    target: appName,
    binaryFound: false,
    inPath: false,
    executionWorking: false,
    detectedIssues: [],
    recommendedFixes: [],
  };

  // 1. Check if accessible via system PATH
  const checkCmd = platform === 'win32' ? `where "${appName}"` : `which "${appName}"`;
  try {
    const stdout = execSync(checkCmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    if (stdout) {
      report.inPath = true;
      report.binaryFound = true;
      report.binaryPath = stdout.split('\n')[0].trim();
    }
  } catch {
    report.inPath = false;
  }

  // 2. If not in PATH, search standard system directories (Windows)
  if (!report.binaryFound && platform === 'win32') {
    const foundPath = searchWindowsBinaryPaths(appName);
    if (foundPath) {
      report.binaryFound = true;
      report.binaryPath = foundPath;
      report.detectedIssues.push(`Binary exists at "${foundPath}" but is missing from system PATH.`);
      report.recommendedFixes.push(`Add "${path.dirname(foundPath)}" to system PATH environment variables.`);
    }
  }

  // 3. Test execution & fetch version
  if (report.binaryFound || report.inPath) {
    const execTarget = report.binaryPath || appName;
    try {
      const verOut = execSync(`"${execTarget}" --version`, { encoding: 'utf8', timeout: 5000 }).trim();
      report.executionWorking = true;
      report.version = verOut.split('\n')[0].trim();
    } catch (e: any) {
      try {
        const helpOut = execSync(`"${execTarget}" -h`, { encoding: 'utf8', timeout: 5000 }).trim();
        report.executionWorking = true;
        report.version = 'Executable responding to -h';
      } catch {
        report.executionWorking = false;
        report.detectedIssues.push(`Executable found at "${execTarget}" fails to run or throws crash error.`);
        report.recommendedFixes.push(`Reinstall or repair "${appName}" using native package manager.`);
      }
    }
  } else {
    report.detectedIssues.push(`Application "${appName}" was not found on this system.`);
    report.recommendedFixes.push(`Perform clean installation of "${appName}" via OPVIS installer.`);
  }

  return report;
}

/**
 * Execute Problem-Solving Repair Engine
 */
export async function repairApp(appName: string, options: { yes?: boolean } = {}): Promise<RepairResult> {
  const steps: string[] = [];

  mindsetLogger.stage(`DIAGNOSING TARGET: ${appName.toUpperCase()}`);
  mindsetLogger.hypothesis(`Analyzing failure mode for "${appName}"...`);

  const diag = await diagnoseApp(appName);

  if (diag.binaryFound) {
    mindsetLogger.analysis(`Binary discovered at "${diag.binaryPath}". In PATH: ${diag.inPath ? 'YES' : 'NO'}. Execution Working: ${diag.executionWorking ? 'YES' : 'NO'}`);
  } else {
    mindsetLogger.analysis(`Binary "${appName}" is completely missing from local system PATH and default directories.`);
  }

  if (diag.detectedIssues.length > 0) {
    diag.detectedIssues.forEach((issue) => mindsetLogger.analysis(`Detected Issue: ${issue}`));
  }

  mindsetLogger.stage('FORMULATING REPAIR STRATEGY');

  // Strategy 1: Reinstall/Repair package via Package Manager
  const pm = detectPackageManager();
  if (pm) {
    mindsetLogger.action(`Package Manager detected: [${pm.name}]. Preparing force reinstall/repair execution...`);

    const repairCmd = buildRepairCommand(appName, pm);
    mindsetLogger.step(1, `Command to execute: ${chalk.cyan(repairCmd)}`);

    // Interactive user approval check
    if (!options.yes) {
      const confirmed = await showApproveRejectPopup(`Repair Request: Execute force reinstall strategy for "${appName}" via [${pm.name}]`, {
        title: 'OPVIS REPAIR AUTHORIZATION POPUP',
        useGuiFallback: true,
      });
      if (!confirmed) {
        mindsetLogger.analysis('Repair operation cancelled by user approval policy.');
        return {
          success: false,
          stepsExecuted: steps,
          message: `Repair operation for "${appName}" was cancelled by user.`,
        };
      }
    }

    steps.push(`Executed package repair command: ${repairCmd}`);

    try {
      execSync(repairCmd, { stdio: 'inherit' });
      mindsetLogger.success(`Package repair command finished successfully.`);


      // Post-repair verification
      mindsetLogger.stage('VERIFYING REPAIR RESULT');
      const postDiag = await diagnoseApp(appName);
      if (postDiag.executionWorking || postDiag.binaryFound) {
        mindsetLogger.success(`Application "${appName}" has been successfully repaired and validated!`);
        return {
          success: true,
          stepsExecuted: steps,
          message: `Application "${appName}" repaired successfully via ${pm.name}.`,
        };
      }
    } catch (err: any) {
      mindsetLogger.failure(`Repair command via ${pm.name} encountered an error: ${err.message}`);
      steps.push(`Failed repair via ${pm.name}: ${err.message}`);
    }
  } else {
    mindsetLogger.failure(`No native package manager available for automated repair.`);
  }

  return {
    success: false,
    stepsExecuted: steps,
    message: `Could not automatically repair "${appName}". Manual intervention or package manager setup required.`,
  };
}
