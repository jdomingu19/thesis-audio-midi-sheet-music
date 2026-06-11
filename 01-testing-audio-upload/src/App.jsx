import { useState, useCallback } from 'react'
import UploadZone from './components/UploadZone/UploadZone'
import AudioList from './components/AudioList/AudioList'
import styles from './App.module.css'

const ACCEPTED_TYPES = [
  'audio/mpeg',       // .mp3
  'audio/wav',        // .wav
  'audio/wave',
  'audio/x-wav',
  'audio/ogg',        // .ogg
  'audio/flac',       // .flac
  'audio/x-flac',
  'audio/aac',        // .aac
  'audio/webm',       // .webm
  'audio/mp4',        // .m4a / .mp4
  'audio/x-m4a',
  'audio/mpeg3',
  'audio/x-mpeg-3',
]

const MAX_FILE_SIZE_MB = 100

export default function App() {
  const [audioFiles, setAudioFiles] = useState([])
  const [uploadError, setUploadError] = useState(null)

  const handleFilesAdded = useCallback((files) => {
    setUploadError(null)
    const errors = []
    const valid = []

    Array.from(files).forEach((file) => {
      const isAudio =
        ACCEPTED_TYPES.includes(file.type) ||
        /\.(mp3|wav|ogg|flac|aac|webm|m4a|mp4|mpeg|opus)$/i.test(file.name)

      if (!isAudio) {
        errors.push(`"${file.name}" no es un formato de audio soportado.`)
        return
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        errors.push(`"${file.name}" supera el límite de ${MAX_FILE_SIZE_MB} MB.`)
        return
      }

      valid.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'audio/unknown',
        url: URL.createObjectURL(file),
        addedAt: new Date(),
      })
    })

    if (errors.length) setUploadError(errors.join(' '))
    if (valid.length) setAudioFiles((prev) => [...prev, ...valid])
  }, [])

  const handleDelete = useCallback((id) => {
    setAudioFiles((prev) => {
      const item = prev.find((f) => f.id === id)
      if (item) URL.revokeObjectURL(item.url)
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const handleClearAll = useCallback(() => {
    setAudioFiles((prev) => {
      prev.forEach((f) => URL.revokeObjectURL(f.url))
      return []
    })
  }, [])

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <span className={styles.brandIcon}>
              <WaveIcon />
            </span>
            <span className={styles.brandName}>AudioUpload</span>
            <span className={styles.brandTag}>tester</span>
          </div>
          <p className={styles.headerSub}>
            Prueba de subida y reproducción de archivos de audio en el navegador
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <UploadZone
          onFilesAdded={handleFilesAdded}
          acceptedTypes={ACCEPTED_TYPES}
          error={uploadError}
          onErrorDismiss={() => setUploadError(null)}
        />
        <AudioList
          files={audioFiles}
          onDelete={handleDelete}
          onClearAll={handleClearAll}
        />
      </main>

      <footer className={styles.footer}>
        <span>Audio Upload Tester · React + Vite + CSS Modules</span>
      </footer>
    </div>
  )
}

function WaveIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M2 12h2M6 8v8M10 5v14M14 9v6M18 6v12M22 12h-2" />
    </svg>
  )
}
