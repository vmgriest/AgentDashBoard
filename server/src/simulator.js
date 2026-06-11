const API = process.env.DASHBOARD_API || 'http://localhost:4000/api/events';

const AGENTS = [
  { id: 'agent-builder', name: 'Builder' },
  { id: 'agent-researcher', name: 'Researcher' },
  { id: 'agent-reviewer', name: 'Reviewer' },
];

const TASKS = [
  'Implement user authentication',
  'Summarize quarterly report',
  'Refactor payment module',
  'Write integration tests',
  'Investigate flaky CI job',
  'Generate release notes',
];

const TOOLS = [
  { tool: 'file_reader', input: 'src/app.js' },
  { tool: 'file_writer', input: 'src/auth.js' },
  { tool: 'web_search', input: 'best practices for JWT auth' },
  { tool: 'shell', input: 'npm test' },
  { tool: 'code_search', input: 'TODO' },
];

function send(body) {
  return fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch((err) => console.error('Failed to send event:', err.message));
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runAgentCycle(agent) {
  await send({ agentId: agent.id, agentName: agent.name, type: 'register', message: 'Agent online' });

  const task = pick(TASKS);
  await send({
    agentId: agent.id,
    agentName: agent.name,
    type: 'task_started',
    message: task,
    currentTask: task,
  });

  const toolCalls = 1 + Math.floor(Math.random() * 3);
  for (let i = 0; i < toolCalls; i++) {
    await sleep(800 + Math.random() * 1200);
    const tool = pick(TOOLS);
    await send({
      agentId: agent.id,
      agentName: agent.name,
      type: 'tool_call',
      message: `Used ${tool.tool}`,
      currentTask: task,
      payload: { tool: tool.tool, input: tool.input, output: `${tool.tool} completed successfully` },
    });
  }

  await sleep(800 + Math.random() * 1200);
  const durationMs = 2000 + Math.floor(Math.random() * 8000);
  const failed = Math.random() < 0.15;

  if (failed) {
    await send({
      agentId: agent.id,
      agentName: agent.name,
      type: 'task_error',
      message: `Failed: ${task}`,
      durationMs,
      payload: { error: 'Unexpected error while completing task' },
    });
  } else {
    await send({
      agentId: agent.id,
      agentName: agent.name,
      type: 'task_finished',
      message: `Completed: ${task}`,
      durationMs,
      payload: { result: 'Task completed successfully' },
    });
  }
}

async function loop(agent) {
  while (true) {
    await runAgentCycle(agent);
    await sleep(1500 + Math.random() * 3000);
  }
}

console.log(`Simulating ${AGENTS.length} agents against ${API}`);
for (const agent of AGENTS) {
  loop(agent);
}
