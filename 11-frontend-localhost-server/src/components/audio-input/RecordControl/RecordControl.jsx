// thesis-audio-midi-sheet-music
// @jdomingu19
// RecordControl.jsx

import { forwardRef } from "react";
import { Mic, Square } from "lucide-react";
import clsx from "clsx";
import styles from "./RecordControl.module.css";

/**
 * RecordControl — botón circular principal de grabación.
 * Puramente visual en esta fase (sin MediaRecorder real); el estado es
 * controlado por el padre.
 *
 * @param {'idle'|'recording'|'stopped'} state
 * @param {() => void} onToggle
 * @param {boolean} disabled
 */
const RecordControl = forwardRef(function RecordControl(
  { state = "idle", onToggle, disabled = false, className, ...rest },
  ref,
) {
  const isRecording = state === "recording";

  const label = isRecording ? "Detener grabación" : "Iniciar grabación";

  return (
    <div className={clsx(styles.wrapper, className)}>
      <button
        ref={ref}
        type="button"
        onClick={onToggle}
        disabled={disabled}
        aria-label={label}
        aria-pressed={isRecording}
        className={clsx(
          styles.button,
          styles[`state-${state}`],
          isRecording && styles.pulseRec,
        )}
        {...rest}
      >
        <span className={styles.iconWrapper} aria-hidden="true">
          {isRecording ? <Square size={20} /> : <Mic size={22} />}
        </span>
      </button>
      <span className={styles.statusLabel}>
        {isRecording
          ? "Grabando…"
          : state === "stopped"
            ? "Grabación detenida"
            : "Grabar audio"}
      </span>
    </div>
  );
});

export default RecordControl;
