import { useState, useEffect, useRef } from 'react';
import styles from './CleanModal.module.css';

const CLEAN_OPTIONS = [
  {
    key: 'whiteNoise',
    label: 'White Noise',
    description: 'Removes hiss, static, and high-frequency interference',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 9h14M4 6l1.5 1.5M4 12l1.5-1.5M12.5 6L14 7.5M12.5 12L14 10.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    key: 'backgroundNoise',
    label: 'Background Noise',
    description: 'Suppresses room tone, AC hum, and ambient sounds',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 13c2-4 3-8 5-8s3 6 5 2 2-4 4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 13h14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 2"/>
      </svg>
    ),
  },
  {
    key: 'distortion',
    label: 'Distortions',
    description: 'Repairs clipping, peaks, and dynamic irregularities',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 9h2l2-5 2 10 2-6 2 3 2-2h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function CleanModal({ isOpen, onClose, onConfirm, audioName }) {
  const [selected, setSelected] = useState({
    whiteNoise: true,
    backgroundNoise: true,
    distortion: false,
  });

  const overlayRef = useRef(null);
  const firstBtnRef = useRef(null);

  // Reset defaults on open
  useEffect(() => {
    if (isOpen) {
      setSelected({ whiteNoise: true, backgroundNoise: true, distortion: false });
      setTimeout(() => firstBtnRef.current?.focus(), 60);
    }
  }, [isOpen]);

  // Trap escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  const toggle = (key) =>
    setSelected(prev => ({ ...prev, [key]: !prev[key] }));

  const hasSelection = Object.values(selected).some(Boolean);

  const handleConfirm = () => {
    if (!hasSelection) return;
    onConfirm(selected);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  if (!isOpen) return null;

  const shortName = audioName && audioName.length > 36
    ? audioName.slice(0, 17) + '…' + audioName.slice(-16)
    : audioName;

  return (
    <div
      className={styles.overlay}
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className={styles.modal}>
        {/* ── Header ──────────────────────────────────── */}
        <div className={styles.header}>
          <div className={styles.headerIcon} aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <circle cx="11" cy="11" r="10" stroke="var(--color-sage)" strokeWidth="1.3"/>
              <path d="M7 11c0 0 1-3 2-3s1.5 2 2 2 1-4 2-4 2 5 2 5" stroke="var(--color-sage)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className={styles.headerText}>
            <h2 id="modal-title" className={styles.title}>Clean Audio</h2>
            {shortName && (
              <p className={styles.subtitle}>{shortName}</p>
            )}
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* ── Divider ──────────────────────────────────── */}
        <div className={styles.divider} />

        {/* ── Body ────────────────────────────────────── */}
        <div className={styles.body}>
          <p className={styles.prompt}>
            Select the type of noise to remove:
          </p>

          <ul className={styles.optionList} role="list">
            {CLEAN_OPTIONS.map(({ key, label, description, icon }, idx) => {
              const isChecked = selected[key];
              return (
                <li key={key}>
                  <button
                    ref={idx === 0 ? firstBtnRef : undefined}
                    className={`${styles.option} ${isChecked ? styles.optionActive : ''}`}
                    onClick={() => toggle(key)}
                    aria-pressed={isChecked}
                  >
                    <span className={styles.optionIcon}>{icon}</span>
                    <span className={styles.optionText}>
                      <span className={styles.optionLabel}>{label}</span>
                      <span className={styles.optionDesc}>{description}</span>
                    </span>
                    <span className={styles.optionCheck} aria-hidden="true">
                      {isChecked && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <p className={styles.notice}>
            Audio is processed entirely in your browser. No data leaves your device.
          </p>
        </div>

        {/* ── Footer ──────────────────────────────────── */}
        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onClose}>
            Cancel
          </button>
          <button
            className={styles.btnConfirm}
            onClick={handleConfirm}
            disabled={!hasSelection}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M3 7.5c0 0 1-3 2-3s1.5 2 2 2 1-4 2-4 2 5 2 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Start Cleaning
          </button>
        </div>
      </div>
    </div>
  );
}
