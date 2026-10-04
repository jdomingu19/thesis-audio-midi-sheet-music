// thesis-audio-midi-sheet-music
// @jdomingu19
// Header.jsx

import s from "./Header.module.css";

export function Header() {
  return (
    <header className={s.header}>
      <div className={s.inner}>
        <div className={s.brand}>
          <span className={s.logo} aria-hidden="true">
            ♩
          </span>
          <div className={s.wordmark}>
            <span className={s.primary}>JSON</span>
            <span className={s.arrow}> → </span>
            <span className={s.accent}>VexFlow</span>
          </div>
        </div>

        <p className={s.tagline}>Partitura renderizada desde Tone.js JSON</p>

        <div className={s.badge}>
          <span className={s.dot} aria-hidden="true" />
          Módulo 06
        </div>
      </div>
    </header>
  );
}
