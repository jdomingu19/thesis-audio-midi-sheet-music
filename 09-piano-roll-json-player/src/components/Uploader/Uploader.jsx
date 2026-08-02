// Thesis Audio to MIDI & Sheet Music
// Piano Roll JSON Player @jdomingu19
// Uploader.jsx

import { useRef, useState } from "react";
import styles from "./Uploader.module.css";

export default function Uploader({ onLoad, fileName }) {
  const inputRef = useRef(null);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith(".json")) {
      setError("El archivo debe tener extensión .json");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed.tracks) {
          setError(
            'El JSON no tiene el formato esperado de @tonejs/midi (falta "tracks")',
          );
          return;
        }
        setError(null);
        onLoad(parsed, file.name);
      } catch {
        setError("No se pudo parsear el archivo JSON");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div
      className={`${styles.dropzone} ${isDragging ? styles.dragging : ""}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        className={styles.hiddenInput}
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <svg
        className={styles.icon}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
      >
        <path
          d="M10 2.5v9M6.5 8 10 11.5 13.5 8"
          stroke="var(--accent-light)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.5 13v2a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5v-2"
          stroke="var(--accent-light)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
      <div className={styles.textCol}>
        <p className={styles.title}>
          {fileName ? fileName : "Sube tu .json de Tone.js"}
        </p>
        <p className={styles.subtitle}>
          {fileName
            ? "Click para cargar otro archivo"
            : "Arrastra o haz click para seleccionar"}
        </p>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    </div>
  );
}
