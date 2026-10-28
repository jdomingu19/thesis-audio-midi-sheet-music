// thesis-audio-midi-sheet-music
// @jdomingu19
// midiAdapters.js

import { Midi } from "@tonejs/midi";
import { readThemeColor } from "@/utils/themeColors";

const TRACK_ACCENT_FALLBACK = "#5b9cf5";
const EXTRA_TRACK_COLORS = [
  "#d9a15b",
  "#b58cf0",
  "#e07a9c",
  "#7dd3fc",
  "#f0c75e",
];

/** Convierte el Blob MIDI (respuesta del backend) en el JSON de @tonejs/midi. */
export async function parseMidiBlob(midiBlob) {
  const arrayBuffer = await midiBlob.arrayBuffer();
  const midi = new Midi(arrayBuffer);
  return midi.toJSON();
}

/** Aplana todas las notas de todos los tracks en un solo arreglo, con color por track. */
/** Aplana todas las notas de todos los tracks en un solo arreglo, con color por track. */
export function flattenTrackNotes(midiJson) {
  if (!midiJson?.tracks) return [];
  const trackColors = [
    readThemeColor("--color-sage", TRACK_ACCENT_FALLBACK),
    ...EXTRA_TRACK_COLORS,
  ];
  const notes = [];
  midiJson.tracks.forEach((track, trackIndex) => {
    if (!track.notes) return;
    track.notes.forEach((note) => {
      notes.push({
        ...note,
        trackIndex,
        color: trackColors[trackIndex % trackColors.length],
      });
    });
  });
  return notes.sort((a, b) => a.time - b.time);
}

/** Rango de teclas MIDI a mostrar (con margen), o C3–C5 si no hay notas. */
export function getMidiRange(notes, padding = 2) {
  if (!notes.length) return { min: 48, max: 72 };
  let min = Infinity;
  let max = -Infinity;
  notes.forEach((n) => {
    if (n.midi < min) min = n.midi;
    if (n.midi > max) max = n.midi;
  });
  return { min: Math.max(0, min - padding), max: Math.min(127, max + padding) };
}

/** Duración total de la pieza, en segundos. */
export function getDuration(notes) {
  if (!notes.length) return 0;
  return Math.max(...notes.map((n) => n.time + n.duration));
}

/** Adapta las notas planas al shape { id, pitch, startTime, duration } que espera PianoRollView. */
export function toPianoRollNotes(notes) {
  return notes.map((note, index) => ({
    id: `note-${index}-${note.midi}-${note.time}`,
    pitch: note.midi,
    startTime: note.time,
    duration: note.duration,
  }));
}

/** Genera marcadores de compás { id, label, position } para PianoRollTimeline. */
export function buildPianoRollMeasures(midiJson, totalDuration) {
  const header = midiJson?.header;
  const bpm = header?.tempos?.[0]?.bpm ?? 120;
  const [beatsPerMeasure] = header?.timeSignatures?.[0]?.timeSignature ?? [
    4, 4,
  ];
  const secondsPerMeasure = (60 / bpm) * beatsPerMeasure;

  if (!totalDuration || !secondsPerMeasure) return [];

  const measureCount = Math.max(
    1,
    Math.ceil(totalDuration / secondsPerMeasure),
  );
  return Array.from({ length: measureCount }, (_, i) => ({
    id: `measure-${i + 1}`,
    label: `C${i + 1}`,
    position: Math.min(1, (i * secondsPerMeasure) / totalDuration),
  }));
}

const SPANISH_NOTE_SHARP = [
  "Do",
  "Do#",
  "Re",
  "Re#",
  "Mi",
  "Fa",
  "Fa#",
  "Sol",
  "Sol#",
  "La",
  "La#",
  "Si",
];
const SPANISH_NOTE_FLAT = [
  "Do",
  "Reb",
  "Re",
  "Mib",
  "Mi",
  "Fa",
  "Solb",
  "Sol",
  "Lab",
  "La",
  "Sib",
  "Si",
];

/** Traduce el resultado de detectKey() a un rótulo en español, ej. "Sib mayor". */
export function formatKeyLabel(keyInfo) {
  if (!keyInfo) return "—";
  const names = keyInfo.useFlats ? SPANISH_NOTE_FLAT : SPANISH_NOTE_SHARP;
  const tonicName = names[keyInfo.tonicPitchClass];
  const modeLabel = keyInfo.mode === "minor" ? "menor" : "mayor";
  return `${tonicName} ${modeLabel}`;
}

export function formatMidiFilename(sourceFilename) {
  return sourceFilename.replace(/\.[^.]+$/, "") + ".mid";
}
