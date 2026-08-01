import { useMemo } from 'react'
import { getKeyLayout } from '@/utils/noteUtils'
import styles from './Keyboard.module.css'

export default function Keyboard({ minMidi, maxMidi, activeMidiSet }) {
  const layout = useMemo(() => getKeyLayout(minMidi, maxMidi), [minMidi, maxMidi])

  const whiteEntries = []
  const blackEntries = []
  layout.forEach((pos, midi) => {
    ;(pos.isBlack ? blackEntries : whiteEntries).push({ midi, ...pos })
  })

  return (
    <div className={styles.keyboard}>
      {whiteEntries.map(({ midi, left, width }) => (
        <div
          key={midi}
          className={`${styles.whiteKey} ${activeMidiSet.has(midi) ? styles.active : ''}`}
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      ))}
      {blackEntries.map(({ midi, left, width }) => (
        <div
          key={midi}
          className={`${styles.blackKey} ${activeMidiSet.has(midi) ? styles.active : ''}`}
          style={{ left: `${left}%`, width: `${width}%` }}
        />
      ))}
    </div>
  )
}
