import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Use environment variable from Vite or fallback to local dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_URL = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;

import { 
    Type as TypeIcon, 
    Image as ImageIcon, 
    Link as LinkIcon, 
    File as FileIcon, 
    Upload as UploadIcon, 
    Share as ShareIcon, 
    Copy as CopyIcon, 
    Check as CheckIcon, 
    AlertCircle as AlertIcon, 
    X as XIcon,
    Loader2 as _SpinIcon
} from 'lucide-react';

/* ── Icons ──────────────────────────────────────────────── */
const SpinIcon = () => <_SpinIcon className="spin" />;

/* ── Sliding Pill Selector ──────────────────────────────── */
function SlidingPills({ label, options, value, onChange }) {
    const containerRef = useRef(null);
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
    const buttonRefs = useRef({});

    useEffect(() => {
        const activeEl = buttonRefs.current[value];
        const container = containerRef.current;
        if (!activeEl || !container) return;
        const containerRect = container.getBoundingClientRect();
        const btnRect = activeEl.getBoundingClientRect();
        setPillStyle({
            left: btnRect.left - containerRect.left,
            width: btnRect.width,
        });
    }, [value]);

    return (
        <div className="pill-selector-wrap">
            {label && <span className="pill-selector-label">{label}</span>}
            <div className="pill-selector" ref={containerRef}>
                <motion.div
                    className="pill-indicator"
                    animate={{ left: pillStyle.left, width: pillStyle.width }}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        ref={(el) => (buttonRefs.current[opt.value] = el)}
                        className={`pill-option${value === opt.value ? ' active' : ''}`}
                        type="button"
                        onClick={() => onChange(opt.value)}
                        data-tooltip={opt.label}
                    >
                        <span style={{ display: 'flex', alignItems: 'center', gap: value === opt.value && opt.icon ? '6px' : '0' }}>
                            {opt.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{opt.icon}</span>}
                            {(opt.showLabel !== false || value === opt.value) && <span>{opt.label}</span>}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}

/* ── Content type options ───────────────────────────────── */
const contentTypes = [
    { value: 'text',  label: 'Text',  icon: <TypeIcon />,  showLabel: false },
    { value: 'image', label: 'Image', icon: <ImageIcon />, showLabel: false },
    { value: 'link',  label: 'Link',  icon: <LinkIcon />,  showLabel: false },
    { value: 'file',  label: 'File',  icon: <FileIcon />,  showLabel: false },
];

const durationOptions = [
    { value: '1',  label: '1m'  },
    { value: '5',  label: '5m'  },
    { value: '10', label: '10m' },
];

/* ── Component ──────────────────────────────────────────── */
export function UploadCard() {
    const [content, setContent] = useState('');
    const [file, setFile] = useState(null);
    const [duration, setDuration] = useState('1');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [contentType, setContentType] = useState('text');
    const [copied, setCopied] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleTypeChange = (val) => {
        setContentType(val);
        if (!['file', 'image'].includes(val)) setFile(null);
    };

    const handleDragOver  = (e) => { e.preventDefault(); setDragActive(true);  };
    const handleDragLeave = (e) => { e.preventDefault(); setDragActive(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files.length > 0) {
            const uploadedFile = e.dataTransfer.files[0];
            if (uploadedFile.size > 10 * 1024 * 1024) {
                setError('File too large. Maximum size is 10MB.');
                return;
            }
            setFile(uploadedFile);
            setError(null);
            setContent('');
        }
    };
    const handleFileSelect = (e) => {
        if (e.target.files.length > 0) {
            const uploadedFile = e.target.files[0];
            if (uploadedFile.size > 10 * 1024 * 1024) {
                setError('File too large. Maximum size is 10MB.');
                return;
            }
            setFile(uploadedFile);
            setError(null);
            setContent('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setResult(null);
        if (!content && !file) { setError('Please enter content or select a file'); return; }
        setLoading(true);
        try {
            const formData = new FormData();
            if (file) {
                formData.append('file', file);
                formData.append('contentType', 'file');
            } else {
                formData.append('content', content);
                formData.append('contentType', contentType);
            }
            formData.append('duration', duration);
            const res = await axios.post(`${API_URL}/api/paste`, formData, {
                headers: { 'Content-Type': file ? 'multipart/form-data' : 'application/x-www-form-urlencoded' },
            });
            setResult(res.data);
            setContent('');
            setFile(null);
            
            // Auto copy to clipboard
            if (res.data.id) {
                navigator.clipboard.writeText(res.data.id).catch(() => {});
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);

                const recentShare = {
                    id: res.data.id,
                    type: contentType,
                    name: file ? file.name : (content.length > 15 ? content.slice(0, 15) + '...' : content || 'Snippet'),
                    duration: duration,
                    expiresAt: res.data.expiresAt
                };
                localStorage.setItem('recentShare', JSON.stringify(recentShare));
                window.dispatchEvent(new Event('recentShareUpdated'));
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        if (result?.id) {
            navigator.clipboard.writeText(result.id);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleReset = () => {
        setResult(null);
        setContent('');
        setFile(null);
        setError(null);
    };

    const placeholder =
        contentType === 'text'  ? 'Paste your text...' :
        contentType === 'image' ? 'Paste image URL...' :
        contentType === 'link'  ? 'https://example.com' : '';

    /* Success */
    if (result) {
        return (
            <motion.div
                className="success-state"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="success-header">
                    <motion.div
                        className="success-icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                    >
                        <CheckIcon />
                    </motion.div>
                    <div>
                        <p className="success-title">Shared successfully!</p>
                        <p className="success-sub">Content is ready to retrieve</p>
                    </div>
                </div>

                <div className="code-box">
                    <p className="code-box-label">Share Code</p>
                    <motion.code
                        className="code-box-code"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                    >
                        {result.id}
                    </motion.code>
                    <motion.button
                        className="copy-btn"
                        onClick={copyCode}
                        whileTap={{ scale: 0.97 }}
                    >
                        <CopyIcon />
                        {copied ? 'Copied!' : 'Copy Code'}
                    </motion.button>
                </div>

                <p className="expiry-note">Expires in {result.expiryMinutes ?? duration} minute{Number(result.expiryMinutes ?? duration) !== 1 ? 's' : ''}</p>

                <button className="reset-btn" onClick={handleReset}>Share Another</button>
            </motion.div>
        );
    }

    return (
        <form className="upload-form" onSubmit={handleSubmit}>

            {/* Error */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        className="error-banner"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                    >
                        <AlertIcon />
                        <div>
                            <p className="error-title">Error</p>
                            <p className="error-msg">{error}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls row */}
            <div className="controls-row">
                <SlidingPills
                    label="Content Type"
                    options={contentTypes}
                    value={contentType}
                    onChange={handleTypeChange}
                />
                <SlidingPills
                    label="Keep For"
                    options={durationOptions}
                    value={duration}
                    onChange={setDuration}
                />
            </div>

            {/* Input area */}
            <AnimatePresence mode="wait">
                {['file', 'image'].includes(contentType) ? (
                    <motion.div
                        key="file"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className={`drop-zone${dragActive ? ' drag-active' : ''}`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload-input').click()}
                    >
                        <input
                            type="file"
                            id="file-upload-input"
                            style={{ display: 'none' }}
                            onChange={handleFileSelect}
                        />
                        {file && file.type.startsWith('image/') ? (
                            <img src={URL.createObjectURL(file)} alt="Preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 6 }} />
                        ) : (
                            <>
                                <div className="drop-zone-icon" style={{ width: 28, height: 28 }}>
                                    <UploadIcon />
                                </div>
                                <p className="drop-zone-label">Drag or click to upload</p>
                                <p className="drop-zone-sub">Max 10MB</p>
                            </>
                        )}
                    </motion.div>
                ) : (
                    <motion.textarea
                        key="text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="content-textarea"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={placeholder}
                    />
                )}
            </AnimatePresence>

            {/* File badge */}
            <AnimatePresence>
                {file && (
                    <motion.div
                        className="file-badge"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                    >
                        <div className="file-badge-name">
                            <span style={{ width: 14, height: 14, display: 'flex' }}><FileIcon /></span>
                            <span>{file.name}</span>
                        </div>
                        <button type="button" className="file-badge-remove" onClick={() => setFile(null)}>
                            <span style={{ width: 14, height: 14, display: 'flex' }}><XIcon /></span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
                type="submit"
                className="submit-btn"
                disabled={loading || (!content && !file)}
                whileTap={!loading && (content || file) ? { scale: 0.98 } : {}}
                style={{ marginTop: 'auto' }}
            >
                {loading ? (
                    <><SpinIcon /> Sharing...</>
                ) : (
                    <><ShareIcon /> Share to Clipboard</>
                )}
            </motion.button>
        </form>
    );
}
