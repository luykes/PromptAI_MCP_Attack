import React from 'react';

export default function Header({ configOpen, onToggleConfig }) {
  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>⬡</span>
          <span style={styles.logoText}>PromptAI</span>
          <span style={styles.logoSub}>Security Demo</span>
        </div>
        <div style={styles.tagline}>
          LLM Tool Abuse · MCP Attack Surface · Runtime AI Controls
        </div>
      </div>
      <div style={styles.right}>
        <div style={styles.statusDots}>
          <span style={styles.dot('#44ff88')} title="MCP Raw Server :8787" />
          <span style={styles.dotLabel}>RAW</span>
          <span style={styles.dot('#44ff88')} title="MCP Protected Server :8788" />
          <span style={styles.dotLabel}>SAFE</span>
          <span style={styles.dot('#7b2fff')} title="Backend :3001" />
          <span style={styles.dotLabel}>API</span>
        </div>
        <button style={styles.configBtn} onClick={onToggleConfig}>
          {configOpen ? '✕ Close' : '⚙ Config'}
        </button>
      </div>
    </header>
  );
}

const styles = {
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 24px',
    background: 'linear-gradient(180deg, #1a002e 0%, #0d0014 100%)',
    borderBottom: '1px solid #2d1050',
    boxShadow: '0 0 30px rgba(123, 47, 255, 0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 28,
    color: '#7b2fff',
    filter: 'drop-shadow(0 0 8px rgba(123, 47, 255, 0.8))',
    lineHeight: 1,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 700,
    color: '#e8d5ff',
    letterSpacing: '-0.5px',
  },
  logoSub: {
    fontSize: 11,
    fontWeight: 500,
    color: '#7b2fff',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    marginLeft: 4,
    marginTop: 2,
    alignSelf: 'flex-end',
  },
  tagline: {
    fontSize: 11,
    color: '#6b4f8a',
    borderLeft: '1px solid #2d1050',
    paddingLeft: 16,
    letterSpacing: '0.5px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
  },
  statusDots: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 10,
    color: '#6b4f8a',
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '0.5px',
  },
  dot: (color) => ({
    display: 'inline-block',
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: color,
    boxShadow: `0 0 6px ${color}`,
    animation: 'pulse 2s infinite',
  }),
  dotLabel: {
    marginRight: 6,
  },
  configBtn: {
    background: 'transparent',
    border: '1px solid #5b21b6',
    color: '#a855f7',
    borderRadius: 6,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 500,
    transition: 'all 0.2s',
    cursor: 'pointer',
  },
};
