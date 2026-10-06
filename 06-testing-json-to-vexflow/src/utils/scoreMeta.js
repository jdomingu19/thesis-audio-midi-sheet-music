// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// scoreMeta.js

export const AUTHOR = "Jesús Domínguez @jdomingu19";
export const SUBTITLE = "Transcripción generada con VexFlow";

/** "mi_cancion-final.json" -> "Mi Cancion Final — Sheet Music" */
export const formatTitle = (fileName = "") => {
  const base = fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const pretty = base
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
  return `${pretty || "Untitled"} — Sheet Music`;
};
