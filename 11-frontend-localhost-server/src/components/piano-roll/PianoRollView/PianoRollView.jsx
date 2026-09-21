// thesis-audio-midi-sheet-music
// @jdomingu19
// PianoRollView.jsx

import { useCallback, useLayoutEffect, useRef } from "react";
import clsx from "clsx";
import styles from "./PianoRollView.module.css";
import PianoRollTimeline from "@/components/piano-roll/PianoRollTimeline/PianoRollTimeline";
import PianoKeyboard from "@/components/piano-roll/PianoKeyboard/PianoKeyboard";
import PianoRollCanvas from "@/components/piano-roll/PianoRollCanvas/PianoRollCanvas";
import EmptyState from "@/components/ui/EmptyState/EmptyState";
import { Music4 } from "lucide-react";
import {
  getKeyLayout,
  getScrollLeftForMidi,
  CENTER_ANCHOR_MIDI,
  DEFAULT_LOW_MIDI,
  DEFAULT_HIGH_MIDI,
} from "@/utils/pianoKeyLayout";

/**
 * PianoRollView — contenedor de la sección completa de visualización MIDI
 * en orientación cascada: gutter de compases + canvas waterfall arriba,
 * teclado horizontal fijo abajo. Orquesta:
 * - Sincronización de scroll horizontal (canvas ↔ teclado, eje de pitch)
 *   y vertical (canvas → gutter, eje de tiempo).
 * - Centrado horizontal inicial en Do central (MIDI 60) al cargar
 *   cualquier audio, sin importar si el registro real de las notas es
 *   muy grave o muy agudo — el teclado siempre arranca desde un punto de
 *   referencia estable y predecible.
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

  const canvasRef = useRef(null);
  const keyboardRef = useRef(null);
  const timelineRef = useRef(null);
  const isSyncingRef = useRef(false);

  const handleCanvasScroll = useCallback(() => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    const canvas = canvasRef.current;
    if (canvas) {
      if (keyboardRef.current) {
        keyboardRef.current.scrollLeft = canvas.scrollLeft;
      }
      if (timelineRef.current) {
        timelineRef.current.scrollTop = canvas.scrollTop;
      }
    }
    isSyncingRef.current = false;
  }, []);

  const handleKeyboardScroll = useCallback(() => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    if (keyboardRef.current && canvasRef.current) {
      canvasRef.current.scrollLeft = keyboardRef.current.scrollLeft;
    }
    isSyncingRef.current = false;
  }, []);

  // Centrado horizontal en Do central al montar y cada vez que cambia el
  // rango de teclado o se carga un audio distinto.
  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const keyboard = keyboardRef.current;
    if (!hasNotes || !canvas || !keyboard) return;

    const layout = getKeyLayout(
      lowMidi ?? DEFAULT_LOW_MIDI,
      highMidi ?? DEFAULT_HIGH_MIDI,
    );
    const viewportWidth = keyboard.clientWidth || canvas.clientWidth;
    const targetScrollLeft = getScrollLeftForMidi(
      layout,
      CENTER_ANCHOR_MIDI,
      viewportWidth,
    );

    canvas.scrollLeft = targetScrollLeft;
    keyboard.scrollLeft = targetScrollLeft;
  }, [lowMidi, highMidi, notes, hasNotes]);

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
          <div className={styles.body}>
            <PianoRollTimeline
              ref={timelineRef}
              measures={measures}
              totalDuration={totalDuration}
              className={styles.timeline}
            />
            <PianoRollCanvas
              ref={canvasRef}
              notes={notes}
              lowMidi={lowMidi}
              highMidi={highMidi}
              totalDuration={totalDuration}
              currentPosition={currentPosition}
              isPlaying={isPlaying}
              activeMidiNotes={activeMidiNotes}
              onScroll={handleCanvasScroll}
              className={styles.canvas}
            />
          </div>

          <PianoKeyboard
            ref={keyboardRef}
            lowMidi={lowMidi}
            highMidi={highMidi}
            activeMidiNotes={activeMidiNotes}
            onScroll={handleKeyboardScroll}
            className={styles.keyboard}
          />
        </>
      )}
    </section>
  );
}

export default PianoRollView;
