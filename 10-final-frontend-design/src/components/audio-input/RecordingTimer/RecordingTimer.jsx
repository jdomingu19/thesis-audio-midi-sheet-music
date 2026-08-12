// thesis-audio-midi-sheet-music
// @jdomingu19
// RecordingTimer.jsx

import clsx from "clsx";
import styles from "./RecordingTimer.module.css";

function formatDuration(totalSeconds) {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * RecordingTimer — contador mm:ss en JetBrains Mono.
 * El valor de `seconds` es controlado por el padre (mock en esta fase).
 *
 * @param {number} seconds
 * @param {boolean} isActive - aplica estilo/énfasis de "corriendo"
 */
function RecordingTimer({ seconds = 0, isActive = false, className, ...rest }) {
  return (
    <span
      className={clsx(styles.timer, isActive && styles.active, className)}
      aria-live="polite"
      {...rest}
    >
      {formatDuration(seconds)}
    </span>
  );
}

export default RecordingTimer;
