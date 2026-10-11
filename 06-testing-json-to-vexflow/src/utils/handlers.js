// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// handlers.js

import { buildScoreDocument } from "@/utils/scoreDocument";

export const uploadJSON = () => {
  console.log("uploadJSON...");
};

export const downloadPDF = ({
  measures,
  timeSignature = "4/4",
  keyInfo,
  tempo,
  fileName,
}) => {
  const doc = buildScoreDocument({
    measures,
    timeSignature,
    keyInfo,
    tempo,
    fileName,
  });
  if (!doc) {
    console.error("The score could not be rendered for printing.");
    return;
  }

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert(
      "The browser blocked the popup. Please enable pop-ups for this site.",
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
};
