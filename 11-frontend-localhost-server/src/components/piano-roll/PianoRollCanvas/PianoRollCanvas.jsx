// thesis-audio-midi-sheet-music
// @jdomingu19
// PianoRollCanvas.jsx

import clsx from "clsx";
import styles from "./PianoRollCanvas.module.css";

const DEFAULT_LOW_MIDI = 36; // C2
const DEFAULT_HIGH_MIDI = 84; // C6

/**
 * PianoRollCanvas — área principal donde "caen"/scrollean las notas.
 * En esta fase renderiza notas mock estáticas posicionadas por CSS custom
 * properties (pitch → eje vertical, tiempo → eje horizontal), sin
 * sincronización real a audio.
 *
 * @param {Array<{
 *   id: string,
 *   pitch: number,       // nota MIDI
 *   startTime: number,   // segundos (o beats, según mock)
 *   duration: number,    // segundos (o beats)
 * }>} notes
 * @param {number} lowMidi
 * @param {number} highMidi
 * @param {number} totalDuration - duración total visible del canvas (mismas unidades que startTime)
 * @param {number} currentPosition - 0–1, posición del playhead (mock)
 * @param {number[]} activeMidiNotes - notas actualmente sonando (mock), para resaltar
 */
function PianoRollCanvas({
  notes = [],
  lowMidi = DEFAULT_LOW_MIDI,
  highMidi = DEFAULT_HIGH_MIDI,
  totalDuration = 16,
  currentPosition = 0,
  activeMidiNotes = [],
  className,
  ...rest
}) {
  const activeSet = new Set(activeMidiNotes);
  const pitchRange = highMidi - lowMidi || 1;

  return (
    <div
      className={clsx(styles.canvas, styles.rollGrid, className)}
      role="img"
      aria-label="Visualización de notas MIDI en piano roll"
      {...rest}
    >
      <div className={styles.notesLayer}>
        {notes.map((note) => {
          const verticalPosition = (note.pitch - lowMidi) / pitchRange;
          const horizontalStart = note.startTime / totalDuration;
          const horizontalWidth = note.duration / totalDuration;
          const isActive = activeSet.has(note.pitch);

          return (
            <div
              key={note.id}
              className={clsx(styles.note, isActive && styles.active)}
              style={{
                "--note-vertical-position": verticalPosition,
                "--note-horizontal-start": horizontalStart,
                "--note-horizontal-width": horizontalWidth,
              }}
              title={`MIDI ${note.pitch}`}
            />
          );
        })}
      </div>

      <div
        className={styles.playhead}
        style={{ "--playhead-position": currentPosition }}
        aria-hidden="true"
      />
    </div>
  );
}

export default PianoRollCanvas;
