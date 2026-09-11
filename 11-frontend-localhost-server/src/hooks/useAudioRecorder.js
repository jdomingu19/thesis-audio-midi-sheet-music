// thesis-audio-midi-sheet-music
// @jdomingu19
// useAudioRecorder.js

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useAudioRecorder — grabación real de audio vía MediaRecorder.
 * Expone { state, seconds, error, start, stop, reset }.
 * `stop()` devuelve una Promise con { blob, mimeType, durationSeconds }.
 */
export function useAudioRecorder() {
  const [state, setState] = useState("idle");
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (state === "recording") {
      intervalRef.current = setInterval(() => {
        setSeconds((previous) => previous + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [state]);

  const start = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "";
      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      mediaRecorderRef.current = recorder;
      setSeconds(0);
      recorder.start();
      setState("recording");
    } catch {
      setError(
        "No se pudo acceder al micrófono. Revisa los permisos del navegador.",
      );
      setState("idle");
    }
  }, []);

  const stop = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder || recorder.state === "inactive") {
        resolve(null);
        return;
      }

      recorder.onstop = () => {
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        setState("stopped");
        resolve({ blob, mimeType, durationSeconds: seconds });
      };
      recorder.stop();
    });
  }, [seconds]);

  const reset = useCallback(() => {
    setState("idle");
    setSeconds(0);
    setError(null);
  }, []);

  return { state, seconds, error, start, stop, reset };
}
