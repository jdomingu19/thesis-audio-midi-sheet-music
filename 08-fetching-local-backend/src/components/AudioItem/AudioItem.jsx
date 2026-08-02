import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./AudioItem.module.css";

const FORMAT_COLORS = {
  mp3: "#c9a84c",
  wav: "#4a90d9",
  ogg: "#9b6fd4",
  flac: "#4caf82",
  aac: "#e07b4a",
  webm: "#4ab8c9",
  m4a: "#d44a7a",
  opus: "#7ab8d4",
  mp4: "#4ab8c9",
};

function getExtension(filename) {
  return filename.split(".").pop()?.toLowerCase() || "audio";
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatTime(seconds) {
  if (!isFinite(seconds) || isNaN(seconds)) return "—:——";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function truncateName(name, maxLen = 34) {
  if (name.length <= maxLen) return name;
  const ext = name.split(".").pop();
  const base = name.slice(0, name.length - ext.length - 1);
  const truncated = base.slice(0, maxLen - ext.length - 4) + "…";
  return `${truncated}.${ext}`;
}

export default function AudioItem({ file, onDelete, onConvert }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const ext = getExtension(file.name);
  const accentColor = FORMAT_COLORS[ext] || "#8faec8";

  useEffect(() => {
    const audio = new Audio(file.url);
    audioRef.current = audio;

    const fixDurationIfNeeded = () => {
      // Bug conocido de Chrome: blobs de MediaRecorder (.webm) reportan
      // duration = Infinity hasta forzar un seek más allá del final.
      if (audio.duration === Infinity || isNaN(audio.duration)) {
        audio.currentTime = 1e101;
        const onTimeUpdateOnce = () => {
          audio.removeEventListener("timeupdate", onTimeUpdateOnce);
          audio.currentTime = 0;
          setDuration(audio.duration);
        };
        audio.addEventListener("timeupdate", onTimeUpdateOnce);
      } else {
        setDuration(audio.duration);
      }
    };

    const onLoaded = () => {
      fixDurationIfNeeded();
      setIsLoading(false);
    };
    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      audio.currentTime = 0;
    };
    const onError = () => {
      setHasError(true);
      setIsPlaying(false);
      setIsLoading(false);
    };
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);

    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);

    return () => {
      audio.pause();
      audio.src = "";
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
    };
  }, [file.url]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        setIsLoading(true);
        await audio.play();
        setIsPlaying(true);
        setIsLoading(false);
      } catch {
        setHasError(true);
        setIsLoading(false);
      }
    }
  }, [isPlaying, hasError]);

  const handleSeek = useCallback(
    (e) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = Math.max(
        0,
        Math.min(1, (e.clientX - rect.left) / rect.width),
      );
      audio.currentTime = ratio * duration;
      setCurrentTime(ratio * duration);
    },
    [duration],
  );

  const handleDownload = useCallback((url, name) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isConverting = file.status === "converting";
  const isDone = file.status === "done";
  const isFailed = file.status === "error";

  return (
    <article className={styles.card} style={{ "--accent": accentColor }}>
      <button
        className={styles.playBtn}
        onClick={togglePlay}
        disabled={hasError}
        aria-label={isPlaying ? "Pausar" : "Reproducir"}
      >
        {isLoading ? (
          <LoadingSpinner />
        ) : isPlaying ? (
          <PauseIcon />
        ) : (
          <PlayIcon />
        )}
      </button>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <p className={styles.filename} title={file.name}>
            {truncateName(file.name)}
          </p>
          <div className={styles.metaBadges}>
            <span className={styles.sourceBadge} data-source={file.source}>
              {file.source === "recorded" ? "Grabado" : "Subido"}
            </span>
            <span
              className={styles.formatBadge}
              style={{
                color: accentColor,
                borderColor: `${accentColor}40`,
                background: `${accentColor}15`,
              }}
            >
              {ext.toUpperCase()}
            </span>
            <span className={styles.sizeBadge}>{formatBytes(file.size)}</span>
          </div>
        </div>

        <div
          className={styles.progressTrack}
          onClick={handleSeek}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          tabIndex={0}
        >
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
          <div
            className={styles.progressThumb}
            style={{ left: `${progress}%` }}
          />
        </div>

        <div className={styles.timeRow}>
          <span className={styles.time}>{formatTime(currentTime)}</span>
          {hasError && (
            <span className={styles.errorText}>Error al cargar audio</span>
          )}
          {isFailed && (
            <span className={styles.errorText}>
              {file.errorMessage || "Fallo la conversión"}
            </span>
          )}
          <span className={styles.time}>{formatTime(duration)}</span>
        </div>
      </div>

      <div className={styles.actions}>
        {!isDone && (
          <button
            className={`${styles.actionBtn} ${styles.convertBtn}`}
            onClick={() => onConvert(file.id)}
            disabled={isConverting}
            aria-label={`Convertir ${file.name} a MIDI`}
            title="Convertir a MIDI"
          >
            {isConverting ? <LoadingSpinner /> : <ConvertIcon />}
            <span className={styles.convertLabel}>
              {isConverting
                ? "Procesando…"
                : isFailed
                  ? "Reintentar"
                  : "Convertir"}
            </span>
          </button>
        )}

        {isDone && (
          <button
            className={`${styles.actionBtn} ${styles.midiBtn}`}
            onClick={() => handleDownload(file.midiUrl, file.midiFilename)}
            aria-label="Descargar MIDI"
            title="Descargar MIDI"
          >
            <MidiIcon />
            <span className={styles.convertLabel}>MIDI listo</span>
          </button>
        )}

        <button
          className={styles.actionBtn}
          onClick={() => handleDownload(file.url, file.name)}
          aria-label={`Descargar audio original ${file.name}`}
          title="Descargar audio original"
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
  );
}

function PlayIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}
function LoadingSpinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={styles.spinner}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}
function DeleteIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}
function ConvertIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12a8 8 0 0 1 14.93-4" />
      <polyline points="18 3 18 8 13 8" />
      <path d="M20 12a8 8 0 0 1-14.93 4" />
      <polyline points="6 21 6 16 11 16" />
    </svg>
  );
}
function MidiIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
