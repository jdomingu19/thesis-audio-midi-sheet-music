// thesis-audio-midi-sheet-music
// @jdomingu19
// VexFlowSheetMusic.jsx

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/Button";
import { downloadPDF } from "@/utils/handlers";
import { buildScoreDocument } from "@/utils/scoreDocument";

import s from "./VexFlowSheetMusic.module.css";

// Ancho de una hoja A4 a 96 dpi y escala mínima antes de activar el scroll horizontal
const SHEET_WIDTH = 794;
const MIN_SCALE = 0.5;

export function VexFlowSheetMusic({
  measures,
  timeSignature = "4/4",
  keyInfo,
  tempo,
  fileName,
  onReset,
}) {
  const viewerRef = useRef(null);
  const frameRef = useRef(null);
  const [docHtml, setDocHtml] = useState("");
  const [docHeight, setDocHeight] = useState(0);
  const [boxWidth, setBoxWidth] = useState(0);

  // Construye el mismo documento que se imprime, en modo vista previa
  useEffect(() => {
    if (!measures?.length) return;
    let cancelled = false;

    const build = () => {
      if (cancelled) return;
      const doc = buildScoreDocument(
        { measures, timeSignature, keyInfo, tempo, fileName },
        { preview: true },
      );
      setDocHtml(doc?.html ?? "");
    };

    const fonts = document.fonts
      ? Promise.all([
          document.fonts.load("16px Bravura"),
          document.fonts.load("16px Academico"),
        ])
      : Promise.resolve();
    fonts.catch(() => {}).then(build);

    return () => {
      cancelled = true;
    };
  }, [measures, timeSignature, keyInfo, tempo, fileName]);

  // Observa el ancho disponible para escalar las hojas
  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    let frame;
    const observer = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setBoxWidth(Math.floor(entry.contentRect.width));
      });
    });

    observer.observe(el);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const handleFrameLoad = () => {
    const doc = frameRef.current?.contentDocument;
    if (doc) setDocHeight(doc.documentElement.scrollHeight);
  };

  const handleDownload = () =>
    downloadPDF({ measures, timeSignature, keyInfo, tempo, fileName });

  const scale = boxWidth
    ? Math.max(MIN_SCALE, Math.min(1, boxWidth / SHEET_WIDTH))
    : 1;

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

      <div className={s.viewer} ref={viewerRef}>
        {docHtml && (
          <div
            className={s.sizer}
            style={{
              width: SHEET_WIDTH * scale,
              height: docHeight * scale,
            }}
          >
            <iframe
              ref={frameRef}
              className={s.frame}
              title="Vista previa de la partitura"
              sandbox="allow-same-origin"
              srcDoc={docHtml}
              onLoad={handleFrameLoad}
              style={{
                width: SHEET_WIDTH,
                height: docHeight,
                transform: `scale(${scale})`,
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
