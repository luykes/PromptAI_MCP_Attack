import { Router } from 'express';

const router = Router();

// In-memory SSE client registry
// Map: target ('raw' | 'protected') -> Set of response objects
export const sseClients = {
  raw: new Set(),
  protected: new Set(),
};

// Broadcast a log line to all connected SSE clients for a given target
export function broadcastLog(target, level, message) {
  const clients = sseClients[target];
  if (!clients) return;
  const data = JSON.stringify({ level, message, timestamp: new Date().toISOString() });
  for (const res of clients) {
    try {
      res.write(`data: ${data}\n\n`);
    } catch {
      clients.delete(res);
    }
  }
}

// GET /api/stream/raw — SSE stream for raw (vulnerable) agent
router.get('/raw', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  // Send heartbeat
  res.write(': connected\n\n');
  sseClients.raw.add(res);

  req.on('close', () => {
    sseClients.raw.delete(res);
  });
});

// GET /api/stream/protected — SSE stream for protected agent
router.get('/protected', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  res.write(': connected\n\n');
  sseClients.protected.add(res);

  req.on('close', () => {
    sseClients.protected.delete(res);
  });
});

export default router;
