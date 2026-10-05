// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// renderScore.js

import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Beam,
  Accidental,
} from "vexflow";

export const MIN_STAVE_WIDTH = 240;
export const MAX_STAVE_WIDTH = 340;
export const MAX_STAVES_PER_LINE = 4;
export const PADDING = 16;
export const ROW_HEIGHT = 150;

function parseTimeSignature(ts) {
  const [num, den] = String(ts).split("/").map(Number);
  return { numBeats: num || 4, beatValue: den || 4 };
}

function getLayout(width) {
  const available = width - PADDING * 2;
  const perLine = Math.max(
    1,
    Math.min(MAX_STAVES_PER_LINE, Math.floor(available / MIN_STAVE_WIDTH)),
  );
  const staveWidth = Math.max(
    MIN_STAVE_WIDTH,
    Math.min(MAX_STAVE_WIDTH, Math.floor(available / perLine)),
  );
  return { perLine, staveWidth };
}

/**
 * Dibuja la partitura como SVG dentro de `container`.
 * Devuelve las dimensiones reales para poder paginar.
 */
export function renderScore(
  container,
  { measures, timeSignature = "4/4", keyInfo, width },
) {
  container.innerHTML = "";

  const { perLine, staveWidth } = getLayout(width);
  const rows = Math.ceil(measures.length / perLine);
  const totalWidth = staveWidth * perLine + PADDING * 2;
  const totalHeight = rows * ROW_HEIGHT + 40;

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(totalWidth, totalHeight);
  const context = renderer.getContext();

  const { numBeats, beatValue } = parseTimeSignature(timeSignature);

  measures.forEach((measureEvents, i) => {
    const col = i % perLine;
    const row = Math.floor(i / perLine);
    const x = PADDING + col * staveWidth;
    const y = 20 + row * ROW_HEIGHT;

    const stave = new Stave(x, y, staveWidth);
    if (col === 0) {
      stave.addClef("treble");
      if (keyInfo?.vexKey) stave.addKeySignature(keyInfo.vexKey);
    }
    if (i === 0) stave.addTimeSignature(timeSignature);
    stave.setContext(context).draw();

    const staveNotes = measureEvents.map((ev) => {
      const note = new StaveNote({ keys: ev.keys, duration: ev.duration });
      if (!ev.isRest) {
        // Accidental explícito, no un .includes() ambiguo
        ev.accidentals.forEach((acc, idx) => {
          if (acc === "#" || acc === "b") {
            note.addModifier(new Accidental(acc), idx);
          }
        });
      }
      return note;
    });

    const voice = new Voice({ numBeats, beatValue });
    voice.setStrict(false);
    voice.addTickables(staveNotes);

    // Ancho útil real: descuenta clave, armadura y compás
    const formatWidth = Math.max(
      60,
      stave.getNoteEndX() - stave.getNoteStartX() - 10,
    );
    new Formatter().joinVoices([voice]).format([voice], formatWidth);

    const beams = Beam.generateBeams(staveNotes.filter((n) => !n.isRest));
    voice.draw(context, stave);
    beams.forEach((b) => b.setContext(context).draw());
  });

  return { width: totalWidth, height: totalHeight, rows, perLine };
}
