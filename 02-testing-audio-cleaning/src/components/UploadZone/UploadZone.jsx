import { useRef, useState, useCallback } from 'react';
import { ACCEPT_STRING, SUPPORTED_EXTENSIONS, isFormatSupported } from '../../utils/audioProcessing';
import styles from './UploadZone.module.css';

export default function UploadZone({ onUpload }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError]           = useState(null);

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(null), 3500);
  };

  const processFiles = useCallback((files) => {
    const arr = Array.from(files);
    if (!arr.length) return;

    const valid   = arr.filter(isFormatSupported);
    const invalid = arr.filter(f => !isFormatSupported(f));

    if (!valid.length) {
      showError(`Unsupported format. Use: ${SUPPORTED_EXTENSIONS.join(', ')}`);
      return;
    }

    if (invalid.length) {
      showError(`${invalid.length} file(s) skipped — unsupported format.`);
    }

    onUpload(valid);
  }, [onUpload]);

  // ── Drag handlers ──────────────────────────────────────────────
  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragging(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const onInputChange = (e) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.zone} ${isDragging ? styles.dragging : ''} ${error ? styles.hasError : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        aria-label="Upload audio files"
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        {/* Background grid accent */}
        <div className={styles.bg} aria-hidden="true" />

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_STRING}
          multiple
          onChange={onInputChange}
          className={styles.input}
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className={styles.icon} aria-hidden="true">
          {isDragging ? (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 8v24M8 20h24" stroke="var(--color-sage)" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="20" cy="20" r="18" stroke="var(--color-sage)" strokeWidth="1.5" strokeDasharray="4 3"/>
            </svg>
          ) : (
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M8 26v4a2 2 0 0 0 2 2h20a2 2 0 0 0 2-2v-4" stroke="var(--color-sage)" strokeWidth="1.8" strokeLinecap="round"/>
              <path d="M20 8v18M13 15l7-7 7 7" stroke="var(--color-sage)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>

        <div className={styles.text}>
          <p className={styles.headline}>
            {isDragging ? 'Release to upload' : 'Drop audio files here'}
          </p>
          <p className={styles.sub}>or <span className={styles.link}>browse your device</span></p>
        </div>

        <div className={styles.formats}>
          {SUPPORTED_EXTENSIONS.map(ext => (
            <span key={ext} className={styles.formatChip}>
              {ext.replace('.', '').toUpperCase()}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className={styles.error} role="alert">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="6.5" stroke="var(--color-danger)" strokeWidth="1.2"/>
            <path d="M7 4v3.5M7 9.5v.5" stroke="var(--color-danger)" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  );
}
