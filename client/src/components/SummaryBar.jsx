function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3">
      <div className="text-2xl font-semibold text-slate-100">{value}</div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

export default function SummaryBar({ agents }) {
  const totalAgents = agents.length;
  const activeAgents = agents.filter((a) => a.status === 'running').length;
  const totalTasks = agents.reduce((sum, a) => sum + a.taskCount, 0);
  const totalSuccess = agents.reduce((sum, a) => sum + a.successCount, 0);
  const overallSuccessRate = totalTasks > 0 ? `${Math.round((totalSuccess / totalTasks) * 100)}%` : '—';

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard label="Agents" value={totalAgents} />
      <StatCard label="Active now" value={activeAgents} />
      <StatCard label="Tasks completed" value={totalTasks} />
      <StatCard label="Success rate" value={overallSuccessRate} />
    </div>
  );
}
