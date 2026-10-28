// thesis-audio-midi-sheet-music
// @jdomingu19
// pianoRoll.mock.js

/**
 * Datos mock para poblar visualmente <PianoRollView /> sin lógica real de
 * MIDI. `notes` usa números MIDI como fuente de verdad para el pitch
 * (nunca strings de nota), siguiendo el aprendizaje ya validado en las
 * vistas de partitura.
 *
 * Shape esperado por PianoRollCanvas / PianoKeyboard:
 * {
 *   id: string,
 *   pitch: number,      // nota MIDI (ej. 60 = C4)
 *   startTime: number,  // segundos, relativo al inicio del audio
 *   duration: number,   // segundos
 * }
 */

export const pianoRollRange = {
  lowMidi: 48, // C3
  highMidi: 72, // C5
};

export const pianoRollTotalDuration = 16; // segundos visibles en el canvas

export const pianoRollMeasuresMock = [
  { id: "measure-1", label: "C1", position: 0 },
  { id: "measure-2", label: "C2", position: 0.25 },
  { id: "measure-3", label: "C3", position: 0.5 },
  { id: "measure-4", label: "C4", position: 0.75 },
];

export const pianoRollNotesMock = [
  { id: "note-1", pitch: 60, startTime: 0, duration: 1 }, // C4
  { id: "note-2", pitch: 62, startTime: 1, duration: 1 }, // D4
  { id: "note-3", pitch: 64, startTime: 2, duration: 1 }, // E4
  { id: "note-4", pitch: 65, startTime: 3, duration: 1 }, // F4
  { id: "note-5", pitch: 67, startTime: 4, duration: 2 }, // G4
  { id: "note-6", pitch: 64, startTime: 6, duration: 1 }, // E4
  { id: "note-7", pitch: 60, startTime: 7, duration: 2 }, // C4
  { id: "note-8", pitch: 67, startTime: 9, duration: 1 }, // G4
  { id: "note-9", pitch: 69, startTime: 10, duration: 1 }, // A4
  { id: "note-10", pitch: 71, startTime: 11, duration: 1 }, // B4
  { id: "note-11", pitch: 72, startTime: 12, duration: 3 }, // C5
  { id: "note-12", pitch: 55, startTime: 12, duration: 3 }, // G3 (nota simultánea, voz grave)
];

// Notas "activas" mock — simulan qué teclas estarían sonando en un instante
// dado del playhead (ej. currentPosition ≈ 0.75 → startTime ≈ 12s).
export const pianoRollActiveNotesMock = [72, 55];

export default {
  range: pianoRollRange,
  totalDuration: pianoRollTotalDuration,
  measures: pianoRollMeasuresMock,
  notes: pianoRollNotesMock,
  activeNotes: pianoRollActiveNotesMock,
};
