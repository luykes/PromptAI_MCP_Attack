import React from 'react';

export default function SecurityToggle({ enabled, onChange }) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.label}>
        <span style={styles.labelText}>Prompt Security</span>
        <span style={styles.labelHint}>Highlight protected pane</span>
      </div>

      <button
        style={{
          ...styles.toggle,
          background: enabled
            ? 'linear-gradient(135deg, rgba(68, 255, 136, 0.15), rgba(68, 255, 136, 0.05))'
            : 'linear-gradient(135deg, rgba(255, 68, 68, 0.15), rgba(255, 68, 68, 0.05))',
          borderColor: enabled ? '#44ff88' : '#ff4444',
        }}
        onClick={() => onChange(!enabled)}
      >
        <div style={{
          ...styles.indicator,
          background: enabled ? '#44ff88' : '#ff4444',
          boxShadow: enabled
            ? '0 0 12px rgba(68, 255, 136, 0.6)'
            : '0 0 12px rgba(255, 68, 68, 0.6)',
        }} />
        <div style={styles.toggleContent}>
          <span style={{
            ...styles.statusText,
            color: enabled ? '#44ff88' : '#ff4444',
          }}>
            {enabled ? 'PROTECTION ON' : 'UNPROTECTED'}
          </span>
          <span style={styles.statusDesc}>
            {enabled ? 'Highlighting protected pane — Prompt Security active' : 'Highlighting vulnerable pane — no enforcement'}
          </span>
        </div>
        <div style={styles.switchTrack}>
          <div style={{
            ...styles.switchThumb,
            left: enabled ? '50%' : '2px',
            background: enabled ? '#44ff88' : '#ff4444',
          }} />
        </div>
      </button>
    </div>
  );
}

const styles = {
  wrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  labelText: {
    fontSize: 11,
    fontWeight: 600,
    color: '#9d7dbf',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    whiteSpace: 'nowrap',
  },
  labelHint: {
    fontSize: 10,
    color: '#3d1060',
    whiteSpace: 'nowrap',
  },
  toggle: {
    border: '1px solid',
    borderRadius: 10,
    padding: '10px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    transition: 'all 0.3s',
    minWidth: 280,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
    transition: 'all 0.3s',
  },
  toggleContent: {
    flex: 1,
    textAlign: 'left',
  },
  statusText: {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    fontFamily: 'JetBrains Mono, monospace',
    letterSpacing: '0.5px',
    transition: 'color 0.3s',
  },
  statusDesc: {
    display: 'block',
    fontSize: 10,
    color: '#6b4f8a',
    marginTop: 1,
  },
  switchTrack: {
    width: 36,
    height: 20,
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    position: 'relative',
    flexShrink: 0,
  },
  switchThumb: {
    position: 'absolute',
    top: 2,
    width: 16,
    height: 16,
    borderRadius: '50%',
    transition: 'all 0.3s',
  },
};
