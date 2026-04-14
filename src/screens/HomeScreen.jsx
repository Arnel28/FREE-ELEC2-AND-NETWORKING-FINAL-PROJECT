import React from 'react';

const CARDS = [
  { key: 'windows',  icon: '🪟', label: 'Phase 1', title: 'Windows Installation', desc: 'Boot from USB and install Windows 10/11. Partition the drive leaving space for Linux.', color: 'var(--blue)', pts: 20 },
  { key: 'linux',    icon: '🐧', label: 'Phase 2', title: 'Linux Installation', desc: 'Install Ubuntu/Kali Linux alongside Windows using unallocated space. Setup GRUB.', color: 'var(--orange)', pts: 20 },
  { key: 'dualboot', icon: '⚙️', label: 'Phase 3', title: 'Dual-Boot Verification', desc: 'Confirm GRUB bootloader works. Boot into each OS and verify system info.', color: 'var(--purple)', pts: 15 },
  { key: 'subnet',   icon: '🌐', label: 'Phase 4', title: 'Subnetting & IP Config', desc: 'Design a subnet plan. Assign static IPs to each PC and verify with ipconfig.', color: 'var(--teal)', pts: 20 },
  { key: 'ping',     icon: '📡', label: 'Phase 5', title: 'Ping Test & Messaging', desc: 'Test LAN connectivity using ping. Send a message between networked computers.', color: 'var(--green)', pts: 15 },
];

export default function HomeScreen({ progress, goTo, groupInfo, setGroupInfo }) {
  const completed = Object.values(progress).filter(Boolean).length;
  const totalScore = completed * 20;
  const pct = Math.round((completed / 5) * 100);

  const canStart = groupInfo.section.trim() !== '' && groupInfo.groupName.trim() !== '';

  return (
    <div className="fade-in">
      {/* Group Info Input Section */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '20px',
        marginBottom: '20px',
        display: 'flex',
        gap: '20px',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Section / Year Level</label>
          <input 
            type="text" 
            placeholder="e.g. 12-ICT-A"
            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)' }}
            value={groupInfo.section}
            onChange={(e) => setGroupInfo({ ...groupInfo, section: e.target.value })}
          />
        </div>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase' }}>Group Number / Name</label>
          <input 
            type="text" 
            placeholder="e.g. Group 1"
            style={{ width: '100%', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px', color: 'var(--text-primary)' }}
            value={groupInfo.groupName}
            onChange={(e) => setGroupInfo({ ...groupInfo, groupName: e.target.value })}
          />
        </div>
        {!canStart && (
          <div style={{ color: 'var(--orange)', fontSize: '12px', fontWeight: '600', width: '100%' }}>
            ⚠️ Please enter your Section and Group Name to begin the lab.
          </div>
        )}
      </div>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px 36px',
        marginBottom: 28,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background glow blobs */}
        <div style={{ position:'absolute',top:-60,right:-60,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,0.18),transparent 70%)',pointerEvents:'none' }} />
        <div style={{ position:'absolute',bottom:-40,left:-40,width:160,height:160,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,0.15),transparent 70%)',pointerEvents:'none' }} />

        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:24, flexWrap:'wrap' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ padding:'6px 14px', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:20, fontSize:11, fontWeight:700, color:'#a5b4fc', letterSpacing:1, textTransform:'uppercase' }}>
                🏫 IT Department · TVL–ICT · CSS NC II
              </div>
            </div>
            <h1 style={{ fontSize:28, fontWeight:800, lineHeight:1.2, marginBottom:10, background:'linear-gradient(90deg,#e0e7ff,#a5b4fc)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              OS Installation &amp;<br/>Network Setup Emulator
            </h1>
            <p style={{ color:'var(--text-secondary)', fontSize:14, maxWidth:480, lineHeight:1.7 }}>
              An interactive simulator for Windows/Linux installation, dual-boot GRUB configuration, subnetting, and VM connectivity testing. Complete all 5 phases to earn 100 points.
            </p>
            <div style={{ display:'flex', gap:10, marginTop:20, flexWrap:'wrap' }}>
              <button 
                className="btn btn-primary" 
                onClick={() => canStart && goTo('windows')}
                disabled={!canStart}
                style={{ opacity: canStart ? 1 : 0.5, cursor: canStart ? 'pointer' : 'not-allowed' }}
              >
                🚀 Start Virtual Lab
              </button>
              <div style={{ display:'flex', alignItems:'center', gap:8, background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 16px', fontSize:13 }}>
                <span style={{ color:'var(--yellow)' }}>⭐</span>
                <span style={{ fontWeight:700, color:'var(--text-primary)' }}>{totalScore}</span>
                <span style={{ color:'var(--text-muted)' }}>/100 pts</span>
              </div>
            </div>
          </div>

          {/* Circular progress */}
          <div style={{ textAlign:'center', flexShrink:0 }}>
            <svg width={100} height={100} style={{ transform:'rotate(-90deg)' }}>
              <circle cx={50} cy={50} r={42} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8}/>
              <circle cx={50} cy={50} r={42} fill="none" stroke="#6366f1" strokeWidth={8}
                strokeDasharray={`${2*Math.PI*42}`}
                strokeDashoffset={`${2*Math.PI*42*(1-pct/100)}`}
                strokeLinecap="round" style={{ transition:'stroke-dashoffset 0.7s ease' }}/>
            </svg>
            <div style={{ marginTop:-70, marginBottom:30, textAlign:'center' }}>
              <div style={{ fontSize:22, fontWeight:800, color:'#e0e7ff' }}>{pct}%</div>
              <div style={{ fontSize:11, color:'var(--text-muted)' }}>Complete</div>
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div style={{ marginTop:24 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-muted)', marginBottom:6 }}>
            <span>Overall Progress</span>
            <span>{completed}/5 phases complete</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width:`${pct}%`, background:'linear-gradient(90deg,#6366f1,#3b82f6)' }}/>
          </div>
        </div>
      </div>

      {/* Phase Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:16 }}>
        {CARDS.map((c, i) => {
          const done = progress[c.key];
          return (
            <div
              key={c.key}
              style={{
                background:'var(--bg-card)',
                border:`1px solid ${done ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
                borderRadius:'var(--radius)',
                padding:20,
                cursor:'pointer',
                transition:'all 0.22s ease',
                position:'relative',
                overflow:'hidden',
              }}
              onClick={() => goTo(c.key)}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 8px 30px rgba(0,0,0,0.3)`; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
            >
              {done && (
                <div style={{ position:'absolute',top:12,right:12,width:22,height:22,background:'var(--green)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#000',fontWeight:700 }}>✓</div>
              )}
              <div style={{ width:44,height:44,borderRadius:10,background:`${c.color}1a`,border:`1px solid ${c.color}40`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,marginBottom:14 }}>
                {c.icon}
              </div>
              <div style={{ fontSize:11,fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:0.8,marginBottom:4 }}>{c.label}</div>
              <div style={{ fontSize:15,fontWeight:700,color:'var(--text-primary)',marginBottom:6 }}>{c.title}</div>
              <div style={{ fontSize:13,color:'var(--text-secondary)',lineHeight:1.6,marginBottom:16 }}>{c.desc}</div>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
                <span className={`badge ${done?'badge-green':'badge-muted'}`}>
                  {done ? '✓ Done' : `+${c.pts} pts`}
                </span>
                <span style={{ fontSize:12,color:c.color,fontWeight:600 }}>Start →</span>
              </div>
              {/* Left accent bar */}
              <div style={{ position:'absolute',left:0,top:0,bottom:0,width:3,background:done?'var(--green)':c.color,borderRadius:'3px 0 0 3px' }}/>
            </div>
          );
        })}

        {/* Summary card */}
        <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:'var(--radius)',padding:20 }}>
          <div style={{ fontSize:13,fontWeight:700,color:'var(--text-secondary)',marginBottom:16, textTransform:'uppercase', letterSpacing:0.5 }}>📊 Score Breakdown</div>
          {CARDS.map(c => (
            <div key={c.key} style={{ display:'flex',alignItems:'center',justifyContent:'space-between',paddingBottom:8,marginBottom:8,borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex',alignItems:'center',gap:8,fontSize:13 }}>
                <div className={`status-dot ${progress[c.key]?'online':'offline'}`}/>
                <span style={{ color:'var(--text-secondary)' }}>{c.title}</span>
              </div>
              <span style={{ fontFamily:'var(--font-mono)',fontSize:13,fontWeight:600,color:progress[c.key]?'var(--green)':'var(--text-muted)' }}>
                {progress[c.key] ? `${c.pts}` : '0'}/{c.pts}
              </span>
            </div>
          ))}
          <div style={{ display:'flex',justifyContent:'space-between',fontSize:14,fontWeight:800,color:'var(--text-primary)',marginTop:8 }}>
            <span>TOTAL</span>
            <span style={{ color:'var(--yellow)',fontFamily:'var(--font-mono)' }}>{totalScore}/100</span>
          </div>
        </div>
      </div>
    </div>
  );
}
