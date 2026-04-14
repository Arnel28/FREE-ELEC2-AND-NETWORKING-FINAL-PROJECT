import React, { useState, useEffect } from 'react';

export default function LinuxInstaller({ onComplete, config, setConfig }) {
  const [setupStep, setSetupStep] = useState('welcome'); // welcome, type, manual, progress, user, done
  const [installProgress, setInstallProgress] = useState(0);
  const [error, setError] = useState(null);
  
  // Simulated Disk State from Windows phase
  const [partitions, setPartitions] = useState([
    { id: 1, name: '/dev/sda1', size: '500MB', type: 'System Reserved', fs: 'ntfs' },
    { id: 2, name: '/dev/sda2', size: '430GB', type: 'Windows 11', fs: 'ntfs' },
    { id: 3, name: 'free space', size: '70GB', type: 'unallocated', fs: '' }
  ]);

  const handleNext = () => {
    if (setupStep === 'welcome') setSetupStep('type');
  };

  const handleManualPartition = () => {
    const unalloc = partitions.find(p => p.type === 'unallocated');
    if (!unalloc) {
      setError("No free space found! Did you leave space during Windows installation?");
      return;
    }

    // Logic: Split 70GB into 60GB root, 8GB swap, 2GB left
    const newPartitions = [
      { id: 1, name: '/dev/sda1', size: '500MB', type: 'System Reserved', fs: 'ntfs' },
      { id: 2, name: '/dev/sda2', size: '430GB', type: 'Windows 11', fs: 'ntfs' },
      { id: 4, name: '/dev/sda3', size: '60GB', type: '/', fs: 'ext4' },
      { id: 5, name: '/dev/sda4', size: '8GB', type: 'swap', fs: 'swap' },
      { id: 6, name: 'free space', size: '2GB', type: 'unallocated', fs: '' }
    ];
    
    setPartitions(newPartitions);
    setError(null);
    setTimeout(() => setSetupStep('progress'), 800);
  };

  useEffect(() => {
    if (setupStep === 'progress') {
      const interval = setInterval(() => {
        setInstallProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setSetupStep('user'), 1000);
            return 100;
          }
          return prev + 1;
        });
      }, 80);
      return () => clearInterval(interval);
    }
  }, [setupStep]);

  // Styles
  const linuxStyle = {
    background: '#300a24', // Ubuntu Purple
    color: '#fff',
    height: '500px',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Ubuntu, sans-serif',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid #444'
  };

  const headerStyle = {
    background: '#444',
    padding: '10px 20px',
    fontSize: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const boxStyle = {
    flex: 1,
    padding: '40px',
    display: 'flex',
    flexDirection: 'column'
  };

  const footerStyle = {
    padding: '15px 30px',
    background: '#333',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px'
  };

  const btnStyle = {
    padding: '8px 25px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold'
  };

  return (
    <div style={linuxStyle} className="fade-in">
      <div style={headerStyle}>
        <span>Install Ubuntu 22.04 LTS</span>
        <span>🕒 {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      {setupStep === 'welcome' && (
        <div style={{ display: 'flex', flex: 1 }}>
          <div style={{ width: '200px', background: 'rgba(255,255,255,0.05)', padding: '20px' }}>
            <div style={{ padding: '8px', background: '#e95420', borderRadius: '4px' }}>English</div>
            <div style={{ padding: '8px', opacity: 0.6 }}>Español</div>
            <div style={{ padding: '8px', opacity: 0.6 }}>Français</div>
            <div style={{ padding: '8px', opacity: 0.6 }}>Filipino</div>
          </div>
          <div style={boxStyle}>
            <h1 style={{ fontSize: '32px', fontWeight: '300', marginBottom: '20px' }}>Welcome</h1>
            <p style={{ fontSize: '15px', lineHeight: '1.6' }}>
              You can try Ubuntu without making any changes to your computer, directly from this CD.
              Or if you're ready, you can install Ubuntu alongside Windows.
            </p>
            <div style={{ marginTop: 'auto', display: 'flex', gap: '20px' }}>
              <button style={{ ...btnStyle, background: '#666', color: '#fff' }} onClick={() => setError("Trial mode disabled in simulator.")}>Try Ubuntu</button>
              <button style={{ ...btnStyle, background: '#e95420', color: '#fff' }} onClick={handleNext}>Install Ubuntu</button>
            </div>
            {error && <div style={{ color: '#ff4444', marginTop: '20px' }}>{error}</div>}
          </div>
        </div>
      )}

      {setupStep === 'type' && (
        <div style={boxStyle}>
          <h2 style={{ fontSize: '22px', fontWeight: 'normal', marginBottom: '25px' }}>Installation type</h2>
          
          <div style={{ marginBottom: '20px' }}>
             <label style={{ display: 'flex', gap: '15px', cursor: 'pointer' }}>
               <input type="radio" name="it" checked />
               <div>
                 <strong>Install Ubuntu alongside Windows Boot Manager</strong>
                 <p style={{ fontSize: '13px', opacity: 0.7 }}>Documents, music, and other files will be kept. You can choose which OS to start at boot.</p>
               </div>
             </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
             <label style={{ display: 'flex', gap: '15px', cursor: 'pointer', opacity: 0.5 }}>
               <input type="radio" name="it" disabled />
               <div>
                 <strong>Erase disk and install Ubuntu</strong>
                 <p style={{ fontSize: '13px', color: '#ff9999' }}>Warning: This will delete your Windows installation and all files!</p>
               </div>
             </label>
          </div>

          <div style={{ marginBottom: '20px' }}>
             <label style={{ display: 'flex', gap: '15px', cursor: 'pointer' }} onClick={() => setSetupStep('manual')}>
               <input type="radio" name="it" />
               <div>
                 <strong>Something else</strong>
                 <p style={{ fontSize: '13px', opacity: 0.7 }}>You can create or resize partitions yourself, or choose multiple partitions for Ubuntu.</p>
               </div>
             </label>
          </div>

          <div style={{ marginTop: 'auto', textAlign: 'right' }}>
             <button style={{ ...btnStyle, background: '#e95420', color: '#fff' }} onClick={() => setSetupStep('progress')}>Install Now</button>
          </div>
        </div>
      )}

      {setupStep === 'manual' && (
        <div style={boxStyle}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Advanced Partition Tool</h3>
          <div style={{ background: '#fff', color: '#333', borderRadius: '4px', overflow: 'hidden' }}>
            <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#eee' }}>
                <tr>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Device</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Type</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Size</th>
                  <th style={{ padding: '8px', textAlign: 'left' }}>Used</th>
                </tr>
              </thead>
              <tbody>
                {partitions.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px' }}>{p.name}</td>
                    <td style={{ padding: '8px' }}>{p.fs || p.type}</td>
                    <td style={{ padding: '8px' }}>{p.size}</td>
                    <td style={{ padding: '8px' }}>{p.type === 'Windows 11' ? '12GB' : '0'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
            <button style={{ padding: '4px 12px', fontSize: '12px' }} onClick={handleManualPartition}>+ New Partition</button>
            <button style={{ padding: '4px 12px', fontSize: '12px', opacity: 0.5 }}>- Delete</button>
          </div>
          <p style={{ fontSize: '12px', marginTop: '15px', opacity: 0.8 }}>
             Lab Instruction: Use the <strong>free space</strong> to create a <strong>/ (root)</strong> partition (min 30GB) and a <strong>swap</strong> partition (2GB).
          </p>
          <div style={{ marginTop: 'auto', textAlign: 'right' }}>
             <button style={{ ...btnStyle, background: '#e95420', color: '#fff' }} onClick={() => setSetupStep('progress')}>Install Now</button>
          </div>
        </div>
      )}

      {setupStep === 'progress' && (
        <div style={boxStyle}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '300' }}>Almost there...</h2>
            <p style={{ opacity: 0.7 }}>Copying files and configuring GRUB bootloader</p>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.1)', height: '24px', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ background: '#e95420', width: `${installProgress}%`, height: '100%', transition: 'width 0.1s linear' }} />
            <div style={{ position: 'absolute', width: '100%', textAlign: 'center', fontSize: '12px', lineHeight: '24px', fontWeight: 'bold' }}>
              {installProgress}% complete
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ color: '#ffb399', marginBottom: '10px' }}>Fast and full of new features</h4>
              <p style={{ fontSize: '12px', opacity: 0.8 }}>The latest version of Ubuntu makes computing easier than ever.</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
              <h4 style={{ color: '#ffb399', marginBottom: '10px' }}>LibreOffice included</h4>
              <p style={{ fontSize: '12px', opacity: 0.8 }}>Everything you need to create documents, spreadsheets and presentations.</p>
            </div>
          </div>
        </div>
      )}

      {setupStep === 'user' && (
        <div style={boxStyle}>
          <h2 style={{ fontSize: '22px', fontWeight: 'normal', marginBottom: '25px' }}>Who are you?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '15px', alignItems: 'center' }}>
            <label style={{ fontSize: '14px' }}>Your name:</label>
            <input type="text" style={{ padding: '8px', borderRadius: '4px', border: 'none' }} placeholder="Student" />
            
            <label style={{ fontSize: '14px' }}>Your computer's name:</label>
            <input type="text" style={{ padding: '8px', borderRadius: '4px', border: 'none' }} placeholder="student-pc" />
            
            <label style={{ fontSize: '14px' }}>Pick a username:</label>
            <input type="text" style={{ padding: '8px', borderRadius: '4px', border: 'none' }} 
              onChange={(e) => setConfig({ ...config, linuxUser: e.target.value })}
            />
            
            <label style={{ fontSize: '14px' }}>Choose a password:</label>
            <input type="password" style={{ padding: '8px', borderRadius: '4px', border: 'none' }} placeholder="••••••••" />
          </div>
          
          <div style={{ marginTop: 'auto', textAlign: 'right' }}>
             <button style={{ ...btnStyle, background: '#e95420', color: '#fff' }} onClick={() => { setSetupStep('done'); onComplete(); }}>Continue</button>
          </div>
        </div>
      )}
    </div>
  );
}
