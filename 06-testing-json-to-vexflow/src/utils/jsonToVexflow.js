// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/utils/jsonToVexflow.js
//
// Convierte un JSON exportado por @tonejs/midi (Tone.js) en una
// estructura de compases lista para dibujar con VexFlow.
// Simplificaciones para esta mini-app de prueba:
//  - Se usa el primer track del archivo.
//  - Se reduce la polifonía a UNA voz por golpe rítmico:
//    si hay varias notas simultáneas se agrupan como acorde.
//  - Cuantización a corchea (1/8) por defecto (RESOLUTION).
//  - Solo se soportan duraciones simples: w, h, q, 8, 16 (+ puntillo simple).

const RESOLUTION_DIVISIONS = 16; // 8 = cuantiza a corchea, 16 = semicorchea

// Convierte nombre de nota Tone.js ("C#4") a formato VexFlow ("c#/4")
function toVexKey(name) {
  const match = name.match(/^([A-Ga-g])(#|b)?(-?\d+)$/);
  if (!match) return "c/4";
  const [, letter, accidental = "", octave] = match;
  return `${letter.toLowerCase()}${accidental}/${octave}`;
}

// Snap de duración en "unidades de resolución" a duraciones VexFlow válidas
function unitsToDuration(units) {
  // units está expresado en fracciones de negra * RESOLUTION_DIVISIONS/4
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

/**
 * @param {object} toneJson - JSON completo exportado por @tonejs/midi
 * @param {number} trackIndex - índice del track a convertir
 * @returns {{ measures: Array, timeSignature: string, notesPerMeasure: number }}
 */
export function jsonToVexflowMeasures(toneJson, trackIndex = 0) {
  const { header, tracks } = toneJson;
  const ppq = header.ppq;
  const [tsNum, tsDen] = header.timeSignatures?.[0]?.timeSignature ?? [4, 4];

  const track = tracks[trackIndex];
  if (!track || !track.notes?.length) {
    return {
      measures: [],
      timeSignature: `${tsNum}/${tsDen}`,
      notesPerMeasure: 0,
    };
  }

  // Unidad de cuantización en ticks (ej: 1/8 de negra = ppq / (RESOLUTION_DIVISIONS/4))
  const ticksPerUnit = ppq / (RESOLUTION_DIVISIONS / 4);
  const ticksPerMeasure = ppq * tsNum * (4 / tsDen);
  const unitsPerMeasure = Math.round(ticksPerMeasure / ticksPerUnit);

  // 1. Cuantizar cada nota a la unidad más cercana y agrupar por "slot" (acordes)
  const slots = new Map(); // unitIndex -> [{key, endUnit}]
  for (const note of track.notes) {
    const startUnit = Math.round(note.ticks / ticksPerUnit);
    const durUnits = Math.max(1, Math.round(note.durationTicks / ticksPerUnit));
    if (!slots.has(startUnit)) slots.set(startUnit, []);
    slots.get(startUnit).push({
      key: toVexKey(note.name),
      durUnits,
    });
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

  // 2. Construir línea de tiempo completa (con silencios) en unidades
  const timeline = new Array(totalMeasures * unitsPerMeasure).fill(null);
  for (const start of sortedStarts) {
    const chordNotes = slots.get(start);
    // Si el slot ya está ocupado (choque de cuantización), lo saltamos
    if (timeline[start] !== undefined && timeline[start] !== null) continue;
    const durUnits = Math.min(
      Math.max(...chordNotes.map((n) => n.durUnits)),
      unitsPerMeasure, // evita que una nota cruce el compás (simplificación)
    );
    timeline[start] = {
      keys: chordNotes.map((n) => n.key),
      durUnits,
    };
    // marcar unidades ocupadas para no insertar silencios encima
    for (let i = 1; i < durUnits; i++) {
      if (start + i < timeline.length) timeline[start + i] = "occupied";
    }
  }

  // 3. Rellenar huecos con silencios y trocear en compases
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
          keys: cell.keys,
          duration: unitsToDuration(
            durUnits * (32 / unitsPerMeasure) * (tsNum === 4 ? 8 : 8),
          ),
          isRest: false,
        });
        unit += durUnits;
      } else {
        // silencio: buscamos cuántas unidades vacías consecutivas hay
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
          duration: unitsToDuration(gap * (32 / unitsPerMeasure)) + "r",
          isRest: true,
        });
        unit += gap;
      }
    }
    measures.push(measureEvents);
  }

  return {
    measures,
    timeSignature: `${tsNum}/${tsDen}`,
    notesPerMeasure: unitsPerMeasure,
  };
}
