// thesis-audio-midi-sheet-music
// @jdomingu19
// Uploader.jsx

import { useRef, useState } from "react";
import s from "./Uploader.module.css";

export default function Uploader({ onFile }) {
  const ref = useRef();
  const [drag, setDrag] = useState(false);

  function pick(e) {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (file) onFile(file);
    if (e.target.value) e.target.value = "";
  }

  return (
    <div
      className={`${s.zone} ${drag ? s.drag : ""}`}
      onClick={() => ref.current.click()}
      onKeyDown={(e) => e.key === "Enter" && ref.current.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setDrag(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        pick(e);
      }}
      role="button"
      tabIndex={0}
      aria-label="Upload a MIDI file"
    >
      <div className={s.bg} aria-hidden="true" />

      <input
        ref={ref}
        className={s.input}
        type="file"
        accept=".mid,.midi"
        onChange={pick}
        aria-hidden="true"
        tabIndex={-1}
      />

      <div className={s.icon} aria-hidden="true">
        <span>{drag ? "＋" : "♬"}</span>
      </div>

      <div className={s.text}>
        <p className={s.label}>
          {drag ? (
            "Release to parse"
          ) : (
            <>
              Drop a <strong>.mid</strong> file here
            </>
          )}
        </p>
        <p className={s.link}>
          or <span>browse your device</span>
        </p>
      </div>

      <div className={s.formats}>
        <span className={s.formatChip}>MID</span>
        <span className={s.formatChip}>MIDI</span>
      </div>

      <p className={s.hint}>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
        Parsed entirely in the browser — nothing leaves your machine
      </p>
    </div>
  );
}
