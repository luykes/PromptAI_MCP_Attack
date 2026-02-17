import React from 'react';
import TelemetryPane from './TelemetryPane.jsx';

export default function SplitScreen({ isRunning }) {
  return (
    <div style={styles.container}>
      <TelemetryPane
        title="No guardrails — raw tool execution"
        badge="Vulnerable"
        badgeColor="#ff4444"
        streamUrl="/api/stream/raw"
        isActive={isRunning}
        sideGlowColor="rgba(255, 68, 68, 0.3)"
      />
      <div style={styles.divider}>
        <div style={styles.dividerLine} />
        <div style={styles.dividerLabel}>VS</div>
        <div style={styles.dividerLine} />
      </div>
      <TelemetryPane
        title="Prompt Security enforcement layer active"
        badge="Protected"
        badgeColor="#44ff88"
        streamUrl="/api/stream/protected"
        isActive={isRunning}
        sideGlowColor="rgba(68, 255, 136, 0.3)"
      />
    </div>
  );
}

const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    gap: 0,
    flex: 1,
    minHeight: 0,
  },
  divider: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    width: 1,
    background: 'linear-gradient(180deg, transparent, #2d1050, transparent)',
  },
  dividerLabel: {
    fontSize: 10,
    fontWeight: 800,
    color: '#3d1060',
    letterSpacing: '1px',
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    padding: '8px 0',
  },
};
