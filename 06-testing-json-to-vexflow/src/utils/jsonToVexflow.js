// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// jsonToVexflow.js

const RESOLUTION_DIVISIONS = 16;

// Notas desde A3 (MIDI 57) hacia arriba -> clave de sol; por debajo (G3 y menores) -> clave de fa
export const SPLIT_MIDI = 57;

// Alcance de una mano: semitonos máximos entre la nota más grave y la más aguda
// de un acorde (12 = una octava; súbelo a 14-16 para manos grandes)
export const HAND_SPAN = 12;

// Rango aceptado al pasar notas de una clave a la otra
const TREBLE_MIN_MIDI = 53; // F3: lo más grave que admite cómodamente la clave de sol
const BASS_MAX_MIDI = 67; // G4: lo más agudo que admite cómodamente la clave de fa

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

// --- Alteraciones según la armadura ---
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
 *
 * handMeasures[m] = lista de voces del compás m (cada voz es una lista de eventos).
 * Todas las voces de una clave comparten el mismo estado de alteraciones.
 */
function applyAccidentalRules(handMeasures, keyAccidentals) {
  // Alturas (letra+octava) que quedaron alteradas respecto a la armadura
  const altered = new Set();

  for (const voices of handMeasures) {
    // Alteración vigente por altura dentro del compás actual
    const state = new Map();

    // Todas las voces en orden temporal
    const events = voices
      .flat()
      .filter((ev) => !ev.isRest)
      .sort((a, b) => a.start - b.start);

    for (const ev of events) {
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

// --- Reparto de acordes entre manos y voces ---

/** Semitonos entre la nota más grave y la más aguda (acorde ordenado de grave a agudo) */
function span(chord) {
  return chord.length ? chord[chord.length - 1].midi - chord[0].midi : 0;
}

function mergeSorted(a, b) {
  return [...a, ...b].sort((x, y) => x.midi - y.midi);
}

/**
 * Reparte las notas de un instante entre clave de sol y de fa.
 * Si un acorde es más ancho que una mano, intenta pasar las notas sobrantes a la otra clave
 * (solo si están dentro del rango aceptado de esa clave y no desbordan su mano).
 */
function balanceHands(notes) {
  let treble = notes.filter((n) => n.midi >= SPLIT_MIDI);
  let bass = notes.filter((n) => n.midi < SPLIT_MIDI);

  // Acorde de sol demasiado ancho: las notas más graves pasan a la clave de fa
  let k = 0;
  while (k < treble.length - 1 && span(treble.slice(k)) > HAND_SPAN) k++;
  if (k > 0) {
    const moved = treble.slice(0, k);
    const merged = mergeSorted(bass, moved);
    if (
      moved.every((n) => n.midi <= BASS_MAX_MIDI) &&
      span(merged) <= HAND_SPAN
    ) {
      treble = treble.slice(k);
      bass = merged;
    }
  }

  // Acorde de fa demasiado ancho: las notas más agudas pasan a la clave de sol
  k = 0;
  while (
    k < bass.length - 1 &&
    span(bass.slice(0, bass.length - k)) > HAND_SPAN
  )
    k++;
  if (k > 0) {
    const moved = bass.slice(bass.length - k);
    const merged = mergeSorted(treble, moved);
    if (
      moved.every((n) => n.midi >= TREBLE_MIN_MIDI) &&
      span(merged) <= HAND_SPAN
    ) {
      bass = bass.slice(0, bass.length - k);
      treble = merged;
    }
  }

  return { treble, bass };
}

/**
 * Si un acorde sigue siendo más ancho que una mano, lo divide en dos voces:
 * la voz superior toma la nota más aguda y todo lo que cae dentro del alcance
 * de una mano por debajo; el resto forma la voz inferior.
 */
function splitVoices(chord) {
  if (span(chord) <= HAND_SPAN) return [chord];
  const top = chord[chord.length - 1].midi;
  return [
    chord.filter((n) => top - n.midi <= HAND_SPAN),
    chord.filter((n) => top - n.midi > HAND_SPAN),
  ];
}

/**
 * Construye los compases de UNA voz. Cada compás queda llenado exactamente con
 * notas y silencios. En voces secundarias (ghost) los silencios no se dibujan.
 * Devuelve measures[m] = lista de eventos con su posición `start` dentro del compás.
 */
function buildVoiceMeasures(
  slots,
  { clef, ghost, unitsPerMeasure, totalMeasures },
) {
  const measures = Array.from({ length: totalMeasures }, () => []);
  const totalUnits = totalMeasures * unitsPerMeasure;
  const starts = Array.from(slots.keys()).sort((a, b) => a - b);

  // Añade silencios partiendo el hueco en los límites de compás
  const pushRests = (from, length) => {
    let pos = from;
    let left = length;
    while (left > 0 && pos < totalUnits) {
      const m = Math.floor(pos / unitsPerMeasure);
      const room = (m + 1) * unitsPerMeasure - pos;
      const chunk = Math.min(left, room);
      let offset = pos - m * unitsPerMeasure;
      for (const piece of restPieces(chunk)) {
        measures[m].push({
          keys: [REST_KEY[clef]],
          accidentals: [""],
          duration: ghost ? piece.duration : `${piece.duration}r`,
          isRest: true,
          isGhost: ghost,
          start: offset,
        });
        offset += piece.units;
      }
      pos += chunk;
      left -= chunk;
    }
  };

  let cursor = 0;
  starts.forEach((start, idx) => {
    if (start < cursor || start >= totalUnits) return;

    pushRests(cursor, start - cursor);

    const chord = slots.get(start);
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
      isGhost: false,
      start: start - m * unitsPerMeasure,
    });
    cursor = start + snapped.units;
  });

  pushRests(cursor, totalUnits - cursor);
  return measures;
}

/**
 * Devuelve { measures, timeSignature, keyInfo, tempo }
 * donde measures[i] = { treble: [voz1, voz2?], bass: [voz1, voz2?] }
 * y cada voz es una lista de eventos { keys, accidentals, duration, isRest, ... }.
 * La voz 2 solo existe en los compases donde un acorde tuvo que dividirse.
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
  const keyAccidentals = keySignatureMap(keyInfo.accidentalCount);

  const ticksPerUnit = ppq / (RESOLUTION_DIVISIONS / 4);
  const ticksPerMeasure = ppq * tsNum * (4 / tsDen);
  const unitsPerMeasure = Math.round(ticksPerMeasure / ticksPerUnit);

  // Agrupa todas las notas por instante de inicio
  const onsets = new Map();
  let lastUnit = 0;
  for (const note of track.notes) {
    const start = Math.round(note.ticks / ticksPerUnit);
    const durUnits = Math.max(1, Math.round(note.durationTicks / ticksPerUnit));
    lastUnit = Math.max(lastUnit, start + durUnits);

    const { key, accidental } = midiToVexKey(note.midi, keyInfo.useFlats);
    if (!onsets.has(start)) onsets.set(start, []);
    onsets.get(start).push({ midi: note.midi, key, accidental, durUnits });
  }

  // Ambas manos comparten el mismo número de compases
  const totalMeasures = Math.max(1, Math.ceil(lastUnit / unitsPerMeasure));

  // lanes[clave][voz] = Map(inicio -> notas del acorde en esa voz)
  const lanes = {
    treble: [new Map(), new Map()],
    bass: [new Map(), new Map()],
  };

  for (const [start, raw] of onsets) {
    // Acorde ordenado de grave a agudo y sin notas repetidas
    const sorted = raw
      .sort((a, b) => a.midi - b.midi)
      .filter((n, i, arr) => i === 0 || n.midi !== arr[i - 1].midi);

    const hands = balanceHands(sorted);
    for (const clef of ["treble", "bass"]) {
      if (!hands[clef].length) continue;
      splitVoices(hands[clef]).forEach((group, v) => {
        lanes[clef][v].set(start, group);
      });
    }
  }

  const buildHand = (clef) => {
    const voices = lanes[clef].map((slots, v) =>
      buildVoiceMeasures(slots, {
        clef,
        ghost: v > 0,
        unitsPerMeasure,
        totalMeasures,
      }),
    );

    // La voz 1 siempre existe; la voz 2 solo en compases donde tiene notas
    const handMeasures = Array.from({ length: totalMeasures }, (_, m) =>
      voices
        .map((voiceMeasures) => voiceMeasures[m])
        .filter((events, v) => v === 0 || events.some((ev) => !ev.isRest)),
    );

    applyAccidentalRules(handMeasures, keyAccidentals);
    return handMeasures;
  };

  const treble = buildHand("treble");
  const bass = buildHand("bass");

  const measures = Array.from({ length: totalMeasures }, (_, m) => ({
    treble: treble[m],
    bass: bass[m],
  }));

  return { measures, timeSignature: `${tsNum}/${tsDen}`, keyInfo, tempo };
}
