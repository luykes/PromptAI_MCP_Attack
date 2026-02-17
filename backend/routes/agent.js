import { Router } from 'express';
import { spawn } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { broadcastLog } from './telemetry.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = join(__dirname, '..', '.runtime-config.json');
const AGENT_PATH = join(__dirname, '..', '..', 'agent', 'mcp_agent.py');
const AGENT_DIR = join(__dirname, '..', '..', 'agent');

// Use venv Python if it exists (has all deps installed), fall back to system python3
const VENV_PYTHON_UNIX = join(AGENT_DIR, 'venv', 'bin', 'python3');
const VENV_PYTHON_WIN  = join(AGENT_DIR, 'venv', 'Scripts', 'python.exe');
const PYTHON = existsSync(VENV_PYTHON_UNIX) ? VENV_PYTHON_UNIX
             : existsSync(VENV_PYTHON_WIN)  ? VENV_PYTHON_WIN
             : 'python3';

const router = Router();

function getConfiguredUsername() {
  try {
    if (existsSync(CONFIG_PATH)) {
      const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
      return config.username || 'anonymous';
    }
  } catch { /* ignore */ }
  return 'anonymous';
}

// Track running subprocesses so they can be killed on stop
const runningProcesses = { raw: null, protected: null };

function spawnAgent(target, username) {
  // Kill any existing process for this target
  if (runningProcesses[target]) {
    runningProcesses[target].kill('SIGTERM');
    runningProcesses[target] = null;
  }

  broadcastLog(target, 'SYSTEM', `Starting ${target.toUpperCase()} agent — running all 6 scenarios`);

  const proc = spawn(PYTHON, [
    AGENT_PATH,
    '--target', target,
    '--scenario', 'all',
    '--username', username,
  ]);

  runningProcesses[target] = proc;

  let buffer = '';

  proc.stdout.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop(); // keep any incomplete trailing line

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      try {
        const { level, message } = JSON.parse(trimmed);
        broadcastLog(target, level || 'SYSTEM', message || trimmed);
      } catch {
        // Non-JSON output — surface as SYSTEM message
        broadcastLog(target, 'SYSTEM', trimmed);
      }
    }
  });

  proc.stderr.on('data', (chunk) => {
    const msg = chunk.toString().trim();
    if (msg) {
      // Filter out Python/MCP verbose debug lines
      const skip = ['DEBUG', 'INFO', 'WARNING', 'httpx', 'asyncio'];
      if (!skip.some(s => msg.includes(s))) {
        broadcastLog(target, 'ERROR', msg);
      }
    }
  });

  proc.on('close', (code) => {
    runningProcesses[target] = null;
    if (code !== 0 && code !== null) {
      broadcastLog(target, 'ERROR', `Agent process exited with code ${code}`);
    }
  });

  proc.on('error', (err) => {
    runningProcesses[target] = null;
    broadcastLog(target, 'ERROR', `Failed to start agent: ${err.message}. Is python3 installed?`);
  });
}

// POST /api/agent/run — spawns both raw and protected agents in parallel
router.post('/run', (req, res) => {
  const username = getConfiguredUsername();

  spawnAgent('raw', username);
  spawnAgent('protected', username);

  res.json({ success: true, username, message: 'Both agents launched — running all 6 scenarios' });
});

// POST /api/agent/stop — kill running agent processes
router.post('/stop', (req, res) => {
  let stopped = 0;
  for (const target of ['raw', 'protected']) {
    if (runningProcesses[target]) {
      runningProcesses[target].kill('SIGTERM');
      runningProcesses[target] = null;
      broadcastLog(target, 'SYSTEM', 'Agent stopped by user');
      stopped++;
    }
  }
  res.json({ success: true, stopped });
});

export default router;
