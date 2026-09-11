// thesis-audio-midi-sheet-music
// @jdomingu19
// pdfExport.js

/**
 * downloadSheetMusicPdf — exporta el SVG de VexFlow renderizado dentro de
 * `containerElement` a PDF usando el patrón de ventana de impresión.
 *
 * IMPORTANTE: las fuentes Bravura/Academico de VexFlow deben estar
 * declaradas vía @font-face en el CSS global (no solo cargadas por JS),
 * para que se repliquen correctamente en la ventana de impresión.
 */
export function downloadSheetMusicPdf(containerElement, title = "Partitura") {
  if (!containerElement) return;

  const svgElement = containerElement.querySelector("svg");
  if (!svgElement) {
    console.error(
      "No se encontró un <svg> dentro del contenedor de partitura.",
    );
    return;
  }

  const svgClone = svgElement.cloneNode(true);

  const headContent = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style'),
  )
    .map((node) => node.outerHTML)
    .join("\n");

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert(
      "El navegador bloqueó la ventana emergente. Habilita los pop-ups para este sitio.",
    );
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>${title}</title>
        ${headContent}
        <style>
          @media print {
            @page { margin: 0; size: auto; }
          }
          html, body {
            margin: 0;
            padding: 20px;
            background: #ffffff;
          }
          svg {
            display: block;
            max-width: 100%;
            height: auto;
            margin: 0 auto;
          }
        </style>
      </head>
      <body>
        ${svgClone.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();

  printWindow.onload = async () => {
    try {
      await printWindow.document.fonts.ready;
    } catch {
      // el navegador de esa ventana no soporta document.fonts; el diálogo de impresión suele esperar solo
    }
    printWindow.focus();
    printWindow.print();
  };
}
