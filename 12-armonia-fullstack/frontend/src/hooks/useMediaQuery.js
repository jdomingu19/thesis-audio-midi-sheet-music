// thesis-audio-midi-sheet-music
// @jdomingu19
// useMediaQuery.js

import { useSyncExternalStore } from "react";

/**
 * useMediaQuery — true mientras la media query coincide. Se usa solo para
 * decisiones de COMPORTAMIENTO (ej. volumen emergente en pantallas
 * estrechas); el layout se resuelve siempre con CSS.
 */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      const mediaQueryList = window.matchMedia(query);
      mediaQueryList.addEventListener("change", onChange);
      return () => mediaQueryList.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
