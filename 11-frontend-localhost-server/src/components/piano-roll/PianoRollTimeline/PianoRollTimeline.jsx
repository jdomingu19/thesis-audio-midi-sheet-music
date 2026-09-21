// thesis-audio-midi-sheet-music
// @jdomingu19
// PianoRollTimeline.jsx

import { forwardRef } from "react";
import clsx from "clsx";
import styles from "./PianoRollTimeline.module.css";
import { getContentY, getTrackHeight } from "@/utils/pianoRollTiming";

/**
 * PianoRollTimeline — gutter vertical de compases, alineado al mismo eje
 * de tiempo que PianoRollCanvas (misma fórmula getContentY, ahora
 * centralizada en utils/pianoRollTiming.js para evitar que ambos
 * componentes se desincronicen si se ajustan las constantes). No tiene
 * scroll interactivo propio: PianoRollView sincroniza su scrollTop con
 * el del canvas.
 */
const PianoRollTimeline = forwardRef(function PianoRollTimeline(
  { measures = [], totalDuration = 16, className, ...rest },
  ref,
) {
  const trackHeight = getTrackHeight(totalDuration);

  return (
    <div
      ref={ref}
      className={clsx(styles.gutter, className)}
      role="presentation"
      aria-label="Regla de compases del piano roll"
      {...rest}
    >
      <div className={styles.track} style={{ height: trackHeight }}>
        {measures.map((measure) => {
          const measureTime = measure.position * totalDuration;
          return (
            <div
              key={measure.id}
              className={styles.measureMark}
              style={{ top: getContentY(measureTime, totalDuration) }}
            >
              <span className={styles.measureLabel}>{measure.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default PianoRollTimeline;
