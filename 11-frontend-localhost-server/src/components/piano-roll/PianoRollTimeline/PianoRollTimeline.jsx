// thesis-audio-midi-sheet-music
// @jdomingu19
// PianoRollTimeline.jsx

import clsx from "clsx";
import styles from "./PianoRollTimeline.module.css";

/**
 * PianoRollTimeline — regla superior de tiempo/compases del piano roll.
 * Puramente visual en esta fase; recibe los compases ya calculados (mock)
 * en vez de derivarlos de un motor de audio real.
 *
 * @param {Array<{ id: string, label: string, position: number }>} measures
 *   - position: 0–1, posición relativa dentro del ancho total del timeline
 * @param {number} currentPosition - 0–1, posición del playhead (mock)
 * @param {boolean} isPlaying - aplica énfasis visual al playhead
 */
function PianoRollTimeline({
  measures = [],
  currentPosition = 0,
  isPlaying = false,
  className,
  ...rest
}) {
  return (
    <div
      className={clsx(styles.timeline, className)}
      role="presentation"
      aria-label="Regla de tiempo del piano roll"
      {...rest}
    >
      <div className={styles.track}>
        {measures.map((measure) => (
          <div
            key={measure.id}
            className={styles.measureMark}
            style={{ "--measure-position": measure.position }}
          >
            <span className={styles.measureLabel}>{measure.label}</span>
          </div>
        ))}

        <div
          className={clsx(styles.playhead, isPlaying && styles.active)}
          style={{ "--playhead-position": currentPosition }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

export default PianoRollTimeline;
