import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'dashboard.db');

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS agents (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'idle',
    current_task TEXT,
    last_seen INTEGER NOT NULL,
    success_count INTEGER NOT NULL DEFAULT 0,
    error_count INTEGER NOT NULL DEFAULT 0,
    task_count INTEGER NOT NULL DEFAULT 0,
    total_duration_ms INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id TEXT NOT NULL,
    agent_name TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT,
    payload TEXT,
    duration_ms INTEGER,
    timestamp INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events (timestamp);
  CREATE INDEX IF NOT EXISTS idx_events_agent_id ON events (agent_id);
`);

const upsertAgentStmt = db.prepare(`
  INSERT INTO agents (id, name, status, current_task, last_seen, success_count, error_count, task_count, total_duration_ms)
  VALUES (@id, @name, @status, @currentTask, @lastSeen, 0, 0, 0, 0)
  ON CONFLICT(id) DO UPDATE SET
    name = @name,
    status = @status,
    current_task = @currentTask,
    last_seen = @lastSeen
`);

const insertEventStmt = db.prepare(`
  INSERT INTO events (agent_id, agent_name, type, message, payload, duration_ms, timestamp)
  VALUES (@agentId, @agentName, @type, @message, @payload, @durationMs, @timestamp)
`);

const incrementSuccessStmt = db.prepare(`
  UPDATE agents
  SET success_count = success_count + 1,
      task_count = task_count + 1,
      total_duration_ms = total_duration_ms + @durationMs
  WHERE id = @id
`);

const incrementErrorStmt = db.prepare(`
  UPDATE agents
  SET error_count = error_count + 1,
      task_count = task_count + 1,
      total_duration_ms = total_duration_ms + @durationMs
  WHERE id = @id
`);

export function upsertAgent({ id, name, status, currentTask, lastSeen }) {
  upsertAgentStmt.run({ id, name, status, currentTask: currentTask ?? null, lastSeen });
}

export function recordEvent({ agentId, agentName, type, message, payload, durationMs, timestamp }) {
  const info = insertEventStmt.run({
    agentId,
    agentName,
    type,
    message: message ?? null,
    payload: payload ? JSON.stringify(payload) : null,
    durationMs: durationMs ?? null,
    timestamp,
  });

  if (type === 'task_finished') {
    incrementSuccessStmt.run({ id: agentId, durationMs: durationMs ?? 0 });
  } else if (type === 'task_error') {
    incrementErrorStmt.run({ id: agentId, durationMs: durationMs ?? 0 });
  }

  return info.lastInsertRowid;
}

export function getAgents() {
  const rows = db.prepare('SELECT * FROM agents ORDER BY name').all();
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    status: row.status,
    currentTask: row.current_task,
    lastSeen: row.last_seen,
    successCount: row.success_count,
    errorCount: row.error_count,
    taskCount: row.task_count,
    avgDurationMs: row.task_count > 0 ? Math.round(row.total_duration_ms / row.task_count) : 0,
    successRate: row.task_count > 0 ? row.success_count / row.task_count : null,
  }));
}

export function getEvents({ agentId, limit = 100 } = {}) {
  const rows = agentId
    ? db.prepare('SELECT * FROM events WHERE agent_id = ? ORDER BY id DESC LIMIT ?').all(agentId, limit)
    : db.prepare('SELECT * FROM events ORDER BY id DESC LIMIT ?').all(limit);

  return rows.map(formatEvent).reverse();
}

export function formatEvent(row) {
  return {
    id: row.id,
    agentId: row.agent_id,
    agentName: row.agent_name,
    type: row.type,
    message: row.message,
    payload: row.payload ? JSON.parse(row.payload) : null,
    durationMs: row.duration_ms,
    timestamp: row.timestamp,
  };
}

export function getEventById(id) {
  const row = db.prepare('SELECT * FROM events WHERE id = ?').get(id);
  return row ? formatEvent(row) : null;
}
