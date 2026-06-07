import { useState, useRef, useEffect } from "react";
import styles from "./AudioList.module.css";

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const formatTime = (date) =>
  date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const formatDate = (date) =>
  date.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

/* ── Single recording row ── */
function RecordingItem({ recording, index, onDelete }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(recording.duration || 0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => {
      setPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    };
    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration)
        setProgress((audio.currentTime / audio.duration) * 100);
    };
    const onLoadedMetadata = () => {
      if (isFinite(audio.duration))
        setAudioDuration(Math.round(audio.duration));
    };

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    playing ? audio.pause() : audio.play();
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = recording.url;
    a.download = recording.filename;
    a.click();
  };

  const sizeKB = recording.blob ? (recording.blob.size / 1024).toFixed(1) : "—";

  return (
    <div className={`${styles.item} ${playing ? styles.itemPlaying : ""}`}>
      {/* Hidden native audio */}
      <audio ref={audioRef} src={recording.url} preload="metadata" />

      {/* Index badge */}
      <div className={styles.indexBadge}>
        #{String(index + 1).padStart(2, "0")}
      </div>

      {/* Main content */}
      <div className={styles.itemContent}>
        {/* Top row: filename + meta */}
        <div className={styles.itemTop}>
          <span className={styles.filename}>{recording.filename}</span>
          <div className={styles.meta}>
            <span className={styles.metaChip}>
              {formatDate(recording.createdAt)}
            </span>
            <span className={styles.metaChip}>
              {formatTime(recording.createdAt)}
            </span>
            <span className={styles.metaChip}>{sizeKB} KB</span>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className={styles.progressBar}
          onClick={handleSeek}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
          aria-label="Progreso de reproducción"
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

        {/* Time row */}
        <div className={styles.timeRow}>
          <span className={styles.timeValue}>
            {formatDuration(Math.round(currentTime))}
          </span>
          <span className={styles.timeSep}>/</span>
          <span className={styles.timeTotal}>
            {formatDuration(audioDuration)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.actions}>
        <button
          className={`${styles.actionBtn} ${styles.playBtn} ${playing ? styles.playBtnActive : ""}`}
          onClick={togglePlay}
          aria-label={playing ? "Pausar" : "Reproducir"}
          title={playing ? "Pausar" : "Reproducir"}
        >
          {playing ? "❙❙" : "▶"}
        </button>

        <button
          className={`${styles.actionBtn} ${styles.downloadBtn}`}
          onClick={handleDownload}
          aria-label="Descargar"
          title="Descargar audio"
        >
          ↓
        </button>

        <button
          className={`${styles.actionBtn} ${styles.deleteBtn}`}
          onClick={() => onDelete(recording.id)}
          aria-label="Eliminar"
          title="Eliminar grabación"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/* ── Audio List ── */
export default function AudioList({ recordings, onDelete, onClearAll }) {
  if (recordings.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <svg
            width="40"
            height="40"
            viewBox="0 0 40 40"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="20"
              cy="20"
              r="19"
              stroke="currentColor"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
            <rect
              x="16"
              y="10"
              width="8"
              height="14"
              rx="4"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M10 22c0 5.523 4.477 10 10 10s10-4.477 10-10"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="20"
              y1="32"
              x2="20"
              y2="36"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="16"
              y1="36"
              x2="24"
              y2="36"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className={styles.emptyTitle}>Sin grabaciones aún</p>
        <p className={styles.emptyDesc}>
          Los audios grabados aparecerán aquí de forma instantánea
        </p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {/* List header */}
      <div className={styles.listHeader}>
        <span className={styles.listCount}>
          {recordings.length}{" "}
          {recordings.length === 1 ? "grabación" : "grabaciones"}
        </span>
        {recordings.length > 0 && (
          <button className={styles.clearBtn} onClick={onClearAll}>
            Borrar todo
          </button>
        )}
      </div>

      {/* Items */}
      <div className={styles.items}>
        {recordings.map((rec, i) => (
          <RecordingItem
            key={rec.id}
            recording={rec}
            index={i}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
