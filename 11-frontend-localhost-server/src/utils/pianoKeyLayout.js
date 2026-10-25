// thesis-audio-midi-sheet-music
// @jdomingu19
// pianoKeyLayout.js

const BLACK_KEY_STEPS = new Set([1, 3, 6, 8, 10]);

export function isBlackKey(midiNumber) {
  return BLACK_KEY_STEPS.has(((midiNumber % 12) + 12) % 12);
}

export function getWhiteKeyCount(minMidi, maxMidi) {
  let count = 0;
  for (let midi = minMidi; midi <= maxMidi; midi += 1) {
    if (!isBlackKey(midi)) count += 1;
  }
  return count;
}

/**
 * Posición horizontal (en %) de cada tecla dentro del rango. Usado por
 * PianoRollCanvas y PianoKeyboard para que ambos queden perfectamente
 * alineados. Map(midi -> { left, width, isBlack }).
 */
export function getKeyLayout(minMidi, maxMidi) {
  const whiteMidis = [];
  for (let midi = minMidi; midi <= maxMidi; midi += 1) {
    if (!isBlackKey(midi)) whiteMidis.push(midi);
  }
  const whiteWidth = 100 / Math.max(1, whiteMidis.length);
  const layout = new Map();

  whiteMidis.forEach((midi, index) => {
    layout.set(midi, {
      left: index * whiteWidth,
      width: whiteWidth,
      isBlack: false,
    });
  });

  for (let midi = minMidi; midi <= maxMidi; midi += 1) {
    if (!isBlackKey(midi)) continue;
    const whiteBefore = whiteMidis.filter((w) => w < midi).length;
    layout.set(midi, {
      left: whiteBefore * whiteWidth - whiteWidth * 0.28,
      width: whiteWidth * 0.56,
      isBlack: true,
    });
  }

  return layout;
}
