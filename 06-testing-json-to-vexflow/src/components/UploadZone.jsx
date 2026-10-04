// thesis-audio-midi-sheet-music
// @jdomingu19
// UploadZone.jsx

import { useRef, useState } from "react";
import s from "./UploadZone.module.css";

export function UploadZone({ onFile, error }) {
  const inputRef = useRef(null);
  const [drag, setDrag] = useState(false);

  const pick = (e) => {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0];
    if (file) onFile(file);
    if (e.target.value) e.target.value = "";
  };

  return (
    <div className={s.wrapper}>
      <div
        className={`${s.zone} ${drag ? s.drag : ""} ${error ? s.hasError : ""}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
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
        aria-label="Subir un archivo JSON"
      >
        <div className={s.bg} aria-hidden="true" />

        <input
          ref={inputRef}
          className={s.input}
          type="file"
          accept=".json,application/json"
          onChange={pick}
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className={s.icon} aria-hidden="true">
          <span>{drag ? "＋" : "𝄞"}</span>
        </div>

        <div className={s.text}>
          <p className={s.label}>
            {drag ? (
              "Suelta para renderizar"
            ) : (
              <>
                Arrastra un archivo <strong>.json</strong> aquí
              </>
            )}
          </p>
          <p className={s.link}>
            o <span>explora tu dispositivo</span>
          </p>
        </div>

        <div className={s.formats}>
          <span className={s.chip}>JSON</span>
          <span className={s.chip}>Tone.js / @tonejs/midi</span>
        </div>
      </div>

      {error && (
        <div className={s.error} role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
