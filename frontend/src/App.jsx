import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCard } from './components/UploadCard';
import { FetchCard } from './components/FetchCard';

/* ── SVG Icons ──────────────────────────────────────────── */
const ZapIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);
const LockIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);
const BoxIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);
const HashIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);

const features = [
    { Icon: ZapIcon,  title: 'Instant Sharing',    desc: 'Copy, paste, share in seconds. No hassle.' },
    { Icon: LockIcon, title: 'Auto-Expiring',       desc: 'Choose 1m to 10m. Content self-destructs.' },
    { Icon: BoxIcon,  title: 'Everything Works',    desc: 'Text, images, links, files. Up to 10MB.' },
    { Icon: HashIcon, title: 'Simple 4-Digit Codes', desc: 'No accounts, no logins. Just share the code.' },
];

/* ── Nature SVG Background ──────────────────────────────── */
function NatureBg() {
    // Procedural background generation on mount
    const props = React.useMemo(() => {
        // 1. Randomize Hills (Static per reload)
        const hills = [...Array(4)].map((_, i) => {
            const h1 = 160 + Math.random() * 80;
            const h2 = 140 + Math.random() * 100;
            const h3 = 180 + Math.random() * 60;
            return `M-100,320 L-100,${h1} Q300,${h1 - 80} 720,${h2} Q1140,${h2 + 80} 1600,${h3} L1600,320 Z`;
        });

        // 2. Five Layers of Dense Grass
        const grassLayers = [...Array(5)].map((_, layerIndex) => {
            const count = 50 + (layerIndex * 15);
            return [...Array(count)].map((__, i) => {
                const type = i % 3; // 0: standard, 1: thick, 2: tapered/wild
                return {
                    x: Math.random() * 1500 - 50,
                    h: (20 + (layerIndex * 10)) + Math.random() * (20 + layerIndex * 5),
                    strokeWidth: type === 1 ? 3.5 : (type === 2 ? 1.5 : 2.5),
                    opacity: 0.3 + (layerIndex * 0.12),
                    color: ["#8ecfa8", "#6fb58d", "#4ba371", "#3a8f5e", "#2a6e40"][layerIndex],
                    duration: 3 + Math.random() * 4,
                    delay: Math.random() * 5,
                    skew: (Math.random() - 0.5) * 12
                };
            });
        });

        // 3. Scattered Flowers
        const flowers = [...Array(16)].map((_, i) => ({
            x: Math.random() * 1440,
            stemH: 25 + Math.random() * 20,
            delay: Math.random() * 6,
            color: ["#ff9e6d", "#ffcc6d", "#ffed6d", "#6dccff"][i % 4]
        }));

        return { hills, grassLayers, flowers };
    }, []);

    return (
        <div className="nature-bg" aria-hidden="true">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 1440 320"
                preserveAspectRatio="none"
                style={{ width: '100%', height: '100%', display: 'block' }}
            >
                {/* Procedural Static Hills */}
                {props.hills.map((d, i) => (
                    <path 
                        key={`hill-${i}`} 
                        d={d} 
                        fill={["#f0faf4", "#e2f5e9", "#d4eedd", "#c6e7d1"][i]} 
                        opacity={0.6 + (i * 0.1)} 
                    />
                ))}

                {/* 5 Layers of Grass */}
                {props.grassLayers.map((layer, lIdx) => (
                    <g key={`layer-${lIdx}`}>
                        {layer.map((g, i) => (
                            <motion.path
                                key={`g-${lIdx}-${i}`}
                                d={`M${g.x},321 Q${g.x + g.skew},${320 - g.h/2} ${g.x},${320 - g.h}`}
                                stroke={g.color}
                                strokeWidth={g.strokeWidth}
                                strokeLinecap="round"
                                fill="none"
                                opacity={g.opacity}
                                animate={{ 
                                    d: [
                                        `M${g.x},321 Q${g.x + g.skew},${320 - g.h/2} ${g.x},${320 - g.h}`,
                                        `M${g.x},321 Q${g.x + g.skew + 8},${320 - g.h/2} ${g.x + 4},${320 - g.h}`,
                                        `M${g.x},321 Q${g.x + g.skew},${320 - g.h/2} ${g.x},${320 - g.h}`
                                    ]
                                }}
                                transition={{ duration: g.duration, repeat: Infinity, ease: "easeInOut", delay: g.delay }}
                            />
                        ))}
                    </g>
                ))}

                {/* Scattered Mixed Flowers */}
                {props.flowers.map((f, i) => (
                    <g key={`f-${i}`}>
                        <path d={`M${f.x},320 Q${f.x + 2},${320 - f.stemH/2} ${f.x},${320 - f.stemH}`} stroke="#2a6e40" strokeWidth="1.2" fill="none" opacity={0.5} />
                        <motion.g
                            animate={{ rotate: [0, 5, -5, 0], x: [0, 2, -2, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: f.delay }}
                            style={{ transformOrigin: `${f.x}px ${320 - f.stemH}px` }}
                        >
                            <circle cx={f.x} cy={320 - f.stemH - 4} r="4" fill={f.color} />
                            <circle cx={f.x - 4} cy={320 - f.stemH} r="4" fill={f.color} />
                            <circle cx={f.x + 4} cy={320 - f.stemH} r="4" fill={f.color} />
                            <circle cx={f.x} cy={320 - f.stemH + 4} r="4" fill={f.color} />
                            <circle cx={f.x} cy={320 - f.stemH} r="3" fill="#f4c430" />
                        </motion.g>
                    </g>
                ))}
            </svg>
        </div>
    );
}

/* ── Developer Credits ──────────────────────────────────── */
function DeveloperInfo() {
    return (
        <motion.div 
            className="dev-credits"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
        >
            <div className="dev-pill">
                <span className="dev-label">Crafted by</span>
                <span className="dev-name">iteshxt</span>
                
                <div className="dev-links">
                    <a href="https://github.com/iteshxt" target="_blank" rel="noopener noreferrer">GitHub</a>
                    <a href="https://iteshxt.me" target="_blank" rel="noopener noreferrer">Website</a>
                    <a href="mailto:iteshxt@gmail.com">Email</a>
                </div>
            </div>
        </motion.div>
    );
}

/* ── Fade-in variant for left col items ─────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 22 },
    show:   { opacity: 1, y: 0 },
};

/* ── Animated Mascot Switcher ───────────────────────────── */
function Mascot() {
    const [gifLoaded, setGifLoaded] = React.useState(false);

    return (
        <div className="mascot-wrapper">
            {/* Background PNG - Always there until GIF is ready */}
            <motion.img
                src="/images/lizard.png"
                alt="Static mascot"
                className="mascot-img static"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: gifLoaded ? 0 : 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            />
            
            {/* Animated GIF - Fades in once loaded */}
            <motion.img
                src="/images/lizard.gif"
                alt="Animated mascot"
                className="mascot-img animated"
                onLoad={() => setGifLoaded(true)}
                initial={{ opacity: 0 }}
                animate={{ opacity: gifLoaded ? 1 : 0 }}
                transition={{ duration: 0.4 }}
                whileHover={{ scale: 1.07 }}
            />
        </div>
    );
}

/* ── Branding ── */
function Branding() {
    return (
        <motion.div 
            className="brand-section"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="brand-row">
                <Mascot />
                <div className="brand-info">
                    <h1 className="brand-name">Clippy</h1>
                    <div className="brand-meta">
                        <span className="beta-badge">BETA</span>
                        <span className="brand-tagline">Lightning fast Sharing</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

export default function App() {
    const [activeTab, setActiveTab] = useState('share');

    return (
        <div className="page-shell">
            <NatureBg />
            <DeveloperInfo />

            <div className="page-inner">
                <Branding />

                {/* ── Hero (Heading) ── */}
                <motion.div 
                    className="hero-section" 
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                >
                    <h2 className="hero-headline">
                        Share anything<br />in seconds
                    </h2>
                    <p className="hero-sub">No accounts. No logins. No friction.</p>
                </motion.div>

                {/* ── Features ── */}
                <motion.div 
                    className="features-section"
                    initial="hidden"
                    animate="show"
                    variants={{ show: { transition: { staggerChildren: 0.1 } } }}
                >
                    <div className="features">
                        {features.map(({ Icon, title, desc }, i) => (
                            <motion.div
                                key={title}
                                className="feat-item"
                                variants={fadeUp}
                                transition={{ delay: i * 0.06 }}
                            >
                                <div className="feat-icon"><Icon /></div>
                                <div className="feat-body">
                                    <p className="feat-title">{title}</p>
                                    <p className="feat-desc">{desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* ── RIGHT ── */}
                <motion.div
                    className="right-col"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
                >
                    {/* Tabs */}
                    <div className="tab-strip">
                        {['share', 'fetch'].map((tab) => (
                            <button
                                key={tab}
                                className={`tab-btn${activeTab === tab ? ' active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                            >
                                {tab === 'share' ? 'Share' : 'Retrieve'}
                                {activeTab === tab && (
                                    <motion.div
                                        layoutId="tab-underline"
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 8,
                                            right: 8,
                                            height: 2,
                                            background: 'var(--green)',
                                            borderRadius: 2,
                                        }}
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Card */}
                    <div className="main-card">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, x: activeTab === 'share' ? -16 : 16 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: activeTab === 'share' ? 16 : -16 }}
                                transition={{ duration: 0.22, ease: 'easeInOut' }}
                                style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
                            >
                                {activeTab === 'share' ? <UploadCard /> : <FetchCard />}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Recent Share floating pill */}
                    <RecentShare />
                </motion.div>

            </div>
        </div>
    );
}

/* ── RecentShare Component ───────────────────────────────── */
const CopyIconSmall = () => (
    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
);

function RecentShare() {
    const [recent, setRecent] = React.useState(null);
    const [copied, setCopied] = React.useState(false);

    React.useEffect(() => {
        let interval;
        const loadRecent = () => {
            const saved = localStorage.getItem('recentShare');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.expiresAt && new Date() > new Date(parsed.expiresAt)) {
                    localStorage.removeItem('recentShare');
                    setRecent(null);
                } else {
                    setRecent(parsed);
                }
            } else {
                setRecent(null);
            }
        };
        
        loadRecent();
        window.addEventListener('recentShareUpdated', loadRecent);
        
        interval = setInterval(() => {
            if (recent?.expiresAt && new Date() > new Date(recent.expiresAt)) {
                localStorage.removeItem('recentShare');
                setRecent(null);
            }
        }, 1000);

        return () => {
            window.removeEventListener('recentShareUpdated', loadRecent);
            clearInterval(interval);
        };
    }, [recent]);

    if (!recent) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="recent-share"
        >
            <div className="recent-info">
                <span className="recent-label">Shared</span>
                <span className="recent-name" title={recent.name}>{recent.name}</span>
                <span className="recent-meta">({recent.duration}m)</span>
            </div>
            <div className="recent-code">
                <span>Code:</span>
                <strong>{recent.id}</strong>
                <button 
                    onClick={() => {
                        navigator.clipboard.writeText(recent.id);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                    }} 
                    title="Copy Code"
                >
                    {copied ? <span style={{fontSize: 10, fontWeight: 'bold', color: 'var(--green)'}}>✓</span> : <CopyIconSmall />}
                </button>
            </div>
        </motion.div>
    );
}