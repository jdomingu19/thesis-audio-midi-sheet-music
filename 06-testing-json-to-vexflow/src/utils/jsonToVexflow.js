// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// jsonToVexflow.js

const RESOLUTION_DIVISIONS = 16;

// Notas desde A3 (MIDI 57) hacia arriba -> clave de sol; por debajo (G3 y menores) -> clave de fa
export const SPLIT_MIDI = 57;

// Silencio centrado en cada pentagrama
const REST_KEY = { treble: "b/4", bass: "d/3" };

// Duraciones representables, en semicorcheas (ascendente). Cada "unidad" es una semicorchea.
const DURATIONS = [
  { units: 1, duration: "16" },
  { units: 2, duration: "8" },
  { units: 3, duration: "8d" },
  { units: 4, duration: "q" },
  { units: 6, duration: "qd" },
  { units: 8, duration: "h" },
  { units: 12, duration: "hd" },
  { units: 16, duration: "w" },
  { units: 24, duration: "wd" },
];

// --- Detección de tonalidad (Krumhansl-Kessler) ---
const KK_MAJOR = [
  6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88,
];
const KK_MINOR = [
  6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17,
];

const PITCH_NAMES_SHARP = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];
const PITCH_NAMES_FLAT = [
  "C",
  "Db",
  "D",
  "Eb",
  "E",
  "F",
  "Gb",
  "G",
  "Ab",
  "A",
  "Bb",
  "B",
];

// Nº de bemoles/sostenidos por tónica mayor (índice = pitch class de la tónica)
// positivo = sostenidos, negativo = bemoles
const MAJOR_KEY_ACCIDENTALS = {
  0: 0,
  7: 1,
  2: 2,
  9: 3,
  4: 4,
  11: 5,
  6: 6, // C G D A E B F#
  5: -1,
  10: -2,
  3: -3,
  8: -4,
  1: -5, // F Bb Eb Ab Db
};

function correlate(hist, profile) {
  const meanH = hist.reduce((a, b) => a + b) / 12;
  const meanP = profile.reduce((a, b) => a + b) / 12;
  let num = 0,
    denH = 0,
    denP = 0;
  for (let i = 0; i < 12; i++) {
    const dh = hist[i] - meanH;
    const dp = profile[i] - meanP;
    num += dh * dp;
    denH += dh * dh;
    denP += dp * dp;
  }
  return num / Math.sqrt(denH * denP || 1);
}

/** Devuelve { tonicPitchClass, mode, useFlats, sharpsOrFlats } */
export function detectKey(notes) {
  const histogram = new Array(12).fill(0);
  for (const n of notes) {
    histogram[n.midi % 12] += n.duration; // ponderado por duración
  }

  let best = { score: -Infinity, tonic: 0, mode: "major" };
  for (let tonic = 0; tonic < 12; tonic++) {
    const rotatedMajor = KK_MAJOR.map(
      (_, i) => KK_MAJOR[(i - tonic + 12) % 12],
    );
    const rotatedMinor = KK_MINOR.map(
      (_, i) => KK_MINOR[(i - tonic + 12) % 12],
    );
    const scoreMajor = correlate(histogram, rotatedMajor);
    const scoreMinor = correlate(histogram, rotatedMinor);
    if (scoreMajor > best.score)
      best = { score: scoreMajor, tonic, mode: "major" };
    if (scoreMinor > best.score)
      best = { score: scoreMinor, tonic, mode: "minor" };
  }

  // Para la escritura de accidentales usamos la mayor relativa
  const majorTonic = best.mode === "major" ? best.tonic : (best.tonic + 3) % 12;
  const accidentalCount = MAJOR_KEY_ACCIDENTALS[majorTonic] ?? 0;

  return {
    tonicPitchClass: best.tonic,
    mode: best.mode,
    tonicName: (best.mode === "major" ? PITCH_NAMES_SHARP : PITCH_NAMES_SHARP)[
      best.tonic
    ],
    useFlats: accidentalCount < 0,
    accidentalCount,
    // string usable directamente en stave.addKeySignature()
    vexKey:
      (accidentalCount < 0 ? PITCH_NAMES_FLAT : PITCH_NAMES_SHARP)[best.tonic] +
      (best.mode === "minor" ? "m" : ""),
  };
}

// Convierte midi -> "c#/4" respetando la tonalidad detectada
function midiToVexKey(midi, useFlats) {
  const pitchClass = midi % 12;
  const octave = Math.floor(midi / 12) - 1;
  const name = (useFlats ? PITCH_NAMES_FLAT : PITCH_NAMES_SHARP)[pitchClass];
  const letter = name[0].toLowerCase();
  const accidental = name.slice(1); // "", "#", o "b"
  return { key: `${letter}${accidental}/${octave}`, accidental };
}

/** Duración representable más cercana a `target` sin superar `max` (empate -> la menor). */
function snapDuration(target, max) {
  let best = DURATIONS[0];
  for (const d of DURATIONS) {
    if (d.units > max) break;
    if (Math.abs(d.units - target) < Math.abs(best.units - target)) best = d;
  }
  return best;
}

/** Descompone un hueco en silencios representables (voraz, de mayor a menor). */
function restPieces(length) {
  const pieces = [];
  let left = length;
  while (left > 0) {
    let pick = DURATIONS[0];
    for (const d of DURATIONS) {
      if (d.units <= left) pick = d;
      else break;
    }
    pieces.push(pick);
    left -= pick.units;
  }
  return pieces;
}

const SHARP_ORDER = ["f", "c", "g", "d", "a", "e", "b"];
const FLAT_ORDER = ["b", "e", "a", "d", "g", "c", "f"];

/** Letra -> alteración que impone la armadura (p. ej. Re mayor: { f: "#", c: "#" }) */
function keySignatureMap(accidentalCount) {
  const map = {};
  const sign = accidentalCount >= 0 ? "#" : "b";
  const order = accidentalCount >= 0 ? SHARP_ORDER : FLAT_ORDER;
  order.slice(0, Math.abs(accidentalCount)).forEach((letter) => {
    map[letter] = sign;
  });
  return map;
}

/** "c#/4" -> { letter: "c", accidental: "#", octave: "4" } */
function parseKey(key) {
  const [pitch, octave] = key.split("/");
  return { letter: pitch[0], accidental: pitch.slice(1), octave };
}

/**
 * Reemplaza ev.accidentals por las alteraciones que realmente deben dibujarse:
 * - se muestran los cromáticos (notas distintas a la armadura)
 * - dentro de un compás no se repite una alteración ya vigente
 * - al volver a su estado de la armadura tras haber sido alterada, la primera
 *   aparición lleva la alteración (o becuadro) de recordatorio; luego se omite
 * Valores posibles: "" (nada), "#", "b", "n" (becuadro)
 */
function applyAccidentalRules(measures, keyAccidentals) {
  // Alturas (letra+octava) que quedaron alteradas respecto a la armadura
  const altered = new Set();

  for (const events of measures) {
    // Alteración vigente por altura dentro del compás actual
    const state = new Map();

    for (const ev of events) {
      if (ev.isRest) continue;

      ev.accidentals = ev.keys.map((key) => {
        const { letter, accidental, octave } = parseKey(key);
        const id = `${letter}${octave}`;
        const signature = keyAccidentals[letter] ?? "";
        const firstInMeasure = !state.has(id);
        const inForce = firstInMeasure ? signature : state.get(id);

        let show = "";
        if (accidental !== inForce) {
          // Cromático, o cambio dentro del mismo compás
          show = accidental || "n";
        } else if (firstInMeasure && altered.has(id)) {
          // Vuelve a su estado original tras una alteración anterior
          show = accidental || "n";
        }

        state.set(id, accidental);
        return show;
      });
    }

    // Al cerrar el compás: ¿quedó la altura alterada respecto a la armadura?
    for (const [id, accidental] of state) {
      const signature = keyAccidentals[id[0]] ?? "";
      if (accidental !== signature) altered.add(id);
      else altered.delete(id);
    }
  }
}

/**
 * Construye los compases de UNA mano. Cada compás queda llenado exactamente
 * con notas y silencios, para que ambas claves queden sincronizadas.
 */
function buildHandMeasures(
  notes,
  {
    clef,
    ticksPerUnit,
    unitsPerMeasure,
    totalMeasures,
    useFlats,
    keyAccidentals,
  },
) {
  const measures = Array.from({ length: totalMeasures }, () => []);
  const totalUnits = totalMeasures * unitsPerMeasure;

  // Agrupa las notas por instante de inicio (cada grupo es un acorde)
  const slots = new Map();
  for (const note of notes) {
    const start = Math.round(note.ticks / ticksPerUnit);
    const durUnits = Math.max(1, Math.round(note.durationTicks / ticksPerUnit));
    const { key, accidental } = midiToVexKey(note.midi, useFlats);
    if (!slots.has(start)) slots.set(start, []);
    slots.get(start).push({ midi: note.midi, key, accidental, durUnits });
  }
  const starts = Array.from(slots.keys()).sort((a, b) => a - b);

  // Añade silencios partiendo el hueco en los límites de compás
  const pushRests = (from, length) => {
    let pos = from;
    let left = length;
    while (left > 0 && pos < totalUnits) {
      const m = Math.floor(pos / unitsPerMeasure);
      const room = (m + 1) * unitsPerMeasure - pos;
      const chunk = Math.min(left, room);
      for (const piece of restPieces(chunk)) {
        measures[m].push({
          keys: [REST_KEY[clef]],
          accidentals: [""],
          duration: `${piece.duration}r`,
          isRest: true,
        });
      }
      pos += chunk;
      left -= chunk;
    }
  };

  let cursor = 0;
  starts.forEach((start, idx) => {
    if (start < cursor || start >= totalUnits) return;

    pushRests(cursor, start - cursor);

    // Acorde ordenado de grave a agudo y sin notas repetidas
    const chord = slots
      .get(start)
      .sort((a, b) => a.midi - b.midi)
      .filter((n, i, arr) => i === 0 || n.midi !== arr[i - 1].midi);

    const m = Math.floor(start / unitsPerMeasure);
    const measureEnd = (m + 1) * unitsPerMeasure;
    const nextStart = idx + 1 < starts.length ? starts[idx + 1] : Infinity;
    const available = Math.min(measureEnd, nextStart) - start;
    const target = Math.max(...chord.map((n) => n.durUnits));
    const snapped = snapDuration(target, available);

    measures[m].push({
      keys: chord.map((n) => n.key),
      accidentals: chord.map((n) => n.accidental),
      duration: snapped.duration,
      isRest: false,
    });
    cursor = start + snapped.units;
  });

  pushRests(cursor, totalUnits - cursor);
  applyAccidentalRules(measures, keyAccidentals);
  return measures;
}

/**
 * Devuelve { measures, timeSignature, keyInfo, tempo }
 * donde measures[i] = { treble: [...eventos], bass: [...eventos] }
 */
export function jsonToVexflowMeasures(toneJson, trackIndex = 0) {
  const { header, tracks } = toneJson;
  const ppq = header.ppq;
  const [tsNum, tsDen] = header.timeSignatures?.[0]?.timeSignature ?? [4, 4];
  const bpm = header.tempos?.[0]?.bpm;
  const tempo = bpm ? Math.round(bpm) : null;

  const track = tracks[trackIndex];
  if (!track || !track.notes?.length) {
    return {
      measures: [],
      timeSignature: `${tsNum}/${tsDen}`,
      keyInfo: null,
      tempo,
    };
  }

  const keyInfo = detectKey(track.notes);

  const ticksPerUnit = ppq / (RESOLUTION_DIVISIONS / 4);
  const ticksPerMeasure = ppq * tsNum * (4 / tsDen);
  const unitsPerMeasure = Math.round(ticksPerMeasure / ticksPerUnit);

  // Reparto por mano según el registro
  const hands = { treble: [], bass: [] };
  let lastUnit = 0;
  for (const note of track.notes) {
    hands[note.midi >= SPLIT_MIDI ? "treble" : "bass"].push(note);
    const start = Math.round(note.ticks / ticksPerUnit);
    const dur = Math.max(1, Math.round(note.durationTicks / ticksPerUnit));
    lastUnit = Math.max(lastUnit, start + dur);
  }

  // Ambas manos comparten el mismo número de compases
  const totalMeasures = Math.max(1, Math.ceil(lastUnit / unitsPerMeasure));
  const ctx = {
    ticksPerUnit,
    unitsPerMeasure,
    totalMeasures,
    useFlats: keyInfo.useFlats,
    keyAccidentals: keySignatureMap(keyInfo.accidentalCount),
  };

  const treble = buildHandMeasures(hands.treble, { ...ctx, clef: "treble" });
  const bass = buildHandMeasures(hands.bass, { ...ctx, clef: "bass" });

  const measures = Array.from({ length: totalMeasures }, (_, m) => ({
    treble: treble[m],
    bass: bass[m],
  }));

  return { measures, timeSignature: `${tsNum}/${tsDen}`, keyInfo, tempo };
}
