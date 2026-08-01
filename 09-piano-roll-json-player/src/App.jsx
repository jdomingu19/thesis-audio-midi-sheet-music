import { useMemo, useState } from 'react'
import Uploader from '@/components/Uploader/Uploader'
import PianoRoll from '@/components/PianoRoll/PianoRoll'
import Keyboard from '@/components/Keyboard/Keyboard'
import TransportControls from '@/components/TransportControls/TransportControls'
import { useTonePlayer } from '@/hooks/useTonePlayer'
import { flattenNotes, getMidiRange } from '@/utils/noteUtils'
import styles from './App.module.css'

export default function App() {
  const [midiJson, setMidiJson] = useState(null)
  const [fileName, setFileName] = useState(null)

  const notes = useMemo(() => flattenNotes(midiJson), [midiJson])
  const { min: minMidi, max: maxMidi } = useMemo(() => getMidiRange(notes), [notes])

  const { isPlaying, currentTime, duration, play, pause, stop, seek } = useTonePlayer(notes)

  const activeMidiSet = useMemo(() => {
    const set = new Set()
    notes.forEach((n) => {
      if (n.time <= currentTime && currentTime <= n.time + n.duration) set.add(n.midi)
    })
    return set
  }, [notes, currentTime])

  const handleLoad = (json, name) => {
    setMidiJson(json)
    setFileName(name)
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Piano Roll JSON Player</h1>
        <div className={styles.uploaderSlot}>
          <Uploader onLoad={handleLoad} fileName={fileName} />
        </div>
      </header>

      <main className={styles.main}>
        {notes.length > 0 ? (
          <>
            <PianoRoll
              notes={notes}
              currentTime={currentTime}
              minMidi={minMidi}
              maxMidi={maxMidi}
            />
            <Keyboard minMidi={minMidi} maxMidi={maxMidi} activeMidiSet={activeMidiSet} />
            <TransportControls
              isPlaying={isPlaying}
              currentTime={currentTime}
              duration={duration}
              onPlay={play}
              onPause={pause}
              onStop={stop}
              onSeek={seek}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <p>Sube un archivo .json exportado con @tonejs/midi para comenzar.</p>
          </div>
        )}
      </main>
    </div>
  )
}
