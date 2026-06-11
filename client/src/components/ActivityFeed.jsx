import { useEffect, useMemo, useRef, useState } from 'react';
import EventItem from './EventItem.jsx';

const SIMPLE_TYPES = ['register', 'task_started', 'task_finished', 'task_error'];
const DEBUG_TYPES = [...SIMPLE_TYPES.slice(0, 2), 'tool_call', ...SIMPLE_TYPES.slice(2), 'log'];

const TYPE_LABELS = {
  register: 'Online',
  task_started: 'Started',
  tool_call: 'Tool call',
  task_finished: 'Completed',
  task_error: 'Error',
  log: 'Log',
};

export default function ActivityFeed({ events, agents, debug }) {
  const scrollRef = useRef(null);
  const [agentFilter, setAgentFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const availableTypes = debug ? DEBUG_TYPES : SIMPLE_TYPES;

  // Reset the type filter if it's no longer valid for the current mode (e.g. switching out of debug).
  useEffect(() => {
    if (typeFilter !== 'all' && !availableTypes.includes(typeFilter)) {
      setTypeFilter('all');
    }
  }, [debug]); // eslint-disable-line react-hooks/exhaustive-deps

  const visibleEvents = useMemo(() => {
    return events.filter((e) => {
      if (!availableTypes.includes(e.type)) return false;
      if (agentFilter !== 'all' && e.agentId !== agentFilter) return false;
      if (typeFilter !== 'all' && e.type !== typeFilter) return false;
      return true;
    });
  }, [events, availableTypes, agentFilter, typeFilter]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [visibleEvents.length]);

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800 px-4 py-2">
        <h2 className="text-sm font-semibold text-slate-100">Activity</h2>

        <select
          value={agentFilter}
          onChange={(e) => setAgentFilter(e.target.value)}
          className="ml-auto rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs text-slate-200 focus:outline-none"
        >
          <option value="all">All agents</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setTypeFilter('all')}
            className={`rounded-full px-2.5 py-1 text-xs transition ${
              typeFilter === 'all'
                ? 'bg-slate-100 text-slate-900'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
          {availableTypes.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`rounded-full px-2.5 py-1 text-xs transition ${
                typeFilter === type
                  ? 'bg-slate-100 text-slate-900'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div ref={scrollRef} className="max-h-96 overflow-y-auto">
        {visibleEvents.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">No matching activity</p>
        ) : (
          visibleEvents.map((event) => <EventItem key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}
