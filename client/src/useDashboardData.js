import { useEffect, useRef, useState } from 'react';

const MAX_EVENTS = 200;

export function useDashboardData() {
  const [agents, setAgents] = useState([]);
  const [events, setEvents] = useState([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let reconnectTimer;

    function connect() {
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);

      ws.onclose = () => {
        setConnected(false);
        if (!cancelled) {
          reconnectTimer = setTimeout(connect, 2000);
        }
      };

      ws.onerror = () => ws.close();

      ws.onmessage = (msg) => {
        const { type, data } = JSON.parse(msg.data);

        if (type === 'snapshot') {
          setAgents(data.agents);
          setEvents(data.events);
        } else if (type === 'agent') {
          setAgents((prev) => {
            const next = prev.filter((a) => a.id !== data.id);
            next.push(data);
            next.sort((a, b) => a.name.localeCompare(b.name));
            return next;
          });
        } else if (type === 'event') {
          setEvents((prev) => {
            const next = [...prev, data];
            return next.length > MAX_EVENTS ? next.slice(next.length - MAX_EVENTS) : next;
          });
        }
      };
    }

    connect();

    return () => {
      cancelled = true;
      clearTimeout(reconnectTimer);
      wsRef.current?.close();
    };
  }, []);

  return { agents, events, connected };
}
