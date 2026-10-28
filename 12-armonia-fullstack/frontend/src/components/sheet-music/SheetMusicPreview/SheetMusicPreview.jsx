// thesis-audio-midi-sheet-music
// @jdomingu19
// SheetMusicPreview.jsx

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import styles from "./SheetMusicPreview.module.css";
import Spinner from "@/components/ui/Spinner/Spinner";
import { buildScoreDocument } from "@/utils/scoreDocument";

// Ancho de una hoja A4 a 96 dpi y escala mínima de ajuste al ancho disponible
const SHEET_WIDTH = 794;
const MIN_SCALE = 0.5;

/**
 * SheetMusicPreview — vista previa de la partitura. Renderiza en un iframe
 * el MISMO documento A4 que se imprime al descargar el PDF (clave de sol +
 * clave de fa, 4 compases por fila, hojas paginadas). La escala se ajusta
 * al ancho disponible y se multiplica por `zoomLevel`.
 *
 * @param {Array} measures - measures[] devuelto por jsonToVexflowMeasures
 * @param {string} timeSignature
 * @param {object} keyInfo
 * @param {number | null} tempo
 * @param {string} fileName - nombre del audio (genera el título de la partitura)
 * @param {number} zoomLevel - porcentaje (100 = ajustado al ancho)
 */
function SheetMusicPreview({
  measures,
  timeSignature = "4/4",
  keyInfo,
  tempo,
  fileName,
  zoomLevel = 100,
  className,
  ...rest
}) {
  const viewerRef = useRef(null);
  const frameRef = useRef(null);
  const [docHtml, setDocHtml] = useState("");
  const [docHeight, setDocHeight] = useState(0);
  const [boxWidth, setBoxWidth] = useState(0);

  // Construye el mismo documento que se imprime, en modo vista previa
  useEffect(() => {
    if (!measures?.length) return undefined;
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
    const element = viewerRef.current;
    if (!element) return undefined;

    let frame;
    const observer = new ResizeObserver(([entry]) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setBoxWidth(Math.floor(entry.contentRect.width));
      });
    });

    observer.observe(element);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  const handleFrameLoad = () => {
    const doc = frameRef.current?.contentDocument;
    if (doc) setDocHeight(doc.documentElement.scrollHeight);
  };

  const fitScale = boxWidth
    ? Math.max(MIN_SCALE, Math.min(1, boxWidth / SHEET_WIDTH))
    : 1;
  const scale = fitScale * (zoomLevel / 100);

  return (
    <div
      ref={viewerRef}
      className={clsx(styles.viewer, className)}
      aria-label="Vista previa de la partitura"
      {...rest}
    >
      {!docHtml && (
        <div className={styles.loading}>
          <Spinner size="md" variant="sage" label="Generando partitura" />
        </div>
      )}

      {docHtml && (
        <div
          className={styles.sizer}
          style={{
            width: SHEET_WIDTH * scale,
            height: docHeight * scale,
          }}
        >
          <iframe
            ref={frameRef}
            className={styles.frame}
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
  );
}

export default SheetMusicPreview;
