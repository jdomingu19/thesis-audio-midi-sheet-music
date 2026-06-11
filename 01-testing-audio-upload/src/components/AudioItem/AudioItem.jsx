import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './AudioItem.module.css'

const FORMAT_COLORS = {
  mp3:  '#c9a84c',
  wav:  '#4a90d9',
  ogg:  '#9b6fd4',
  flac: '#4caf82',
  aac:  '#e07b4a',
  webm: '#4ab8c9',
  m4a:  '#d44a7a',
  opus: '#7ab8d4',
}

function getExtension(filename) {
  return filename.split('.').pop()?.toLowerCase() || 'audio'
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function formatTime(seconds) {
  if (!isFinite(seconds) || isNaN(seconds)) return '—:——'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function truncateName(name, maxLen = 42) {
  if (name.length <= maxLen) return name
  const ext = name.split('.').pop()
  const base = name.slice(0, name.length - ext.length - 1)
  const truncated = base.slice(0, maxLen - ext.length - 4) + '…'
  return `${truncated}.${ext}`
}

export default function AudioItem({ file, onDelete }) {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState(false)

  const ext = getExtension(file.name)
  const accentColor = FORMAT_COLORS[ext] || '#8faec8'

  /* ── Audio element setup ── */
  useEffect(() => {
    const audio = new Audio(file.url)
    audioRef.current = audio

    const onLoaded = () => {
      setDuration(audio.duration)
      setIsLoading(false)
    }
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onEnded = () => {
      setIsPlaying(false)
      setCurrentTime(0)
      audio.currentTime = 0
    }
    const onError = () => {
      setHasError(true)
      setIsPlaying(false)
      setIsLoading(false)
    }
    const onWaiting = () => setIsLoading(true)
    const onCanPlay = () => setIsLoading(false)

    audio.addEventListener('loadedmetadata', onLoaded)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('ended', onEnded)
    audio.addEventListener('error', onError)
    audio.addEventListener('waiting', onWaiting)
    audio.addEventListener('canplay', onCanPlay)

    return () => {
      audio.pause()
      audio.src = ''
      audio.removeEventListener('loadedmetadata', onLoaded)
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('ended', onEnded)
      audio.removeEventListener('error', onError)
      audio.removeEventListener('waiting', onWaiting)
      audio.removeEventListener('canplay', onCanPlay)
    }
  }, [file.url])

  /* ── Controls ── */
  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || hasError) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      try {
        setIsLoading(true)
        await audio.play()
        setIsPlaying(true)
        setIsLoading(false)
      } catch {
        setHasError(true)
        setIsLoading(false)
      }
    }
  }, [isPlaying, hasError])

  const handleSeek = useCallback((e) => {
    const audio = audioRef.current
    if (!audio || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audio.currentTime = ratio * duration
    setCurrentTime(ratio * duration)
  }, [duration])

  const handleDownload = useCallback(() => {
    const a = document.createElement('a')
    a.href = file.url
    a.download = file.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }, [file.url, file.name])

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <article className={styles.card} style={{ '--accent': accentColor }}>
      {/* Play button */}
      <button
        className={styles.playBtn}
        onClick={togglePlay}
        disabled={hasError}
        aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
        title={hasError ? 'Error al cargar el audio' : undefined}
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : isPlaying ? (
          <PauseIcon />
        ) : (
          <PlayIcon />
        )}
      </button>

      {/* Main content */}
      <div className={styles.content}>
        {/* Top row: name + badges */}
        <div className={styles.topRow}>
          <p className={styles.filename} title={file.name}>
            {truncateName(file.name)}
          </p>
          <div className={styles.metaBadges}>
            <span
              className={styles.formatBadge}
              style={{ color: accentColor, borderColor: `${accentColor}40`, background: `${accentColor}15` }}
            >
              {ext.toUpperCase()}
            </span>
            <span className={styles.sizeBadge}>{formatBytes(file.size)}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className={styles.progressTrack}
          onClick={handleSeek}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Progreso de reproducción"
          tabIndex={0}
          onKeyDown={(e) => {
            const audio = audioRef.current
            if (!audio || !duration) return
            if (e.key === 'ArrowRight') audio.currentTime = Math.min(duration, audio.currentTime + 5)
            if (e.key === 'ArrowLeft')  audio.currentTime = Math.max(0, audio.currentTime - 5)
          }}
        >
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          <div className={styles.progressThumb} style={{ left: `${progress}%` }} />
        </div>

        {/* Time row */}
        <div className={styles.timeRow}>
          <span className={styles.time}>{formatTime(currentTime)}</span>
          {hasError && <span className={styles.errorText}>Error al cargar</span>}
          <span className={styles.time}>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${styles.downloadBtn}`}
          onClick={handleDownload}
          aria-label={`Descargar ${file.name}`}
          title="Descargar"
        >
          <DownloadIcon />
        </button>
        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={() => onDelete(file.id)}
          aria-label={`Eliminar ${file.name}`}
          title="Eliminar"
        >
          <DeleteIcon />
        </button>
      </div>
    </article>
  )
}

/* ─── Icons ─────────────────────────────────────────────────────── */
function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

function LoadingSpinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={styles.spinner}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

function DeleteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}
