// thesis-audio-midi-sheet-music
// @jdomingu19
// PianoKeyboard.jsx

import clsx from "clsx";
import styles from "./PianoKeyboard.module.css";

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
const SHARP_INDEXES = new Set([1, 3, 6, 8, 10]);

const DEFAULT_LOW_MIDI = 36; // C2
const DEFAULT_HIGH_MIDI = 84; // C6

function isBlackKey(midiNumber) {
  return SHARP_INDEXES.has(midiNumber % 12);
}

function getNoteLabel(midiNumber) {
  const noteName = NOTE_NAMES[midiNumber % 12];
  const octave = Math.floor(midiNumber / 12) - 1;
  return `${noteName}${octave}`;
}

/**
 * PianoKeyboard — teclado vertical lateral, sincronizado con las notas
 * activas del piano roll. Genera las teclas dentro del rango MIDI dado.
 *
 * @param {number} lowMidi - nota MIDI más baja del rango visible
 * @param {number} highMidi - nota MIDI más alta del rango visible
 * @param {number[]} activeMidiNotes - notas actualmente resaltadas (mock)
 */
function PianoKeyboard({
  lowMidi = DEFAULT_LOW_MIDI,
  highMidi = DEFAULT_HIGH_MIDI,
  activeMidiNotes = [],
  className,
  ...rest
}) {
  const activeSet = new Set(activeMidiNotes);

  const keys = [];
  for (let midiNumber = highMidi; midiNumber >= lowMidi; midiNumber -= 1) {
    keys.push(midiNumber);
  }

  return (
    <div
      className={clsx(styles.keyboard, className)}
      role="presentation"
      aria-label="Teclado vertical del piano roll"
      {...rest}
    >
      {keys.map((midiNumber) => {
        const isBlack = isBlackKey(midiNumber);
        const isActive = activeSet.has(midiNumber);
        const isC = midiNumber % 12 === 0;

        return (
          <div
            key={midiNumber}
            className={clsx(
              styles.key,
              isBlack ? styles.blackKey : styles.whiteKey,
              isActive && styles.active,
            )}
            data-midi={midiNumber}
          >
            {isC && (
              <span className={styles.octaveLabel}>
                {getNoteLabel(midiNumber)}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PianoKeyboard;
