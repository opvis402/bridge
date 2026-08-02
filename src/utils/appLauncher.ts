// ============================================================
// O.P.V.I.S. Bridge — Cross-Platform App Launcher Utility
// Supports Windows, Linux, & macOS
// ============================================================

import { exec, spawn } from 'child_process';
import os from 'os';

export interface LaunchResult {
  success: boolean;
  message: string;
}

export function launchApp(appNameOrPath: string): Promise<LaunchResult> {
  const platform = os.platform(); // 'win32', 'linux', 'darwin'
  const target = appNameOrPath.trim();

  return new Promise((resolve) => {
    if (platform === 'win32') {
      // Windows launching via 'start' command or direct spawn
      const cmd = `start "" "${target}"`;
      exec(cmd, { shell: 'cmd.exe' }, (err) => {
        if (err) {
          // Fallback to direct execution
          try {
            spawn(target, { detached: true, stdio: 'ignore' }).unref();
            resolve({ success: true, message: `Launched ${target} on Windows` });
          } catch (spawnErr: any) {
            resolve({ success: false, error: spawnErr.message || err.message } as any);
          }
        } else {
          resolve({ success: true, message: `Launched ${target} on Windows` });
        }
      });
    } else if (platform === 'darwin') {
      // macOS launching via 'open'
      exec(`open -a "${target}" || open "${target}"`, (err) => {
        if (err) {
          resolve({ success: false, message: err.message });
        } else {
          resolve({ success: true, message: `Launched ${target} on macOS` });
        }
      });
    } else {
      // Linux launching via 'xdg-open' or background nohup
      exec(`xdg-open "${target}" || nohup "${target}" >/dev/null 2>&1 &`, (err) => {
        if (err) {
          resolve({ success: false, message: err.message });
        } else {
          resolve({ success: true, message: `Launched ${target} on Linux` });
        }
      });
    }
  });
}
