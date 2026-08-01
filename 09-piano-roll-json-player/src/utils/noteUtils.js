// Utilidades para trabajar con el formato JSON exportado por @tonejs/midi
// Estructura esperada: { header, tracks: [{ name, notes: [{ midi, time, duration, velocity, name }] }] }

const TRACK_COLORS = ['#6A9C89', '#c9a15a', '#5a8fc9', '#c96a8f', '#8f6ac9', '#c9c15a']

/**
 * Aplana todas las notas de todos los tracks en un solo arreglo,
 * agregando el índice de track y un color asociado.
 */
export function flattenNotes(midiJson) {
  if (!midiJson?.tracks) return []

  const notes = []
  midiJson.tracks.forEach((track, trackIndex) => {
    if (!track.notes) return
    track.notes.forEach((note) => {
      notes.push({
        ...note,
        trackIndex,
        color: TRACK_COLORS[trackIndex % TRACK_COLORS.length]
      })
    })
  })
  return notes.sort((a, b) => a.time - b.time)
}

/**
 * Calcula el rango de teclas (midi) a mostrar en el teclado,
 * con un pequeño margen para que las notas no queden pegadas al borde.
 */
export function getMidiRange(notes, padding = 2) {
  if (!notes.length) return { min: 48, max: 72 } // C3–C5 por defecto

  let min = Infinity
  let max = -Infinity
  notes.forEach((n) => {
    if (n.midi < min) min = n.midi
    if (n.midi > max) max = n.midi
  })

  return {
    min: Math.max(0, min - padding),
    max: Math.min(127, max + padding)
  }
}

/** true si el número midi corresponde a una tecla negra */
export function isBlackKey(midi) {
  const pitchClass = midi % 12
  return [1, 3, 6, 8, 10].includes(pitchClass)
}

/** Duración total de la pieza en segundos */
export function getDuration(notes) {
  if (!notes.length) return 0
  return Math.max(...notes.map((n) => n.time + n.duration))
}

/**
 * Calcula la posición horizontal (en %) de cada tecla dentro del rango,
 * para que el piano roll y el teclado usen exactamente el mismo layout.
 */
export function getKeyLayout(minMidi, maxMidi) {
  const whiteMidis = []
  for (let m = minMidi; m <= maxMidi; m++) {
    if (!isBlackKey(m)) whiteMidis.push(m)
  }
  const whiteWidth = 100 / whiteMidis.length
  const layout = new Map()

  whiteMidis.forEach((midi, i) => {
    layout.set(midi, { left: i * whiteWidth, width: whiteWidth, isBlack: false })
  })

  for (let m = minMidi; m <= maxMidi; m++) {
    if (!isBlackKey(m)) continue
    const whiteBefore = whiteMidis.filter((w) => w < m).length
    const width = whiteWidth * 0.56
    layout.set(m, { left: whiteBefore * whiteWidth - whiteWidth * 0.28, width, isBlack: true })
  }

  return layout
}

export function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
