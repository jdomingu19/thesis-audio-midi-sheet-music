import { useState } from 'react'
import s from './Editor.module.css'

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B']
const midiToName = n => `${NOTE_NAMES[n % 12]}${Math.floor(n / 12) - 1}`

export default function Editor({ midi }) {
  const [open, setOpen] = useState(0)

  // --- Header fields ---
  function setTempo(val) {
    if (midi.header.tempos.length) midi.header.tempos[0].bpm = Number(val)
  }

  function setTimeSignature(field, val) {
    if (midi.header.timeSignatures.length)
      midi.header.timeSignatures[0][field] = Number(val)
  }

  // --- Note fields ---
  function setNote(track, noteIdx, field, val) {
    const note = track.notes[noteIdx]
    if (field === 'midi')     note.midi     = Number(val)
    if (field === 'velocity') note.velocity = Number(val) / 127
    if (field === 'duration') note.duration = Number(val)
    if (field === 'time')     note.time     = Number(val)
  }

  // --- Track name ---
  function setTrackName(track, val) { track.name = val }

  const bpm    = midi.header.tempos[0]?.bpm ?? 120
  const timeSig = midi.header.timeSignatures[0]
  const dur    = midi.duration.toFixed(2)

  return (
    <div className={s.editor}>
      {/* ── Global info ── */}
      <section className={s.meta}>
        <div className={s.chip}><span>Format</span><code>{midi.header.format}</code></div>
        <div className={s.chip}><span>Duration</span><code>{dur}s</code></div>
        <div className={s.chip}><span>Tracks</span><code>{midi.tracks.length}</code></div>

        <label className={s.field}>
          <span>BPM</span>
          <input type="number" defaultValue={Math.round(bpm)} min={20} max={300}
            onChange={e => setTempo(e.target.value)} />
        </label>

        {timeSig && <>
          <label className={s.field}>
            <span>Beats</span>
            <input type="number" defaultValue={timeSig.timeSignature[0]} min={1} max={32}
              onChange={e => setTimeSignature('numerator', e.target.value)} />
          </label>
          <label className={s.field}>
            <span>Division</span>
            <input type="number" defaultValue={timeSig.timeSignature[1]} min={1} max={32}
              onChange={e => setTimeSignature('denominator', e.target.value)} />
          </label>
        </>}
      </section>

      {/* ── Tracks ── */}
      {midi.tracks.map((track, ti) => (
        <div key={ti} className={s.track}>
          <button className={s.trackHead} onClick={() => setOpen(open === ti ? -1 : ti)}>
            <span className={s.trackNum}>Track {ti}</span>
            <input
              className={s.trackName}
              defaultValue={track.name || `Track ${ti}`}
              onClick={e => e.stopPropagation()}
              onChange={e => setTrackName(track, e.target.value)}
            />
            <span className={s.trackInfo}>{track.notes.length} notes · {track.instrument.name}</span>
            <span className={s.caret}>{open === ti ? '▲' : '▼'}</span>
          </button>

          {open === ti && (
            <div className={s.notes}>
              <div className={s.noteHeader}>
                <span>Note</span><span>Time (s)</span><span>Dur (s)</span><span>Vel</span>
              </div>
              {track.notes.map((note, ni) => (
                <div key={ni} className={s.noteRow}>
                  <span className={s.noteName}>{midiToName(note.midi)}</span>
                  <input type="number" defaultValue={note.midi} min={0} max={127} step={1}
                    title="MIDI pitch"
                    onChange={e => setNote(track, ni, 'midi', e.target.value)} />
                  <input type="number" defaultValue={note.time.toFixed(3)} min={0} step={0.01}
                    onChange={e => setNote(track, ni, 'time', e.target.value)} />
                  <input type="number" defaultValue={note.duration.toFixed(3)} min={0.01} step={0.01}
                    onChange={e => setNote(track, ni, 'duration', e.target.value)} />
                  <input type="number" defaultValue={Math.round(note.velocity * 127)} min={0} max={127}
                    onChange={e => setNote(track, ni, 'velocity', e.target.value)} />
                </div>
              ))}
              {track.notes.length === 0 && <p className={s.empty}>No notes in this track</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
