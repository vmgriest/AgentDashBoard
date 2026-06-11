import { useEffect, useState } from 'react';
import { useDashboardData } from './useDashboardData.js';
import AgentCard from './components/AgentCard.jsx';
import ActivityFeed from './components/ActivityFeed.jsx';
import SummaryBar from './components/SummaryBar.jsx';

export default function App() {
  const { agents, events, connected } = useDashboardData();
  const [debug, setDebug] = useState(() => localStorage.getItem('dashboard:debug') === 'true');

  useEffect(() => {
    localStorage.setItem('dashboard:debug', String(debug));
  }, [debug]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-4 py-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Agent Dashboard</h1>
            <p className="mt-1 flex items-center gap-2 text-xs text-slate-500">
              <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-red-400'}`} />
              {connected ? 'Connected' : 'Disconnected'}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 p-1 text-sm">
            <button
              onClick={() => setDebug(false)}
              className={`rounded-full px-3 py-1 transition ${
                !debug ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setDebug(true)}
              className={`rounded-full px-3 py-1 transition ${
                debug ? 'bg-slate-100 text-slate-900' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Debug
            </button>
          </div>
        </header>

        <div className="mb-6">
          <SummaryBar agents={agents} />
        </div>

        {agents.length === 0 ? (
          <div className="mb-6 rounded-xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-500">
            No agents have reported in yet. Run <code className="text-slate-300">npm run simulate</code> to see demo
            data, or POST events to <code className="text-slate-300">/api/events</code>.
          </div>
        ) : (
          <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} debug={debug} />
            ))}
          </div>
        )}

        <ActivityFeed events={events} debug={debug} />
      </div>
    </div>
  );
}
