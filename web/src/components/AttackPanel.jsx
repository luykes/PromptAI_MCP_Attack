import React from 'react';

const SCENARIOS = [
  {
    id: 'exfiltration',
    name: 'Secret Exfiltration',
    icon: '🔑',
    desc: 'Reads .env files to steal API keys, passwords, and credentials',
    tools: 'read_file',
    severity: 'critical',
  },
  {
    id: 'probing',
    name: 'Internal System Probe',
    icon: '🔍',
    desc: 'Maps internal systems, discovers VPN configs, SSH keys, employee data',
    tools: 'read_file, search_docs',
    severity: 'high',
  },
  {
    id: 'export',
    name: 'PII Data Export',
    icon: '📊',
    desc: 'Dumps customer database — SSNs, credit cards, addresses, and emails',
    tools: 'db_export',
    severity: 'critical',
  },
  {
    id: 'http',
    name: 'Unauthorized HTTP Fetch',
    icon: '🌐',
    desc: 'Exfiltrates data to external attacker server, probes internal endpoints',
    tools: 'http_fetch',
    severity: 'high',
  },
  {
    id: 'email',
    name: 'Email Exfiltration',
    icon: '📧',
    desc: 'Collects secrets + PII then sends everything to attacker@evil.com',
    tools: 'read_file, db_export, send_email',
    severity: 'high',
  },
  {
    id: 'shell',
    name: 'Shell Command Injection',
    icon: '💻',
    desc: 'Executes arbitrary shell commands, dumps env vars, proves full RCE',
    tools: 'run_shell',
    severity: 'critical',
  },
];

const SEVERITY_COLORS = {
  critical: '#ff4444',
  high: '#ffaa44',
  medium: '#44aaff',
};

export default function AttackPanel({ onLaunch, isRunning, onStop }) {
  return (
    <div style={styles.panel}>
      <div style={styles.panelHeader}>
        <div style={styles.headerLeft}>
          <span style={styles.panelTitle}>Attack Scenarios</span>
          <span style={styles.scenarioCount}>6 scenarios — all run in sequence</span>
        </div>
        <span style={styles.hint}>Powered by Ollama llama3.2 — scripted tool execution, LLM commentary</span>
      </div>

      <div style={styles.scenarioGrid}>
        {SCENARIOS.map((scenario, i) => (
          <div key={scenario.id} style={styles.scenarioCard}>
            <div style={styles.cardTop}>
              <div style={styles.cardLeft}>
                <span style={styles.stepNum}>{i + 1}</span>
                <span style={styles.cardIcon}>{scenario.icon}</span>
              </div>
              <span style={{
                ...styles.severityBadge,
                color: SEVERITY_COLORS[scenario.severity],
                borderColor: SEVERITY_COLORS[scenario.severity],
                background: `${SEVERITY_COLORS[scenario.severity]}15`,
              }}>
                {scenario.severity}
              </span>
            </div>
            <div style={styles.cardName}>{scenario.name}</div>
            <div style={styles.cardDesc}>{scenario.desc}</div>
            <div style={styles.cardTools}>
              <code style={styles.toolCode}>{scenario.tools}</code>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.actions}>
        <button
          style={{
            ...styles.launchBtn,
            ...(isRunning ? styles.launchBtnRunning : {}),
          }}
          onClick={() => !isRunning && onLaunch()}
          disabled={isRunning}
        >
          {isRunning ? (
            <>
              <span style={styles.spinner} />
              Running All 6 Attacks...
            </>
          ) : (
            <>
              <span>⚡</span>
              Launch All 6 Attacks
            </>
          )}
        </button>

        {isRunning && (
          <button style={styles.stopBtn} onClick={onStop}>
            ⬛ Stop
          </button>
        )}
      </div>
    </div>
  );
}

const styles = {
  panel: {
    background: '#150022',
    border: '1px solid #2d1050',
    borderRadius: 12,
    overflow: 'hidden',
  },
  panelHeader: {
    padding: '14px 18px',
    borderBottom: '1px solid #2d1050',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  panelTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#e8d5ff',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  scenarioCount: {
    fontSize: 11,
    color: '#7b2fff',
    background: 'rgba(123, 47, 255, 0.12)',
    border: '1px solid rgba(123, 47, 255, 0.3)',
    borderRadius: 4,
    padding: '2px 8px',
  },
  hint: {
    fontSize: 11,
    color: '#6b4f8a',
  },
  scenarioGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: 8,
    padding: 16,
  },
  scenarioCard: {
    background: '#1e0035',
    border: '1px solid #2d1050',
    borderRadius: 8,
    padding: '10px 12px',
    display: 'flex',
    flexDirection: 'column',
    gap: 5,
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  stepNum: {
    fontSize: 10,
    fontWeight: 700,
    color: '#7b2fff',
    background: 'rgba(123, 47, 255, 0.15)',
    borderRadius: '50%',
    width: 18,
    height: 18,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontFamily: 'JetBrains Mono, monospace',
  },
  cardIcon: {
    fontSize: 15,
  },
  severityBadge: {
    fontSize: 9,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    padding: '2px 5px',
    borderRadius: 4,
    border: '1px solid',
  },
  cardName: {
    fontSize: 11,
    fontWeight: 600,
    color: '#e8d5ff',
    lineHeight: 1.3,
  },
  cardDesc: {
    fontSize: 10,
    color: '#6b4f8a',
    lineHeight: 1.4,
  },
  cardTools: {
    marginTop: 2,
  },
  toolCode: {
    fontFamily: 'JetBrains Mono, monospace',
    fontSize: 9,
    color: '#44aaff',
  },
  actions: {
    padding: '0 16px 16px',
    display: 'flex',
    gap: 10,
  },
  launchBtn: {
    flex: 1,
    background: 'linear-gradient(135deg, #7b2fff, #5b21b6)',
    border: 'none',
    borderRadius: 8,
    color: '#fff',
    padding: '12px 20px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 4px 20px rgba(123, 47, 255, 0.4)',
    transition: 'all 0.2s',
    letterSpacing: '0.3px',
  },
  launchBtnRunning: {
    background: 'linear-gradient(135deg, #4a1a99, #2d0f5e)',
    boxShadow: 'none',
    cursor: 'not-allowed',
  },
  stopBtn: {
    background: 'rgba(255, 68, 68, 0.1)',
    border: '1px solid #ff4444',
    borderRadius: 8,
    color: '#ff4444',
    padding: '12px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  spinner: {
    width: 14,
    height: 14,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTop: '2px solid white',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.8s linear infinite',
  },
};
