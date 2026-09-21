// thesis-audio-midi-sheet-music
// @jdomingu19
// pianoKeyLayout.js

const WHITE_KEY_STEPS = [0, 2, 4, 5, 7, 9, 11]; // C D E F G A B
const BLACK_KEY_STEPS = new Set([1, 3, 6, 8, 10]);

export const DEFAULT_WHITE_KEY_WIDTH = 32;
export const DEFAULT_BLACK_KEY_WIDTH_RATIO = 0.62;

export const DEFAULT_LOW_MIDI = 21; // A0
export const DEFAULT_HIGH_MIDI = 108; // C8
export const CENTER_ANCHOR_MIDI = 60; // Do central — punto de referencia fijo para el centrado horizontal

export function isBlackKey(midiNumber) {
  return BLACK_KEY_STEPS.has(((midiNumber % 12) + 12) % 12);
}

/**
 * Calcula la posición horizontal (x) y ancho de cada tecla MIDI dentro del
 * rango [lowMidi, highMidi], replicando la geometría de un teclado real.
 * Usado tanto por PianoKeyboard como por PianoRollCanvas para que ambos
 * queden perfectamente alineados.
 */
export function getKeyLayout(
  lowMidi,
  highMidi,
  whiteKeyWidth = DEFAULT_WHITE_KEY_WIDTH,
) {
  const blackKeyWidth = whiteKeyWidth * DEFAULT_BLACK_KEY_WIDTH_RATIO;
  const layout = new Map();

  let whiteIndex = 0;
  for (let midi = lowMidi; midi <= highMidi; midi += 1) {
    if (!isBlackKey(midi)) {
      layout.set(midi, {
        midi,
        isBlack: false,
        x: whiteIndex * whiteKeyWidth,
        width: whiteKeyWidth,
      });
      whiteIndex += 1;
    }
  }

  for (let midi = lowMidi; midi <= highMidi; midi += 1) {
    if (isBlackKey(midi)) {
      const prevWhite = layout.get(midi - 1);
      if (prevWhite) {
        layout.set(midi, {
          midi,
          isBlack: true,
          x: prevWhite.x + prevWhite.width - blackKeyWidth / 2,
          width: blackKeyWidth,
        });
      }
    }
  }

  const totalWidth = whiteIndex * whiteKeyWidth;

  return {
    keys: Array.from(layout.values()).sort((a, b) => a.midi - b.midi),
    totalWidth,
    whiteKeyWidth,
    blackKeyWidth,
  };
}

/**
 * Calcula el scrollLeft necesario para centrar una tecla ancla (por
 * defecto, Do central) dentro del viewport visible, sin importar si el
 * rango real de notas del audio es muy grave o muy agudo. Usado al cargar
 * cada audio para que el teclado siempre arranque en una posición estable
 * y predecible.
 */
export function getScrollLeftForMidi(layout, midi, viewportWidth) {
  const keyInfo =
    layout.keys.find((k) => k.midi === midi) ??
    layout.keys[Math.floor(layout.keys.length / 2)];
  if (!keyInfo) return 0;

  const keyCenter = keyInfo.x + keyInfo.width / 2;
  const maxScrollLeft = Math.max(0, layout.totalWidth - viewportWidth);
  return Math.min(Math.max(0, keyCenter - viewportWidth / 2), maxScrollLeft);
}
