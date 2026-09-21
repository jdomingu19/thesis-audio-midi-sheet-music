// thesis-audio-midi-sheet-music
// @jdomingu19
// PianoRollCanvas.jsx

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import styles from "./PianoRollCanvas.module.css";
import {
  getKeyLayout,
  DEFAULT_LOW_MIDI,
  DEFAULT_HIGH_MIDI,
} from "@/utils/pianoKeyLayout";
import {
  PIXELS_PER_SECOND,
  RENDER_BUFFER_SECONDS,
  getContentY,
  getTrackHeight,
} from "@/utils/pianoRollTiming";

export { PIXELS_PER_SECOND };

/**
 * PianoRollCanvas — waterfall vertical: las notas caen de arriba hacia
 * abajo y llegan a la línea de impacto (borde inferior, alineada con el
 * teclado) en sincronía con la reproducción.
 *
 * Tres mejoras clave sobre la versión anterior:
 * 1. Virtualización: solo se montan en el DOM las notas cuyo rango
 *    temporal cae dentro del viewport visible (+ margen), en vez de
 *    renderizar toda la pieza de una sola vez.
 * 2. Reloj interno por requestAnimationFrame: interpola el tiempo actual
 *    entre actualizaciones de `currentPosition`, produciendo una caída
 *    fluida y continua en vez de saltos ligados a la frecuencia con la
 *    que el padre re-renderiza.
 * 3. Nota activa = pitch Y tiempo: evita que notas repetidas del mismo
 *    tono en otros compases se iluminen simultáneamente.
 *
 * Scroll horizontal = eje de pitch (88 teclas), sincronizado con
 * PianoKeyboard vía onScroll. Scroll vertical = eje de tiempo,
 * auto-seguido mientras isPlaying=true; libre para el usuario en pausa.
 */
const PianoRollCanvas = forwardRef(function PianoRollCanvas(
  {
    notes = [],
    lowMidi = DEFAULT_LOW_MIDI,
    highMidi = DEFAULT_HIGH_MIDI,
    totalDuration = 16,
    currentPosition = 0,
    isPlaying = false,
    activeMidiNotes = [],
    onScroll,
    className,
    ...rest
  },
  ref,
) {
  const { keys, totalWidth } = useMemo(
    () => getKeyLayout(lowMidi, highMidi),
    [lowMidi, highMidi],
  );
  const keyByMidi = useMemo(() => {
    const map = new Map();
    keys.forEach((k) => map.set(k.midi, k));
    return map;
  }, [keys]);

  const trackHeight = getTrackHeight(totalDuration);
  const activeSet = new Set(activeMidiNotes);

  // Alto real medido del viewport — garantiza que la ventana de
  // virtualización se calcule sobre el espacio realmente visible, sin
  // depender de que la cadena de flexbox de los ancestros sea perfecta.
  const [viewportHeight, setViewportHeight] = useState(0);
  useEffect(() => {
    const container = ref?.current;
    if (!container) return undefined;
    const observer = new ResizeObserver((entries) => {
      setViewportHeight(entries[0].contentRect.height);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [ref]);

  // Reloj interno: cada vez que llega una nueva `currentPosition` desde el
  // padre, fija un punto de referencia (tiempo base + marca de reloj real);
  // mientras se reproduce, un loop de rAF interpola el tiempo transcurrido
  // por delta de reloj real, no por cuántos renders ocurrieron.
  const clockRef = useRef({ baseTime: 0, wallStart: 0 });
  const [renderTime, setRenderTime] = useState(currentPosition * totalDuration);

  useEffect(() => {
    clockRef.current = {
      baseTime: currentPosition * totalDuration,
      wallStart: performance.now(),
    };
    if (!isPlaying) {
      setRenderTime(currentPosition * totalDuration);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPosition, totalDuration]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    let frameId;
    const tick = () => {
      const { baseTime, wallStart } = clockRef.current;
      const elapsed = (performance.now() - wallStart) / 1000;
      setRenderTime(Math.min(baseTime + elapsed, totalDuration));
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [isPlaying, totalDuration]);

  // Posiciona t=0 en la línea de impacto al cargar un audio nuevo.
  useEffect(() => {
    const container = ref?.current;
    if (!container) return;
    container.scrollTop = Math.max(
      0,
      getContentY(0, totalDuration) - container.clientHeight,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, totalDuration]);

  // Auto-scroll: sigue renderTime manteniendo la línea de impacto fija.
  useEffect(() => {
    const container = ref?.current;
    if (!container || !isPlaying) return;
    container.scrollTop = Math.max(
      0,
      getContentY(renderTime, totalDuration) - container.clientHeight,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [renderTime, isPlaying]);

  // Ventana de revelado: solo las notas dentro del viewport visible (+
  // margen) se montan en el DOM.
  const visibleNotes = useMemo(() => {
    if (!viewportHeight) return [];
    const windowSeconds =
      viewportHeight / PIXELS_PER_SECOND + RENDER_BUFFER_SECONDS * 2;
    const windowStart = renderTime - RENDER_BUFFER_SECONDS;
    const windowEnd = windowStart + windowSeconds;
    return notes.filter(
      (note) =>
        note.startTime + note.duration >= windowStart &&
        note.startTime <= windowEnd,
    );
  }, [notes, renderTime, viewportHeight]);

  return (
    <div className={clsx(styles.canvasWrapper, className)}>
      <div
        ref={ref}
        className={styles.canvasScroll}
        onScroll={onScroll}
        role="img"
        aria-label="Visualización cascada de notas MIDI"
        {...rest}
      >
        <div
          className={clsx(styles.canvas, styles.rollGrid)}
          style={{ width: totalWidth, height: trackHeight }}
        >
          {keys
            .filter((k) => !k.isBlack)
            .map((k) => (
              <div
                key={`grid-${k.midi}`}
                className={styles.keyGridLine}
                style={{ left: k.x }}
              />
            ))}

          {visibleNotes.map((note) => {
            const keyInfo = keyByMidi.get(note.pitch);
            if (!keyInfo) return null;

            // Nota "sonando" = coincide en tono Y el tiempo actual cae
            // dentro de su rango — evita iluminar notas repetidas del
            // mismo tono en otros compases.
            const isSounding =
              activeSet.has(note.pitch) &&
              renderTime >= note.startTime &&
              renderTime <= note.startTime + note.duration;

            const top = getContentY(
              note.startTime + note.duration,
              totalDuration,
            );
            const height = Math.max(6, note.duration * PIXELS_PER_SECOND);

            return (
              <div
                key={note.id}
                className={clsx(
                  styles.note,
                  keyInfo.isBlack && styles.noteBlack,
                  isSounding && styles.active,
                )}
                style={{ left: keyInfo.x, width: keyInfo.width, top, height }}
                title={`MIDI ${note.pitch}`}
              />
            );
          })}
        </div>
      </div>

      <div className={styles.hitLine} aria-hidden="true" />
    </div>
  );
});

export default PianoRollCanvas;
