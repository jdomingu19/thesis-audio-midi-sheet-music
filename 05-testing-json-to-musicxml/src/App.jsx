// src/App.jsx
import { useState, useRef } from "react";
import { toneJsonToMusicXml } from "./utils/converter";
import styles from "./App.module.css";

function App() {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const uploadedFiles = Array.from(event.target.files);

    uploadedFiles.forEach((file) => {
      if (file.type !== "application/json" && !file.name.endsWith(".json"))
        return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonContent = JSON.parse(e.target.result);
          const xmlData = toneJsonToMusicXml(jsonContent);

          const newFileRecord = {
            id: crypto.randomUUID(),
            name: file.name,
            xmlData: xmlData,
            originalSize: file.size,
          };

          setFiles((prev) => [...prev, newFileRecord]);
        } catch (error) {
          console.error("Error al procesar el archivo:", error);
          alert(
            `Error procesando ${file.name}: Asegúrate de que sea un JSON de Tone.js válido.`,
          );
        }
      };
      reader.readAsText(file);
    });

    // Resetear el input para permitir subir el mismo archivo nuevamente si se desea
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const downloadXml = (xmlData, originalName) => {
    const blob = new Blob([xmlData], {
      type: "application/vnd.recordare.musicxml+xml",
    });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = originalName.replace(".json", ".musicxml");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>
          MIDI JSON <span>&rarr;</span> MusicXML
        </h1>
        <p>Convierte salidas de Tone.js a un formato de partitura estándar.</p>
      </header>

      <div className={styles.uploadSection}>
        <label className={styles.uploadButton}>
          Subir archivo .json
          <input
            type="file"
            accept=".json"
            multiple
            onChange={handleFileUpload}
            ref={fileInputRef}
            hidden
          />
        </label>
      </div>

      <div className={styles.listContainer}>
        {files.length === 0 ? (
          <p className={styles.emptyState}>No hay archivos subidos aún.</p>
        ) : (
          <ul className={styles.fileList}>
            {files.map((file) => (
              <li key={file.id} className={styles.fileItem}>
                <div className={styles.fileInfo}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>
                    {(file.originalSize / 1024).toFixed(2)} KB
                  </span>
                </div>
                <button
                  className={styles.downloadBtn}
                  onClick={() => downloadXml(file.xmlData, file.name)}
                >
                  Descargar MusicXML
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default App;
