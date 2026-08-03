// ============================================================
// O.P.V.I.S. Bridge — Cross-Platform App Installer Utility
// Supports Windows (winget/choco/scoop), macOS (brew), Linux (apt/dnf/pacman)
// ============================================================

import { exec, execSync } from 'child_process';
import os from 'os';

export interface InstallResult {
  success: boolean;
  message: string;
  pkgManagerUsed?: string;
}

export type OSPlatform = 'win32' | 'darwin' | 'linux';

// Known app ID mappings for package managers
export const APP_DICTIONARY: Record<string, { win32?: string; darwin?: string; linux?: string; label: string }> = {
  git: { win32: 'Git.Git', darwin: 'git', linux: 'git', label: 'Git Version Control' },
  vscode: { win32: 'Microsoft.VisualStudioCode', darwin: 'visual-studio-code', linux: 'code', label: 'Visual Studio Code' },
  code: { win32: 'Microsoft.VisualStudioCode', darwin: 'visual-studio-code', linux: 'code', label: 'Visual Studio Code' },
  node: { win32: 'OpenJS.NodeJS', darwin: 'node', linux: 'nodejs', label: 'Node.js Runtime' },
  nodejs: { win32: 'OpenJS.NodeJS', darwin: 'node', linux: 'nodejs', label: 'Node.js Runtime' },
  python: { win32: 'Python.Python.3.12', darwin: 'python3', linux: 'python3', label: 'Python 3' },
  python3: { win32: 'Python.Python.3.12', darwin: 'python3', linux: 'python3', label: 'Python 3' },
  chrome: { win32: 'Google.Chrome', darwin: 'google-chrome', linux: 'google-chrome-stable', label: 'Google Chrome' },
  docker: { win32: 'Docker.DockerDesktop', darwin: 'docker', linux: 'docker.io', label: 'Docker Desktop' },
  ffmpeg: { win32: 'Gyan.FFmpeg', darwin: 'ffmpeg', linux: 'ffmpeg', label: 'FFmpeg Media Encoder' },
  '7zip': { win32: '7zip.7zip', darwin: 'sevenzip', linux: 'p7zip-full', label: '7-Zip Archiver' },
  '7z': { win32: '7zip.7zip', darwin: 'sevenzip', linux: 'p7zip-full', label: '7-Zip Archiver' },
  curl: { win32: 'cURL.cURL', darwin: 'curl', linux: 'curl', label: 'cURL Transfer Tool' },
  powershell: { win32: 'Microsoft.PowerShell', darwin: 'powershell', linux: 'powershell', label: 'PowerShell Core' },
  vlc: { win32: 'VideoLAN.VLC', darwin: 'vlc', linux: 'vlc', label: 'VLC Media Player' },
};

/**
 * Detect available package manager on system
 */
export function detectPackageManager(): { name: string; command: string } | null {
  const platform = os.platform();

  if (platform === 'win32') {
    try {
      execSync('winget --version', { stdio: 'ignore' });
      return { name: 'winget', command: 'winget' };
    } catch {}
    try {
      execSync('choco --version', { stdio: 'ignore' });
      return { name: 'chocolatey', command: 'choco' };
    } catch {}
    try {
      execSync('scoop --version', { stdio: 'ignore' });
      return { name: 'scoop', command: 'scoop' };
    } catch {}
  } else if (platform === 'darwin') {
    try {
      execSync('brew --version', { stdio: 'ignore' });
      return { name: 'homebrew', command: 'brew' };
    } catch {}
  } else if (platform === 'linux') {
    try {
      execSync('apt-get --version', { stdio: 'ignore' });
      return { name: 'apt', command: 'sudo apt-get' };
    } catch {}
    try {
      execSync('dnf --version', { stdio: 'ignore' });
      return { name: 'dnf', command: 'sudo dnf' };
    } catch {}
    try {
      execSync('pacman --version', { stdio: 'ignore' });
      return { name: 'pacman', command: 'sudo pacman' };
    } catch {}
  }

  return null;
}

/**
 * Build install command string for specified package manager & app
 */
export function buildInstallCommand(appName: string, pm: { name: string; command: string }): string {
  const platform = os.platform() as OSPlatform;
  const key = appName.toLowerCase().trim();
  const mapping = APP_DICTIONARY[key];
  const pkgId = (mapping && mapping[platform]) ? mapping[platform]! : appName;

  switch (pm.name) {
    case 'winget':
      return `winget install --id "${pkgId}" -e --accept-source-agreements --accept-package-agreements`;
    case 'chocolatey':
      return `choco install "${pkgId}" -y`;
    case 'scoop':
      return `scoop install "${pkgId}"`;
    case 'homebrew':
      return `brew install "${pkgId}"`;
    case 'apt':
      return `sudo apt-get update && sudo apt-get install -y "${pkgId}"`;
    case 'dnf':
      return `sudo dnf install -y "${pkgId}"`;
    case 'pacman':
      return `sudo pacman -S --noconfirm "${pkgId}"`;
    default:
      return `${pm.command} install "${pkgId}"`;
  }
}

/**
 * Build repair / reinstall command string
 */
export function buildRepairCommand(appName: string, pm: { name: string; command: string }): string {
  const platform = os.platform() as OSPlatform;
  const key = appName.toLowerCase().trim();
  const mapping = APP_DICTIONARY[key];
  const pkgId = (mapping && mapping[platform]) ? mapping[platform]! : appName;

  switch (pm.name) {
    case 'winget':
      return `winget install --id "${pkgId}" -e --force --accept-source-agreements --accept-package-agreements`;
    case 'chocolatey':
      return `choco reinstall "${pkgId}" -y`;
    case 'scoop':
      return `scoop reinstall "${pkgId}"`;
    case 'homebrew':
      return `brew reinstall "${pkgId}"`;
    case 'apt':
      return `sudo apt-get install --reinstall -y "${pkgId}"`;
    case 'dnf':
      return `sudo dnf reinstall -y "${pkgId}"`;
    case 'pacman':
      return `sudo pacman -S --noconfirm "${pkgId}"`;
    default:
      return `${pm.command} reinstall "${pkgId}"`;
  }
}

/**
 * Execute app installation with promise wrapper
 */
export function executeInstall(appName: string): Promise<InstallResult> {
  return new Promise((resolve) => {
    const pm = detectPackageManager();
    if (!pm) {
      return resolve({
        success: false,
        message: `No supported package manager found on this system (${os.platform()}). Please install winget/choco (Windows), homebrew (macOS), or apt/dnf (Linux).`,
      });
    }

    const cmd = buildInstallCommand(appName, pm);

    exec(cmd, { maxBuffer: 10 * 1024 * 1024 }, (err) => {
      if (err) {
        resolve({
          success: false,
          message: `Installation failed using ${pm.name}: ${err.message}`,
          pkgManagerUsed: pm.name,
        });
      } else {
        resolve({
          success: true,
          message: `Successfully installed "${appName}" via ${pm.name}!`,
          pkgManagerUsed: pm.name,
        });
      }
    });
  });
}
