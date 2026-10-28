// thesis-audio-midi-sheet-music
// @jdomingu19
// SheetMusicToolbar.jsx

import { ZoomIn, ZoomOut, Download, Music2 } from "lucide-react";
import clsx from "clsx";
import styles from "./SheetMusicToolbar.module.css";
import IconButton from "@/components/ui/IconButton/IconButton";
import Badge from "@/components/ui/Badge/Badge";

const MIN_ZOOM = 50;
const MAX_ZOOM = 200;
const ZOOM_STEP = 10;

/**
 * SheetMusicToolbar — controles de zoom, tonalidad detectada y exportación
 * para la vista de partitura. Puramente visual/controlado en esta fase;
 * `detectedKey` llega como mock (ej. "Sib mayor").
 *
 * @param {number} zoomLevel - porcentaje, ej. 100
 * @param {(zoomLevel: number) => void} onZoomChange
 * @param {string} detectedKey - tonalidad detectada (mock)
 * @param {boolean} isExportDisabled
 * @param {boolean} isExporting
 * @param {() => void} onExport
 */
function SheetMusicToolbar({
  zoomLevel = 100,
  onZoomChange,
  detectedKey,
  isExportDisabled = false,
  isExporting = false,
  onExport,
  className,
  ...rest
}) {
  const handleZoomOut = () => {
    onZoomChange?.(Math.max(MIN_ZOOM, zoomLevel - ZOOM_STEP));
  };

  const handleZoomIn = () => {
    onZoomChange?.(Math.min(MAX_ZOOM, zoomLevel + ZOOM_STEP));
  };

  return (
    <div className={clsx(styles.toolbar, className)} {...rest}>
      <div className={styles.zoomGroup}>
        <IconButton
          icon={<ZoomOut size={16} />}
          label="Reducir zoom"
          size="sm"
          variant="ghost"
          disabled={zoomLevel <= MIN_ZOOM}
          onClick={handleZoomOut}
        />
        <span className={styles.zoomValue}>{zoomLevel}%</span>
        <IconButton
          icon={<ZoomIn size={16} />}
          label="Aumentar zoom"
          size="sm"
          variant="ghost"
          disabled={zoomLevel >= MAX_ZOOM}
          onClick={handleZoomIn}
        />
      </div>

      {detectedKey && (
        <Badge
          status="default"
          icon={<Music2 size={12} />}
          className={styles.keyBadge}
        >
          {detectedKey}
        </Badge>
      )}

      <IconButton
        icon={<Download size={16} />}
        label="Exportar partitura"
        size="sm"
        variant="primary"
        disabled={isExportDisabled}
        isLoading={isExporting}
        onClick={onExport}
        className={styles.exportButton}
      />
    </div>
  );
}

export default SheetMusicToolbar;
