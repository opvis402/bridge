// ============================================================
// O.P.V.I.S. Bridge — Voice & Speech Synthesis Streaming Engine
// Text-to-Speech & Voice Summary generator for Windows, macOS, & Linux
// ============================================================

import { exec } from 'child_process';
import os from 'os';

export interface VoiceOptions {
  enabled?: boolean;
  rate?: number; // Speech rate (-10 to 10)
  volume?: number; // 0 to 100
}

/**
 * Generate a clean, concise spoken summary of AI response (like web app voice summary)
 * Removes code blocks, URLs, markdown lists (1. 2. 3.), and technical headers
 */
export function createVoiceSummary(fullText: string): string {
  if (!fullText || !fullText.trim()) return '';

  let text = fullText;

  // 1. Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');

  // 2. Remove markdown links and URLs
  text = text.replace(/\[(.*?)\]\((https?:\/\/|\/)?.*?\)/g, '$1');
  text = text.replace(/https?:\/\/\S+/g, '');
  text = text.replace(/www\.\S+/g, '');

  // 3. Remove option headers and bold markers
  text = text
    .replace(/\*\*RECOMMENDATIONS\*\*/gi, '')
    .replace(/\*\*OPTION\s+\d+:?\s*/gi, '')
    .replace(/^#+\s+/gm, '')           // Headings # ## ###
    .replace(/\*\*(.*?)\*\*/g, '$1')   // **bold**
    .replace(/\*(.*?)\*/g, '$1')       // *italic*
    .replace(/`(.*?)`/g, '$1')         // `code`
    .replace(/^\s*\d+\.\s*/gm, '')     // Numbered lists 1. 2. 3.
    .replace(/^\s*[-*+]\s*/gm, '')     // Bullet lists - * +
    .replace(/[`"$]/g, '');            // Shell chars

  // 4. Split into clean non-empty sentences/paragraphs
  const paragraphs = text
    .split(/\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 5);

  if (paragraphs.length === 0) return '';

  // Take the first 2-3 clean lines as concise spoken summary
  let summary = paragraphs.slice(0, 3).join('. ');

  // Clean up punctuation and whitespace
  summary = summary.replace(/\.+/g, '.').replace(/\s+/g, ' ').trim();

  // Limit summary length to ~280 chars to ensure punchy, natural voice speech
  if (summary.length > 280) {
    const cut = summary.slice(0, 280);
    const lastDot = cut.lastIndexOf('.');
    summary = lastDot > 80 ? cut.slice(0, lastDot + 1) : cut + '.';
  }

  return summary;
}

/**
 * Text-to-Speech Engine for Windows, macOS, and Linux
 */
export function speakText(text: string, options: VoiceOptions = {}): Promise<void> {
  const platform = os.platform();
  const cleanText = createVoiceSummary(text);

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
 * Stream voice synthesis player
 */
export class VoiceStreamPlayer {
  private enabled = true;

  constructor(enabled = true) {
    this.enabled = enabled;
  }

  public async speakSummary(fullText: string) {
    if (!this.enabled) return;
    const summary = createVoiceSummary(fullText);
    if (summary) {
      await speakText(summary);
    }
  }

  public stop() {}
}
