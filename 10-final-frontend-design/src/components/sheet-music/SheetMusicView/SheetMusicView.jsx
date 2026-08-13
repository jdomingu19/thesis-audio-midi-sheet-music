// thesis-audio-midi-sheet-music
// @jdomingu19
// SheetMusicView.jsx

import { FileMusic } from "lucide-react";
import clsx from "clsx";
import styles from "./SheetMusicView.module.css";
import SheetMusicToolbar from "@/components/sheet-music/SheetMusicToolbar/SheetMusicToolbar";
import SheetMusicPageControls from "@/components/sheet-music/SheetMusicPageControls/SheetMusicPageControls";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

/**
 * SheetMusicView — contenedor de la sección completa de partitura.
 * Compone Toolbar + área de renderizado + PageControls. En esta fase el
 * área central es un placeholder visual (sin VexFlow real conectado).
 *
 * @param {string} detectedKey - tonalidad detectada (mock)
 * @param {number} zoomLevel
 * @param {(zoomLevel: number) => void} onZoomChange
 * @param {boolean} isExportDisabled
 * @param {boolean} isExporting
 * @param {() => void} onExport
 * @param {number} currentPage
 * @param {number} totalPages
 * @param {(page: number) => void} onPageChange
 * @param {React.ReactNode} scoreContent - placeholder/SVG mock de la partitura (opcional)
 * @param {boolean} isEmpty - fuerza el estado vacío (sin partitura para mostrar)
 */
function SheetMusicView({
  detectedKey,
  zoomLevel = 100,
  onZoomChange,
  isExportDisabled = false,
  isExporting = false,
  onExport,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  scoreContent,
  isEmpty = false,
  className,
  ...rest
}) {
  const hasScore = !isEmpty && Boolean(scoreContent);

  return (
    <section className={clsx(styles.view, className)} {...rest}>
      {!hasScore && (
        <EmptyState
          icon={<FileMusic size={32} />}
          title="Sin partitura"
          description="Este audio aún no tiene una partitura generada."
          className={styles.emptyState}
        />
      )}

      {hasScore && (
        <>
          <SheetMusicToolbar
            zoomLevel={zoomLevel}
            onZoomChange={onZoomChange}
            detectedKey={detectedKey}
            isExportDisabled={isExportDisabled}
            isExporting={isExporting}
            onExport={onExport}
            className={styles.toolbar}
          />

          <div
            className={clsx(styles.scoreArea, styles.staffLines)}
            style={{ "--score-zoom": zoomLevel / 100 }}
          >
            <div className={styles.scoreContent}>{scoreContent}</div>
          </div>

          <SheetMusicPageControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            className={styles.pageControls}
          />
        </>
      )}
    </section>
  );
}

export default SheetMusicView;
