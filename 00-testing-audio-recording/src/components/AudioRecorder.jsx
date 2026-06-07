import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./AudioRecorder.module.css";

/* ── Constants ── */
const MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
  "audio/ogg",
  "audio/mp4",
];

const getSupportedMimeType = () =>
  MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t)) || "";

const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

/* ── Waveform bars ── */
const BAR_COUNT = 40;

export default function AudioRecorder({ onNewRecording }) {
  const [status, setStatus] = useState("idle"); // idle | requesting | recording | paused | error
  const [duration, setDuration] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const [bars, setBars] = useState(Array(BAR_COUNT).fill(0));

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);

  const stopEverything = () => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    audioCtxRef.current?.close();
  };

  /* ── Cleanup on unmount ── */
  useEffect(() => {
    return () => {
      stopEverything();
    };
  }, []);

  /* ── Waveform animation ── */
  const startWaveform = (stream) => {
    const ctx = new AudioContext();
    audioCtxRef.current = ctx;
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.8;
    source.connect(analyser);
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const step = Math.floor(data.length / BAR_COUNT);
      const newBars = Array.from({ length: BAR_COUNT }, (_, i) => {
        const slice = data.slice(i * step, (i + 1) * step);
        const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
        return avg / 255;
      });
      setBars(newBars);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    tick();
  };

  const stopWaveform = () => {
    cancelAnimationFrame(animFrameRef.current);
    setBars(Array(BAR_COUNT).fill(0));
  };

  /* ── Start recording ── */
  const handleStart = useCallback(async () => {
    setErrorMsg("");
    setStatus("requesting");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {});
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        const ext = (recorder.mimeType || "audio/webm").includes("ogg")
          ? "ogg"
          : recorder.mimeType?.includes("mp4")
            ? "mp4"
            : "webm";

        onNewRecording({
          id: crypto.randomUUID(),
          url,
          blob,
          duration,
          mimeType: recorder.mimeType,
          filename: `rec_${Date.now()}.${ext}`,
          createdAt: new Date(),
        });

        setDuration(0);
        setStatus("idle");
        stopWaveform();
        stopEverything();
      };

      recorder.start(100);
      setStatus("recording");
      setDuration(0);
      startWaveform(stream);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      const msg =
        err.name === "NotAllowedError"
          ? "Permiso de micrófono denegado. Habilítalo en tu navegador."
          : err.name === "NotFoundError"
            ? "No se encontró ningún micrófono."
            : `Error: ${err.message}`;
      setErrorMsg(msg);
      setStatus("error");
    }
  }, [duration, onNewRecording]);

  /* ── Stop recording ── */
  const handleStop = useCallback(() => {
    clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  /* ── Pause / Resume ── */
  const handlePauseResume = useCallback(() => {
    if (!mediaRecorderRef.current) return;

    if (status === "recording") {
      mediaRecorderRef.current.pause();
      clearInterval(timerRef.current);
      stopWaveform();
      setStatus("paused");
    } else if (status === "paused") {
      mediaRecorderRef.current.resume();
      startWaveform(streamRef.current);
      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
      setStatus("recording");
    }
  }, [status]);

  const isRecording = status === "recording";
  const isPaused = status === "paused";
  const isActive = isRecording || isPaused;

  return (
    <div className={styles.card}>
      {/* Card header */}
      <div className={styles.cardHeader}>
        <span className={styles.cardLabel}>// recorder.component</span>
        <div className={styles.statusIndicator}>
          <span
            className={`${styles.dot} ${
              isRecording
                ? styles.dotRecording
                : isPaused
                  ? styles.dotPaused
                  : status === "error"
                    ? styles.dotError
                    : styles.dotIdle
            }`}
          />
          <span className={styles.statusText}>
            {status === "idle" && "IDLE"}
            {status === "requesting" && "REQUESTING"}
            {status === "recording" && "REC"}
            {status === "paused" && "PAUSED"}
            {status === "error" && "ERROR"}
          </span>
        </div>
      </div>

      {/* Waveform visualizer */}
      <div className={styles.waveform} aria-hidden="true">
        {bars.map((h, i) => (
          <div
            key={i}
            className={`${styles.bar} ${isRecording ? styles.barActive : ""}`}
            style={{ "--h": `${Math.max(h * 100, 3)}%` }}
          />
        ))}
      </div>

      {/* Timer */}
      <div className={styles.timer}>
        <span className={styles.timerValue}>{formatDuration(duration)}</span>
        <span className={styles.timerUnit}>elapsed</span>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        {!isActive && (
          <button
            className={`${styles.btn} ${styles.btnRecord}`}
            onClick={handleStart}
            disabled={status === "requesting"}
            aria-label="Iniciar grabación"
          >
            <span className={styles.btnIcon}>●</span>
            {status === "requesting" ? "Solicitando..." : "Grabar"}
          </button>
        )}

        {isActive && (
          <>
            <button
              className={`${styles.btn} ${styles.btnPause}`}
              onClick={handlePauseResume}
              aria-label={isPaused ? "Reanudar" : "Pausar"}
            >
              <span className={styles.btnIcon}>{isPaused ? "▶" : "❙❙"}</span>
              {isPaused ? "Reanudar" : "Pausar"}
            </button>
            <button
              className={`${styles.btn} ${styles.btnStop}`}
              onClick={handleStop}
              aria-label="Detener grabación"
            >
              <span className={styles.btnIcon}>■</span>
              Detener
            </button>
          </>
        )}
      </div>

      {/* Error message */}
      {status === "error" && errorMsg && (
        <div className={styles.error} role="alert">
          <span className={styles.errorIcon}>⚠</span>
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Info */}
      {!isActive && status !== "error" && (
        <p className={styles.hint}>
          Presiona <strong>Grabar</strong> para iniciar · el audio se procesa
          localmente en tu navegador
        </p>
      )}
    </div>
  );
}
