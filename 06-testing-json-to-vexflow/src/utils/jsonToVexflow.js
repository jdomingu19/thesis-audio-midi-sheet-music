// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/utils/jsonToVexflow.js

const RESOLUTION_DIVISIONS = 16;

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
      (accidentalCount < 0 ? PITCH_NAMES_FLAT : PITCH_NAMES_SHARP)[majorTonic] +
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

function unitsToDuration(units) {
  const table = [
    { units: 32, duration: "w" },
    { units: 24, duration: "hd" },
    { units: 16, duration: "h" },
    { units: 12, duration: "qd" },
    { units: 8, duration: "q" },
    { units: 6, duration: "8d" },
    { units: 4, duration: "8" },
    { units: 2, duration: "16" },
  ];
  let closest = table[table.length - 1];
  let minDiff = Infinity;
  for (const entry of table) {
    const diff = Math.abs(entry.units - units);
    if (diff < minDiff) {
      minDiff = diff;
      closest = entry;
    }
  }
  return closest.duration;
}

export function jsonToVexflowMeasures(toneJson, trackIndex = 0) {
  const { header, tracks } = toneJson;
  const ppq = header.ppq;
  const [tsNum, tsDen] = header.timeSignatures?.[0]?.timeSignature ?? [4, 4];

  const track = tracks[trackIndex];
  if (!track || !track.notes?.length) {
    return { measures: [], timeSignature: `${tsNum}/${tsDen}`, keyInfo: null };
  }

  const keyInfo = detectKey(track.notes);

  const ticksPerUnit = ppq / (RESOLUTION_DIVISIONS / 4);
  const ticksPerMeasure = ppq * tsNum * (4 / tsDen);
  const unitsPerMeasure = Math.round(ticksPerMeasure / ticksPerUnit);

  const slots = new Map();
  for (const note of track.notes) {
    const startUnit = Math.round(note.ticks / ticksPerUnit);
    const durUnits = Math.max(1, Math.round(note.durationTicks / ticksPerUnit));
    if (!slots.has(startUnit)) slots.set(startUnit, []);
    const { key, accidental } = midiToVexKey(note.midi, keyInfo.useFlats);
    slots.get(startUnit).push({ key, accidental, durUnits });
  }

  const sortedStarts = Array.from(slots.keys()).sort((a, b) => a - b);
  const lastUnit = sortedStarts.length
    ? sortedStarts[sortedStarts.length - 1] +
      Math.max(
        ...slots
          .get(sortedStarts[sortedStarts.length - 1])
          .map((n) => n.durUnits),
      )
    : 0;
  const totalMeasures = Math.max(1, Math.ceil(lastUnit / unitsPerMeasure));

  const timeline = new Array(totalMeasures * unitsPerMeasure).fill(null);
  for (const start of sortedStarts) {
    if (timeline[start] !== undefined && timeline[start] !== null) continue;
    const chordNotes = slots.get(start);
    const durUnits = Math.min(
      Math.max(...chordNotes.map((n) => n.durUnits)),
      unitsPerMeasure,
    );
    timeline[start] = {
      notes: chordNotes.map(({ key, accidental }) => ({ key, accidental })),
      durUnits,
    };
    for (let i = 1; i < durUnits; i++) {
      if (start + i < timeline.length) timeline[start + i] = "occupied";
    }
  }

  const measures = [];
  for (let m = 0; m < totalMeasures; m++) {
    const measureEvents = [];
    let unit = 0;
    while (unit < unitsPerMeasure) {
      const globalIndex = m * unitsPerMeasure + unit;
      const cell = timeline[globalIndex];

      if (cell === "occupied") {
        unit++;
        continue;
      }
      if (cell && typeof cell === "object") {
        const durUnits = Math.min(cell.durUnits, unitsPerMeasure - unit);
        measureEvents.push({
          keys: cell.notes.map((n) => n.key),
          accidentals: cell.notes.map((n) => n.accidental),
          // FIX: sin el *8 sobrante
          duration: unitsToDuration(durUnits * (32 / unitsPerMeasure)),
          isRest: false,
        });
        unit += durUnits;
      } else {
        let gap = 0;
        while (
          unit + gap < unitsPerMeasure &&
          !(
            timeline[m * unitsPerMeasure + unit + gap] &&
            typeof timeline[m * unitsPerMeasure + unit + gap] === "object"
          )
        ) {
          gap++;
        }
        measureEvents.push({
          keys: ["b/4"],
          accidentals: [""],
          duration: unitsToDuration(gap * (32 / unitsPerMeasure)) + "r",
          isRest: true,
        });
        unit += gap;
      }
    }
    measures.push(measureEvents);
  }

  return { measures, timeSignature: `${tsNum}/${tsDen}`, keyInfo };
}
