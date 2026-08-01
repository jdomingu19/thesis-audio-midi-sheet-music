import { useEffect, useRef, useState, useCallback } from 'react'
import * as Tone from 'tone'
import { getDuration } from '@/utils/noteUtils'

/**
 * Encapsula Tone.Transport + Tone.Part + un PolySynth para reproducir
 * un arreglo plano de notas { midi, time, duration, velocity }.
 */
export function useTonePlayer(notes) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [isReady, setIsReady] = useState(false)

  const synthRef = useRef(null)
  const partRef = useRef(null)
  const rafRef = useRef(null)
  const duration = getDuration(notes)

  // (Re)construye el Part cada vez que cambian las notas
  useEffect(() => {
    // limpieza de la instancia anterior
    partRef.current?.dispose()
    synthRef.current?.dispose()
    Tone.Transport.stop()
    Tone.Transport.cancel()
    setCurrentTime(0)
    setIsPlaying(false)
    setIsReady(false)

    if (!notes.length) return

    const synth = new Tone.PolySynth(Tone.Synth, {
      envelope: { attack: 0.01, decay: 0.1, sustain: 0.3, release: 0.3 }
    }).toDestination()

    const part = new Tone.Part((time, note) => {
      synth.triggerAttackRelease(
        Tone.Frequency(note.midi, 'midi'),
        note.duration,
        time,
        note.velocity ?? 0.8
      )
    }, notes.map((n) => [n.time, n])).start(0)

    part.loop = false

    synthRef.current = synth
    partRef.current = part
    setIsReady(true)

    return () => {
      part.dispose()
      synth.dispose()
      Tone.Transport.stop()
      Tone.Transport.cancel()
    }
  }, [notes])

  // loop de animación para sincronizar currentTime con Tone.Transport
  useEffect(() => {
    const tick = () => {
      setCurrentTime(Tone.Transport.seconds)
      if (Tone.Transport.seconds >= duration && isPlaying) {
        Tone.Transport.stop()
        Tone.Transport.seconds = 0
        setIsPlaying(false)
        setCurrentTime(0)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [isPlaying, duration])

  const play = useCallback(async () => {
    await Tone.start() // desbloquea el AudioContext (gesto del usuario)
    Tone.Transport.start()
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    Tone.Transport.pause()
    setIsPlaying(false)
  }, [])

  const stop = useCallback(() => {
    Tone.Transport.stop()
    Tone.Transport.seconds = 0
    setCurrentTime(0)
    setIsPlaying(false)
  }, [])

  const seek = useCallback((seconds) => {
    const clamped = Math.max(0, Math.min(seconds, duration))
    Tone.Transport.seconds = clamped
    setCurrentTime(clamped)
  }, [duration])

  return { isPlaying, currentTime, duration, isReady, play, pause, stop, seek }
}
