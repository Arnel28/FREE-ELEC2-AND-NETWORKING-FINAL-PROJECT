import React, { useState, useEffect, useRef } from 'react';

/* ── helpers ─────────────────────────────────────────── */
function randBetween(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function isValidIp(s) { return /^(\d{1,3}\.){3}\d{1,3}$/.test(s) && s.split('.').every(o => Number(o) <= 255); }

/* ── simulate ping output lines ─────────────────────── */
function buildPingLines(target, success) {
  const ms = () => randBetween(1, 12);
  const ttl = 128;
  const lines = [
    [`Pinging ${target} with 32 bytes of data:`, 't-dim'],
    ...(success ? [
      [`Reply from ${target}: bytes=32 time=${ms()}ms TTL=${ttl}`, 't-green t-bold'],
      [`Reply from ${target}: bytes=32 time=${ms()}ms TTL=${ttl}`, 't-green t-bold'],
      [`Reply from ${target}: bytes=32 time=${ms()}ms TTL=${ttl}`, 't-green t-bold'],
      [`Reply from ${target}: bytes=32 time=${ms()}ms TTL=${ttl}`, 't-green t-bold'],
    ] : [
      [`Request timeout for icmp_seq 0`, 't-red'],
      [`Request timeout for icmp_seq 1`, 't-red'],
      [`Request timeout for icmp_seq 2`, 't-red'],
      [`Request timeout for icmp_seq 3`, 't-red'],
    ]),
    [``, ''],
    ['Ping statistics:', 't-dim'],
    success
      ? [`    Packets: Sent=4, Received=4, Lost=0 (0% loss)`, 't-bold']
      : [`    Packets: Sent=4, Received=0, Lost=4 (100% loss)`, 't-red t-bold'],
    success
      ? [`Approximate round trip times: Min=${ms()}ms Max=${ms()}ms Avg=${ms()}ms`, '']
      : [`Destination host unreachable.`, 't-red'],
  ];
  return lines;
}

/* ── topology nodes ─────────────────────────────────── */
const DEFAULT_NODES = [
  { id:'pc1', label:'PC-01', os:'windows', icon:'🪟', x:80,  y:80 },
  { id:'pc2', label:'PC-02', os:'linux',   icon:'🐧', x:280, y:80 },
  { id:'pc3', label:'PC-03', os:'linux',   icon:'🐧', x:180, y:200 },
  { id:'sw',  label:'Switch', os:'switch', icon:'🔌', x:180, y:135 },
];
const DEFAULT_LINKS = [
  ['pc1','sw'], ['pc2','sw'], ['pc3','sw'],
];

/* ── component ───────────────────────────────────────── */
export default function PingTestScreen({ networkConfig, onComplete }) {
  const [tab, setTab] = useState('ping');   // ping | msg | topology
  const [completed, setCompleted] = useState(false);

  /* derive IPs from networkConfig or use defaults */
  const pcs = networkConfig?.pcs ?? [
    { name:'PC-01 (Windows)', ip:'192.168.1.10', gateway:'192.168.1.1' },
    { name:'PC-02 (Linux)',   ip:'192.168.1.11', gateway:'192.168.1.1' },
    { name:'PC-03 (Switch)',  ip:'192.168.1.12', gateway:'192.168.1.1' },
  ];
  const allIps = pcs.map(p => p.ip).filter(ip => isValidIp(ip));

  /* ── PING state ── */
  const [src, setSrc]     = useState('');
  const [dst, setDst]     = useState('');
  const [pingRunning, setPingRunning] = useState(false);
  const [pingLines, setPingLines]     = useState([]);
  const [pingIdx, setPingIdx]   = useState(0);
  const [pingResult, setPingResult]   = useState(null); // 'success' | 'fail'
  const [pingHistory, setPingHistory] = useState([]);
  const pingRef = useRef(null);
  const [pendingLines, setPendingLines] = useState([]);

  useEffect(() => { if (pingRef.current) pingRef.current.scrollTop = pingRef.current.scrollHeight; }, [pingLines]);

  useEffect(() => {
    if (!pingRunning || pingIdx >= pendingLines.length) return;
    const t = setTimeout(() => {
      setPingLines(l => [...l, pendingLines[pingIdx]]);
      setPingIdx(i => i + 1);
    }, 220 + Math.random() * 150);
    return () => clearTimeout(t);
  }, [pingRunning, pingIdx, pendingLines]);

  useEffect(() => {
    if (pingRunning && pingIdx === pendingLines.length && pendingLines.length > 0) {
      setPingRunning(false);
      const success = pendingLines.some(([t]) => t.includes('Received=4'));
      setPingResult(success ? 'success' : 'fail');
      setPingHistory(h => [...h, { src, dst, success, time: new Date().toLocaleTimeString() }]);
    }
  }, [pingRunning, pingIdx, pendingLines]);

  const handlePing = () => {
    if (!isValidIp(dst)) return;
    const sameSrc = src === '' || src === dst;
    const sameSubnet = allIps.length < 2 || allIps.includes(dst);
    const success = !sameSrc && sameSubnet;
    const lines = buildPingLines(dst, success);
    setPendingLines(lines);
    setPingLines([]); setPingIdx(0); setPingResult(null);
    setPingRunning(true);
  };

  const pingsDone = pingHistory.filter(p => p.success).length >= 2;

  /* ── MESSAGING state ── */
  const [msgSender, setMsgSender] = useState('');
  const [msgRecipient, setMsgRecipient] = useState('');
  const [msgText, setMsgText] = useState('');
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    if (!msgText.trim() || !msgSender || !msgRecipient || msgSender === msgRecipient) return;
    setMessages(m => [...m, {
      id: Date.now(), sender: msgSender, recipient: msgRecipient,
      text: msgText.trim(), time: new Date().toLocaleTimeString(),
    }]);
    setMsgText('');
  };

  const msgsDone = messages.length >= 1;

  const allDone = pingsDone && msgsDone;

  useEffect(() => {
    if (allDone && !completed) setCompleted(true);
  }, [allDone]);

  /* ── TABS ── */
  const TABS = [
    { id:'ping',     label:'📡 Ping Test' },
    { id:'msg',      label:'💬 LAN Messaging' },
    { id:'topology', label:'🗺️ Network Topology' },
  ];

  return (
    <div className="fade-in">
      {/* header */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        <div style={{ width:50, height:50, borderRadius:12, background:'linear-gradient(135deg,#065f46,#059669)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>📡</div>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--green-light)', textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>Phase 5</div>
          <h2 style={{ fontSize:22, fontWeight:800 }}>Ping Test &amp; LAN Messaging</h2>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:2 }}>Test LAN connectivity using ping. Send a message between networked computers.</p>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          <span className="badge badge-green">15 pts</span>
          {allDone && <span className="badge badge-green">✓ Complete</span>}
        </div>
      </div>

      {/* progress chips */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        {[
          { label:'Successful pings', done:pingsDone, text:`${pingHistory.filter(p=>p.success).length}/2` },
          { label:'LAN message sent',  done:msgsDone,  text:`${messages.length} sent` },
        ].map(c => (
          <div key={c.label} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 14px', borderRadius:20,
            background: c.done ? 'rgba(34,197,94,0.1)' : 'var(--bg-card)',
            border: `1px solid ${c.done ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`,
          }}>
            <div className={`status-dot ${c.done ? 'online' : 'offline'}`} />
            <span style={{ fontSize:12, color: c.done ? 'var(--green-light)' : 'var(--text-muted)', fontWeight:600 }}>{c.label}</span>
            <span style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-secondary)' }}>{c.text}</span>
          </div>
        ))}
      </div>

      {/* tab nav */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--bg-card)', borderRadius:10, padding:4, border:'1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1, padding:'8px 12px', borderRadius:7, border:'none', cursor:'pointer',
            fontFamily:'var(--font-sans)', fontSize:13, fontWeight:600,
            background: tab===t.id ? 'linear-gradient(135deg,#065f46,#059669)' : 'transparent',
            color: tab===t.id ? '#fff' : 'var(--text-secondary)',
            transition:'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ──────────── TAB: PING ──────────── */}
      {tab === 'ping' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* controls */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="card" style={{ padding:18 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:14 }}>⚙️ Ping Configuration</div>

              <div style={{ marginBottom:12 }}>
                <label className="label">Source PC (optional)</label>
                <select className="input" value={src} onChange={e => setSrc(e.target.value)}>
                  <option value="">Any (local machine)</option>
                  {pcs.map((p, i) => <option key={i} value={p.ip}>{p.name} — {p.ip}</option>)}
                </select>
              </div>

              <div style={{ marginBottom:16 }}>
                <label className="label">Destination IP</label>
                <input className="input" value={dst} onChange={e => setDst(e.target.value)}
                  placeholder="e.g. 192.168.1.11"
                  style={{ fontFamily:'var(--font-mono)' }}
                  onKeyDown={e => e.key === 'Enter' && !pingRunning && dst && handlePing()} />
                {/* quick select */}
                <div style={{ display:'flex', gap:6, marginTop:8, flexWrap:'wrap' }}>
                  {pcs.filter(p => isValidIp(p.ip)).map((p, i) => (
                    <button key={i} className="btn btn-ghost" onClick={() => setDst(p.ip)}
                      style={{ fontSize:11, padding:'4px 10px' }}>{p.ip}</button>
                  ))}
                  <button className="btn btn-ghost" onClick={() => setDst('8.8.8.8')} style={{ fontSize:11, padding:'4px 10px' }}>8.8.8.8 (WAN)</button>
                </div>
              </div>

              <button className="btn btn-success" onClick={handlePing}
                disabled={pingRunning || !isValidIp(dst)} style={{ width:'100%' }}>
                {pingRunning ? <><span className="spinner" />Pinging...</> : '▶ Run Ping'}
              </button>
            </div>

            {/* ping history */}
            <div className="card" style={{ padding:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:12 }}>📋 Ping History</div>
              {pingHistory.length === 0
                ? <div style={{ fontSize:13, color:'var(--text-muted)' }}>No pings yet.</div>
                : pingHistory.map((h, i) => (
                  <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, padding:'6px 10px', borderRadius:8, background:'var(--bg-secondary)' }}>
                    <div className={`status-dot ${h.success ? 'online' : 'offline'}`} />
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:12, flex:1, color:'var(--text-secondary)' }}>
                      {h.dst}
                    </span>
                    <span style={{ fontSize:11, color: h.success ? 'var(--green-light)' : 'var(--red-light)', fontWeight:600 }}>
                      {h.success ? '✓ Reply' : '✗ Timeout'}
                    </span>
                    <span style={{ fontSize:10, color:'var(--text-muted)' }}>{h.time}</span>
                  </div>
                ))
              }
              {pingsDone && (
                <div className="result-box result-success" style={{ marginTop:8 }}>
                  <span>✅</span><span>LAN connectivity confirmed! 2+ successful pings.</span>
                </div>
              )}
            </div>
          </div>

          {/* terminal */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:8 }}>📟 Ping Output</div>
              <div className="terminal" ref={pingRef} style={{ minHeight:260, maxHeight:340 }}>
                {pingLines.length === 0 && <span className="t-dim">C:\&gt; waiting for ping command...</span>}
                {pingLines.map(([text, cls], i) => (
                  <div key={i} className={cls}>{text}</div>
                ))}
                {pingRunning && <div className="cursor">&nbsp;</div>}
              </div>
            </div>

            {pingResult && !pingRunning && (
              <div className={`result-box ${pingResult==='success'?'result-success':'result-error'}`}>
                <span>{pingResult==='success'?'✅':'❌'}</span>
                <span>{pingResult==='success'
                  ? `Ping to ${dst} successful! Host is reachable on the LAN.`
                  : `Ping to ${dst} failed. Check IP address, subnet, or firewall settings.`
                }</span>
              </div>
            )}

            {/* quick guide */}
            <div className="card" style={{ padding:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:10 }}>💡 Ping Guide</div>
              {[
                ['ping [IP]',           'Send 4 ICMP echo requests'],
                ['ping -t [IP]',        'Continuous ping (Ctrl+C to stop)'],
                ['ping -n 10 [IP]',     'Send exactly 10 packets'],
                ['ping 127.0.0.1',      'Loopback test (always succeeds)'],
                ['ping 8.8.8.8',        'Test internet connectivity'],
              ].map(([cmd, desc]) => (
                <div key={cmd} style={{ display:'flex', gap:12, fontSize:12, marginBottom:6 }}>
                  <span style={{ fontFamily:'var(--font-mono)', color:'var(--cyan)', minWidth:160, flexShrink:0 }}>{cmd}</span>
                  <span style={{ color:'var(--text-muted)' }}>{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ──────────── TAB: MESSAGING ──────────── */}
      {tab === 'msg' && (
        <div style={{ display:'grid', gridTemplateColumns:'320px 1fr', gap:20 }}>
          {/* compose */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="card" style={{ padding:18 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:14 }}>✉️ Compose LAN Message</div>

              <div style={{ marginBottom:12 }}>
                <label className="label">From</label>
                <select className="input" value={msgSender} onChange={e => setMsgSender(e.target.value)}>
                  <option value="">Select sender…</option>
                  {pcs.map((p, i) => <option key={i} value={p.name}>{p.name} ({p.ip})</option>)}
                </select>
              </div>
              <div style={{ marginBottom:12 }}>
                <label className="label">To</label>
                <select className="input" value={msgRecipient} onChange={e => setMsgRecipient(e.target.value)}>
                  <option value="">Select recipient…</option>
                  {pcs.filter(p => p.name !== msgSender).map((p, i) => (
                    <option key={i} value={p.name}>{p.name} ({p.ip})</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom:14 }}>
                <label className="label">Message</label>
                <textarea className="input" value={msgText} onChange={e => setMsgText(e.target.value)}
                  rows={4} placeholder="Type your LAN message here…"
                  style={{ resize:'vertical', lineHeight:1.5 }}
                  onKeyDown={e => e.key === 'Enter' && e.ctrlKey && sendMessage()} />
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:4 }}>Ctrl+Enter to send</div>
              </div>
              <button className="btn btn-success" onClick={sendMessage}
                disabled={!msgText.trim() || !msgSender || !msgRecipient || msgSender === msgRecipient}
                style={{ width:'100%' }}>
                📤 Send Message
              </button>
            </div>

            {/* net info */}
            <div className="card" style={{ padding:14 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:10 }}>🖥️ PC Addresses</div>
              {pcs.map((p, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', fontSize:12, marginBottom:6 }}>
                  <span style={{ color:'var(--text-secondary)' }}>{p.name}</span>
                  <span style={{ fontFamily:'var(--font-mono)', color:'var(--cyan)' }}>{p.ip || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* message feed */}
          <div className="card" style={{ padding:18 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:14 }}>
              💬 Message Feed
              {messages.length > 0 && <span className="badge badge-green" style={{ marginLeft:10 }}>{messages.length} sent</span>}
            </div>

            {messages.length === 0 ? (
              <div style={{ textAlign:'center', padding:'40px 0', color:'var(--text-muted)', fontSize:14 }}>
                <div style={{ fontSize:36, marginBottom:12 }}>💬</div>
                <div>No messages yet. Compose your first LAN message!</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {messages.map(m => (
                  <div key={m.id} style={{ background:'var(--bg-secondary)', borderRadius:10, padding:14, border:'1px solid var(--border)' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="status-dot online" />
                        <span style={{ fontSize:12, fontWeight:700, color:'var(--green-light)' }}>{m.sender}</span>
                        <span style={{ fontSize:12, color:'var(--text-muted)' }}>→</span>
                        <span style={{ fontSize:12, fontWeight:600, color:'var(--text-secondary)' }}>{m.recipient}</span>
                      </div>
                      <span style={{ fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)' }}>{m.time}</span>
                    </div>
                    <div style={{ fontSize:14, color:'var(--text-primary)', lineHeight:1.6, marginLeft:18 }}>
                      {m.text}
                    </div>
                    <div style={{ marginTop:8, fontSize:11, color:'var(--text-muted)', fontFamily:'var(--font-mono)', marginLeft:18 }}>
                      Delivered via LAN (TCP/UDP) ✓
                    </div>
                  </div>
                ))}
              </div>
            )}

            {msgsDone && (
              <div className="result-box result-success" style={{ marginTop:16 }}>
                <span>✅</span><span>LAN message delivered successfully! Communication between PCs confirmed.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────── TAB: TOPOLOGY ──────────── */}
      {tab === 'topology' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20 }}>
          {/* diagram */}
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:16 }}>🗺️ LAN Topology Diagram</div>
            <svg viewBox="0 0 360 300" style={{ width:'100%', maxHeight:340, display:'block' }}>
              {/* links */}
              {DEFAULT_LINKS.map(([a, b], i) => {
                const na = DEFAULT_NODES.find(n => n.id === a);
                const nb = DEFAULT_NODES.find(n => n.id === b);
                return <line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                  stroke="rgba(20,184,166,0.5)" strokeWidth={2} strokeDasharray="5,4" />;
              })}
              {/* nodes */}
              {DEFAULT_NODES.map(n => {
                const pc  = pcs.find(p => p.name.includes(n.label.split('-')[1] ?? n.label));
                const ip  = n.id === 'sw' ? '—' : (pc?.ip || '?.?.?.?');
                return (
                  <g key={n.id}>
                    <circle cx={n.x} cy={n.y} r={28}
                      fill={n.id==='sw' ? 'rgba(99,102,241,0.2)' : 'rgba(20,184,166,0.12)'}
                      stroke={n.id==='sw' ? 'rgba(99,102,241,0.5)' : 'rgba(20,184,166,0.5)'}
                      strokeWidth={2} />
                    <text x={n.x} y={n.y+1} textAnchor="middle" dominantBaseline="middle" fontSize={18}>{n.icon}</text>
                    <text x={n.x} y={n.y+36} textAnchor="middle" fontSize={10} fill="#94a3b8" fontFamily="Inter,sans-serif" fontWeight="600">{n.label}</text>
                    {n.id !== 'sw' && (
                      <text x={n.x} y={n.y+48} textAnchor="middle" fontSize={9} fill="#5eead4" fontFamily="JetBrains Mono,monospace">{ip}</text>
                    )}
                    {pingHistory.some(h => h.success && (h.dst === ip)) && (
                      <circle cx={n.x+20} cy={n.y-20} r={7} fill="rgba(34,197,94,0.9)" />
                    )}
                  </g>
                );
              })}
              {/* label */}
              <text x={180} y={280} textAnchor="middle" fontSize={9} fill="#475569" fontFamily="Inter,sans-serif">
                LAN — 192.168.1.0/24 (Simulated)
              </text>
            </svg>
          </div>

          {/* legend + device table */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="card" style={{ padding:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:12 }}>📋 Device Table</div>
              {pcs.map((p, i) => (
                <div key={i} style={{ marginBottom:12, padding:'10px 12px', borderRadius:8, background:'var(--bg-secondary)', border:'1px solid var(--border)' }}>
                  <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)', marginBottom:4 }}>{p.name}</div>
                  <div style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--cyan)' }}>IP: {p.ip || '—'}</div>
                  <div style={{ fontSize:12, fontFamily:'var(--font-mono)', color:'var(--text-muted)' }}>GW: {p.gateway || '—'}</div>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding:16 }}>
              <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:12 }}>Legend</div>
              {[
                ['rgba(20,184,166,0.4)','PC / Host'],
                ['rgba(99,102,241,0.4)','Network Switch'],
                ['rgba(34,197,94,0.9)','Pinged (reachable)'],
              ].map(([col, lbl]) => (
                <div key={lbl} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
                  <div style={{ width:14, height:14, borderRadius:'50%', background:col, border:'2px solid rgba(255,255,255,0.15)', flexShrink:0 }} />
                  <span style={{ fontSize:12, color:'var(--text-secondary)' }}>{lbl}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── complete ── */}
      {allDone && (
        <div style={{ marginTop:24 }}>
          <div className="result-box result-success" style={{ marginBottom:14 }}>
            <span>🎉</span>
            <span>Phase 5 complete! LAN connectivity verified and messages sent. 15 pts unlocked.</span>
          </div>
          <button className="btn btn-success" onClick={onComplete} style={{ width:'100%', fontSize:15 }}>
            🏆 Finish Lab — View Final Score
          </button>
        </div>
      )}
    </div>
  );
}
