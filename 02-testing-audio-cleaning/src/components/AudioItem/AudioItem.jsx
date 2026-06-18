import { formatFileSize, formatDuration } from '../../utils/audioProcessing';
import styles from './AudioItem.module.css';

// ── Sub-components ────────────────────────────────────────────────
function WaveformBars({ bars, isPlaying }) {
  return (
    <div className={styles.waveform} aria-hidden="true">
      {bars.map((h, i) => (
        <span
          key={i}
          className={`${styles.bar} ${isPlaying ? styles.barPlaying : ''}`}
          style={{
            '--bar-h':     h,
            '--bar-delay': `${(i * 37) % 700}ms`,
          }}
        />
      ))}
    </div>
  );
}

function ProcessingOverlay({ step }) {
  return (
    <div className={styles.processingOverlay}>
      <div className={styles.processingInner}>
        <span className={styles.processingSpinner} aria-hidden="true" />
        <span className={styles.processingStep}>{step}</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function AudioItem({
  audio,
  isPlaying,
  onPlay,
  onDownload,
  onClean,
  onDelete,
}) {
  const {
    id, name, size, format, duration,
    isCleaned, isProcessing, processingStep, waveformBars,
  } = audio;

  const displayName = name.length > 42
    ? name.slice(0, 20) + '…' + name.slice(-18)
    : name;

  return (
    <article
      className={`${styles.card} ${isPlaying ? styles.playing : ''} ${isProcessing ? styles.processing : ''} ${isCleaned ? styles.cleaned : ''}`}
    >
      {isProcessing && <ProcessingOverlay step={processingStep} />}

      {/* ── Left: metadata ──────────────────────────── */}
      <div className={styles.meta}>
        <div className={styles.nameRow}>
          <span className={styles.formatBadge}>{format}</span>
          <span className={styles.name} title={name}>{displayName}</span>
        </div>
        <div className={styles.stats}>
          <span className={styles.stat}>{formatFileSize(size)}</span>
          <span className={styles.statDot} aria-hidden="true">·</span>
          <span className={styles.stat}>{formatDuration(duration)}</span>
          {isCleaned && (
            <>
              <span className={styles.statDot} aria-hidden="true">·</span>
              <span className={styles.statCleaned}>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 5l2.5 2.5L8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Cleaned
              </span>
            </>
          )}
        </div>
      </div>

      {/* ── Center: waveform ─────────────────────────── */}
      <WaveformBars bars={waveformBars} isPlaying={isPlaying} />

      {/* ── Right: actions ───────────────────────────── */}
      <div className={styles.actions}>
        {/* Play / Pause */}
        <button
          className={`${styles.btn} ${styles.btnPlay} ${isPlaying ? styles.btnActive : ''}`}
          onClick={() => onPlay(id)}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause' : 'Play'}
          disabled={isProcessing}
        >
          {isPlaying ? (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <rect x="3" y="2" width="3.5" height="11" rx="1" fill="currentColor"/>
              <rect x="8.5" y="2" width="3.5" height="11" rx="1" fill="currentColor"/>
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M4 2.5l9 5-9 5V2.5z" fill="currentColor"/>
            </svg>
          )}
        </button>

        {/* Download */}
        <button
          className={`${styles.btn} ${styles.btnGhost}`}
          onClick={() => onDownload(id)}
          aria-label="Download"
          title={isCleaned ? 'Download cleaned audio' : 'Download original audio'}
          disabled={isProcessing}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M7.5 2v8M4 7l3.5 3.5L11 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Clean */}
        <button
          className={`${styles.btn} ${styles.btnGhost} ${styles.btnClean}`}
          onClick={() => onClean(id)}
          aria-label="Clean audio"
          title="Clean audio noise"
          disabled={isProcessing}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M2 11L6 3l2 4 2-2 3 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="12" cy="3.5" r="1.5" fill="currentColor" fillOpacity=".6"/>
          </svg>
        </button>

        {/* Delete */}
        <button
          className={`${styles.btn} ${styles.btnGhost} ${styles.btnDelete}`}
          onClick={() => onDelete(id)}
          aria-label="Delete"
          title="Remove from list"
          disabled={isProcessing}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M3 4h9M6 4V3h3v1M5.5 4l.5 7.5h3L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </article>
  );
}
