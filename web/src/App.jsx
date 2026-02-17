import React, { useState } from 'react';
import Header from './components/Header.jsx';
import AttackPanel from './components/AttackPanel.jsx';
import SplitScreen from './components/SplitScreen.jsx';
import ConfigPanel from './components/ConfigPanel.jsx';

export default function App() {
  const [configOpen, setConfigOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const handleLaunch = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/agent/run', { method: 'POST' });
      if (!res.ok) {
        const err = await res.json();
        console.error('Failed to launch agent:', err);
      }
      // All 6 scenarios with Ollama commentary can take up to 5 minutes
      setTimeout(() => setIsRunning(false), 300000);
    } catch (err) {
      console.error('Launch error:', err);
      setIsRunning(false);
    }
  };

  const handleStop = async () => {
    try {
      await fetch('/api/agent/stop', { method: 'POST' });
    } catch {
      // ignore
    }
    setIsRunning(false);
  };

  return (
    <div style={styles.root}>
      {/* Background ambient effects */}
      <div style={styles.ambientLeft} />
      <div style={styles.ambientRight} />

      <Header configOpen={configOpen} onToggleConfig={() => setConfigOpen(!configOpen)} />

      <ConfigPanel open={configOpen} onClose={() => setConfigOpen(false)} />

      <main style={styles.main}>
        {/* Attack scenario selector */}
        <div style={styles.controlBar}>
          <AttackPanel
            onLaunch={handleLaunch}
            isRunning={isRunning}
            onStop={handleStop}
          />

        </div>

        {/* Split screen telemetry */}
        <div style={styles.splitContainer}>
          <SplitScreen isRunning={isRunning} />
        </div>
      </main>

      <style>{globalAnimations}</style>
    </div>
  );
}

const globalAnimations = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }
  button:hover {
    filter: brightness(1.1);
  }
`;

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  ambientLeft: {
    position: 'fixed',
    top: '10%',
    left: '-10%',
    width: 600,
    height: 600,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(123, 47, 255, 0.06) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  ambientRight: {
    position: 'fixed',
    bottom: '10%',
    right: '-10%',
    width: 500,
    height: 500,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: 0,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px 20px',
    gap: 16,
    position: 'relative',
    zIndex: 1,
    minHeight: 0,
    height: 'calc(100vh - 57px)',
  },
  controlBar: {
    flexShrink: 0,
  },
  splitContainer: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
};
