// thesis-audio-midi-sheet-music
// @jdomingu19
// DownloadButton.jsx

import { FileAudio2, FileText } from "lucide-react";
import clsx from "clsx";
import styles from "./DownloadButton.module.css";
import Button from "@/components/ui/Button/Button";

const VARIANT_CONFIG = {
  midi: {
    label: "MIDI",
    icon: <FileAudio2 size={16} />,
  },
  pdf: {
    label: "PDF",
    icon: <FileText size={16} />,
  },
};

/**
 * DownloadButton — botón individual de descarga (variante MIDI o PDF).
 * Deshabilitado cuando el audio seleccionado no está en estado `ready`.
 * En pantallas muy estrechas muestra solo el ícono (el aria-label se mantiene).
 *
 * @param {'midi'|'pdf'} format
 * @param {boolean} isReady - habilita el botón cuando el resultado está listo
 * @param {boolean} isLoading - descarga en curso
 * @param {() => void} onDownload
 */
function DownloadButton({
  format = "midi",
  isReady = false,
  isLoading = false,
  onDownload,
  className,
  ...rest
}) {
  const config = VARIANT_CONFIG[format] ?? VARIANT_CONFIG.midi;

  return (
    <Button
      variant="secondary"
      size="sm"
      leftIcon={config.icon}
      isLoading={isLoading}
      disabled={!isReady}
      onClick={onDownload}
      aria-label={`Descargar ${config.label}`}
      className={clsx(
        styles.downloadButton,
        styles[`format-${format}`],
        className,
      )}
      {...rest}
    >
      <span className={styles.labelText}>{config.label}</span>
    </Button>
  );
}

export default DownloadButton;
