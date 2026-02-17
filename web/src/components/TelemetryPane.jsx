import React, { useEffect, useRef, useState, useCallback } from 'react';

const LEVEL_STYLES = {
  BLOCKED: { color: '#ff4444', bg: 'rgba(255, 68, 68, 0.08)', icon: '🚫', bold: true },
  OUTPUT_BLOCKED: { color: '#ff6600', bg: 'rgba(255, 102, 0, 0.10)', icon: '🔒', bold: true },
  ALLOWED: { color: '#44ff88', bg: 'rgba(68, 255, 136, 0.06)', icon: '✓', bold: false },
  MODIFIED: { color: '#ffcc44', bg: 'rgba(255, 204, 68, 0.08)', icon: '✂', bold: true },
  DETECTED: { color: '#ffaa44', bg: 'rgba(255, 170, 68, 0.08)', icon: '⚠', bold: false },
  TOOL_CALL: { color: '#44aaff', bg: 'rgba(68, 170, 255, 0.06)', icon: '→', bold: false },
  TOOL_RESULT: { color: '#d4b8ff', bg: 'rgba(212, 184, 255, 0.05)', icon: '←', bold: false },
  SYSTEM: { color: '#6b4f8a', bg: 'transparent', icon: '·', bold: false },
  INIT: { color: '#7b5fc0', bg: 'transparent', icon: '◆', bold: false },
  DONE: { color: '#a855f7', bg: 'rgba(168, 85, 247, 0.06)', icon: '✦', bold: false },
  AGENT: { color: '#e8d5ff', bg: 'transparent', icon: '⬡', bold: false },
  ERROR: { color: '#ff6666', bg: 'rgba(255, 68, 68, 0.05)', icon: '✕', bold: false },
  INFO: { color: '#9d7dbf', bg: 'transparent', icon: '·', bold: false },
  TOOLS: { color: '#7b2fff', bg: 'transparent', icon: '⚙', bold: false },
  ATTACK: { color: '#f0c0ff', bg: 'rgba(192, 132, 252, 0.15)', icon: '⚡', bold: true },
  TURN: { color: '#9b6fd4', bg: 'rgba(123, 47, 255, 0.08)', icon: '▶', bold: true },
};

function getStyle(level) {
  return LEVEL_STYLES[level] || LEVEL_STYLES.INFO;
}

export default function TelemetryPane({ title, badge, badgeColor, streamUrl, isActive, sideGlowColor }) {
  const [logs, setLogs] = useState([]);
  const [connected, setConnected] = useState(false);
  const logEndRef = useRef(null);
  const esRef = useRef(null);

  const connect = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
    }

    const es = new EventSource(streamUrl);
    esRef.current = es;

    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);

    es.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLogs(prev => [...prev, { ...data, id: Date.now() + Math.random() }]);
      } catch {
        // ignore malformed messages
      }
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [streamUrl]);

  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  // Auto-scroll to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const clearLogs = () => setLogs([]);

  return (
    <div style={{
      ...styles.pane,
      ...(isActive ? { boxShadow: `0 0 20px ${sideGlowColor || 'rgba(123, 47, 255, 0.3)'}` } : {}),
    }}>
      <div style={styles.paneHeader}>
        <div style={styles.paneTitle}>
          <span style={{
            ...styles.badge,
            background: `${badgeColor}20`,
            color: badgeColor,
            borderColor: badgeColor,
          }}>
            {badge}
          </span>
          <span style={styles.titleText}>{title}</span>
          <span style={{
            ...styles.connDot,
            background: connected ? '#44ff88' : '#6b4f8a',
            boxShadow: connected ? '0 0 6px #44ff88' : 'none',
          }} title={connected ? 'Connected' : 'Disconnected'} />
        </div>
        <div style={styles.paneActions}>
          <span style={styles.logCount}>{logs.length} events</span>
          <button style={styles.clearBtn} onClick={clearLogs}>Clear</button>
        </div>
      </div>

      <div style={styles.logContainer}>
        {logs.length === 0 && (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>⬡</div>
            <div style={styles.emptyText}>Waiting for attack to launch...</div>
            <div style={styles.emptyHint}>Select a scenario and click Launch Attack</div>
          </div>
        )}

        {logs.map((log) => {
          const style = getStyle(log.level);
          return (
            <div
              key={log.id}
              style={{
                ...styles.logEntry,
                background: style.bg,
                borderLeft: `2px solid ${style.color}40`,
              }}
            >
              <span style={styles.logTimestamp}>{log.timestamp || ''}</span>
              <span style={{ ...styles.logIcon, color: style.color }}>{style.icon}</span>
              <span style={{ ...styles.logLevel, color: style.color }}>
                {log.level}
              </span>
              <span style={{
                ...styles.logMessage,
                color: style.bold ? style.color : undefined,
                fontWeight: style.bold ? 700 : 400,
              }}>
                {log.message}
              </span>
            </div>
          );
        })}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}

const styles = {
  pane: {
    background: '#150022',
    border: '1px solid #2d1050',
    borderRadius: 12,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  paneHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderBottom: '1px solid #2d1050',
    background: 'rgba(0,0,0,0.2)',
    flexShrink: 0,
  },
  paneTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    fontSize: 9,
    fontWeight: 800,
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
    padding: '3px 8px',
    borderRadius: 4,
    border: '1px solid',
  },
  titleText: {
    fontSize: 12,
    fontWeight: 600,
    color: '#9d7dbf',
  },
  connDot: {
    width: 7,
    height: 7,
    borderRadius: '50%',
    display: 'inline-block',
  },
  paneActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logCount: {
    fontSize: 10,
    color: '#6b4f8a',
    fontFamily: 'JetBrains Mono, monospace',
  },
  clearBtn: {
    background: 'transparent',
    border: '1px solid #2d1050',
    borderRadius: 4,
    color: '#6b4f8a',
    fontSize: 10,
    padding: '3px 8px',
    cursor: 'pointer',
    fontFamily: 'Inter, sans-serif',
  },
  logContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 0',
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 11,
    lineHeight: 1.5,
    minHeight: 0,
    maxHeight: '100%',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: 10,
    color: '#2d1050',
  },
  emptyIcon: {
    fontSize: 40,
    color: '#2d1050',
  },
  emptyText: {
    fontSize: 13,
    color: '#3d1060',
    fontWeight: 500,
    fontFamily: 'Inter, sans-serif',
  },
  emptyHint: {
    fontSize: 11,
    color: '#2d1050',
    fontFamily: 'Inter, sans-serif',
  },
  logEntry: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 6,
    padding: '3px 12px 3px 8px',
    transition: 'background 0.1s',
    wordBreak: 'break-word',
  },
  logTimestamp: {
    color: '#3d1060',
    flexShrink: 0,
    fontSize: 10,
    paddingTop: 1,
  },
  logIcon: {
    flexShrink: 0,
    width: 12,
    textAlign: 'center',
    paddingTop: 1,
  },
  logLevel: {
    flexShrink: 0,
    width: 88,
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    paddingTop: 2,
  },
  logMessage: {
    color: '#9d7dbf',
    whiteSpace: 'pre-wrap',
    flex: 1,
  },
};
