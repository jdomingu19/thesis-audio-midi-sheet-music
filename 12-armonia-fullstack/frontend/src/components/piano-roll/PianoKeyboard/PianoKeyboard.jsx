// thesis-audio-midi-sheet-music
// @jdomingu19
// PianoKeyboard.jsx

import { useMemo } from "react";
import clsx from "clsx";
import styles from "./PianoKeyboard.module.css";
import { getKeyLayout } from "@/utils/pianoKeyLayout";

/**
 * PianoKeyboard — teclado horizontal fijo bajo la cascada. Usa el mismo
 * layout porcentual que PianoRollCanvas, por lo que ambos quedan alineados
 * sin sincronizar scroll (comparten el mismo scroller horizontal).
 *
 * @param {number} lowMidi
 * @param {number} highMidi
 * @param {number[]} activeMidiNotes - teclas sonando en este instante
 */
function PianoKeyboard({
  lowMidi = 48,
  highMidi = 72,
  activeMidiNotes = [],
  className,
  ...rest
}) {
  const layout = useMemo(
    () => getKeyLayout(lowMidi, highMidi),
    [lowMidi, highMidi],
  );
  const activeSet = useMemo(() => new Set(activeMidiNotes), [activeMidiNotes]);

  const whiteKeys = [];
  const blackKeys = [];
  layout.forEach((position, midi) => {
    (position.isBlack ? blackKeys : whiteKeys).push({ midi, ...position });
  });

  return (
    <div
      className={clsx(styles.keyboard, className)}
      role="presentation"
      aria-label="Teclado del piano roll"
      {...rest}
    >
      {whiteKeys.map(({ midi, left, width }) => (
        <div
          key={midi}
          className={clsx(
            styles.whiteKey,
            activeSet.has(midi) && styles.active,
          )}
          style={{ left: `${left}%`, width: `${width}%` }}
          data-midi={midi}
        >
          {midi % 12 === 0 && (
            <span className={styles.octaveLabel}>
              C{Math.floor(midi / 12) - 1}
            </span>
          )}
        </div>
      ))}
      {blackKeys.map(({ midi, left, width }) => (
        <div
          key={midi}
          className={clsx(
            styles.blackKey,
            activeSet.has(midi) && styles.active,
          )}
          style={{ left: `${left}%`, width: `${width}%` }}
          data-midi={midi}
        />
      ))}
    </div>
  );
}

export default PianoKeyboard;
