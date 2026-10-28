// thesis-audio-midi-sheet-music
// @jdomingu19
// instrumentLoader.js

import * as Tone from "tone";
import { getInstrumentById } from "@/data/instruments";
import { getOutputBus } from "@/utils/audioOutput";

const MAX_CACHED_INSTRUMENTS = 4;
const SYNTH_ID = "synth";

// id -> { promise }  (el orden de inserción actúa como "menos usado primero")
const cache = new Map();

/** "Ds4" -> "D#4" (las alteraciones de los archivos usan "s") */
function stemToNote(stem) {
  return stem.replace("s", "#");
}

function buildUrls(notes) {
  return Object.fromEntries(
    notes.map((stem) => [stemToNote(stem), `${stem}.mp3`]),
  );
}

function buildSynth(volumeDb = -6) {
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.2, sustain: 0.3, release: 0.5 },
  });
  synth.volume.value = volumeDb;
  synth.connect(getOutputBus().input);
  return synth;
}

function loadSampler(definition, baseUrl) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const sampler = new Tone.Sampler({
      urls: buildUrls(definition.notes),
      baseUrl,
      release: definition.release ?? 1,
      onload: () => {
        if (settled) return;
        settled = true;
        resolve(sampler);
      },
      onerror: (error) => {
        if (settled) return;
        settled = true;
        sampler.dispose();
        reject(error);
      },
    });
  });
}

/**
 * Crea el instrumento. Intenta primero las muestras locales
 * (public/samples/<folder>/), luego el CDN; si ambos fallan, devuelve un
 * sintetizador (nunca rechaza) con el mensaje del error.
 */
async function createInstrument(definition) {
  if (definition.kind === "synth") {
    return {
      node: buildSynth(definition.volumeDb),
      usedFallback: false,
      error: null,
    };
  }

  const sources = [
    `${import.meta.env.BASE_URL}samples/${definition.folder}/`,
    definition.remoteBase,
  ];
  let lastError = null;

  for (const baseUrl of sources) {
    try {
      const sampler = await loadSampler(definition, baseUrl);
      sampler.volume.value = definition.volumeDb ?? 0;
      sampler.connect(getOutputBus().input);
      return { node: sampler, usedFallback: false, error: null };
    } catch (error) {
      lastError = error;
    }
  }

  return {
    node: buildSynth(),
    usedFallback: true,
    error: lastError?.message ?? "No se pudieron cargar las muestras.",
  };
}

function evictOldest() {
  while (cache.size > MAX_CACHED_INSTRUMENTS) {
    const [oldestId, oldest] = cache.entries().next().value;
    cache.delete(oldestId);
    oldest.promise.then(({ node }) => node.dispose()).catch(() => {});
  }
}

/**
 * loadInstrument — devuelve Promise<{ node, usedFallback, error }>.
 * Cachea hasta MAX_CACHED_INSTRUMENTS instrumentos (libera memoria de los
 * menos usados). Un fallo no se cachea: al volver a elegirlo se reintenta.
 */
export function loadInstrument(id) {
  const definition = getInstrumentById(id);
  const cached = cache.get(definition.id);

  if (cached) {
    cache.delete(definition.id);
    cache.set(definition.id, cached);
    return cached.promise;
  }

  const entry = {
    promise: createInstrument(definition).then((result) => {
      if (result.usedFallback && definition.id !== SYNTH_ID) {
        cache.delete(definition.id);
      }
      return result;
    }),
  };
  cache.set(definition.id, entry);
  evictOldest();
  return entry.promise;
}
