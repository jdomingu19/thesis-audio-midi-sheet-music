// thesis-audio-midi-sheet-music
// @jdomingu19
// audioOutput.js

import * as Tone from "tone";

let outputBus = null;

/**
 * Cadena de salida compartida por todos los instrumentos:
 * instrumento → entrada → reverb de sala (suave) → limitador → Destination.
 * El volumen general sigue controlándose en Tone.Destination (App.jsx).
 */
export function getOutputBus() {
  if (outputBus) return outputBus;

  const input = new Tone.Gain(1);
  const reverb = new Tone.Reverb({ decay: 2.2, preDelay: 0.015, wet: 0.16 });
  const limiter = new Tone.Limiter(-1);
  input.chain(reverb, limiter, Tone.getDestination());

  outputBus = { input, reverb, limiter };
  return outputBus;
}
