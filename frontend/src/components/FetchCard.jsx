import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Use environment variable from Vite or fallback to local dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_URL = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;

/* ── Icons ──────────────────────────────────────────────── */
const DownloadIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);
const CopyIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);
const AlertIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
);
const CheckIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
const FileIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
        <polyline points="13 2 13 9 20 9" />
    </svg>
);
const TypeIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="4 7 4 4 20 4 20 7" />
        <line x1="9" y1="20" x2="15" y2="20" />
        <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
);
const ImageIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);
const LinkIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
);
const SpinIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export function FetchCard() {
    const [pasteId, setPasteId] = useState('');
    const [loading, setLoading] = useState(false);
    const [paste, setPaste] = useState(null);
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleFetch = async (e) => {
        e.preventDefault();
        if (!/^\d{4}$/.test(pasteId)) {
            setError('Paste ID must be exactly 4 digits');
            return;
        }
        setError(null);
        setPaste(null);
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/paste/${pasteId}`);
            setPaste(res.data);
        } catch (err) {
            setError(err.response?.data?.error || 'Content not found or expired');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (paste?.content) {
            navigator.clipboard.writeText(paste.content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const downloadFile = () => {
        if (paste?.contentType === 'file' && paste?.content) {
            const binaryString = atob(paste.content);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: paste.mimeType });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = paste.fileName || 'download';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        }
    };

    const typeInfo = {
        text:  { Icon: TypeIcon,  label: 'Text'  },
        image: { Icon: ImageIcon, label: 'Image' },
        link:  { Icon: LinkIcon,  label: 'Link'  },
        file:  { Icon: FileIcon,  label: paste?.fileName || 'File' },
    };

    return (
        <div className="fetch-inner">

            {/* Error */}
            <AnimatePresence>
                {error && !paste && (
                    <motion.div
                        className="error-banner"
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                    >
                        <AlertIcon />
                        <div>
                            <p className="error-title">Not Found</p>
                            <p className="error-msg">{error}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!paste && (
                <form className="upload-form" onSubmit={handleFetch} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, position: 'relative', top: '-10px' }}>
                        <div style={{ width: '100%' }}>
                            <p className="fetch-label" style={{ marginBottom: 16, textAlign: 'center' }}>Enter 4-Digit Code</p>
                            <input
                                type="text"
                                className="code-input"
                                value={pasteId}
                                onChange={(e) => setPasteId(e.target.value.slice(0, 4).replace(/[^0-9]/g, ''))}
                                placeholder="0000"
                                maxLength="4"
                                inputMode="numeric"
                                style={{ width: '100%', maxWidth: 300, margin: '0 auto', display: 'block' }}
                            />
                        </div>
                        <div className="fetch-empty" style={{ border: 'none', background: 'transparent', padding: 0 }}>
                            <div style={{ width: 34, height: 34, opacity: 0.35, margin: '0 auto', color: 'var(--green)' }}><FileIcon /></div>
                            <p className="fetch-empty-text" style={{ marginTop: 14 }}>Enter code to retrieve content</p>
                        </div>
                    </div>

                    <motion.button
                        type="submit"
                        className="submit-btn"
                        disabled={loading || pasteId.length !== 4}
                        whileTap={pasteId.length === 4 ? { scale: 0.98 } : {}}
                    >
                        {loading ? (
                            <><SpinIcon /> Retrieving...</>
                        ) : (
                            <><DownloadIcon /> Retrieve Content</>
                        )}
                    </motion.button>

                </form>
            )}

            {/* Retrieved content */}
            <AnimatePresence>
                {paste && (
                    <motion.div
                        className="retrieved-block"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.28 }}
                    >
                        {/* Success banner */}
                        <div className="retrieved-banner">
                            <CheckIcon />
                            <div>
                                <p className="retrieved-title">Content Retrieved</p>
                                <p className="retrieved-sub">
                                    {paste.expiresAt ? `Expires exactly at ${new Date(paste.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}` : 'Expires soon'}
                                </p>
                            </div>
                        </div>

                        {/* Type chip */}
                        {(() => {
                            const info = typeInfo[paste.contentType] || typeInfo.file;
                            return (
                                <div className="content-type-chip">
                                    <span style={{ display: 'flex', width: 13, height: 13 }}><info.Icon /></span>
                                    {info.label}
                                </div>
                            );
                        })()}

                        {/* Text */}
                        {paste.contentType === 'text' && (
                            <>
                                <div className="content-display">
                                    <pre>{paste.content}</pre>
                                </div>
                                <motion.button
                                    className="copy-btn"
                                    onClick={copyToClipboard}
                                    whileTap={{ scale: 0.97 }}
                                    style={{ flexShrink: 0, marginTop: 'auto' }}
                                >
                                    <CopyIcon />
                                    {copied ? 'Copied!' : 'Copy Text'}
                                </motion.button>
                            </>
                        )}

                        {/* Image */}
                        {paste.contentType === 'image' && (
                            <>
                                <div className="content-display" style={{ textAlign: 'center' }}>
                                    <img
                                        src={paste.content.startsWith('http') || paste.content.startsWith('data:') ? paste.content : `data:${paste.mimeType || 'image/png'};base64,${paste.content}`}
                                        alt="Retrieved"
                                    />
                                </div>
                                <motion.button className="copy-btn" onClick={copyToClipboard} whileTap={{ scale: 0.97 }} style={{ flexShrink: 0, marginTop: 'auto' }}>
                                    <CopyIcon /> Copy URL
                                </motion.button>
                            </>
                        )}

                        {/* Link */}
                        {paste.contentType === 'link' && (
                            <>
                                <div className="content-display">
                                    <a href={paste.content} target="_blank" rel="noopener noreferrer" className="content-link">
                                        {paste.content}
                                    </a>
                                </div>
                                <motion.button className="copy-btn" onClick={copyToClipboard} whileTap={{ scale: 0.97 }} style={{ flexShrink: 0, marginTop: 'auto' }}>
                                    <CopyIcon /> {copied ? 'Copied!' : 'Copy Link'}
                                </motion.button>
                            </>
                        )}

                        {/* File */}
                        {paste.contentType === 'file' && (
                            <>
                                {paste.mimeType && paste.mimeType.startsWith('image/') && (
                                    <div className="content-display" style={{ textAlign: 'center' }}>
                                        <img
                                            src={`data:${paste.mimeType};base64,${paste.content}`}
                                            alt="Retrieved preview"
                                            style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                                        />
                                    </div>
                                )}
                                <motion.button className="copy-btn" onClick={downloadFile} whileTap={{ scale: 0.97 }} style={{ flexShrink: 0, marginTop: 'auto' }}>
                                    <DownloadIcon /> Download File
                                </motion.button>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
