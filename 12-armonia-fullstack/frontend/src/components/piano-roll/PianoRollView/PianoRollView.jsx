// thesis-audio-midi-sheet-music
// @jdomingu19
// PianoRollView.jsx

import { useMemo } from "react";
import { Music4 } from "lucide-react";
import clsx from "clsx";
import styles from "./PianoRollView.module.css";
import PianoRollCanvas from "@/components/piano-roll/PianoRollCanvas/PianoRollCanvas";
import PianoKeyboard from "@/components/piano-roll/PianoKeyboard/PianoKeyboard";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { getWhiteKeyCount } from "@/utils/pianoKeyLayout";
import { formatDuration } from "@/utils/audioUtils";

/**
 * PianoRollView — visor MIDI de altura fija: barra de metadatos + escenario
 * (cascada <canvas> + teclado) con un único scroll horizontal compartido.
 * El tiempo se controla desde afuera (currentTime / onSeek), de modo que
 * mover la cascada mueve la barra de reproducción y viceversa.
 *
 * @param {Array} notes - notas planas { midi, time, duration, color }
 * @param {Array} measures - marcadores { id, label, position }
 * @param {number} currentTime - segundos
 * @param {number} totalDuration - segundos
 * @param {number[]} activeMidiNotes
 * @param {(seconds:number) => void} onSeek
 * @param {boolean} isEmpty
 */
function PianoRollView({
  notes = [],
  measures = [],
  lowMidi = 48,
  highMidi = 72,
  totalDuration = 0,
  currentTime = 0,
  activeMidiNotes = [],
  onSeek,
  isEmpty = false,
  className,
  ...rest
}) {
  const hasNotes = !isEmpty && notes.length > 0;
  const whiteCount = useMemo(
    () => getWhiteKeyCount(lowMidi, highMidi),
    [lowMidi, highMidi],
  );

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
          <div className={styles.meta}>
            <span className={styles.metaItem}>
              Notas <strong>{notes.length}</strong>
            </span>
            <span className={styles.metaItem}>
              Duración <strong>{formatDuration(totalDuration)}</strong>
            </span>
            <span className={styles.metaItem}>
              Rango{" "}
              <strong>
                {lowMidi}–{highMidi}
              </strong>
            </span>
            <span className={styles.hint}>
              Rueda o arrastre: mover reproducción
            </span>
          </div>

          <div className={styles.stageScroll}>
            <div
              className={styles.stage}
              style={{ "--white-count": whiteCount }}
            >
              <PianoRollCanvas
                notes={notes}
                currentTime={currentTime}
                duration={totalDuration}
                lowMidi={lowMidi}
                highMidi={highMidi}
                measures={measures}
                onSeek={onSeek}
                className={styles.canvas}
              />
              <PianoKeyboard
                lowMidi={lowMidi}
                highMidi={highMidi}
                activeMidiNotes={activeMidiNotes}
                className={styles.keyboard}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}

export default PianoRollView;
