const STATUS_STYLES = {
  running: { dot: 'bg-blue-400 animate-pulse', label: 'Running', text: 'text-blue-300' },
  idle: { dot: 'bg-emerald-400', label: 'Idle', text: 'text-emerald-300' },
  error: { dot: 'bg-red-400', label: 'Error', text: 'text-red-300' },
};

function timeAgo(timestamp) {
  if (!timestamp) return 'never';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function formatDuration(ms) {
  if (!ms) return '—';
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export default function AgentCard({ agent, debug }) {
  const status = STATUS_STYLES[agent.status] ?? STATUS_STYLES.idle;
  const successRatePct = agent.successRate === null ? '—' : `${Math.round(agent.successRate * 100)}%`;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-100">{agent.name}</h3>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
          <span className={`text-xs font-medium ${status.text}`}>{status.label}</span>
        </div>
      </div>

      <p className="mt-2 min-h-[1.25rem] truncate text-xs text-slate-400">
        {agent.currentTask ? `Working on: ${agent.currentTask}` : 'No active task'}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <div className="text-base font-semibold text-slate-100">{successRatePct}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Success</div>
        </div>
        <div>
          <div className="text-base font-semibold text-slate-100">{agent.taskCount}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Tasks</div>
        </div>
        <div>
          <div className="text-base font-semibold text-slate-100">{formatDuration(agent.avgDurationMs)}</div>
          <div className="text-[10px] uppercase tracking-wide text-slate-500">Avg time</div>
        </div>
      </div>

      {debug && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-2 text-[11px] text-slate-500">
          <span>{agent.errorCount} error{agent.errorCount === 1 ? '' : 's'}</span>
          <span>Last seen {timeAgo(agent.lastSeen)}</span>
        </div>
      )}
    </div>
  );
}
