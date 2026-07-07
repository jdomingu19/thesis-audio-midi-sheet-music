// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/components/DownloadPdfButton.jsx

import { printSvgAsPdf } from "../utils/exportSvgToPdf.js";

export function DownloadPdfButton({ containerRef, filename }) {
  const handleDownload = () => {
    // "filename" is now used as the window/tab title,
    // which many browsers use as the suggested PDF name
    printSvgAsPdf(containerRef.current, filename.replace(".pdf", ""));
  };

  return (
    <button className="pdf-download-btn" onClick={handleDownload}>
      Download PDF
    </button>
  );
}
