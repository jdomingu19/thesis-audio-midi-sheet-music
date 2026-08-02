// Thesis Audio to MIDI & Sheet Music
// Piano Roll JSON Player @jdomingu19
// App.jsx

import { useMemo, useState } from "react";
import Uploader from "@/components/Uploader/Uploader";
import PianoRoll from "@/components/PianoRoll/PianoRoll";
import Keyboard from "@/components/Keyboard/Keyboard";
import TransportControls from "@/components/TransportControls/TransportControls";
import { useTonePlayer } from "@/hooks/useTonePlayer";
import {
  flattenNotes,
  getMidiRange,
  isBlackKey,
  formatTime,
} from "@/utils/noteUtils";
import styles from "./App.module.css";

export default function App() {
  const [midiJson, setMidiJson] = useState(null);
  const [fileName, setFileName] = useState(null);

  const notes = useMemo(() => flattenNotes(midiJson), [midiJson]);
  const { min: minMidi, max: maxMidi } = useMemo(
    () => getMidiRange(notes),
    [notes],
  );

  const whiteKeyCount = useMemo(() => {
    let count = 0;
    for (let m = minMidi; m <= maxMidi; m++) if (!isBlackKey(m)) count++;
    return count;
  }, [minMidi, maxMidi]);

  const { isPlaying, currentTime, duration, play, pause, stop, seek } =
    useTonePlayer(notes);

  const activeMidiSet = useMemo(() => {
    const set = new Set();
    notes.forEach((n) => {
      if (n.time <= currentTime && currentTime <= n.time + n.duration)
        set.add(n.midi);
    });
    return set;
  }, [notes, currentTime]);

  const handleLoad = (json, name) => {
    setMidiJson(json);
    setFileName(name);
  };

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <svg
            className={styles.logoMark}
            width="26"
            height="26"
            viewBox="0 0 26 26"
            fill="none"
          >
            <rect
              x="2"
              y="12"
              width="4"
              height="12"
              rx="1.5"
              fill="var(--accent)"
            />
            <rect
              x="8"
              y="6"
              width="4"
              height="18"
              rx="1.5"
              fill="var(--accent-light)"
            />
            <rect
              x="14"
              y="1"
              width="4"
              height="23"
              rx="1.5"
              fill="var(--accent)"
            />
            <rect
              x="20"
              y="9"
              width="4"
              height="15"
              rx="1.5"
              fill="var(--accent-light)"
            />
          </svg>
          <div className={styles.brandText}>
            <h1 className={styles.logo}>Piano Roll JSON Player</h1>
            <p className={styles.tagline}>Audio → MIDI thesis toolkit</p>
          </div>
        </div>
        <div className={styles.uploaderSlot}>
          <Uploader onLoad={handleLoad} fileName={fileName} />
        </div>
      </header>

      <main className={styles.main}>
        {notes.length > 0 ? (
          <>
            <div className={styles.meta}>
              <span className={styles.metaItem}>
                Notes <span>{notes.length}</span>
              </span>
              <span className={styles.metaItem}>
                Duration <span>{formatTime(duration)}</span>
              </span>
              <span className={styles.metaItem}>
                Range{" "}
                <span>
                  {minMidi}–{maxMidi}
                </span>
              </span>
            </div>
            <div className={styles.stageScroll}>
              <div
                className={styles.stage}
                style={{ "--white-count": whiteKeyCount }}
              >
                <PianoRoll
                  notes={notes}
                  currentTime={currentTime}
                  minMidi={minMidi}
                  maxMidi={maxMidi}
                />
                <Keyboard
                  minMidi={minMidi}
                  maxMidi={maxMidi}
                  activeMidiSet={activeMidiSet}
                />
              </div>
            </div>
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
            <div className={styles.emptyCard}>
              <svg
                className={styles.emptyIcon}
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
              >
                <rect
                  x="4"
                  y="20"
                  width="6"
                  height="16"
                  rx="2"
                  fill="var(--accent)"
                />
                <rect
                  x="14"
                  y="10"
                  width="6"
                  height="26"
                  rx="2"
                  fill="var(--accent-light)"
                />
                <rect
                  x="24"
                  y="16"
                  width="6"
                  height="20"
                  rx="2"
                  fill="var(--accent)"
                />
                <rect
                  x="4"
                  y="4"
                  width="32"
                  height="10"
                  rx="2"
                  stroke="var(--border)"
                  strokeWidth="1.5"
                />
              </svg>
              <p className={styles.emptyTitle}>No hay MIDI cargado</p>
              <p className={styles.emptyText}>
                Sube un archivo .json exportado con @tonejs/midi para ver las
                notas caer sobre el teclado.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
