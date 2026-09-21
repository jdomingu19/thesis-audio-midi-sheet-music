// thesis-audio-midi-sheet-music
// @jdomingu19
// pianoRollTiming.js

export const PIXELS_PER_SECOND = 80;
export const TOP_LEAD_SECONDS = 3; // margen arriba para revelar notas futuras con anticipación
export const RENDER_BUFFER_SECONDS = 2; // margen de notas montadas fuera del viewport, para que no aparezcan "de golpe" al entrar en pantalla

/**
 * Convierte un instante de tiempo (segundos) en la coordenada Y del
 * contenido scrolleable. Compartido por PianoRollCanvas y PianoRollTimeline
 * para garantizar que ambos ejes de tiempo queden siempre alineados.
 */
export function getContentY(t, totalDuration) {
  return (totalDuration + TOP_LEAD_SECONDS - t) * PIXELS_PER_SECOND;
}

export function getTrackHeight(totalDuration) {
  return (totalDuration + TOP_LEAD_SECONDS) * PIXELS_PER_SECOND;
}
