// thesis-audio-midi-sheet-music
// @jdomingu19
// VexFlowSheetMusic.jsx

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button";
import { downloadPDF } from "@/utils/handlers";
import { renderScore } from "@/utils/renderScore";

import s from "./VexFlowSheetMusic.module.css";

export function VexFlowSheetMusic({
  measures,
  timeSignature = "4/4",
  keyInfo,
  tempo,
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
    renderScore(outputRef.current, { measures, timeSignature, keyInfo, width });
  }, [measures, timeSignature, keyInfo, width]);

  const handleDownload = () =>
    downloadPDF({ measures, timeSignature, keyInfo, tempo, fileName });

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
            {tempo && (
              <li>
                <span>Tempo</span>
                <code>{tempo} BPM</code>
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
          <Button variant="primary" handleFunction={handleDownload}>
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
