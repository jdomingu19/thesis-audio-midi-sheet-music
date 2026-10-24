// thesis-audio-midi-sheet-music
// @jdomingu19
// pdfExport.js

import { buildScoreDocument } from "@/utils/scoreDocument";

/**
 * downloadSheetMusicPdf — abre una ventana nueva con el mismo documento A4
 * que se ve en la vista previa y lanza el diálogo de impresión (Guardar como PDF).
 *
 * @param {{ measures: Array, timeSignature?: string, keyInfo?: object, tempo?: number|null, fileName?: string }} score
 */
export function downloadSheetMusicPdf({
  measures,
  timeSignature = "4/4",
  keyInfo,
  tempo,
  fileName,
}) {
  const doc = buildScoreDocument({
    measures,
    timeSignature,
    keyInfo,
    tempo,
    fileName,
  });
  if (!doc) {
    console.error("No se pudo renderizar la partitura para imprimir.");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert(
      "El navegador bloqueó la ventana emergente. Habilita los pop-ups para este sitio.",
    );
    return;
  }

  printWindow.document.write(doc.html);
  printWindow.document.close();

  // Esperamos a que las fuentes estén listas EN esa ventana antes de imprimir
  const run = async () => {
    try {
      await Promise.all([
        printWindow.document.fonts.load("16px Academico"),
        printWindow.document.fonts.load("16px Bravura"),
      ]);
      await printWindow.document.fonts.ready;
    } catch {
      // Si el navegador no soporta document.fonts en esa ventana, seguimos igual
    }
    printWindow.focus();
    printWindow.print();
  };

  if (printWindow.document.readyState === "complete") run();
  else printWindow.addEventListener("load", run, { once: true });
}
