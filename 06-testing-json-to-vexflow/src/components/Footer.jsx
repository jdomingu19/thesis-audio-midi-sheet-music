// thesis-audio-midi-sheet-music
// @jdomingu19
// Footer.jsx

import s from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <p className={s.text}>
          <span className={s.mono}>JSON → VexFlow</span>
          <span className={s.sep}> · </span>
          Todo el procesamiento ocurre en tu navegador
        </p>

        <ul className={s.stack} aria-label="Tecnologías utilizadas">
          <li>React</li>
          <li>VexFlow</li>
          <li>Tone.js JSON</li>
        </ul>

        <p className={s.credit}>
          Proyecto de grado · por{" "}
          <a
            href="https://github.com/jdomingu19/"
            target="_blank"
            rel="noreferrer"
          >
            Jesús Domínguez @jdomingu19
          </a>
        </p>
      </div>
    </footer>
  );
}
