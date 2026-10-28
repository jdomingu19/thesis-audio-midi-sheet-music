// thesis-audio-midi-sheet-music
// @jdomingu19
// themeColors.js

/** Lee un token CSS (ej. "--color-sage") con fallback si no está disponible. */
export function readThemeColor(name, fallback) {
  if (typeof document === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/**
 * Compone un rgba() válido para canvas desde un token de canales "R G B".
 * ej. themeRgba("--color-sage-rgb", 0.28, "91 156 245")
 */
export function themeRgba(rgbVariable, alpha, fallbackRgb) {
  const channels = readThemeColor(rgbVariable, fallbackRgb)
    .split(/\s+/)
    .join(", ");
  return `rgba(${channels}, ${alpha})`;
}
