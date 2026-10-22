// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// renderScore.js

import {
  Renderer,
  Stave,
  StaveNote,
  StaveConnector,
  GhostNote,
  Voice,
  Formatter,
  Beam,
  Accidental,
  Dot,
} from "vexflow";

export const MIN_STAVE_WIDTH = 240;
export const MAX_STAVE_WIDTH = 340;
export const MAX_STAVES_PER_LINE = 4;
export const PADDING_LEFT = 30; // deja espacio para la llave
export const PADDING_RIGHT = 16;
// Alto de un sistema completo (clave de sol + clave de fa)
export const ROW_HEIGHT = 280;
// Distancia vertical entre el pentagrama de sol y el de fa
const BASS_OFFSET = 110;

// Dirección de plica cuando hay dos voces en una misma clave
const STEM_UP = 1;
const STEM_DOWN = -1;

// Tipos de conector (compatibles con distintas versiones de VexFlow)
const CONNECTOR = {
  BRACE: StaveConnector.type?.BRACE ?? "brace",
  SINGLE_LEFT: StaveConnector.type?.SINGLE_LEFT ?? "singleLeft",
  SINGLE_RIGHT: StaveConnector.type?.SINGLE_RIGHT ?? "singleRight",
};

function parseTimeSignature(ts) {
  const [num, den] = String(ts).split("/").map(Number);
  return { numBeats: num || 4, beatValue: den || 4 };
}

function getLayout(width) {
  const available = width - PADDING_LEFT - PADDING_RIGHT;
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

function buildNotes(events, clef, stemDirection) {
  return events.map((ev) => {
    // Silencio invisible de las voces secundarias: ocupa tiempo pero no se dibuja
    if (ev.isGhost) return new GhostNote(ev.duration);

    const note = new StaveNote({
      keys: ev.keys,
      duration: ev.duration,
      clef,
    });

    if (!ev.isRest) {
      // Accidental explícito, no un .includes() ambiguo
      ev.accidentals.forEach((acc, idx) => {
        if (acc === "#" || acc === "b" || acc === "n") {
          note.addModifier(new Accidental(acc), idx);
        }
      });
      if (stemDirection) note.setStemDirection(stemDirection);
    }

    // Puntillo para duraciones con "d" (hd, qd, 8d...), sin duplicarlo
    if (
      ev.duration.includes("d") &&
      !note.getModifiers().some((m) => m instanceof Dot)
    ) {
      Dot.buildAndAttach([note], { all: true });
    }

    return note;
  });
}

/**
 * Crea las voces de una clave. `voiceEvents` es la lista de voces del compás
 * (una o dos). Con dos voces, la primera lleva las plicas hacia arriba y la segunda hacia abajo.
 */
function buildHandVoices(voiceEvents, clef, numBeats, beatValue) {
  const multi = voiceEvents.length > 1;
  const noteGroups = voiceEvents.map((events, v) =>
    buildNotes(events, clef, multi ? (v === 0 ? STEM_UP : STEM_DOWN) : null),
  );

  const voices = noteGroups.map((notes) => {
    const voice = new Voice({ numBeats, beatValue });
    voice.setStrict(false);
    voice.addTickables(notes);
    return voice;
  });

  // Los silencios cortan las barras; no se unen notas a través de ellos
  const beams = noteGroups.flatMap((notes) =>
    Beam.generateBeams(
      notes,
      multi
        ? { maintain_stem_directions: true, maintainStemDirections: true }
        : undefined,
    ),
  );

  return { voices, beams };
}

/**
 * Dibuja la partitura (clave de sol + clave de fa) como SVG dentro de `container`.
 * Cada elemento de `measures` es { treble, bass }, y cada clave es una lista de voces.
 * Devuelve las dimensiones reales para poder paginar.
 */
export function renderScore(
  container,
  { measures, timeSignature = "4/4", keyInfo, width },
) {
  container.innerHTML = "";

  const { perLine, staveWidth } = getLayout(width);
  const rows = Math.ceil(measures.length / perLine);
  const totalWidth = staveWidth * perLine + PADDING_LEFT + PADDING_RIGHT;
  const totalHeight = rows * ROW_HEIGHT + 40;

  const renderer = new Renderer(container, Renderer.Backends.SVG);
  renderer.resize(totalWidth, totalHeight);
  const context = renderer.getContext();

  const { numBeats, beatValue } = parseTimeSignature(timeSignature);

  measures.forEach((measure, i) => {
    const col = i % perLine;
    const row = Math.floor(i / perLine);
    const x = PADDING_LEFT + col * staveWidth;
    const trebleY = 20 + row * ROW_HEIGHT;
    const bassY = trebleY + BASS_OFFSET;

    const trebleStave = new Stave(x, trebleY, staveWidth);
    const bassStave = new Stave(x, bassY, staveWidth);

    if (col === 0) {
      trebleStave.addClef("treble");
      bassStave.addClef("bass");
      if (keyInfo?.vexKey) {
        trebleStave.addKeySignature(keyInfo.vexKey);
        bassStave.addKeySignature(keyInfo.vexKey);
      }
    }
    if (i === 0) {
      trebleStave.addTimeSignature(timeSignature);
      bassStave.addTimeSignature(timeSignature);
    }

    // Ambas claves arrancan las notas en la misma X para que queden alineadas
    const noteStartX = Math.max(
      trebleStave.getNoteStartX(),
      bassStave.getNoteStartX(),
    );
    trebleStave.setNoteStartX(noteStartX);
    bassStave.setNoteStartX(noteStartX);

    trebleStave.setContext(context).draw();
    bassStave.setContext(context).draw();

    // Llave al inicio de cada sistema + barras que unen ambas claves en cada compás
    if (col === 0) {
      new StaveConnector(trebleStave, bassStave)
        .setType(CONNECTOR.BRACE)
        .setContext(context)
        .draw();
      new StaveConnector(trebleStave, bassStave)
        .setType(CONNECTOR.SINGLE_LEFT)
        .setContext(context)
        .draw();
    }
    new StaveConnector(trebleStave, bassStave)
      .setType(CONNECTOR.SINGLE_RIGHT)
      .setContext(context)
      .draw();

    const treble = buildHandVoices(
      measure.treble ?? [],
      "treble",
      numBeats,
      beatValue,
    );
    const bass = buildHandVoices(
      measure.bass ?? [],
      "bass",
      numBeats,
      beatValue,
    );

    // Ancho útil real: descuenta clave, armadura y compás
    const formatWidth = Math.max(
      60,
      trebleStave.getNoteEndX() - noteStartX - 10,
    );

    // Se formatean juntas para alinear verticalmente las notas de ambas manos;
    // las voces de una misma clave se unen para evitar choques de alteraciones
    const formatter = new Formatter();
    formatter.joinVoices(treble.voices);
    formatter.joinVoices(bass.voices);
    formatter.format([...treble.voices, ...bass.voices], formatWidth);

    treble.voices.forEach((voice) => voice.draw(context, trebleStave));
    bass.voices.forEach((voice) => voice.draw(context, bassStave));
    [...treble.beams, ...bass.beams].forEach((beam) =>
      beam.setContext(context).draw(),
    );
  });

  return { width: totalWidth, height: totalHeight, rows, perLine };
}
