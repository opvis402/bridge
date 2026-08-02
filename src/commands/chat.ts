// ============================================================
// O.P.V.I.S. Bridge — Chat Command
// ============================================================

import ora from 'ora';
import chalk from 'chalk';
import { logger } from '../utils/logger.js';
import { getApiKey, getEndpoint } from '../utils/auth.js';

interface ChatOptions {
  apiKey?: string;
  endpoint?: string;
  model?: string;
}

export async function chatCommand(message: string, options: ChatOptions) {
  const apiKey = getApiKey(options);
  const endpoint = getEndpoint(options);
  const model = options.model || '@cf/meta/llama-3.1-70b-instruct';

  if (!apiKey) {
    logger.error('No API key provided. Use --api-key or run `opvis connect` first.');
    process.exit(1);
  }

  logger.header('OPVIS Brain — Chat');
  logger.keyValue('Model', model.split('/').pop() || model);
  logger.keyValue('Endpoint', endpoint);
  logger.footer();

  console.log(chalk.hex('#ffb700')('  YOU: ') + chalk.white(message));
  console.log('');

  const spinner = ora({
    text: chalk.cyan('OPVIS is thinking...'),
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
        message,
        model,
        session_id: `cli_${Date.now()}`,
      }),
    });

    if (!res.ok) {
      const err = await res.json() as { error?: string };
      spinner.fail(chalk.red('Request failed'));
      logger.error(err.error || `HTTP ${res.status}`);
      process.exit(1);
    }

    spinner.stop();

    process.stdout.write(chalk.cyan('  OPVIS: '));

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();

    if (reader) {
      let fullResponse = '';
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
              if (parsed.response) {
                process.stdout.write(chalk.white(parsed.response));
                fullResponse += parsed.response;
              }
            } catch {
              // Raw text
              process.stdout.write(chalk.white(data));
              fullResponse += data;
            }
          }
        }
      }

      console.log('\n');
      logger.separator();
      logger.info(`Response length: ${fullResponse.length} characters`);
    }

  } catch (err) {
    spinner.fail(chalk.red('Chat failed'));
    logger.error(`Error: ${err instanceof Error ? err.message : 'Unknown'}`);
    process.exit(1);
  }
}
