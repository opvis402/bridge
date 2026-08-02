// ============================================================
// O.P.V.I.S. Bridge — Safe Cross-Platform App Launcher Utility
// Supports Windows, Linux, & macOS with zero unhandled crash risk
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
    try {
      if (platform === 'win32') {
        // Windows launching via cmd shell
        exec(`start "" "${target}"`, { shell: 'cmd.exe' }, (err) => {
          if (err) {
            // Fallback: try direct spawn with error handler
            try {
              const child = spawn(target, [], { detached: true, stdio: 'ignore' });
              let resolved = false;

              child.on('error', (spawnErr) => {
                if (!resolved) {
                  resolved = true;
                  resolve({
                    success: false,
                    message: `Application "${target}" is not installed or not found in Windows PATH (${spawnErr.message})`,
                  });
                }
              });

              setTimeout(() => {
                if (!resolved) {
                  resolved = true;
                  try {
                    child.unref();
                  } catch {}
                  resolve({ success: true, message: `Launched ${target} on Windows` });
                }
              }, 120);
            } catch (spawnErr: any) {
              resolve({
                success: false,
                message: `Application "${target}" is not installed or not found in system PATH (${spawnErr.message || err.message})`,
              });
            }
          } else {
            resolve({ success: true, message: `Launched ${target} on Windows` });
          }
        });
      } else if (platform === 'darwin') {
        // macOS launching via 'open'
        exec(`open -a "${target}" || open "${target}"`, (err) => {
          if (err) {
            resolve({
              success: false,
              message: `Application "${target}" is not installed or could not be opened on macOS (${err.message})`,
            });
          } else {
            resolve({ success: true, message: `Launched ${target} on macOS` });
          }
        });
      } else {
        // Linux launching via 'xdg-open' or direct command
        exec(`which "${target}" || xdg-open "${target}"`, (err) => {
          if (err) {
            resolve({
              success: false,
              message: `Application "${target}" is not installed or not found in Linux PATH (${err.message})`,
            });
          } else {
            exec(`xdg-open "${target}" >/dev/null 2>&1 &`, () => {});
            resolve({ success: true, message: `Launched ${target} on Linux` });
          }
        });
      }
    } catch (globalErr: any) {
      resolve({
        success: false,
        message: `Failed to launch "${target}": ${globalErr.message || 'Unknown error'}`,
      });
    }
  });
}
