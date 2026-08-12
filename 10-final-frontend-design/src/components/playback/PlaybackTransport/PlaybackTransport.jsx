// thesis-audio-midi-sheet-music
// @jdomingu19
// PlaybackTransport.jsx

import { Play, Pause, SkipBack, SkipForward } from "lucide-react";
import clsx from "clsx";
import styles from "./PlaybackTransport.module.css";
import IconButton from "@/components/ui/IconButton/IconButton";
import Slider from "@/components/ui/Slider/Slider";

function formatTime(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * PlaybackTransport — controles de reproducción del audio/MIDI seleccionado.
 * Play/pause, seek y tiempo actual/total. Controlado por el padre; sin
 * Tone.js real conectado en esta fase.
 *
 * @param {boolean} isPlaying
 * @param {number} currentTime - segundos
 * @param {number} duration - segundos
 * @param {boolean} disabled - true cuando no hay audio seleccionado o no está listo
 * @param {() => void} onPlayPause
 * @param {(seconds: number) => void} onSeek
 * @param {() => void} onSkipBack
 * @param {() => void} onSkipForward
 * @param {string} trackName - nombre del audio activo (opcional, mock)
 */
function PlaybackTransport({
  isPlaying = false,
  currentTime = 0,
  duration = 0,
  disabled = false,
  onPlayPause,
  onSeek,
  onSkipBack,
  onSkipForward,
  trackName,
  className,
  ...rest
}) {
  return (
    <div
      className={clsx(styles.transport, disabled && styles.disabled, className)}
      {...rest}
    >
      {trackName && (
        <span className={styles.trackName} title={trackName}>
          {trackName}
        </span>
      )}

      <div className={styles.controls}>
        <IconButton
          icon={<SkipBack size={16} />}
          label="Retroceder"
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={onSkipBack}
        />

        <IconButton
          icon={isPlaying ? <Pause size={18} /> : <Play size={18} />}
          label={isPlaying ? "Pausar" : "Reproducir"}
          size="md"
          variant="primary"
          disabled={disabled}
          onClick={onPlayPause}
          className={styles.playButton}
        />

        <IconButton
          icon={<SkipForward size={16} />}
          label="Adelantar"
          size="sm"
          variant="ghost"
          disabled={disabled}
          onClick={onSkipForward}
        />
      </div>

      <div className={styles.seekArea}>
        <span className={styles.time}>{formatTime(currentTime)}</span>
        <Slider
          value={currentTime}
          min={0}
          max={duration || 100}
          step={1}
          disabled={disabled}
          onChange={onSeek}
          label="Progreso de reproducción"
          className={styles.seekSlider}
        />
        <span className={styles.time}>{formatTime(duration)}</span>
      </div>
    </div>
  );
}

export default PlaybackTransport;
