import React, { useState, useMemo } from 'react';

/* ── helpers ─────────────────────────────────────────── */
function ipToInt(ip) {
  return ip.split('.').reduce((acc, o) => (acc << 8) | Number(o), 0) >>> 0;
}
function intToIp(n) {
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}
function cidrToMask(cidr) {
  return cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
}
function calcSubnet(ip, cidr) {
  const mask = cidrToMask(cidr);
  const net  = (ipToInt(ip) & mask) >>> 0;
  const bc   = (net | ~mask) >>> 0;
  return {
    mask:      intToIp(mask),
    network:   intToIp(net),
    broadcast: intToIp(bc),
    first:     intToIp(net + 1),
    last:      intToIp(bc - 1),
    hosts:     Math.max(0, (bc - net) - 1),
  };
}
function isValidIp(s) { return /^(\d{1,3}\.){3}\d{1,3}$/.test(s) && s.split('.').every(o => Number(o) <= 255); }
function inRange(ip, net, cidr) {
  const mask = cidrToMask(cidr);
  return (ipToInt(ip) & mask) >>> 0 === (ipToInt(net) & mask) >>> 0;
}

/* ── subnet quiz ─────────────────────────────────────── */
const QUIZ = [
  { q: 'How many host addresses are available in a /24 subnet?', opts: ['254','256','255','512'], ans: 0 },
  { q: 'What is the subnet mask for /26?', opts: ['255.255.255.0','255.255.255.192','255.255.255.128','255.255.255.224'], ans: 1 },
  { q: 'What is the broadcast address of 192.168.1.0/28?', opts: ['192.168.1.14','192.168.1.15','192.168.1.255','192.168.1.31'], ans: 1 },
  { q: 'A /30 subnet is commonly used for?', opts: ['Large LAN','Point-to-point links','VLAN trunks','Loopback'], ans: 1 },
  { q: 'How many bits are borrowed for a /27 from a /24?', opts: ['2','3','4','5'], ans: 1 },
];

const PRESETS = [
  { label:'Lab A – 10.0.0.0/24',  ip:'10.0.0.0',     cidr:24 },
  { label:'Lab B – 192.168.1.0/26', ip:'192.168.1.0', cidr:26 },
  { label:'Lab C – 172.16.0.0/28', ip:'172.16.0.0',   cidr:28 },
];

const PC_DEFAULTS = [
  { name:'PC-01 (Windows)', ip:'', gateway:'' },
  { name:'PC-02 (Linux)',   ip:'', gateway:'' },
  { name:'PC-03 (Switch)',  ip:'', gateway:'' },
];

/* ── component ───────────────────────────────────────── */
export default function SubnettingScreen({ onComplete }) {
  /* ── tab ── */
  const [tab, setTab] = useState('calc'); // calc | assign | quiz

  /* ── calculator ── */
  const [netIp,  setNetIp]  = useState('192.168.1.0');
  const [cidr,   setCidr]   = useState(24);
  const [calcErr, setCalcErr] = useState('');

  const subnet = useMemo(() => {
    if (!isValidIp(netIp)) return null;
    return calcSubnet(netIp, cidr);
  }, [netIp, cidr]);

  /* ── IP assignment ── */
  const [pcs, setPcs] = useState(PC_DEFAULTS);
  const [assignNet, setAssignNet] = useState('192.168.1.0');
  const [assignCidr, setAssignCidr] = useState(24);
  const [verified, setVerified] = useState(false);
  const [assignErrors, setAssignErrors] = useState([]);

  const handlePcChange = (i, field, val) => {
    setPcs(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: val } : p));
    setVerified(false);
    setAssignErrors([]);
  };

  const handlePreset = (p) => {
    setAssignNet(p.ip); setAssignCidr(p.cidr);
    setVerified(false); setAssignErrors([]);
    setPcs(PC_DEFAULTS);
  };

  const verifyAssignment = () => {
    if (!isValidIp(assignNet)) { setAssignErrors(['Invalid network address.']); return; }
    const info = calcSubnet(assignNet, assignCidr);
    const errs = [];
    pcs.forEach((pc, i) => {
      if (!isValidIp(pc.ip)) { errs.push(`${pc.name}: invalid IP "${pc.ip}"`); return; }
      if (!isValidIp(pc.gateway)) { errs.push(`${pc.name}: invalid gateway "${pc.gateway}"`); return; }
      if (!inRange(pc.ip, assignNet, assignCidr))
        errs.push(`${pc.name}: IP ${pc.ip} is not in ${assignNet}/${assignCidr}`);
      if (pc.ip === info.network)
        errs.push(`${pc.name}: IP is the network address`);
      if (pc.ip === info.broadcast)
        errs.push(`${pc.name}: IP is the broadcast address`);
      if (!inRange(pc.gateway, assignNet, assignCidr))
        errs.push(`${pc.name}: gateway ${pc.gateway} not in subnet`);
    });
    // check unique IPs
    const ips = pcs.map(p => p.ip).filter(ip => isValidIp(ip));
    if (new Set(ips).size !== ips.length) errs.push('Duplicate IP addresses detected!');

    setAssignErrors(errs);
    setVerified(errs.length === 0);
  };

  /* ── quiz ── */
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizDone, setQuizDone] = useState(false);

  const handleAnswer = (optIdx) => {
    if (selected !== null) return;
    setSelected(optIdx);
    if (optIdx === QUIZ[qIdx].ans) setQuizScore(s => s + 1);
  };
  const handleNext = () => {
    if (qIdx + 1 >= QUIZ.length) { setQuizDone(true); return; }
    setQIdx(q => q + 1); setSelected(null);
  };

  const allDone = verified && quizDone;

  /* ── tabs ── */
  const TABS = [
    { id:'calc',   label:'🧮 Subnet Calculator' },
    { id:'assign', label:'🖥️ IP Assignment' },
    { id:'quiz',   label:'🧠 Subnet Quiz' },
  ];

  return (
    <div className="fade-in">
      {/* header */}
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        <div style={{ width:50, height:50, borderRadius:12, background:'linear-gradient(135deg,#0d9488,#14b8a6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>🌐</div>
        <div>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--teal)', textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>Phase 4</div>
          <h2 style={{ fontSize:22, fontWeight:800 }}>Subnetting &amp; IP Configuration</h2>
          <p style={{ fontSize:13, color:'var(--text-secondary)', marginTop:2 }}>Design a subnet plan, assign static IPs, and verify with ipconfig.</p>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8, alignItems:'center' }}>
          <span className="badge badge-yellow">20 pts</span>
          {allDone && <span className="badge badge-green">✓ Complete</span>}
        </div>
      </div>

      {/* tab nav */}
      <div style={{ display:'flex', gap:4, marginBottom:20, background:'var(--bg-card)', borderRadius:10, padding:4, border:'1px solid var(--border)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex:1, padding:'8px 12px', borderRadius:7, border:'none', cursor:'pointer',
            fontFamily:'var(--font-sans)', fontSize:13, fontWeight:600,
            background: tab===t.id ? 'linear-gradient(135deg,#0d9488,#14b8a6)' : 'transparent',
            color: tab===t.id ? '#fff' : 'var(--text-secondary)',
            transition:'all 0.2s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* ──────────── TAB: CALCULATOR ──────────── */}
      {tab === 'calc' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          {/* input */}
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:16 }}>📐 Subnet Parameters</div>

            <div style={{ marginBottom:14 }}>
              <label className="label">Network Address</label>
              <input className="input" value={netIp} onChange={e => { setNetIp(e.target.value); setCalcErr(''); }}
                placeholder="e.g. 192.168.1.0" />
            </div>
            <div style={{ marginBottom:20 }}>
              <label className="label">CIDR Prefix (/{cidr})</label>
              <input type="range" min={1} max={30} value={cidr} onChange={e => setCidr(Number(e.target.value))}
                style={{ width:'100%', accentColor:'var(--teal)', marginBottom:6 }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'var(--text-muted)' }}>
                <span>/1</span><span style={{ fontWeight:700, color:'var(--teal)', fontSize:14 }}>/{cidr}</span><span>/30</span>
              </div>
            </div>
            {calcErr && <div className="result-box result-error" style={{ marginBottom:12 }}><span>⚠️</span><span>{calcErr}</span></div>}

            {/* quick reference */}
            <div style={{ background:'var(--bg-secondary)', borderRadius:8, padding:12, fontSize:12, fontFamily:'var(--font-mono)' }}>
              <div style={{ color:'var(--text-muted)', marginBottom:8, fontFamily:'var(--font-sans)', fontSize:11, textTransform:'uppercase', fontWeight:700, letterSpacing:0.5 }}>Common CIDRs</div>
              {[
                ['/24','255.255.255.0','254'],
                ['/25','255.255.255.128','126'],
                ['/26','255.255.255.192','62'],
                ['/27','255.255.255.224','30'],
                ['/28','255.255.255.240','14'],
                ['/30','255.255.255.252','2'],
              ].map(([c,m,h]) => (
                <div key={c} style={{ display:'flex', justifyContent:'space-between', paddingBottom:4, marginBottom:4, borderBottom:'1px solid var(--border)' }}>
                  <span style={{ color:'var(--teal)' }}>{c}</span>
                  <span style={{ color:'var(--text-secondary)' }}>{m}</span>
                  <span style={{ color:'var(--green-light)' }}>{h} hosts</span>
                </div>
              ))}
            </div>
          </div>

          {/* results */}
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:16 }}>📊 Calculated Results</div>
            {subnet ? (
              <>
                {[
                  ['Network Address', subnet.network, 'var(--teal)'],
                  ['Subnet Mask',     subnet.mask,      'var(--blue-light)'],
                  ['First Host IP',   subnet.first,     'var(--green-light)'],
                  ['Last Host IP',    subnet.last,      'var(--green-light)'],
                  ['Broadcast',       subnet.broadcast,  'var(--yellow)'],
                  ['Usable Hosts',    subnet.hosts.toLocaleString(), 'var(--orange-light)'],
                ].map(([label, val, col]) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'9px 0', borderBottom:'1px solid var(--border)' }}>
                    <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{label}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:13, fontWeight:600, color:col }}>{val}</span>
                  </div>
                ))}

                {/* visual bar */}
                <div style={{ marginTop:20 }}>
                  <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:8, textTransform:'uppercase', fontWeight:700, letterSpacing:0.5 }}>Address Space</div>
                  <div style={{ display:'flex', height:24, borderRadius:6, overflow:'hidden', border:'1px solid var(--border)' }}>
                    <div style={{ width:'4%', background:'rgba(59,130,246,0.7)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#93c5fd', fontWeight:700 }}>NET</div>
                    <div style={{ flex:1, background:'rgba(20,184,166,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#5eead4', fontWeight:600 }}>
                      {subnet.hosts} usable hosts
                    </div>
                    <div style={{ width:'4%', background:'rgba(234,179,8,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, color:'#fde047', fontWeight:700 }}>BC</div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'var(--text-muted)', marginTop:4 }}>
                    <span>{subnet.network}</span><span>{subnet.broadcast}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="result-box result-error"><span>⚠️</span><span>Enter a valid IP address (e.g. 192.168.1.0)</span></div>
            )}
          </div>
        </div>
      )}

      {/* ──────────── TAB: ASSIGN ──────────── */}
      {tab === 'assign' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* presets */}
          <div className="card" style={{ padding:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:12 }}>⚡ Lab Presets</div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {PRESETS.map(p => (
                <button key={p.label} className="btn btn-ghost" onClick={() => handlePreset(p)}
                  style={{ fontSize:13 }}>{p.label}</button>
              ))}
            </div>
          </div>

          {/* network config */}
          <div className="card" style={{ padding:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:14 }}>🌐 Network Configuration</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div>
                <label className="label">Network Address</label>
                <input className="input" value={assignNet} onChange={e => { setAssignNet(e.target.value); setVerified(false); }} />
              </div>
              <div>
                <label className="label">CIDR (/{assignCidr})</label>
                <input type="range" min={1} max={30} value={assignCidr} onChange={e => { setAssignCidr(Number(e.target.value)); setVerified(false); }}
                  style={{ width:'100%', accentColor:'var(--teal)', marginTop:10 }} />
                <div style={{ fontSize:12, color:'var(--teal)', fontWeight:700, marginTop:2, textAlign:'center' }}>/{assignCidr} — {isValidIp(assignNet) ? calcSubnet(assignNet, assignCidr).hosts : '?'} hosts</div>
              </div>
            </div>
          </div>

          {/* PC table */}
          <div className="card" style={{ padding:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6, marginBottom:14 }}>🖥️ Assign Static IPs</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:8 }}>
              <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>Device</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>IP Address</div>
              <div style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:0.5 }}>Default Gateway</div>
            </div>
            {pcs.map((pc, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', fontSize:13, color:'var(--text-secondary)', fontWeight:600 }}>
                  {pc.name}
                </div>
                <input className="input" value={pc.ip}
                  onChange={e => handlePcChange(i, 'ip', e.target.value)}
                  placeholder="e.g. 192.168.1.10"
                  style={{ fontFamily:'var(--font-mono)', fontSize:13 }} />
                <input className="input" value={pc.gateway}
                  onChange={e => handlePcChange(i, 'gateway', e.target.value)}
                  placeholder="e.g. 192.168.1.1"
                  style={{ fontFamily:'var(--font-mono)', fontSize:13 }} />
              </div>
            ))}

            <div style={{ display:'flex', gap:10, marginTop:14 }}>
              <button className="btn btn-primary" onClick={verifyAssignment} style={{ flex:1 }}>
                🔍 Verify IP Configuration
              </button>
            </div>

            {assignErrors.length > 0 && (
              <div className="result-box result-error" style={{ marginTop:12, flexDirection:'column', gap:4 }}>
                <span style={{ fontWeight:700 }}>⚠️ Errors found:</span>
                {assignErrors.map((e, i) => <span key={i} style={{ fontSize:12 }}>• {e}</span>)}
              </div>
            )}
            {verified && (
              <div className="result-box result-success" style={{ marginTop:12 }}>
                <span>✅</span>
                <span>All IP addresses are valid and within the subnet! ipconfig simulation passed.</span>
              </div>
            )}

            {/* ipconfig simulation */}
            {verified && (
              <div style={{ marginTop:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:0.5, marginBottom:8 }}>📟 ipconfig /all — Simulated Output</div>
                <div className="terminal" style={{ maxHeight:200 }}>
                  {pcs.map((pc, i) => (
                    <div key={i} style={{ marginBottom:10 }}>
                      <div className="t-bold">{pc.name} — Ethernet adapter:</div>
                      <div><span className="t-dim">   IPv4 Address. . . . . : </span><span className="t-cyan">{pc.ip}</span></div>
                      <div><span className="t-dim">   Subnet Mask . . . . . : </span>{isValidIp(assignNet) ? calcSubnet(assignNet, assignCidr).mask : ''}</div>
                      <div><span className="t-dim">   Default Gateway . . . : </span><span className="t-yellow">{pc.gateway}</span></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ──────────── TAB: QUIZ ──────────── */}
      {tab === 'quiz' && (
        <div className="card" style={{ padding:24, maxWidth:640, margin:'0 auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:0.6 }}>🧠 Subnet Knowledge Check</div>
            <span className="badge badge-yellow">Score: {quizScore}/{QUIZ.length}</span>
          </div>

          {!quizDone ? (
            <>
              {/* progress */}
              <div style={{ display:'flex', gap:6, marginBottom:20 }}>
                {QUIZ.map((_, i) => (
                  <div key={i} style={{ flex:1, height:4, borderRadius:4, background: i < qIdx ? 'var(--green)' : i === qIdx ? 'var(--teal)' : 'var(--border)', transition:'background 0.3s' }} />
                ))}
              </div>

              <div style={{ fontSize:11, color:'var(--text-muted)', marginBottom:8 }}>Question {qIdx + 1} of {QUIZ.length}</div>
              <div style={{ fontSize:16, fontWeight:600, color:'var(--text-primary)', marginBottom:20, lineHeight:1.5 }}>
                {QUIZ[qIdx].q}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {QUIZ[qIdx].opts.map((opt, i) => {
                  const isCorrect = i === QUIZ[qIdx].ans;
                  const isSelected = i === selected;
                  let bg = 'var(--bg-secondary)', border = 'var(--border)', col = 'var(--text-secondary)';
                  if (selected !== null) {
                    if (isCorrect) { bg = 'rgba(34,197,94,0.12)'; border = 'rgba(34,197,94,0.4)'; col = 'var(--green-light)'; }
                    else if (isSelected) { bg = 'rgba(239,68,68,0.12)'; border = 'rgba(239,68,68,0.4)'; col = 'var(--red-light)'; }
                  } else if (isSelected) {
                    bg = 'rgba(20,184,166,0.12)'; border = 'var(--teal)'; col = 'var(--text-primary)';
                  }
                  return (
                    <button key={i} onClick={() => handleAnswer(i)}
                      disabled={selected !== null}
                      style={{
                        padding:'12px 16px', borderRadius:8, border:`2px solid ${border}`,
                        background:bg, color:col, fontSize:14, fontWeight:500, cursor:selected!==null?'default':'pointer',
                        textAlign:'left', fontFamily:'var(--font-sans)', transition:'all 0.2s',
                        display:'flex', alignItems:'center', gap:10,
                      }}>
                      <span style={{ width:24, height:24, borderRadius:'50%', border:`2px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>
                        {selected !== null && isCorrect ? '✓' : selected !== null && isSelected ? '✗' : String.fromCharCode(65+i)}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <div style={{ marginTop:16 }}>
                  <div className={`result-box ${selected === QUIZ[qIdx].ans ? 'result-success' : 'result-error'}`} style={{ marginBottom:12 }}>
                    <span>{selected === QUIZ[qIdx].ans ? '✅ Correct!' : '❌ Wrong!'}</span>
                    <span>The answer is: <strong style={{ fontFamily:'var(--font-mono)' }}>{QUIZ[qIdx].opts[QUIZ[qIdx].ans]}</strong></span>
                  </div>
                  <button className="btn btn-primary" onClick={handleNext} style={{ width:'100%' }}>
                    {qIdx + 1 >= QUIZ.length ? 'Finish Quiz' : 'Next Question →'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign:'center', padding:'20px 0' }}>
              <div style={{ fontSize:48, marginBottom:12 }}>{quizScore >= 4 ? '🏆' : quizScore >= 3 ? '👍' : '📚'}</div>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--text-primary)', marginBottom:6 }}>
                {quizScore}/{QUIZ.length} Correct
              </div>
              <div style={{ fontSize:14, color:'var(--text-secondary)', marginBottom:20 }}>
                {quizScore === QUIZ.length ? 'Perfect score! Subnetting master.' : quizScore >= 3 ? 'Good work! Almost there.' : 'Keep practicing subnetting concepts.'}
              </div>
              <div className={`result-box ${quizScore >= 3 ? 'result-success' : 'result-warn'}`} style={{ textAlign:'left' }}>
                <span>{quizScore >= 3 ? '✅' : '⚠️'}</span>
                <span>{quizScore >= 3 ? 'Quiz passed! Subnetting knowledge confirmed.' : `Score too low. Review CIDR concepts and try again. (${quizScore}/5)`}</span>
              </div>
              {quizScore < 3 && (
                <button className="btn btn-ghost" onClick={() => { setQIdx(0); setSelected(null); setQuizScore(0); setQuizDone(false); }}
                  style={{ marginTop:12, width:'100%' }}>↺ Retry Quiz</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* complete button */}
      {allDone && (
        <div style={{ marginTop:24 }}>
          <div className="result-box result-success" style={{ marginBottom:14 }}>
            <span>✅</span>
            <span>Phase 4 complete! IP configuration verified &amp; quiz passed. 20 pts unlocked.</span>
          </div>
          <button className="btn btn-success" onClick={() => onComplete({ network: assignNet, cidr: assignCidr, pcs })}
            style={{ width:'100%', fontSize:15 }}>
            Next: Ping Test &amp; Messaging →
          </button>
        </div>
      )}
    </div>
  );
}
