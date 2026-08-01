import { useEffect, useRef } from 'react'
import { getKeyLayout } from '@/utils/noteUtils'
import styles from './PianoRoll.module.css'

const LOOKAHEAD_SECONDS = 3.5

export default function PianoRoll({ notes, currentTime, minMidi, maxMidi }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const layoutRef = useRef(getKeyLayout(minMidi, maxMidi))

  useEffect(() => {
    layoutRef.current = getKeyLayout(minMidi, maxMidi)
  }, [minMidi, maxMidi])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()

    const ro = new ResizeObserver(resize)
    ro.observe(container)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    const width = canvas.width / dpr
    const height = canvas.height / dpr
    const layout = layoutRef.current

    ctx.clearRect(0, 0, width, height)

    // líneas guía sutiles cada segundo
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 1
    for (let s = Math.ceil(currentTime); s <= currentTime + LOOKAHEAD_SECONDS; s++) {
      const y = height * (1 - (s - currentTime) / LOOKAHEAD_SECONDS)
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }

    const timeToY = (t) => height * (1 - (t - currentTime) / LOOKAHEAD_SECONDS)

    notes.forEach((note) => {
      const noteEnd = note.time + note.duration
      if (noteEnd < currentTime - 0.05) return // ya pasó
      if (note.time > currentTime + LOOKAHEAD_SECONDS) return // aún no visible

      const pos = layout.get(note.midi)
      if (!pos) return

      const x = (pos.left / 100) * width
      const w = (pos.width / 100) * width
      const yTop = timeToY(noteEnd)
      const yBottom = timeToY(note.time)
      const h = Math.max(4, yBottom - yTop)

      const isActive = note.time <= currentTime && currentTime <= noteEnd

      ctx.fillStyle = note.color
      ctx.globalAlpha = isActive ? 1 : 0.75
      const radius = 3
      roundRect(ctx, x + 1, yTop, Math.max(2, w - 2), h, radius)
      ctx.fill()

      if (isActive) {
        ctx.globalAlpha = 0.35
        ctx.fillStyle = '#ffffff'
        roundRect(ctx, x + 1, yTop, Math.max(2, w - 2), h, radius)
        ctx.fill()
      }
    })
    ctx.globalAlpha = 1
  }, [notes, currentTime])

  return (
    <div ref={containerRef} className={styles.rollContainer}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.strikeLine} />
    </div>
  )
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}
