// thesis-audio-midi-sheet-music
// @jdomingu19
// UploadDropzone.jsx

import { useRef, useState } from "react";
import { UploadCloud, FileAudio, AlertCircle } from "lucide-react";
import clsx from "clsx";
import styles from "./UploadDropzone.module.css";
import Button from "@/components/ui/Button/Button";

/**
 * UploadDropzone — zona de arrastrar-y-soltar o click-para-explorar.
 * Solo maneja estado visual de interacción (dragover); la lógica de subida
 * real se conecta en un commit posterior a través de onFilesSelected.
 *
 * @param {string} acceptLabel - texto de formatos aceptados (mock, ej. "MP3, WAV, M4A")
 * @param {{ name: string, size: string } | null} selectedFile - archivo mock ya seleccionado
 * @param {string | null} errorMessage - mensaje de error mock (formato inválido, etc.)
 * @param {boolean} disabled
 * @param {(fileList: FileList) => void} onFilesSelected
 */
function UploadDropzone({
  acceptLabel = "MP3, WAV, M4A · máx. 20MB",
  selectedFile = null,
  errorMessage = null,
  disabled = false,
  onFilesSelected,
  className,
  ...rest
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef(null);

  const hasError = Boolean(errorMessage);
  const hasFile = Boolean(selectedFile) && !hasError;

  const handleDragEnter = (event) => {
    event.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    if (disabled) return;
    if (event.dataTransfer?.files?.length) {
      onFilesSelected?.(event.dataTransfer.files);
    }
  };

  const handleBrowseClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleInputChange = (event) => {
    if (event.target.files?.length) {
      onFilesSelected?.(event.target.files);
    }
  };

  return (
    <div
      className={clsx(
        styles.dropzone,
        isDragOver && styles.dragover,
        hasFile && styles.fileSelected,
        hasError && styles.error,
        disabled && styles.disabled,
        className,
      )}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...rest}
    >
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className={styles.hiddenInput}
        onChange={handleInputChange}
        disabled={disabled}
        tabIndex={-1}
        aria-hidden="true"
      />

      <div className={styles.icon} aria-hidden="true">
        {hasError ? (
          <AlertCircle size={28} />
        ) : hasFile ? (
          <FileAudio size={28} />
        ) : (
          <UploadCloud size={28} />
        )}
      </div>

      {!hasFile && !hasError && (
        <>
          <p className={styles.primaryText}>Arrastra un audio o haz clic</p>
          <p className={styles.secondaryText}>{acceptLabel}</p>
        </>
      )}

      {hasFile && (
        <>
          <p className={styles.primaryText}>{selectedFile.name}</p>
          <p className={styles.secondaryText}>{selectedFile.size}</p>
        </>
      )}

      {hasError && (
        <>
          <p className={styles.primaryText}>Formato no soportado</p>
          <p className={styles.errorText}>{errorMessage}</p>
        </>
      )}

      <Button
        variant="secondary"
        size="sm"
        onClick={handleBrowseClick}
        disabled={disabled}
        className={styles.browseButton}
      >
        Examinar
      </Button>
    </div>
  );
}

export default UploadDropzone;
