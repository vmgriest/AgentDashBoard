import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import http from 'node:http';
import { upsertAgent, recordEvent, getAgents, getEvents, getEventById } from './db.js';

const PORT = process.env.PORT || 4000;

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

function broadcast(message) {
  const data = JSON.stringify(message);
  for (const client of wss.clients) {
    if (client.readyState === client.OPEN) {
      client.send(data);
    }
  }
}

const STATUS_BY_EVENT = {
  register: 'idle',
  task_started: 'running',
  tool_call: 'running',
  task_finished: 'idle',
  task_error: 'error',
  log: undefined, // keep current status
};

app.get('/api/agents', (req, res) => {
  res.json(getAgents());
});

app.get('/api/events', (req, res) => {
  const { agentId, limit } = req.query;
  res.json(getEvents({ agentId, limit: limit ? Number(limit) : undefined }));
});

app.post('/api/events', (req, res) => {
  const { agentId, agentName, type, message, payload, durationMs, currentTask } = req.body || {};

  if (!agentId || !type) {
    return res.status(400).json({ error: 'agentId and type are required' });
  }

  const now = Date.now();
  const status = STATUS_BY_EVENT[type] ?? 'idle';

  upsertAgent({
    id: agentId,
    name: agentName || agentId,
    status,
    currentTask: type === 'task_finished' || type === 'task_error' ? null : currentTask ?? message,
    lastSeen: now,
  });

  const eventId = recordEvent({
    agentId,
    agentName: agentName || agentId,
    type,
    message,
    payload,
    durationMs,
    timestamp: now,
  });

  const event = getEventById(eventId);
  const agent = getAgents().find((a) => a.id === agentId);

  broadcast({ type: 'event', data: event });
  broadcast({ type: 'agent', data: agent });

  res.status(201).json({ event, agent });
});

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'snapshot', data: { agents: getAgents(), events: getEvents({ limit: 50 }) } }));
});

server.listen(PORT, () => {
  console.log(`Agent dashboard server listening on http://localhost:${PORT}`);
});
