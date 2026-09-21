// thesis-audio-midi-sheet-music
// @jdomingu19
// PianoKeyboard.jsx

import { forwardRef } from "react";
import clsx from "clsx";
import styles from "./PianoKeyboard.module.css";
import { getKeyLayout } from "@/utils/pianoKeyLayout";

const NOTE_NAMES = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

const DEFAULT_LOW_MIDI = 21; // A0
const DEFAULT_HIGH_MIDI = 108; // C8

function getNoteLabel(midiNumber) {
  const noteName = NOTE_NAMES[midiNumber % 12];
  const octave = Math.floor(midiNumber / 12) - 1;
  return `${noteName}${octave}`;
}

/**
 * PianoKeyboard — teclado horizontal fijo en la parte inferior del piano
 * roll (orientación cascada). Se desplaza horizontalmente y se sincroniza
 * con el scroll de PianoRollCanvas mediante el ref expuesto y onScroll
 * (la sincronización real ocurre en PianoRollView).
 */
const PianoKeyboard = forwardRef(function PianoKeyboard(
  {
    lowMidi = DEFAULT_LOW_MIDI,
    highMidi = DEFAULT_HIGH_MIDI,
    activeMidiNotes = [],
    onScroll,
    className,
    ...rest
  },
  ref,
) {
  const activeSet = new Set(activeMidiNotes);
  const { keys, totalWidth } = getKeyLayout(lowMidi, highMidi);
  const whiteKeys = keys.filter((k) => !k.isBlack);
  const blackKeys = keys.filter((k) => k.isBlack);

  return (
    <div
      ref={ref}
      className={clsx(styles.keyboardScroll, className)}
      onScroll={onScroll}
      role="presentation"
      aria-label="Teclado horizontal del piano roll"
      {...rest}
    >
      <div className={styles.keyboard} style={{ width: totalWidth }}>
        {whiteKeys.map(({ midi, x, width }) => {
          const isActive = activeSet.has(midi);
          const isC = midi % 12 === 0;
          return (
            <div
              key={midi}
              className={clsx(
                styles.key,
                styles.whiteKey,
                isActive && styles.active,
              )}
              style={{ left: x, width }}
              data-midi={midi}
            >
              {isC && (
                <span className={styles.octaveLabel}>{getNoteLabel(midi)}</span>
              )}
            </div>
          );
        })}

        {blackKeys.map(({ midi, x, width }) => {
          const isActive = activeSet.has(midi);
          return (
            <div
              key={midi}
              className={clsx(
                styles.key,
                styles.blackKey,
                isActive && styles.active,
              )}
              style={{ left: x, width }}
              data-midi={midi}
            />
          );
        })}
      </div>
    </div>
  );
});

export default PianoKeyboard;
