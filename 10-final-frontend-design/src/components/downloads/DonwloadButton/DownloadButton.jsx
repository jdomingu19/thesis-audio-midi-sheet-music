// thesis-audio-midi-sheet-music
// @jdomingu19
// DownloadButton.jsx

import { FileAudio2, FileText, CheckCircle2 } from "lucide-react";
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
 *
 * @param {'midi'|'pdf'} format
 * @param {boolean} isReady - habilita el botón cuando el resultado está listo
 * @param {boolean} isLoading - descarga en curso (mock)
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
      leftIcon={isReady ? <CheckCircle2 size={14} /> : config.icon}
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
      {config.label}
    </Button>
  );
}

export default DownloadButton;
