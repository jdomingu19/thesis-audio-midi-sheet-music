// thesis-audio-midi-sheet-music
// @jdomingu19
// audioUtils.js

/**
 * getAudioDuration — obtiene la duración real (en segundos) de un Blob/File
 * de audio. Corrige el bug conocido de Chrome donde un .webm grabado con
 * MediaRecorder reporta duration = Infinity hasta que se fuerza un seek.
 */
export function getAudioDuration(blob) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio();
    audio.preload = "metadata";
    audio.src = url;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.removeAttribute("src");
      audio.load();
    };

    audio.addEventListener("loadedmetadata", () => {
      if (audio.duration === Infinity || Number.isNaN(audio.duration)) {
        // Fix conocido: un seek fuera de rango dispara 'durationchange'
        // con el valor real en Chrome.
        audio.currentTime = 1e101;
        audio.addEventListener(
          "durationchange",
          () => {
            const duration = Number.isFinite(audio.duration)
              ? audio.duration
              : 0;
            cleanup();
            resolve(duration);
          },
          { once: true },
        );
      } else {
        const duration = audio.duration;
        cleanup();
        resolve(duration);
      }
    });

    audio.addEventListener("error", () => {
      cleanup();
      reject(new Error("No se pudo leer la duración del audio."));
    });
  });
}

export function formatDuration(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return "--:--";
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatFileSize(bytes) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getFileExtension(filename) {
  return filename.split(".").pop()?.toLowerCase() ?? "";
}
