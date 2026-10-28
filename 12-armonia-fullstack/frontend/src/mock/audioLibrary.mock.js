// thesis-audio-midi-sheet-music
// @jdomingu19
// audioLibrary.mock.js

/**
 * Datos mock de la biblioteca de audios, cubriendo los 4 estados de
 * procesamiento (ready, processing, queued, error) y ambos orígenes
 * (uploaded, recorded). Consumido por <AudioList /> vía prop `items`.
 *
 * Shape esperado por AudioListItem:
 * {
 *   id: string,
 *   name: string,
 *   duration: string,     // mm:ss
 *   timestamp: string,    // texto relativo mock
 *   status: 'ready'|'processing'|'queued'|'error',
 *   source: 'uploaded'|'recorded',
 *   errorMessage?: string,
 *   isNew?: boolean,
 * }
 */
export const audioLibraryMock = [
  {
    id: "audio-001",
    name: "melodia-piano-tema1.wav",
    duration: "02:14",
    timestamp: "hace 3 min",
    status: "ready",
    source: "uploaded",
    isNew: true,
  },
  {
    id: "audio-002",
    name: "grabacion-voz-borrador.webm",
    duration: "01:02",
    timestamp: "hace 8 min",
    status: "processing",
    source: "recorded",
  },
  {
    id: "audio-003",
    name: "guitarra-acustica-idea.mp3",
    duration: "03:47",
    timestamp: "hace 15 min",
    status: "queued",
    source: "uploaded",
  },
  {
    id: "audio-004",
    name: "improvisacion-teclado.webm",
    duration: "00:38",
    timestamp: "hace 22 min",
    status: "error",
    source: "recorded",
    errorMessage:
      "No se pudo procesar el archivo: formato de audio no reconocido.",
  },
  {
    id: "audio-005",
    name: "cancion-completa-demo.m4a",
    duration: "04:12",
    timestamp: "hace 1 hora",
    status: "ready",
    source: "uploaded",
  },
];

export default audioLibraryMock;
