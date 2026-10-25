// thesis-audio-midi-sheet-music
// @jdomingu19
// PianoRollCanvas.jsx

import { useEffect, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import styles from "./PianoRollCanvas.module.css";
import { readThemeColor, themeRgba } from "@/utils/themeColors";
import { getKeyLayout } from "@/utils/pianoKeyLayout";

// Segundos de futuro visibles sobre la línea de impacto (alto del canvas = LOOKAHEAD)
export const LOOKAHEAD_SECONDS = 4;
const KEY_STEP_SECONDS = 1;

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/**
 * PianoRollCanvas — cascada de notas (waterfall) dibujada en <canvas>.
 * Altura fija: solo se dibuja la ventana [currentTime, currentTime + LOOKAHEAD],
 * las notas "caen" hasta la línea de impacto (borde inferior).
 *
 * Interacción sincronizada con la reproducción (todo vía onSeek):
 * - rueda: arriba = avanzar, abajo = retroceder
 * - arrastre (mouse/touch): hacia abajo = avanzar (empuja las notas)
 * - flechas ↑/↓ o PageUp/PageDown: ±1 s
 *
 * @param {Array<{ midi:number, time:number, duration:number, color:string }>} notes
 * @param {number} currentTime - segundos (fuente de verdad: Tone.Transport)
 * @param {number} duration - duración total en segundos
 * @param {Array<{ id:string, label:string, position:number }>} measures
 * @param {(seconds:number) => void} onSeek
 */
function PianoRollCanvas({
  notes = [],
  currentTime = 0,
  duration = 0,
  lowMidi = 48,
  highMidi = 72,
  measures = [],
  onSeek,
  className,
  ...rest
}) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const timeRef = useRef(currentTime);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const layout = useMemo(
    () => getKeyLayout(lowMidi, highMidi),
    [lowMidi, highMidi],
  );

  // Colores del canvas leídos de los tokens CSS (un canvas no entiende var())
  const palette = useMemo(
    () => ({
      guide: themeRgba("--color-ink-rgb", 0.04, "232 238 248"),
      measureLine: themeRgba("--color-sage-rgb", 0.28, "91 156 245"),
      measureLabel: readThemeColor("--color-ink-muted", "#9fb0c9"),
    }),
    [],
  );

  useEffect(() => {
    timeRef.current = currentTime;
  }, [currentTime]);

  // Tamaño real del contenedor (re-dibuja al redimensionar)
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return undefined;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width: Math.round(width), height: Math.round(height) });
    });
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, []);

  // Dibujo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.width || !size.height) return;

    const dpr = window.devicePixelRatio || 1;
    const { width, height } = size;
    const pixelWidth = Math.round(width * dpr);
    const pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }

    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    const timeToY = (t) => height * (1 - (t - currentTime) / LOOKAHEAD_SECONDS);

    // Líneas guía sutiles cada segundo
    ctx.strokeStyle = palette.guide;
    ctx.lineWidth = 1;
    for (
      let s = Math.ceil(currentTime);
      s <= currentTime + LOOKAHEAD_SECONDS;
      s += 1
    ) {
      const y = timeToY(s);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Líneas de compás con etiqueta
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textBaseline = "bottom";
    measures.forEach((measure) => {
      const t = measure.position * duration;
      if (t < currentTime || t > currentTime + LOOKAHEAD_SECONDS) return;
      const y = timeToY(t);
      ctx.strokeStyle = palette.measureLine;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
      ctx.fillStyle = palette.measureLabel;
      ctx.fillText(measure.label, 6, y - 3);
    });

    // Notas
    notes.forEach((note) => {
      const noteEnd = note.time + note.duration;
      if (noteEnd < currentTime - 0.05) return; // ya pasó
      if (note.time > currentTime + LOOKAHEAD_SECONDS) return; // aún no visible

      const position = layout.get(note.midi);
      if (!position) return;

      const x = (position.left / 100) * width;
      const w = (position.width / 100) * width;
      const yTop = timeToY(noteEnd);
      const yBottom = timeToY(note.time);
      const h = Math.max(4, yBottom - yTop);
      const isActive = note.time <= currentTime && currentTime <= noteEnd;

      ctx.fillStyle = note.color;
      ctx.globalAlpha = isActive ? 1 : 0.78;
      ctx.shadowColor = isActive ? note.color : "transparent";
      ctx.shadowBlur = isActive ? 14 : 0;
      roundRect(ctx, x + 1, yTop, Math.max(2, w - 2), h, 3);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (isActive) {
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = "#ffffff";
        roundRect(ctx, x + 1, yTop, Math.max(2, w - 2), h, 3);
        ctx.fill();
      }
    });
    ctx.globalAlpha = 1;
  }, [notes, currentTime, duration, measures, layout, size, palette]);

  // Interacción: rueda, arrastre y teclado → onSeek (sincroniza barra de reproducción)
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !size.height || !duration) return undefined;

    const pixelsPerSecond = size.height / LOOKAHEAD_SECONDS;
    const clamp = (t) => Math.min(Math.max(t, 0), duration);
    const seekTo = (t) => {
      const next = clamp(t);
      timeRef.current = next;
      onSeek?.(next);
    };

    const handleWheel = (event) => {
      if (Math.abs(event.deltaX) > Math.abs(event.deltaY)) return; // scroll horizontal nativo
      event.preventDefault();
      const unit =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? size.height : 1;
      seekTo(timeRef.current - (event.deltaY * unit) / pixelsPerSecond);
    };

    let drag = null;
    const handlePointerDown = (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      drag = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startTime: timeRef.current,
      };
      wrapper.setPointerCapture(event.pointerId);
      setIsDragging(true);
    };
    const handlePointerMove = (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      seekTo(drag.startTime + (event.clientY - drag.startY) / pixelsPerSecond);
    };
    const endDrag = (event) => {
      if (!drag || event.pointerId !== drag.pointerId) return;
      drag = null;
      setIsDragging(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === "ArrowUp" || event.key === "PageUp") {
        event.preventDefault();
        seekTo(timeRef.current + KEY_STEP_SECONDS);
      } else if (event.key === "ArrowDown" || event.key === "PageDown") {
        event.preventDefault();
        seekTo(timeRef.current - KEY_STEP_SECONDS);
      }
    };

    wrapper.addEventListener("wheel", handleWheel, { passive: false });
    wrapper.addEventListener("pointerdown", handlePointerDown);
    wrapper.addEventListener("pointermove", handlePointerMove);
    wrapper.addEventListener("pointerup", endDrag);
    wrapper.addEventListener("pointercancel", endDrag);
    wrapper.addEventListener("keydown", handleKeyDown);
    return () => {
      wrapper.removeEventListener("wheel", handleWheel);
      wrapper.removeEventListener("pointerdown", handlePointerDown);
      wrapper.removeEventListener("pointermove", handlePointerMove);
      wrapper.removeEventListener("pointerup", endDrag);
      wrapper.removeEventListener("pointercancel", endDrag);
      wrapper.removeEventListener("keydown", handleKeyDown);
    };
  }, [duration, size.height, onSeek]);

  return (
    <div
      ref={wrapperRef}
      className={clsx(
        styles.canvasWrapper,
        isDragging && styles.dragging,
        className,
      )}
      tabIndex={0}
      role="application"
      aria-label="Cascada de notas MIDI. Usa la rueda, arrastra o las flechas arriba y abajo para mover la reproducción."
      {...rest}
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.hitLine} aria-hidden="true" />
    </div>
  );
}

export default PianoRollCanvas;
