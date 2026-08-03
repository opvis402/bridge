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

// Known exact app ID mappings for package managers
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
  whatsapp: { win32: '9NKSQGP7F2NH', darwin: 'whatsapp', linux: 'whatsapp', label: 'WhatsApp Desktop' },
  telegram: { win32: 'Telegram.TelegramDesktop', darwin: 'telegram', linux: 'telegram-desktop', label: 'Telegram Desktop' },
  discord: { win32: 'Discord.Discord', darwin: 'discord', linux: 'discord', label: 'Discord' },
  spotify: { win32: 'Spotify.Spotify', darwin: 'spotify', linux: 'spotify', label: 'Spotify' },
  slack: { win32: 'SlackTechnologies.Slack', darwin: 'slack', linux: 'slack-desktop', label: 'Slack' },
  zoom: { win32: 'Zoom.Zoom', darwin: 'zoom', linux: 'zoom', label: 'Zoom' },
  notion: { win32: 'Notion.Notion', darwin: 'notion', linux: 'notion-app', label: 'Notion' },
  postman: { win32: 'Postman.Postman', darwin: 'postman', linux: 'postman', label: 'Postman' },
  obs: { win32: 'OBSProject.OBSStudio', darwin: 'obs', linux: 'obs-studio', label: 'OBS Studio' },
  brave: { win32: 'Brave.Brave', darwin: 'brave-browser', linux: 'brave-browser', label: 'Brave Browser' },
  edge: { win32: 'Microsoft.Edge', darwin: 'microsoft-edge', linux: 'microsoft-edge-stable', label: 'Microsoft Edge' },
  firefox: { win32: 'Mozilla.Firefox', darwin: 'firefox', linux: 'firefox', label: 'Mozilla Firefox' },
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
 * Build primary install command string
 */
export function buildInstallCommand(appName: string, pm: { name: string; command: string }): string {
  const platform = os.platform() as OSPlatform;
  const key = appName.toLowerCase().trim();
  const mapping = APP_DICTIONARY[key];
  const pkgId = (mapping && mapping[platform]) ? mapping[platform]! : appName;

  switch (pm.name) {
    case 'winget':
      return `winget install --id "${pkgId}" --accept-source-agreements --accept-package-agreements`;
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
 * Build fallback install command string if exact ID match fails
 */
export function buildFallbackInstallCommand(appName: string, pm: { name: string; command: string }): string {
  switch (pm.name) {
    case 'winget':
      return `winget install "${appName}" --accept-source-agreements --accept-package-agreements`;
    default:
      return buildInstallCommand(appName, pm);
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
      return `winget install --id "${pkgId}" --force --accept-source-agreements --accept-package-agreements`;
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
 * Execute app installation with fallback retry
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

    const primaryCmd = buildInstallCommand(appName, pm);

    exec(primaryCmd, { maxBuffer: 10 * 1024 * 1024 }, (err) => {
      if (!err) {
        return resolve({
          success: true,
          message: `Successfully installed "${appName}" via ${pm.name}!`,
          pkgManagerUsed: pm.name,
        });
      }

      // Try fallback fuzzy search command if primary ID match failed
      const fallbackCmd = buildFallbackInstallCommand(appName, pm);
      if (fallbackCmd === primaryCmd) {
        return resolve({
          success: false,
          message: `Installation failed using ${pm.name}: ${err.message}`,
          pkgManagerUsed: pm.name,
        });
      }

      exec(fallbackCmd, { maxBuffer: 10 * 1024 * 1024 }, (fallbackErr) => {
        if (!fallbackErr) {
          resolve({
            success: true,
            message: `Successfully installed "${appName}" via ${pm.name}!`,
            pkgManagerUsed: pm.name,
          });
        } else {
          resolve({
            success: false,
            message: `Installation failed using ${pm.name}: ${err.message}`,
            pkgManagerUsed: pm.name,
          });
        }
      });
    });
  });
}
