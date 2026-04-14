import React, { useState } from 'react';
import WindowsInstaller from './WindowsInstaller.jsx';
import LinuxInstaller from './LinuxInstaller.jsx';

// Tasks for the final verification stage
const BOOT_TASKS = [
    { key: 'grub', label: 'Show GRUB Menu', desc: 'Restart PC. GRUB boot menu appears with both OS options.', os: null },
    { key: 'windows', label: 'Boot into Windows', desc: 'Select Windows 11. Wait for desktop. Open System Info (Win+Pause).', os: 'windows' },
    { key: 'linux', label: 'Boot into Linux', desc: 'Restart. Select Linux in GRUB. Open terminal. Run: uname -a', os: 'linux' },
    { key: 'logbook', label: 'Record Boot Times', desc: 'Write start/end time for each OS boot in your logbook.', os: null },
];

const WINDOWS_INFO = {
    label: 'System Information — Windows',
    items: [
        ['OS Name', 'Microsoft Windows 11 Pro'],
        ['Version', '10.0.22631 Build 22631'],
        ['Architecture', 'x64-based PC'],
        ['Processor', 'Intel Core i5-12400, 6 Cores'],
        ['RAM', '8.00 GB'],
        ['Disk', 'C:\\ — 97.6 GB (NTFS)'],
        ['Boot Mode', 'UEFI (Secure Boot ON)'],
    ]
};

const LINUX_INFO = {
    label: 'Terminal — Linux',
    items: [
        ['uname -a', 'Linux student-pc 6.8.0-45-generic #45-Ubuntu SMP x86_64 GNU/Linux'],
        ['df -h /', 'Filesystem: /dev/sda2  Size: 30G  Used: 5.4G  Avail: 23G'],
        ['free -h', 'Mem: 7.7Gi  Used: 1.2Gi  Swap: 2.0Gi'],
        ['lsblk', 'sda1 (EFI 100M) | sda2 Linux / (30G) | sda3 swap (2G)'],
        ['hostnamectl', 'Hostname: student-pc  OS: Ubuntu 24.04 LTS  Kernel: 6.8.0'],
    ]
};

/**
 * Combined Dual‑Boot screen.
 * Stages:
 *   1. Windows installer
 *   2. Linux installer
 *   3. Verification (GRUB menu, boot simulation, logbook)
 * Props:
 *   onWindowsDone – called when Windows installation finishes
 *   onLinuxDone   – called when Linux installation finishes
 *   onComplete    – called after verification checklist is completed
 */
export default function DualBootScreen({ onWindowsDone, onLinuxDone, onComplete, initialStage = 'windows' }) {
    const [stage, setStage] = useState(initialStage); // 'windows' | 'linux' | 'verify'
    const [tasks, setTasks] = useState({ grub: false, windows: false, linux: false, logbook: false });
    const [selected, setSelected] = useState(null); // boot selection for preview
    const [bootAnim, setBootAnim] = useState(null);

    // Shared partition state
    const [partitionConfig, setPartitionConfig] = useState({
        winSize: 100,
        unallocSize: 80,
        linuxRootSize: 40,
        linuxSwapSize: 4,
        errorSim: false
    });

    const allDone = Object.values(tasks).every(Boolean);
    const markTask = (key) => setTasks(t => ({ ...t, [key]: true }));

    const handleBoot = (os) => {
        setBootAnim(os);
        setTimeout(() => {
            setBootAnim(null);
            setSelected(os);
            markTask(os);
        }, 1800);
    };

    // Render the appropriate stage UI
    const renderStage = () => {
        if (stage === 'windows') {
            return (
                <WindowsInstaller
                    config={partitionConfig}
                    setConfig={setPartitionConfig}
                    onComplete={() => {
                        onWindowsDone();
                        setStage('linux');
                    }}
                    goBack={() => { /* no previous stage */ }}
                />
            );
        }
        if (stage === 'linux') {
            return (
                <LinuxInstaller
                    config={partitionConfig}
                    setConfig={setPartitionConfig}
                    onComplete={() => {
                        onLinuxDone();
                        setStage('verify');
                    }}
                    goBack={() => setStage('windows')}
                />
            );
        }
        // Verification UI
        return (
            <div className="fade-in">
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                    <button className="btn btn-ghost" onClick={() => setStage('linux')} style={{ marginRight: 'auto' }}>
                        ← Back to Linux Installer
                    </button>
                    <div style={{ width: 50, height: 50, borderRadius: 12, background: 'linear-gradient(135deg,#7e22ce,#a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>⚙️</div>
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--purple-light)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 3 }}>Phase 3</div>
                        <h2 style={{ fontSize: 22, fontWeight: 800 }}>Dual‑Boot Verification</h2>
                        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Confirm both OSes are accessible via the GRUB bootloader.</p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}><span className="badge badge-purple">15 pts</span></div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
                    {/* Checklist */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div className="card" style={{ padding: 16 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 14 }}>Verification Checklist</div>
                            {BOOT_TASKS.map(t => (
                                <div key={t.key} style={{ display: 'flex', gap: 12, marginBottom: 12, alignItems: 'flex-start' }}>
                                    <div
                                        onClick={() => { if (!tasks[t.key] && !t.os) markTask(t.key); }}
                                        style={{
                                            width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: (!tasks[t.key] && !t.os) ? 'pointer' : 'default',
                                            border: `2px solid ${tasks[t.key] ? 'var(--green)' : 'var(--border)'}`,
                                            background: tasks[t.key] ? 'var(--green)' : 'transparent',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700,
                                            color: '#000', marginTop: 1, transition: 'all 0.2s',
                                        }}>
                                        {tasks[t.key] && '✓'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: tasks[t.key] ? 'var(--text-primary)' : 'var(--text-muted)' }}>{t.label}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{t.desc}</div>
                                        {t.os && !tasks[t.key] && (
                                            <button className={`btn btn-ghost`} onClick={() => handleBoot(t.os)}
                                                disabled={!!bootAnim}
                                                style={{ marginTop: 8, fontSize: 12, padding: '5px 12px' }}>
                                                {bootAnim === t.os ? <><span className="spinner" style={{ width: 12, height: 12 }} />Booting...</> : `Boot ${t.os === 'windows' ? 'Windows' : 'Linux'}`}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {/* Logbook task */}
                            {!tasks.logbook && (
                                <button className="btn btn-ghost" onClick={() => markTask('logbook')} style={{ width: '100%', fontSize: 13, marginTop: 4 }}>
                                    📓 Mark Boot Times Recorded
                                </button>
                            )}
                        </div>
                        {allDone && (
                            <button className="btn btn-success" onClick={onComplete} style={{ width: '100%' }}>
                                Next: Subnetting →
                            </button>
                        )}
                    </div>

                    {/* Right panel – GRUB and boot preview */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ background: '#040810', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 10, padding: 20, fontFamily: 'var(--font-mono)', fontSize: 13 }}>
                            <div style={{ color: '#a855f7', marginBottom: 2, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>GNU GRUB 2.06</div>
                            <div style={{ color: '#475569', fontSize: 11, marginBottom: 16 }}>Use the ↑↓ arrow keys. Press Enter to select.</div>
                            {[{ label: 'Windows 11 (on /dev/sda1)', key: 'windows', icon: '🪟' }, { label: 'Ubuntu 24.04 LTS (on /dev/sda2)', key: 'linux', icon: '🐧' }, { label: 'Advanced options for Ubuntu...', key: null, icon: '⚙️' }].map((item, i) => (
                                <div key={i}
                                    onClick={() => item.key && !bootAnim && handleBoot(item.key)}
                                    style={{
                                        padding: '6px 10px', borderRadius: 4, marginBottom: 4,
                                        background: selected === item.key ? 'rgba(99,102,241,0.3)' : 'transparent',
                                        border: selected === item.key ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                                        cursor: item.key && !bootAnim ? 'pointer' : 'default',
                                        color: item.key ? '#e2e8f0' : '#64748b',
                                        transition: 'all 0.15s',
                                    }}>
                                    {selected === item.key && '▶ '}
                                    {item.icon} {item.label}
                                </div>
                            ))}
                            <div style={{ marginTop: 12, color: '#334155', fontSize: 11, borderTop: '1px solid #1e293b', paddingTop: 10 }}>
                                The highlighted entry will be booted automatically in 5 seconds.
                            </div>
                        </div>
                        {/* Boot animation / OS preview */}
                        {bootAnim && (
                            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 24, textAlign: 'center' }}>
                                <div className="spinner" style={{ width: 32, height: 32, borderTopColor: bootAnim === 'windows' ? 'var(--blue)' : 'var(--orange)', margin: '0 auto 12px' }} />
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>Booting {bootAnim === 'windows' ? 'Windows 11' : 'Ubuntu Linux'}...</div>
                            </div>
                        )}
                        {selected === 'windows' && !bootAnim && (
                            <div className="card" style={{ padding: 16 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue-light)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>🪟 {WINDOWS_INFO.label}</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
                                    {WINDOWS_INFO.items.map(([k, v]) => (
                                        <div key={k} style={{ display: 'flex', gap: 12, paddingBottom: 6, marginBottom: 6, borderBottom: '1px solid var(--border)' }}>
                                            <span style={{ color: 'var(--text-muted)', minWidth: 120, flexShrink: 0 }}>{k}</span>
                                            <span style={{ color: 'var(--text-primary)' }}>{v}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {selected === 'linux' && !bootAnim && (
                            <div className="card" style={{ padding: 16 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--orange-light)', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 }}>🐧 {LINUX_INFO.label}</div>
                                <div className="terminal" style={{ minHeight: 'auto' }}>
                                    {LINUX_INFO.items.map(([cmd, out]) => (
                                        <div key={cmd}>
                                            <span className="t-dim">$ </span><span className="t-cyan">{cmd}</span>
                                            <div style={{ color: '#94a3b8', paddingLeft: 12, fontSize: 11 }}>{out}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        {allDone && (
                            <div className="result-box result-success">
                                <span>✅</span>
                                <span>Dual‑boot verified! Both OSes confirmed accessible via GRUB. 15 pts unlocked.</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fade-in">
            {renderStage()}
        </div>
    );
}

