import express from 'express';
import cors from 'cors';
import configRouter from './routes/config.js';
import agentRouter from './routes/agent.js';
import telemetryRouter from './routes/telemetry.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/config', configRouter);
app.use('/api/agent', agentRouter);  // POST /api/agent/run, POST /api/agent/stop
app.use('/api/stream', telemetryRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[BACKEND] API server running on http://localhost:${PORT}`);
});
