// ============================================================
// O.P.V.I.S. Bridge — Voice & Conversational Streaming Mode
// Interactive real-time voice & text chat session ("Ngobrol Saja")
// ============================================================

import readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';
import { logger } from '../utils/logger.js';
import { getApiKey, getEndpoint } from '../utils/auth.js';
import { VoiceStreamPlayer, speakText } from '../utils/voiceEngine.js';

interface VoiceOptions {
  apiKey?: string;
  endpoint?: string;
  model?: string;
  noVoice?: boolean;
}

export async function voiceCommand(options: VoiceOptions) {
  const apiKey = getApiKey(options);
  const endpoint = getEndpoint(options);
  const model = options.model || '@cf/meta/llama-3.1-70b-instruct';
  const voiceEnabled = !options.noVoice;

  if (!apiKey) {
    logger.error('No API key provided. Use --api-key or run `opvis connect` first.');
    process.exit(1);
  }

  logger.header('OPVIS Brain — Voice & Conversational Stream Mode');
  logger.keyValue('Session Type', 'Continuous Voice Stream ("Ngobrol")');
  logger.keyValue('Model Engine', model.split('/').pop() || model);
  logger.keyValue('Voice Synthesis', voiceEnabled ? chalk.green('ENABLED (OS Audio TTS)') : chalk.gray('DISABLED'));
  logger.footer();

  console.log(`
  ${chalk.cyan.bold('🎙 OPVIS VOICE STREAM ACTIVATED')}
  ${chalk.gray('Ketik pesan atau perintah untuk ngobrol secara alami (Ketik "exit" atau "quit" untuk keluar).')}
  ${chalk.cyan('──────────────────────────────────────────────────────')}
`);

  const player = new VoiceStreamPlayer(voiceEnabled);
  
  if (voiceEnabled) {
    await speakText('OPVIS Voice stream activated. System online.');
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const promptUser = () => {
    rl.question(`\n${chalk.hex('#ffb700').bold('  YOU 💬 > ')}`, async (input) => {
      const trimmed = input.trim();

      if (!trimmed) {
        promptUser();
        return;
      }

      if (trimmed.toLowerCase() === 'exit' || trimmed.toLowerCase() === 'quit') {
        console.log(`\n  ${chalk.cyan('[👋 OPVIS VOICE ENGINE DEACTIVATED] Goodbye!')}\n`);
        if (voiceEnabled) {
          await speakText('OPVIS Voice stream closed. Goodbye!');
        }
        rl.close();
        process.exit(0);
      }

      if (trimmed.toLowerCase() === 'clear') {
        console.clear();
        promptUser();
        return;
      }

      const spinner = ora({
        text: chalk.cyan('OPVIS is synthesizing thoughts...'),
        spinner: 'dots12',
        color: 'cyan',
      }).start();

      try {
        const res = await fetch(`${endpoint}/api/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            message: trimmed,
            model,
            session_id: `voice_${Date.now()}`,
          }),
        });

        if (!res.ok) {
          spinner.fail(chalk.red('Request failed'));
          const err = await res.json() as { error?: string };
          console.log(chalk.red(`  [!] Error: ${err.error || res.statusText}`));
          promptUser();
          return;
        }

        spinner.stop();

        process.stdout.write(`\n  ${chalk.cyan.bold('OPVIS 🤖 > ')}`);

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();

        let fullResponseText = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                try {
                  const parsed = JSON.parse(data);
                  const text = parsed.response || '';
                  process.stdout.write(chalk.white(text));
                  fullResponseText += text;
                } catch {
                  process.stdout.write(chalk.white(data));
                  fullResponseText += data;
                }
              }
            }
          }

          console.log('');

          if (voiceEnabled && fullResponseText.trim()) {
            await player.speakSummary(fullResponseText);
          }
        }
      } catch (err: any) {
        spinner.fail(chalk.red('Voice stream error'));
        console.log(chalk.red(`  [!] Error: ${err.message}`));
      }

      promptUser();
    });
  };

  promptUser();
}
