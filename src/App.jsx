import React, { useState } from 'react';
import HomeScreen from './screens/HomeScreen.jsx';
// WindowsInstaller and LinuxInstaller are now embedded within DualBootScreen
import DualBootScreen from './screens/DualBootScreen.jsx';
import SubnettingScreen from './screens/SubnettingScreen.jsx';
import PingTestScreen from './screens/PingTestScreen.jsx';
import Navbar from './components/Navbar.jsx';

// Simplified flow: Home → Windows → Linux → Dual‑Boot Verification → Subnet → Ping → Results
const PHASES = ['home', 'windows', 'linux', 'dualboot', 'subnet', 'ping', 'results'];

export default function App() {
  const [phase, setPhase] = useState('home');
  const [groupInfo, setGroupInfo] = useState({ section: '', groupName: '' });
  const [progress, setProgress] = useState({
    windows: false,
    linux: false,
    dualboot: false,
    subnet: false,
    ping: false,
  });
  const [networkConfig, setNetworkConfig] = useState(null);

  const markDone = (key) => setProgress(p => ({ ...p, [key]: true }));
  const goTo = (p) => setPhase(p);

  const phaseIndex = PHASES.indexOf(phase);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      <Navbar phase={phase} progress={progress} goTo={goTo} />
      <main style={{ flex: 1, padding: '32px 20px', maxWidth: 960, margin: '0 auto', width: '100%' }}>
        {phase === 'home' && (
          <HomeScreen 
            progress={progress} 
            goTo={goTo} 
            groupInfo={groupInfo} 
            setGroupInfo={setGroupInfo} 
          />
        )}
        {phase === 'windows' && (
          <DualBootScreen
            initialStage="windows"
            onWindowsDone={() => markDone('windows')}
            onLinuxDone={() => markDone('linux')}
            onComplete={() => { markDone('dualboot'); goTo('subnet'); }}
          />
        )}
        {phase === 'linux' && (
          <DualBootScreen
            initialStage="linux"
            onWindowsDone={() => markDone('windows')}
            onLinuxDone={() => markDone('linux')}
            onComplete={() => { markDone('dualboot'); goTo('subnet'); }}
          />
        )}
        {phase === 'dualboot' && (
          <DualBootScreen
            initialStage="verify"
            onWindowsDone={() => markDone('windows')}
            onLinuxDone={() => markDone('linux')}
            onComplete={() => { markDone('dualboot'); goTo('subnet'); }}
          />
        )}
        {phase === 'subnet' && (
          <SubnettingScreen 
            onComplete={(cfg) => { 
              markDone('subnet'); 
              setNetworkConfig(cfg); 
              goTo('ping'); 
            }} 
          />
        )}
        {phase === 'ping' && (
          <PingTestScreen 
            networkConfig={networkConfig} 
            onComplete={() => {
              markDone('ping');
              goTo('results');
            }} 
          />
        )}
        {phase === 'results' && (
          <div className="fade-in" style={{ textAlign: 'center', padding: '40px' }}>
            <h2 style={{ color: 'var(--green)', fontSize: '32px', marginBottom: '20px' }}>✅ Lab Completed!</h2>
            <div style={{ background: 'var(--bg-card)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', maxWidth: '400px', margin: '0 auto' }}>
              <h3 style={{ marginBottom: '16px' }}>Submission Details</h3>
              <p style={{ marginBottom: '8px' }}><strong>Section:</strong> {groupInfo.section || 'N/A'}</p>
              <p style={{ marginBottom: '8px' }}><strong>Group:</strong> {groupInfo.groupName || 'N/A'}</p>
              <p style={{ marginBottom: '24px' }}><strong>Score:</strong> 100/100</p>
              <div style={{ padding: '12px', background: '#000', borderRadius: '6px', fontFamily: 'monospace', fontSize: '14px', color: 'var(--yellow)' }}>
                Verification Token:<br/>
                {btoa(`${groupInfo.section}-${groupInfo.groupName}-COMPLETED-2026`).substring(0, 12).toUpperCase()}
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: '24px' }} onClick={() => goTo('home')}>
              Back to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
