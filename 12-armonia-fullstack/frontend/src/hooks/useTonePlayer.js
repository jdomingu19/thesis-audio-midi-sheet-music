// thesis-audio-midi-sheet-music
// @jdomingu19
// useTonePlayer.js

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Tone from "tone";
import { DEFAULT_INSTRUMENT_ID } from "@/data/instruments";
import { loadInstrument } from "@/utils/instrumentLoader";

const MIN_VELOCITY = 0.2;

function clampVelocity(velocity) {
  const value = Number.isFinite(velocity) ? velocity : 0.8;
  return Math.min(1, Math.max(MIN_VELOCITY, value));
}

function getDurationLocal(notes) {
  let end = 0;
  for (const note of notes) {
    const noteEnd = note.time + note.duration;
    if (noteEnd > end) end = noteEnd;
  }
  return end;
}

/**
 * useTonePlayer — reproduce un arreglo plano de notas { midi, time, duration,
 * velocity } con Tone.Transport + Tone.Part y el instrumento elegido
 * (muestras reales vía Tone.Sampler, o sintetizador de respaldo).
 *
 * @param {Array} notes
 * @param {string} instrumentId - id del catálogo (src/data/instruments.js)
 * @returns instrument: { id, isLoading, usedFallback, error }
 */
export function useTonePlayer(notes, instrumentId = DEFAULT_INSTRUMENT_ID) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [instrumentState, setInstrumentState] = useState({
    loadedId: null,
    usedFallback: false,
    error: null,
  });

  const instrumentRef = useRef(null);
  const rafRef = useRef(null);
  const duration = useMemo(() => getDurationLocal(notes), [notes]);

  // Instrumento: carga (o recupera de caché) y lo intercambia sin cortar la
  // reproducción; el anterior sigue sonando hasta que el nuevo está listo.
  useEffect(() => {
    let cancelled = false;

    loadInstrument(instrumentId).then(({ node, usedFallback, error }) => {
      if (cancelled) return;
      const previous = instrumentRef.current;
      instrumentRef.current = node;
      if (previous && previous !== node) previous.releaseAll?.();
      setInstrumentState({ loadedId: instrumentId, usedFallback, error });
    });

    return () => {
      cancelled = true;
    };
  }, [instrumentId]);

  // Partitura de eventos: se reconstruye al cambiar las notas
  useEffect(() => {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    setCurrentTime(0);
    setIsPlaying(false);

    if (!notes.length) return undefined;

    const events = notes.map((note) => [
      note.time,
      {
        name: Tone.Frequency(note.midi, "midi").toNote(),
        duration: note.duration,
        velocity: clampVelocity(note.velocity),
      },
    ]);

    const part = new Tone.Part((time, event) => {
      try {
        instrumentRef.current?.triggerAttackRelease(
          event.name,
          event.duration,
          time,
          event.velocity,
        );
      } catch {
        // instrumento liberado durante un cambio rápido: se ignora la nota
      }
    }, events).start(0);
    part.loop = false;

    return () => {
      part.dispose();
      Tone.Transport.stop();
      Tone.Transport.cancel();
      instrumentRef.current?.releaseAll?.();
    };
  }, [notes]);

  useEffect(() => {
    const tick = () => {
      setCurrentTime(Tone.Transport.seconds);
      if (Tone.Transport.seconds >= duration && isPlaying) {
        Tone.Transport.stop();
        Tone.Transport.seconds = 0;
        setIsPlaying(false);
        setCurrentTime(0);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isPlaying, duration]);

  const play = useCallback(async () => {
    await Tone.start(); // desbloquea el AudioContext (gesto del usuario)
    Tone.Transport.start();
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    Tone.Transport.pause();
    instrumentRef.current?.releaseAll?.();
    setIsPlaying(false);
  }, []);

  const stop = useCallback(() => {
    Tone.Transport.stop();
    Tone.Transport.seconds = 0;
    instrumentRef.current?.releaseAll?.();
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  const seek = useCallback(
    (seconds) => {
      const clamped = Math.max(0, Math.min(seconds, duration));
      Tone.Transport.seconds = clamped;
      setCurrentTime(clamped);
    },
    [duration],
  );

  const isInstrumentLoading = instrumentState.loadedId !== instrumentId;
  const instrument = {
    id: instrumentState.loadedId,
    isLoading: isInstrumentLoading,
    usedFallback: !isInstrumentLoading && instrumentState.usedFallback,
    error: isInstrumentLoading ? null : instrumentState.error,
  };

  return {
    isPlaying,
    currentTime,
    duration,
    isReady: notes.length > 0 && !isInstrumentLoading,
    instrument,
    play,
    pause,
    stop,
    seek,
  };
}
