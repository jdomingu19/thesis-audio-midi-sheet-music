import { useState, useRef, useCallback } from 'react'
import styles from './UploadZone.module.css'

const SUPPORTED_FORMATS = ['MP3', 'WAV', 'OGG', 'FLAC', 'AAC', 'WebM', 'M4A']

export default function UploadZone({ onFilesAdded, acceptedTypes, error, onErrorDismiss }) {
  const [dragState, setDragState] = useState('idle') // idle | over | reject
  const inputRef = useRef(null)
  const dragCounter = useRef(0)

  const handleDragEnter = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    const hasAudio = Array.from(e.dataTransfer.items).some(
      (item) => item.kind === 'file' && item.type.startsWith('audio/')
    )
    setDragState(hasAudio || e.dataTransfer.items.length === 0 ? 'over' : 'reject')
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) setDragState('idle')
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounter.current = 0
      setDragState('idle')
      if (e.dataTransfer.files.length) {
        onFilesAdded(e.dataTransfer.files)
      }
    },
    [onFilesAdded]
  )

  const handleInputChange = useCallback(
    (e) => {
      if (e.target.files.length) {
        onFilesAdded(e.target.files)
        e.target.value = ''
      }
    },
    [onFilesAdded]
  )

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      inputRef.current?.click()
    }
  }, [])

  const zoneClass = [
    styles.zone,
    dragState === 'over' && styles.zoneOver,
    dragState === 'reject' && styles.zoneReject,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section className={styles.wrapper}>
      <div
        className={zoneClass}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Zona de carga de archivos de audio"
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptedTypes.join(',') + ',.mp3,.wav,.ogg,.flac,.aac,.webm,.m4a,.opus'}
          multiple
          onChange={handleInputChange}
          className={styles.hiddenInput}
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className={styles.iconWrap}>
          {dragState === 'reject' ? <RejectIcon /> : <UploadIcon active={dragState === 'over'} />}
        </div>

        <div className={styles.textGroup}>
          {dragState === 'reject' ? (
            <p className={styles.rejectMsg}>Formato no soportado</p>
          ) : dragState === 'over' ? (
            <p className={styles.dropMsg}>Suelta para subir</p>
          ) : (
            <>
              <p className={styles.primaryText}>
                Arrastra archivos aquí o <span className={styles.browseLink}>selecciona desde tu dispositivo</span>
              </p>
              <p className={styles.secondaryText}>Hasta 100 MB por archivo</p>
            </>
          )}
        </div>

        <div className={styles.formats}>
          {SUPPORTED_FORMATS.map((fmt) => (
            <span key={fmt} className={styles.formatBadge}>
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <ErrorIcon />
          <span>{error}</span>
          <button
            className={styles.errorDismiss}
            onClick={onErrorDismiss}
            aria-label="Cerrar error"
          >
            ✕
          </button>
        </div>
      )}
    </section>
  )
}

function UploadIcon({ active }) {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={active ? 2.5 : 1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function RejectIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  )
}
