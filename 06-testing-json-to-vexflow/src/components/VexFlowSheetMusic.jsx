// thesis-audio-midi-sheet-music
// @jdomingu19
// VexFlowSheetMusic.jsx

import { useEffect, useRef, useState } from "react";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Beam,
  Accidental,
} from "vexflow";

import { Button } from "@/components/Button";
import { downloadPDF } from "@/utils/handlers";

import s from "./VexFlowSheetMusic.module.css";

const MIN_STAVE_WIDTH = 240;
const MAX_STAVE_WIDTH = 340;
const MAX_STAVES_PER_LINE = 4;
const PADDING = 16;
const ROW_HEIGHT = 150;

function parseTimeSignature(ts) {
  const [num, den] = String(ts).split("/").map(Number);
  return { numBeats: num || 4, beatValue: den || 4 };
}

export function VexFlowSheetMusic({
  measures,
  timeSignature = "4/4",
  keyInfo,
  fileName,
  onReset,
}) {
  const paperRef = useRef(null);
  const outputRef = useRef(null);
  const [width, setWidth] = useState(0);

  // Observa el ancho disponible para recalcular el layout
  useEffect(() => {
    const el = paperRef.current;
    if (!el) return;

    let frame;
    const observer = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setWidth(Math.floor(entry.contentRect.width));
      });
    });

    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!outputRef.current || !measures?.length || !width) return;
    outputRef.current.innerHTML = "";

    const available = width - PADDING * 2;
    const perLine = Math.max(
      1,
      Math.min(MAX_STAVES_PER_LINE, Math.floor(available / MIN_STAVE_WIDTH)),
    );
    const staveWidth = Math.max(
      MIN_STAVE_WIDTH,
      Math.min(MAX_STAVE_WIDTH, Math.floor(available / perLine)),
    );

    const lines = Math.ceil(measures.length / perLine);
    const renderer = new Renderer(outputRef.current, Renderer.Backends.SVG);
    renderer.resize(
      staveWidth * perLine + PADDING * 2,
      lines * ROW_HEIGHT + 40,
    );
    const context = renderer.getContext();

    const { numBeats, beatValue } = parseTimeSignature(timeSignature);

    measures.forEach((measureEvents, i) => {
      const col = i % perLine;
      const row = Math.floor(i / perLine);
      const x = PADDING + col * staveWidth;
      const y = 20 + row * ROW_HEIGHT;

      const stave = new Stave(x, y, staveWidth);
      if (col === 0) {
        stave.addClef("treble");
        if (keyInfo?.vexKey) stave.addKeySignature(keyInfo.vexKey);
      }
      if (i === 0) stave.addTimeSignature(timeSignature);
      stave.setContext(context).draw();

      const staveNotes = measureEvents.map((ev) => {
        const note = new StaveNote({ keys: ev.keys, duration: ev.duration });
        if (!ev.isRest) {
          // Accidental explícito, no un .includes() ambiguo
          ev.accidentals.forEach((acc, idx) => {
            if (acc === "#" || acc === "b") {
              note.addModifier(new Accidental(acc), idx);
            }
          });
        }
        return note;
      });

      const voice = new Voice({ numBeats, beatValue });
      voice.setStrict(false);
      voice.addTickables(staveNotes);

      // Ancho útil real: descuenta clave, armadura y compás
      const formatWidth = Math.max(
        60,
        stave.getNoteEndX() - stave.getNoteStartX() - 10,
      );
      new Formatter().joinVoices([voice]).format([voice], formatWidth);

      const beams = Beam.generateBeams(staveNotes.filter((n) => !n.isRest));
      voice.draw(context, stave);
      beams.forEach((b) => b.setContext(context).draw());
    });
  }, [measures, timeSignature, keyInfo, width]);

  return (
    <section className={s.card}>
      <header className={s.toolbar}>
        <div className={s.meta}>
          {fileName && <span className={s.file}>{fileName}</span>}
          <ul className={s.chips}>
            <li>
              <span>Compás</span>
              <code>{timeSignature}</code>
            </li>
            {keyInfo?.vexKey && (
              <li>
                <span>Tonalidad</span>
                <code>{keyInfo.vexKey}</code>
              </li>
            )}
            <li>
              <span>Compases</span>
              <code>{measures.length}</code>
            </li>
          </ul>
        </div>

        <div className={s.actions}>
          <Button variant="ghost" handleFunction={onReset}>
            Nuevo archivo
          </Button>
          <Button
            variant="primary"
            handleFunction={() => downloadPDF(outputRef.current, "Sheet Music")}
          >
            ⬇ Descargar PDF
          </Button>
        </div>
      </header>

      <div className={s.paper} ref={paperRef}>
        <div className={s.output} ref={outputRef} />
      </div>
    </section>
  );
}
