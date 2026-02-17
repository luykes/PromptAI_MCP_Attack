import { Router } from 'express';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, '..', '.runtime-config.json');

function loadConfig() {
  if (existsSync(CONFIG_PATH)) {
    try {
      return JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveConfig(data) {
  writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf8');
}

const router = Router();

// GET /api/config — returns current config (masked key)
router.get('/', (req, res) => {
  const config = loadConfig();
  const apiKey = config.promptSecurityApiKey || '';
  res.json({
    hasApiKey: apiKey.length > 0,
    maskedKey: apiKey ? `${apiKey.slice(0, 4)}${'*'.repeat(Math.max(0, apiKey.length - 8))}${apiKey.slice(-4)}` : '',
    promptSecurityApiUrl: config.promptSecurityApiUrl || 'https://apsouth.prompt.security/api/protect',
    username: config.username || '',
  });
});

// POST /api/config — save API key and settings
router.post('/', (req, res) => {
  const { promptSecurityApiKey, promptSecurityApiUrl, username } = req.body;
  const config = loadConfig();

  if (promptSecurityApiKey !== undefined) {
    config.promptSecurityApiKey = promptSecurityApiKey;
  }
  if (promptSecurityApiUrl !== undefined) {
    config.promptSecurityApiUrl = promptSecurityApiUrl;
  }
  if (username !== undefined) {
    config.username = username;
  }

  saveConfig(config);
  res.json({ success: true, message: 'Configuration saved' });
});

export default router;
