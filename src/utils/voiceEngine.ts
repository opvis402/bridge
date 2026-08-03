// ============================================================
// O.P.V.I.S. Bridge — Voice & Speech Synthesis Streaming Engine
// Text-to-Speech & Voice Stream output for Windows, macOS, & Linux
// ============================================================

import { exec, execSync } from 'child_process';
import os from 'os';
import chalk from 'chalk';

export interface VoiceOptions {
  enabled?: boolean;
  rate?: number; // Speech rate (-10 to 10)
  volume?: number; // 0 to 100
}

/**
 * Text-to-Speech Engine for Windows, macOS, and Linux
 */
export function speakText(text: string, options: VoiceOptions = {}): Promise<void> {
  const platform = os.platform();
  const cleanText = text.replace(/[`"$]/g, '').trim();

  if (!cleanText) return Promise.resolve();

  return new Promise((resolve) => {
    try {
      if (platform === 'win32') {
        // Windows SAPI SpeechSynthesizer via PowerShell
        const rate = options.rate || 1;
        const volume = options.volume || 100;
        const script = `
          Add-Type -AssemblyName System.Speech;
          $synth = New-Object System.Speech.Synthesis.SpeechSynthesizer;
          $synth.Rate = ${rate};
          $synth.Volume = ${volume};
          $synth.Speak("${cleanText.replace(/"/g, '`"')}");
        `;
        exec(`powershell -NoProfile -Command "${script.replace(/\n/g, ' ')}"`, () => resolve());
      } else if (platform === 'darwin') {
        // macOS 'say' command
        exec(`say "${cleanText.replace(/"/g, '\\"')}"`, () => resolve());
      } else if (platform === 'linux') {
        // Linux 'spd-say' or 'espeak'
        exec(`spd-say "${cleanText.replace(/"/g, '\\"')}" || espeak "${cleanText.replace(/"/g, '\\"')}"`, () => resolve());
      } else {
        resolve();
      }
    } catch {
      resolve();
    }
  });
}

/**
 * Stream voice synthesis queue
 */
export class VoiceStreamPlayer {
  private queue: string[] = [];
  private isSpeaking = false;
  private enabled = true;

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  public enqueue(sentence: string) {
    if (!this.enabled) return;
    const cleaned = sentence.trim();
    if (cleaned.length > 0) {
      this.queue.push(cleaned);
      this.processQueue();
    }
  }

  private async processQueue() {
    if (this.isSpeaking || this.queue.length === 0) return;

    this.isSpeaking = true;
    const textToSpeak = this.queue.shift();

    if (textToSpeak) {
      process.stdout.write(chalk.dim(' 🔊'));
      await speakText(textToSpeak);
    }

    this.isSpeaking = false;
    this.processQueue();
  }

  public stop() {
    this.queue = [];
    this.isSpeaking = false;
  }
}
