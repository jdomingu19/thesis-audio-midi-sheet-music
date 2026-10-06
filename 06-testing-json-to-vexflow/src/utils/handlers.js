// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// handlers.js

import { renderScore, ROW_HEIGHT } from "@/utils/renderScore";
import { AUTHOR, SUBTITLE, formatTitle } from "@/utils/scoreMeta";

// Ancho fijo de render para el PDF (A4 vertical, 2 compases por línea)
const PRINT_WIDTH = 700;
// Líneas de pentagrama por hoja (la primera cede espacio al encabezado)
const FIRST_PAGE_ROWS = 5;
const NEXT_PAGE_ROWS = 6;

export const uploadJSON = () => {
  console.log("uploadJSON...");
};

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

/** Renderiza la partitura a ancho fijo y la divide en hojas por bandas verticales. */
function buildPageSvgs({ measures, timeSignature, keyInfo }) {
  const sandbox = document.createElement("div");
  sandbox.style.cssText = `position:fixed;left:-99999px;top:0;width:${PRINT_WIDTH}px;`;
  document.body.appendChild(sandbox);

  try {
    const layout = renderScore(sandbox, {
      measures,
      timeSignature,
      keyInfo,
      width: PRINT_WIDTH,
    });
    const svg = sandbox.querySelector("svg");
    if (!svg) return [];

    const pages = [];
    let row = 0;
    while (row < layout.rows) {
      const count = Math.min(
        pages.length === 0 ? FIRST_PAGE_ROWS : NEXT_PAGE_ROWS,
        layout.rows - row,
      );
      pages.push({ row, count });
      row += count;
    }

    return pages.map(({ row: startRow, count }) => {
      const clone = svg.cloneNode(true);
      const height = count * ROW_HEIGHT;
      clone.removeAttribute("style");
      clone.setAttribute(
        "viewBox",
        `0 ${startRow * ROW_HEIGHT} ${layout.width} ${height}`,
      );
      clone.setAttribute("width", layout.width);
      clone.setAttribute("height", height);
      return clone.outerHTML;
    });
  } finally {
    sandbox.remove();
  }
}

export const downloadPDF = ({
  measures,
  timeSignature = "4/4",
  keyInfo,
  tempo,
  fileName,
}) => {
  if (!measures?.length) return;

  const title = formatTitle(fileName);
  const pageSvgs = buildPageSvgs({ measures, timeSignature, keyInfo });
  if (!pageSvgs.length) {
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

  const header = `
    <header class="head">
      <h1>${escapeHtml(title)}</h1>
      <p class="subtitle">${escapeHtml(SUBTITLE)}</p>
      <div class="meta">
        <span class="tempo">${tempo ? `♩ = ${escapeHtml(tempo)}` : ""}</span>
        <span class="author">${escapeHtml(AUTHOR)}</span>
      </div>
    </header>`;

  const total = pageSvgs.length;

  // Cada hoja es una caja A4 con su propio pie:
  // título centrado desde la 2ª hoja, número de página a la derecha
  const pagesHtml = pageSvgs
    .map(
      (svg, i) => `
      <section class="sheet">
        <div class="content">${i === 0 ? header : ""}${svg}</div>
        <footer class="foot">
          <span></span>
          <span class="foot-title">${i > 0 ? escapeHtml(title) : ""}</span>
          <span class="foot-page">${i + 1}/${total}</span>
        </footer>
      </section>`,
    )
    .join("\n");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          @font-face {
            font-family: "Bravura";
            src: url("https://cdn.jsdelivr.net/npm/@vexflow-fonts/bravura/bravura.woff2") format("woff2");
          }
          @font-face {
            font-family: "Academico";
            src: url("https://cdn.jsdelivr.net/npm/@vexflow-fonts/academico/academico.woff2") format("woff2");
          }

          /* margin: 0 elimina los encabezados y pies del navegador
             (fecha, título, about:blank y paginación por defecto) */
          @page { size: A4 portrait; margin: 0; }

          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            background: #ffffff;
            color: #1a1a1a;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .sheet {
            position: relative;
            width: 210mm;
            height: 296mm;
            padding: 14mm 12mm 18mm;
            overflow: hidden;
            background: #ffffff;
            break-after: page;
            page-break-after: always;
          }
          .sheet:last-child {
            break-after: auto;
            page-break-after: auto;
          }

          .head { margin-bottom: 8px; }
          .head h1 {
            margin: 0;
            text-align: center;
            font-family: "Academico", Georgia, "Times New Roman", serif;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: 0.01em;
          }
          .subtitle {
            margin: 4px 0 0;
            text-align: center;
            font-family: "Academico", Georgia, serif;
            font-size: 14px;
            font-style: italic;
            color: #555;
          }
          .meta {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin: 14px 16px 0;
            font-family: "Academico", Georgia, serif;
            font-size: 14px;
          }
          .tempo { font-weight: 600; }
          .author { color: #333; }

          svg {
            display: block;
            max-width: 100%;
            height: auto;
            margin: 0 auto;
          }

          .foot {
            position: absolute;
            left: 12mm;
            right: 12mm;
            bottom: 8mm;
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            align-items: baseline;
            font-family: "Academico", Georgia, serif;
            font-size: 11px;
            color: #555;
          }
          .foot-title { text-align: center; }
          .foot-page { text-align: right; }

          @media screen {
            html, body { background: #d9d9d9; }
            body { padding: 24px 0; }
            .sheet {
              margin: 0 auto 24px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
            }
          }
        </style>
      </head>
      <body>
        ${pagesHtml}
      </body>
    </html>
  `);
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
