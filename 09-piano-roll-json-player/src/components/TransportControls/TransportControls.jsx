// Thesis Audio to MIDI & Sheet Music
// Piano Roll JSON Player @jdomingu19
// TransportControls.jsx

import { formatTime } from "@/utils/noteUtils";
import styles from "./TransportControls.module.css";

export default function TransportControls({
  isPlaying,
  currentTime,
  duration,
  onPlay,
  onPause,
  onStop,
  onSeek,
}) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={styles.controls}>
      <button
        className={`${styles.iconButton} ${styles.primary}`}
        onClick={isPlaying ? onPause : onPlay}
        aria-label={isPlaying ? "Pausar" : "Reproducir"}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <rect x="2" y="1" width="4" height="12" rx="1" />
            <rect x="8" y="1" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
            <path d="M2.5 1.2v11.6a.9.9 0 0 0 1.36.77l9.3-5.8a.9.9 0 0 0 0-1.54l-9.3-5.8A.9.9 0 0 0 2.5 1.2Z" />
          </svg>
        )}
      </button>

      <button
        className={styles.iconButton}
        onClick={onStop}
        aria-label="Detener"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
          <rect x="1" y="1" width="10" height="10" rx="1.5" />
        </svg>
      </button>

      <span className={styles.time}>{formatTime(currentTime)}</span>

      <input
        type="range"
        min={0}
        max={duration || 0}
        step={0.01}
        value={currentTime}
        onChange={(e) => onSeek(Number(e.target.value))}
        className={styles.seekBar}
        style={{ "--progress": `${progress}%` }}
        aria-label="Progreso de la reproducción"
      />

      <span className={styles.time}>{formatTime(duration)}</span>
    </div>
  );
}
