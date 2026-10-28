// thesis-audio-midi-sheet-music
// @jdomingu19
// DownloadBar.jsx

import clsx from "clsx";
import styles from "./DownloadBar.module.css";
import DownloadButton from "@/components/downloads/DownloadButton/DownloadButton";

/**
 * DownloadBar — contenedor horizontal (glass) que agrupa los DownloadButton
 * (MIDI y PDF) del audio actualmente seleccionado.
 *
 * @param {boolean} isMidiReady
 * @param {boolean} isPdfReady
 * @param {boolean} isMidiDownloading
 * @param {boolean} isPdfDownloading
 * @param {() => void} onDownloadMidi
 * @param {() => void} onDownloadPdf
 */
function DownloadBar({
  isMidiReady = false,
  isPdfReady = false,
  isMidiDownloading = false,
  isPdfDownloading = false,
  onDownloadMidi,
  onDownloadPdf,
  className,
  ...rest
}) {
  return (
    <div className={clsx(styles.bar, styles.glass, className)} {...rest}>
      <DownloadButton
        format="midi"
        isReady={isMidiReady}
        isLoading={isMidiDownloading}
        onDownload={onDownloadMidi}
      />
      <DownloadButton
        format="pdf"
        isReady={isPdfReady}
        isLoading={isPdfDownloading}
        onDownload={onDownloadPdf}
      />
    </div>
  );
}

export default DownloadBar;
