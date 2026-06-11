import { useEffect, useRef } from 'react';
import EventItem from './EventItem.jsx';

const SIMPLE_TYPES = new Set(['register', 'task_started', 'task_finished', 'task_error']);

export default function ActivityFeed({ events, debug }) {
  const scrollRef = useRef(null);

  const visibleEvents = debug ? events : events.filter((e) => SIMPLE_TYPES.has(e.type));

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
      <div className="border-b border-slate-800 px-4 py-2">
        <h2 className="text-sm font-semibold text-slate-100">Activity</h2>
      </div>
      <div ref={scrollRef} className="max-h-96 overflow-y-auto">
        {visibleEvents.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-slate-500">No activity yet</p>
        ) : (
          visibleEvents.map((event) => <EventItem key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}
