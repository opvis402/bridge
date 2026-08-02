// ============================================================
// O.P.V.I.S. Bridge — Auth Utility
// ============================================================

import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.opvis');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

export interface OpvisConfig {
  api_key?: string;
  endpoint?: string;
  machine_name?: string;
  bridge_id?: string;
}

export function loadConfig(): OpvisConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const raw = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return {};
}

export function saveConfig(config: OpvisConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

export function getApiKey(options: { apiKey?: string }): string | null {
  if (options.apiKey) return options.apiKey;

  const config = loadConfig();
  return config.api_key || null;
}

export function getEndpoint(options: { endpoint?: string }): string {
  let ep = options.endpoint;

  if (!ep) {
    const config = loadConfig();
    ep = config.endpoint || 'https://app.opvis.fun';
  }

  return ep.replace(/\/+$/, '');
}
