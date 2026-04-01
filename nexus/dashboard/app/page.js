'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.API_URL || 'http://localhost:4000/api';

async function fetchAPI(endpoint) {
  try {
    const res = await fetch(`${API_URL}${endpoint}`);
    return res.json();
  } catch {
    return null;
  }
}

function Card({ title, children, color = '#1a1a2e' }) {
  return (
    <div style={{
      background: color,
      borderRadius: 12,
      padding: 24,
      border: '1px solid #2a2a4a',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#7c8cf8', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function StatusBadge({ status }) {
  const colors = {
    completed: '#22c55e',
    pending: '#eab308',
    active: '#3b82f6',
    error: '#ef4444',
    blocked: '#f97316',
  };
  return (
    <span style={{
      background: colors[status] || '#666',
      color: '#fff',
      padding: '2px 8px',
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 600,
    }}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [health, setHealth] = useState(null);
  const [taskInput, setTaskInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadData() {
    const [agentsData, tasksData, oppsData, healthData] = await Promise.all([
      fetchAPI('/agents'),
      fetchAPI('/tasks?limit=10'),
      fetchAPI('/opportunities'),
      fetch(`${API_URL.replace('/api', '')}/health`).then(r => r.json()).catch(() => null),
    ]);
    if (agentsData) setAgents(agentsData.agents || []);
    if (tasksData) setTasks(tasksData.tasks || []);
    if (oppsData) setOpportunities(oppsData.opportunities || []);
    setHealth(healthData);
  }

  async function submitTask(e) {
    e.preventDefault();
    if (!taskInput.trim()) return;
    setLoading(true);
    try {
      await fetch(`${API_URL}/task`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'research', action: taskInput, params: { type: 'general', query: taskInput } }),
      });
      setTaskInput('');
      setTimeout(loadData, 1000);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: 32 }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 32, background: 'linear-gradient(135deg, #7c8cf8, #6ee7b7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            NEXUS
          </h1>
          <p style={{ margin: '4px 0 0', color: '#888', fontSize: 14 }}>Neural Executive System for Unified Strategy</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%',
            background: health?.status === 'ok' ? '#22c55e' : '#ef4444',
            display: 'inline-block',
          }} />
          <span style={{ color: '#888', fontSize: 13 }}>
            {health?.status === 'ok' ? 'System Online' : 'Offline'}
          </span>
        </div>
      </header>

      {/* Task Input */}
      <form onSubmit={submitTask} style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <input
            type="text"
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Submit a task (e.g., 'Research AI trends in Latin America')"
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 8, border: '1px solid #2a2a4a',
              background: '#12121f', color: '#e0e0e0', fontSize: 14, outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '12px 24px', borderRadius: 8, border: 'none',
              background: 'linear-gradient(135deg, #7c8cf8, #6366f1)', color: '#fff',
              fontWeight: 600, cursor: 'pointer', fontSize: 14,
            }}
          >
            {loading ? 'Sending...' : 'Submit Task'}
          </button>
        </div>
      </form>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24 }}>
        {/* Agents */}
        <Card title="Active Agents">
          {agents.map((a, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: i < agents.length - 1 ? '1px solid #2a2a4a' : 'none' }}>
              <div style={{ fontWeight: 600, color: '#e0e0e0', marginBottom: 4 }}>{a.name}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{a.description}</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                {(a.capabilities || []).map((c, j) => (
                  <span key={j} style={{ background: '#1e1e3a', padding: '2px 8px', borderRadius: 4, fontSize: 11, color: '#7c8cf8' }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {agents.length === 0 && <p style={{ color: '#666' }}>Loading agents...</p>}
        </Card>

        {/* Tasks */}
        <Card title="Recent Tasks">
          {tasks.map((t, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < tasks.length - 1 ? '1px solid #2a2a4a' : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500 }}>{t.action || t.agent}</span>
                <StatusBadge status={t.status} />
              </div>
              <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                {t.agent} &middot; {t.duration ? `${t.duration}ms` : 'pending'}
              </div>
            </div>
          ))}
          {tasks.length === 0 && <p style={{ color: '#666' }}>No tasks yet</p>}
        </Card>

        {/* Opportunities */}
        <Card title="Business Opportunities">
          {opportunities.slice(0, 5).map((o, i) => (
            <div key={i} style={{ padding: '10px 0', borderBottom: i < Math.min(opportunities.length, 5) - 1 ? '1px solid #2a2a4a' : 'none' }}>
              <div style={{ fontWeight: 500 }}>{o.title}</div>
              <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>{o.description?.slice(0, 120)}</div>
              <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 12 }}>
                <span style={{ color: '#22c55e' }}>Potential: {o.potential || 'N/A'}</span>
                <span style={{ color: '#eab308' }}>Risk: {o.risk || 'N/A'}</span>
                <StatusBadge status={o.status} />
              </div>
            </div>
          ))}
          {opportunities.length === 0 && <p style={{ color: '#666' }}>No opportunities discovered yet</p>}
        </Card>

        {/* System Info */}
        <Card title="System Status">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: '#888' }}>Status</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: health?.status === 'ok' ? '#22c55e' : '#ef4444' }}>
                {health?.status === 'ok' ? 'ONLINE' : 'OFFLINE'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888' }}>Agents</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#7c8cf8' }}>{agents.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888' }}>Tasks Completed</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#6ee7b7' }}>{tasks.length}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888' }}>Opportunities</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#eab308' }}>{opportunities.length}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
