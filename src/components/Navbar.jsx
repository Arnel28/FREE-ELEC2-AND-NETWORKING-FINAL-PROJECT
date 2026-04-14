import React from 'react';

const PHASES = [
  { key: 'home',     label: 'Home',       icon: '🏠' },
  { key: 'windows',  label: 'Windows',    icon: '🪟' },
  { key: 'linux',    label: 'Linux',      icon: '🐧' },
  { key: 'dualboot', label: 'Dual-Boot',  icon: '⚙️' },
  { key: 'subnet',   label: 'Subnetting', icon: '🌐' },
  { key: 'ping',     label: 'Ping Test',  icon: '📡' },
];

export default function Navbar({ phase, progress, goTo }) {
  return (
    <nav style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border)',
      padding: '0 20px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(12px)',
    }}>
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 8, height: 58 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 16, flexShrink: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, var(--blue), var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
          }}>💻</div>
          <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            OS Lab Simulator
          </span>
        </div>

        {/* Phase tabs */}
        <div style={{ display: 'flex', gap: 2, flex: 1, overflowX: 'auto' }}>
          {PHASES.map((p) => {
            const done = progress[p.key];
            const active = phase === p.key;
            return (
              <button
                key={p.key}
                onClick={() => goTo(p.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
                  fontSize: 13, fontWeight: active ? 600 : 500,
                  background: active ? 'rgba(59,130,246,0.15)' : 'transparent',
                  color: active ? 'var(--blue-light)' : done ? 'var(--green-light)' : 'var(--text-secondary)',
                  borderBottom: active ? '2px solid var(--blue)' : '2px solid transparent',
                  transition: 'all 0.2s', whiteSpace: 'nowrap',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
                {done && <span style={{ fontSize: 10, color: 'var(--green)' }}>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Score badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginLeft: 8, flexShrink: 0,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '4px 12px', fontSize: 13, fontWeight: 600,
        }}>
          <span style={{ color: 'var(--yellow)' }}>⭐</span>
          <span style={{ color: 'var(--text-primary)' }}>
            {Object.values(progress).filter(Boolean).length * 20}
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>/100</span>
        </div>
      </div>
    </nav>
  );
}
