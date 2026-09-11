// thesis-audio-midi-sheet-music
// @jdomingu19
// sheetMusic.mock.js

/**
 * Datos mock para poblar visualmente <SheetMusicView /> sin VexFlow real
 * conectado. `detectedKey` usa la convención de menor cantidad de
 * alteraciones (ej. Sib mayor en vez de La# mayor), siguiendo el
 * aprendizaje de detección de tonalidad ya validado (Krumhansl-Kessler).
 *
 * Esta estructura de compases es un mock de maquetación — no representa
 * aún datos reales de VexFlow (clefs/voices/staves), solo lo suficiente
 * para diseñar el layout de SheetMusicView y su paginación.
 */

export const sheetMusicKeyMock = "Sib mayor";

export const sheetMusicTotalPagesMock = 2;

/**
 * Shape de cada compás mock:
 * {
 *   id: string,
 *   page: number,        // página donde se ubica (1-indexed)
 *   clef: 'treble'|'bass',
 *   timeSignature: string,
 *   notes: Array<{ midi: number, durationLabel: string }>, // 'q' = negra, 'e' = corchea, 'h' = blanca
 * }
 */
export const sheetMusicMeasuresMock = [
  {
    id: "measure-1",
    page: 1,
    clef: "treble",
    timeSignature: "4/4",
    notes: [
      { midi: 70, durationLabel: "q" }, // Bb4
      { midi: 72, durationLabel: "q" }, // C5
      { midi: 74, durationLabel: "q" }, // D5
      { midi: 75, durationLabel: "q" }, // Eb5
    ],
  },
  {
    id: "measure-2",
    page: 1,
    clef: "treble",
    timeSignature: "4/4",
    notes: [
      { midi: 77, durationLabel: "h" }, // F5
      { midi: 74, durationLabel: "h" }, // D5
    ],
  },
  {
    id: "measure-3",
    page: 1,
    clef: "treble",
    timeSignature: "4/4",
    notes: [
      { midi: 72, durationLabel: "e" },
      { midi: 74, durationLabel: "e" },
      { midi: 75, durationLabel: "e" },
      { midi: 77, durationLabel: "e" },
      { midi: 79, durationLabel: "q" },
      { midi: 70, durationLabel: "q" },
    ],
  },
  {
    id: "measure-4",
    page: 2,
    clef: "treble",
    timeSignature: "4/4",
    notes: [
      { midi: 70, durationLabel: "q" },
      { midi: 67, durationLabel: "q" },
      { midi: 65, durationLabel: "q" },
      { midi: 63, durationLabel: "q" },
    ],
  },
  {
    id: "measure-5",
    page: 2,
    clef: "treble",
    timeSignature: "4/4",
    notes: [{ midi: 70, durationLabel: "h" }],
  },
];

export function getMeasuresByPage(page) {
  return sheetMusicMeasuresMock.filter((measure) => measure.page === page);
}

export default {
  detectedKey: sheetMusicKeyMock,
  totalPages: sheetMusicTotalPagesMock,
  measures: sheetMusicMeasuresMock,
};
