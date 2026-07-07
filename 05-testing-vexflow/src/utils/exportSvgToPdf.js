// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/utils/exportSvgToPdf.js

/**
 * Open a new window with ONLY the SVG of the score,
 * inheriting the styles/fonts of the original document,
 * and fires the browser's native print dialog
 * (where the user can choose "Save as PDF").
 */
export function printSvgAsPdf(containerElement, title = "Sheet Music") {
  if (!containerElement) return;

  const svgElement = containerElement.querySelector("svg");
  if (!svgElement) {
    console.error("A <svg> was not found inside the container.");
    return;
  }

  // We clone the SVG so as not to mutate the original on the screen
  const svgClone = svgElement.cloneNode(true);

  // We copy ALL the <link> and <style> of the current document,
  // to inherit any @font-face (Bravura/Academico) that
  // is already declared, regardless of how you loaded it.
  const headContent = Array.from(
    document.querySelectorAll('link[rel="stylesheet"], style'),
  )
    .map((node) => node.outerHTML)
    .join("\n");

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    alert(
      "The browser blocked the popup. Please enable pop-ups for this site.",
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
            @page {
              margin: 0;
              size: auto;
            }
          }
          html, body {
            margin: 0;
            padding: 20px;
            background: #ffffff;
            display: flex;
            justify-content: center;
            align-items: center;
          }
          svg {
            max-width: 100%;
            height: auto;
          }
        </style>
      </head>
      <body>
        ${svgClone.outerHTML}
      </body>
    </html>
  `);
  printWindow.document.close();

  // We wait for the font to be ready IN THAT window before printing
  printWindow.onload = async () => {
    try {
      await printWindow.document.fonts.ready;
    } catch {
      // If the browser does not support document.fonts in that window,
      // we continue the same; the print dialog usually waits on its own.
    }
    printWindow.focus();
    printWindow.print();
  };
}
