// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/utils/handlers.js

export const uploadJSON = () => {
  console.log("uploadJSON...");
};

export const downloadPDF = (containerElement, title = "Sheet Music") => {
  console.log("downloadPDF...");
  if (!containerElement) return;

  const svgElement = containerElement.querySelector("svg");
  if (!svgElement) {
    console.error("A <svg> was not found inside the container.");
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
};
