import React, { useState, useEffect } from 'react';

export default function WindowsInstaller({ onComplete, config, setConfig }) {
  const [setupStep, setSetupStep] = useState('language'); // language, install, type, partition, progress, oobe, done
  const [diskSpace, setDiskSpace] = useState({
    total: 500,
    partitions: [] // { name: 'Drive 0 Unallocated Space', size: 500, type: 'unallocated' }
  });
  const [installProgress, setInstallProgress] = useState(0);
  const [selectedPartition, setSelectedPartition] = useState(null);
  const [error, setError] = useState(null);

  // Initialize disk
  useEffect(() => {
    setDiskSpace({
      total: 500,
      partitions: [{ id: 1, name: 'Drive 0 Unallocated Space', size: 500, type: 'unallocated' }]
    });
  }, []);

  const handleNext = () => {
    if (setupStep === 'language') setSetupStep('install');
    if (setupStep === 'install') setSetupStep('type');
    if (setupStep === 'type') setSetupStep('partition');
  };

  const handleCreatePartition = () => {
    const unalloc = diskSpace.partitions.find(p => p.type === 'unallocated');
    if (!unalloc) return;

    // Simulate user entering 450GB (leaving 50GB for Linux)
    const winSize = 430; 
    const remaining = unalloc.size - winSize;

    if (remaining < 50) {
      setError("Warning: You must leave at least 50GB of unallocated space for the Linux installation phase!");
      return;
    }

    const newPartitions = [
      { id: 2, name: 'Drive 0 Partition 1: System Reserved', size: 0.5, type: 'system' },
      { id: 3, name: 'Drive 0 Partition 2 (C:)', size: winSize, type: 'primary' },
      { id: 4, name: 'Drive 0 Unallocated Space', size: remaining, type: 'unallocated' }
    ];

    setDiskSpace({ ...diskSpace, partitions: newPartitions });
    setSelectedPartition(3); // Auto-select C: drive
    setError(null);
  };

  const startInstallation = () => {
    if (!selectedPartition || diskSpace.partitions.find(p => p.id === selectedPartition).type !== 'primary') {
      setError("Please select a Primary partition to install Windows.");
      return;
    }
    setSetupStep('progress');
  };

  useEffect(() => {
    if (setupStep === 'progress') {
      const interval = setInterval(() => {
        setInstallProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setSetupStep('oobe'), 1000);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [setupStep]);

  // Styles
  const winStyle = {
    background: 'linear-gradient(180deg, #3a7bd5 0%, #003366 100%)',
    color: '#fff',
    height: '500px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'Segoe UI, Tahoma, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid #555'
  };

  const boxStyle = {
    background: '#f0f0f0',
    color: '#000',
    width: '80%',
    maxWidth: '600px',
    padding: '30px',
    borderRadius: '2px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    position: 'relative'
  };

  const buttonStyle = {
    padding: '8px 25px',
    border: '1px solid #ccc',
    background: '#e1e1e1',
    cursor: 'pointer',
    fontSize: '13px'
  };

  return (
    <div style={winStyle} className="fade-in">
      <div style={{ position: 'absolute', top: 10, left: 20, fontSize: '12px', opacity: 0.7 }}>Windows Setup</div>

      {setupStep === 'language' && (
        <div style={boxStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: 'normal', marginBottom: '20px' }}>Windows 11 Setup</h2>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '12px', display: 'block' }}>Language to install:</label>
            <select disabled style={{ width: '100%', padding: '5px' }}><option>English (United States)</option></select>
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontSize: '12px', display: 'block' }}>Time and currency format:</label>
            <select disabled style={{ width: '100%', padding: '5px' }}><option>English (United States)</option></select>
          </div>
          <div style={{ textAlign: 'right', marginTop: '30px' }}>
            <button style={buttonStyle} onClick={handleNext}>Next</button>
          </div>
        </div>
      )}

      {setupStep === 'install' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🪟</div>
          <button 
            style={{ padding: '15px 40px', background: '#0078d4', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '18px' }}
            onClick={handleNext}
          >
            Install now
          </button>
          <div style={{ marginTop: '20px', fontSize: '12px', color: '#acc' }}>Setup is starting...</div>
        </div>
      )}

      {setupStep === 'type' && (
        <div style={boxStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: 'normal', marginBottom: '20px' }}>Which type of installation do you want?</h2>
          <div 
            style={{ padding: '15px', border: '1px solid #ccc', marginBottom: '10px', cursor: 'pointer' }}
            onClick={() => setError("Error: You must choose 'Custom' to manage partitions for the Linux task.")}
          >
            <strong>Upgrade: Install Windows and keep files</strong>
            <p style={{ fontSize: '11px', margin: '5px 0 0 0' }}>The files, settings, and applications are moved to Windows with this option.</p>
          </div>
          <div 
            style={{ padding: '15px', border: '1px solid #0078d4', background: '#e1f0ff', cursor: 'pointer' }}
            onClick={handleNext}
          >
            <strong>Custom: Install Windows only (advanced)</strong>
            <p style={{ fontSize: '11px', margin: '5px 0 0 0' }}>The files, settings, and applications aren't moved to Windows with this option.</p>
          </div>
          {error && <p style={{ color: 'red', fontSize: '12px', marginTop: '10px' }}>{error}</p>}
        </div>
      )}

      {setupStep === 'partition' && (
        <div style={boxStyle}>
          <h2 style={{ fontSize: '16px', fontWeight: 'normal', marginBottom: '15px' }}>Where do you want to install Windows?</h2>
          <div style={{ background: '#fff', border: '1px solid #999', height: '180px', overflowY: 'auto', marginBottom: '10px' }}>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#eee', textAlign: 'left' }}>
                  <th style={{ padding: '5px', border: '1px solid #ccc' }}>Name</th>
                  <th style={{ padding: '5px', border: '1px solid #ccc' }}>Total size</th>
                  <th style={{ padding: '5px', border: '1px solid #ccc' }}>Free space</th>
                  <th style={{ padding: '5px', border: '1px solid #ccc' }}>Type</th>
                </tr>
              </thead>
              <tbody>
                {diskSpace.partitions.map(p => (
                  <tr 
                    key={p.id} 
                    onClick={() => setSelectedPartition(p.id)}
                    style={{ background: selectedPartition === p.id ? '#0078d4' : 'transparent', color: selectedPartition === p.id ? '#fff' : '#000', cursor: 'pointer' }}
                  >
                    <td style={{ padding: '5px' }}>{p.name}</td>
                    <td style={{ padding: '5px' }}>{p.size} GB</td>
                    <td style={{ padding: '5px' }}>{p.size} GB</td>
                    <td style={{ padding: '5px' }}>{p.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: '10px', fontSize: '11px', marginBottom: '10px' }}>
            <span style={{ cursor: 'pointer', color: '#0078d4' }} onClick={() => setError("Refresh not needed in simulator.")}>↻ Refresh</span>
            <span style={{ cursor: 'pointer', color: '#0078d4' }} onClick={() => setError("No driver needed.")}>📁 Load driver</span>
            <span style={{ cursor: 'pointer', color: '#0078d4' }} onClick={handleCreatePartition}>✳️ New</span>
            <span style={{ cursor: 'pointer', color: '#999' }}>❌ Delete</span>
            <span style={{ cursor: 'pointer', color: '#999' }}>🖌️ Format</span>
          </div>
          {error && <p style={{ color: 'red', fontSize: '11px', background: '#fee', padding: '5px', border: '1px solid red' }}>{error}</p>}
          <div style={{ textAlign: 'right', marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
             <button style={buttonStyle} onClick={() => setSetupStep('type')}>Back</button>
             <button 
                style={{ ...buttonStyle, background: selectedPartition ? '#e1e1e1' : '#f5f5f5', color: selectedPartition ? '#000' : '#888' }} 
                onClick={startInstallation}
                disabled={!selectedPartition}
              >
                Next
              </button>
          </div>
        </div>
      )}

      {setupStep === 'progress' && (
        <div style={boxStyle}>
          <h2 style={{ fontSize: '18px', fontWeight: 'normal', marginBottom: '20px' }}>Installing Windows</h2>
          <div style={{ fontSize: '13px', marginBottom: '20px' }}>
            <div style={{ marginBottom: '8px' }}>✅ Copying Windows files</div>
            <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>⏳ Getting files ready for installation ({installProgress}%)</div>
            <div style={{ marginBottom: '8px', opacity: 0.5 }}>Installing features</div>
            <div style={{ marginBottom: '8px', opacity: 0.5 }}>Installing updates</div>
            <div style={{ marginBottom: '8px', opacity: 0.5 }}>Finishing up</div>
          </div>
          <div style={{ height: '4px', width: '100%', background: '#ccc', borderRadius: '2px' }}>
            <div style={{ height: '100%', width: `${installProgress}%`, background: '#0078d4', transition: 'width 0.1s linear' }} />
          </div>
        </div>
      )}

      {setupStep === 'oobe' && (
        <div style={{ ...boxStyle, background: '#fff', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '10px' }}>👤</div>
          <h2 style={{ fontSize: '22px', marginBottom: '10px' }}>Who is going to use this PC?</h2>
          <input 
            type="text" 
            placeholder="User Name" 
            style={{ padding: '10px', width: '100%', border: '1px solid #ccc', marginBottom: '20px' }} 
            onChange={(e) => setConfig({ ...config, winUser: e.target.value })}
          />
          <button 
            style={{ padding: '10px 30px', background: '#0078d4', color: '#fff', border: 'none', cursor: 'pointer' }}
            onClick={() => { setSetupStep('done'); onComplete(); }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
