// thesis-audio-midi-sheet-music
// @jdomingu19
// PianoRollView.jsx

import clsx from "clsx";
import styles from "./PianoRollView.module.css";
import PianoRollTimeline from "@/components/piano-roll/PianoRollTimeline/PianoRollTimeline";
import PianoKeyboard from "@/components/piano-roll/PianoKeyboard/PianoKeyboard";
import PianoRollCanvas from "@/components/piano-roll/PianoRollCanvas/PianoRollCanvas";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { Music4 } from "lucide-react";

/**
 * PianoRollView — contenedor de la sección completa de visualización MIDI.
 * Compone Timeline + Keyboard + Canvas. Recibe notas y compases ya
 * resueltos (mock en esta fase) desde el padre.
 *
 * @param {Array<{ id: string, pitch: number, startTime: number, duration: number }>} notes
 * @param {Array<{ id: string, label: string, position: number }>} measures
 * @param {number} lowMidi
 * @param {number} highMidi
 * @param {number} totalDuration
 * @param {number} currentPosition - 0–1
 * @param {boolean} isPlaying
 * @param {number[]} activeMidiNotes
 * @param {boolean} isEmpty - fuerza el estado vacío (sin notas para mostrar)
 */
function PianoRollView({
  notes = [],
  measures = [],
  lowMidi,
  highMidi,
  totalDuration = 16,
  currentPosition = 0,
  isPlaying = false,
  activeMidiNotes = [],
  isEmpty = false,
  className,
  ...rest
}) {
  const hasNotes = !isEmpty && notes.length > 0;

  return (
    <section className={clsx(styles.view, className)} {...rest}>
      {!hasNotes && (
        <EmptyState
          icon={<Music4 size={32} />}
          title="Sin notas MIDI"
          description="Este audio aún no tiene un piano roll generado."
          className={styles.emptyState}
        />
      )}

      {hasNotes && (
        <>
          <PianoRollTimeline
            measures={measures}
            currentPosition={currentPosition}
            isPlaying={isPlaying}
            className={styles.timeline}
          />

          <div className={styles.body}>
            <PianoKeyboard
              lowMidi={lowMidi}
              highMidi={highMidi}
              activeMidiNotes={activeMidiNotes}
              className={styles.keyboard}
            />
            <PianoRollCanvas
              notes={notes}
              lowMidi={lowMidi}
              highMidi={highMidi}
              totalDuration={totalDuration}
              currentPosition={currentPosition}
              activeMidiNotes={activeMidiNotes}
              className={styles.canvas}
            />
          </div>
        </>
      )}
    </section>
  );
}

export default PianoRollView;
