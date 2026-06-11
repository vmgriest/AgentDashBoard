import { useState } from 'react';

const TYPE_META = {
  register: { icon: '🟢', label: 'online' },
  task_started: { icon: '▶️', label: 'started' },
  tool_call: { icon: '🔧', label: 'tool' },
  task_finished: { icon: '✅', label: 'done' },
  task_error: { icon: '❌', label: 'error' },
  log: { icon: '📝', label: 'log' },
};

function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString();
}

export default function EventItem({ event }) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[event.type] ?? { icon: '•', label: event.type };
  const hasDetails = event.payload || event.durationMs;

  return (
    <div className="border-b border-slate-800/60 px-3 py-2 text-sm last:border-b-0">
      <div
        className={`flex items-start gap-2 ${hasDetails ? 'cursor-pointer' : ''}`}
        onClick={() => hasDetails && setExpanded((e) => !e)}
      >
        <span className="mt-0.5">{meta.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-200">{event.agentName}</span>
            <span className="text-xs uppercase tracking-wide text-slate-500">{meta.label}</span>
            <span className="ml-auto shrink-0 text-xs text-slate-500">{formatTime(event.timestamp)}</span>
          </div>
          <p className="truncate text-slate-400">{event.message}</p>
        </div>
        {hasDetails && (
          <span className="mt-0.5 text-xs text-slate-500">{expanded ? '▾' : '▸'}</span>
        )}
      </div>

      {expanded && (
        <div className="ml-6 mt-2 space-y-1 rounded-md bg-slate-950/60 p-2 text-xs text-slate-400">
          {event.durationMs != null && (
            <div>Duration: {(event.durationMs / 1000).toFixed(2)}s</div>
          )}
          {event.payload && (
            <pre className="overflow-x-auto whitespace-pre-wrap break-words text-slate-300">
              {JSON.stringify(event.payload, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
