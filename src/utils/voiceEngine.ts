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
 * Clean markdown tags and symbols for spoken audio
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText || !rawText.trim()) return '';

  return rawText
    .replace(/```[\s\S]*?```/g, '')     // Remove code blocks
    .replace(/\[(.*?)\]\((https?:\/\/|\/)?.*?\)/g, '$1') // Remove MD links
    .replace(/https?:\/\/\S+/g, '')     // Remove URLs
    .replace(/www\.\S+/g, '')           // Remove www URLs
    .replace(/\*\*RECOMMENDATIONS\*\*/gi, '')
    .replace(/\*\*OPTION\s+\d+:?\s*/gi, '')
    .replace(/^#+\s+/gm, '')           // Headings # ## ###
    .replace(/\*\*(.*?)\*\*/g, '$1')   // **bold**
    .replace(/\*(.*?)\*/g, '$1')       // *italic*
    .replace(/`(.*?)`/g, '$1')         // `code`
    .replace(/^\s*\d+\.\s*/gm, '')     // Numbered lists 1. 2. 3.
    .replace(/^\s*[-*+]\s*/gm, '')     // Bullet lists - * +
    .replace(/[`"$]/g, '')             // Shell chars
    .replace(/\s+/g, ' ')              // Normalize whitespace
    .trim();
}

/**
 * Generate a clean, concise spoken summary of long AI response (like web app voice summary)
 */
export function createVoiceSummary(fullText: string): string {
  const cleaned = cleanTextForSpeech(fullText);
  if (!cleaned) return '';

  // Split into clean sentences
  const sentences = cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  if (sentences.length === 0) return cleaned;

  // Take the first 2-3 sentences as concise spoken summary
  let summary = sentences.slice(0, 3).join(' ');

  // Limit summary length to ~280 chars to ensure punchy, natural voice speech
  if (summary.length > 280) {
    const cut = summary.slice(0, 280);
    const lastDot = cut.lastIndexOf('.');
    summary = lastDot > 50 ? cut.slice(0, lastDot + 1) : cut + '.';
  }

  return summary;
}

/**
 * Text-to-Speech Engine for Windows, macOS, and Linux
 */
export function speakText(text: string, options: VoiceOptions = {}): Promise<void> {
  const platform = os.platform();
  const cleanText = cleanTextForSpeech(text);

  if (!cleanText) return Promise.resolve();

  return new Promise((resolve) => {
    try {
      if (platform === 'win32') {
        // Windows SAPI.SpVoice COM Object via PowerShell (100% reliable execution)
        const safeText = cleanText.replace(/'/g, "''").replace(/[\r\n]+/g, ' ');
        const psCmd = `powershell -NoProfile -Command "(New-Object -ComObject SAPI.SpVoice).Speak('${safeText}')"`;
        exec(psCmd, () => resolve());
      } else if (platform === 'darwin') {
        // macOS 'say' command
        const safeText = cleanText.replace(/"/g, '\\"').replace(/[\r\n]+/g, ' ');
        exec(`say "${safeText}"`, () => resolve());
      } else if (platform === 'linux') {
        // Linux 'spd-say' or 'espeak'
        const safeText = cleanText.replace(/"/g, '\\"').replace(/[\r\n]+/g, ' ');
        exec(`spd-say "${safeText}" || espeak "${safeText}"`, () => resolve());
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
