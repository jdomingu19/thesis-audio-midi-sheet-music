import { useState, useCallback, useEffect } from 'react'
import UploadZone from './components/UploadZone/UploadZone'
import AudioRecorder from './components/AudioRecorder/AudioRecorder'
import AudioList from './components/AudioList/AudioList'
import { convertAudioToMidi, checkBackendHealth, ConvertServiceError } from './services/convertService'
import styles from './App.module.css'

const ACCEPTED_EXTENSIONS = ['mp3', 'wav', 'ogg', 'flac', 'm4a', 'webm', 'aac', 'opus']
const MAX_FILE_SIZE = 25 * 1024 * 1024 // 25 MB, debe coincidir con config.py del backend

function getExtension(filename) {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export default function App() {
  const [files, setFiles] = useState([])
  const [uploadError, setUploadError] = useState('')
  const [backendOnline, setBackendOnline] = useState(null) // null = verificando

  useEffect(() => {
    let cancelled = false
    checkBackendHealth().then((online) => {
      if (!cancelled) setBackendOnline(online)
    })
    return () => { cancelled = true }
  }, [])

  const addFile = useCallback((entry) => {
    setFiles((prev) => [
      {
        id: entry.id,
        url: entry.url,
        blob: entry.blob,
        name: entry.name,
        size: entry.size,
        source: entry.source,
        status: 'idle', // idle | converting | done | error
        midiUrl: null,
        midiFilename: null,
        errorMessage: null,
      },
      ...prev,
    ])
  }, [])

  const handleFilesAdded = useCallback(
    (fileList) => {
      setUploadError('')
      const rejected = []

      Array.from(fileList).forEach((file) => {
        const ext = getExtension(file.name)
        if (!ACCEPTED_EXTENSIONS.includes(ext)) {
          rejected.push(`${file.name} (formato no soportado)`)
          return
        }
        if (file.size > MAX_FILE_SIZE) {
          rejected.push(`${file.name} (excede 25 MB)`)
          return
        }
        addFile({
          id: crypto.randomUUID(),
          url: URL.createObjectURL(file),
          blob: file,
          name: file.name,
          size: file.size,
          source: 'uploaded',
        })
      })

      if (rejected.length) {
        setUploadError(`No se pudo agregar: ${rejected.join(', ')}`)
      }
    },
    [addFile]
  )

  const handleNewRecording = useCallback(
    (recording) => {
      addFile({
        id: recording.id,
        url: recording.url,
        blob: recording.blob,
        name: recording.name,
        size: recording.size,
        source: 'recorded',
      })
    },
    [addFile]
  )

  const handleDelete = useCallback((id) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id)
      if (target) {
        URL.revokeObjectURL(target.url)
        if (target.midiUrl) URL.revokeObjectURL(target.midiUrl)
      }
      return prev.filter((f) => f.id !== id)
    })
  }, [])

  const handleClearAll = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => {
        URL.revokeObjectURL(f.url)
        if (f.midiUrl) URL.revokeObjectURL(f.midiUrl)
      })
      return []
    })
  }, [])

  const updateFile = useCallback((id, patch) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)))
  }, [])

  const handleConvert = useCallback(
    async (id) => {
      const target = files.find((f) => f.id === id)
      if (!target) return

      updateFile(id, { status: 'converting', errorMessage: null })

      try {
        const midiBlob = await convertAudioToMidi(target.blob, target.name)
        const midiUrl = URL.createObjectURL(midiBlob)
        const midiFilename = target.name.replace(/\.[^.]+$/, '') + '.mid'

        updateFile(id, {
          status: 'done',
          midiUrl,
          midiFilename,
        })
      } catch (err) {
        const message =
          err instanceof ConvertServiceError ? err.message : 'Error inesperado al convertir el audio.'
        updateFile(id, { status: 'error', errorMessage: message })
      }
    },
    [files, updateFile]
  )

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Audio → MIDI</h1>
          <p className={styles.subtitle}>Sube o graba audio y conviértelo a MIDI con Basic Pitch</p>
        </div>
        <div className={styles.backendStatus} data-online={backendOnline}>
          <span className={styles.statusDot} />
          {backendOnline === null && 'Verificando backend…'}
          {backendOnline === true && 'Backend conectado'}
          {backendOnline === false && 'Backend no disponible'}
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.inputGrid}>
          <UploadZone
            onFilesAdded={handleFilesAdded}
            error={uploadError}
            onErrorDismiss={() => setUploadError('')}
          />
          <AudioRecorder onNewRecording={handleNewRecording} />
        </div>

        <AudioList
          files={files}
          onDelete={handleDelete}
          onClearAll={handleClearAll}
          onConvert={handleConvert}
        />
      </main>
    </div>
  )
}
