import { useRef, useState } from 'react'
import styles from './Uploader.module.css'

export default function Uploader({ onLoad, fileName }) {
  const inputRef = useRef(null)
  const [error, setError] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file) => {
    if (!file) return
    if (!file.name.endsWith('.json')) {
      setError('El archivo debe tener extensión .json')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result)
        if (!parsed.tracks) {
          setError('El JSON no tiene el formato esperado de @tonejs/midi (falta "tracks")')
          return
        }
        setError(null)
        onLoad(parsed, file.name)
      } catch {
        setError('No se pudo parsear el archivo JSON')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div
      className={`${styles.dropzone} ${isDragging ? styles.dragging : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFile(e.dataTransfer.files?.[0])
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className={styles.hiddenInput}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <p className={styles.title}>
        {fileName ? fileName : 'Arrastra tu .json de Tone.js aquí'}
      </p>
      <p className={styles.subtitle}>
        {fileName ? 'Click para cargar otro archivo' : 'o haz click para seleccionar'}
      </p>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
