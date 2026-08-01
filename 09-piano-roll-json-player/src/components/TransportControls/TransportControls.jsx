import { formatTime } from '@/utils/noteUtils'
import styles from './TransportControls.module.css'

export default function TransportControls({
  isPlaying, currentTime, duration, onPlay, onPause, onStop, onSeek
}) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className={styles.controls}>
      <button
        className={styles.iconButton}
        onClick={isPlaying ? onPause : onPlay}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
      >
        {isPlaying ? '⏸' : '▶'}
      </button>

      <button className={styles.iconButton} onClick={onStop} aria-label="Detener">
        ⏹
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
        style={{ '--progress': `${progress}%` }}
      />

      <span className={styles.time}>{formatTime(duration)}</span>
    </div>
  )
}
