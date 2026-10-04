// thesis-audio-midi-sheet-music
// @jdomingu19
// Intro.jsx

import s from "./Intro.module.css";

const STEPS = [
  {
    n: "01",
    title: "Carga el JSON",
    text: "Sube un archivo .json generado con @tonejs/midi a partir de un MIDI. Se lee la primera pista (track 0).",
  },
  {
    n: "02",
    title: "Conversión a compases",
    text: "Las notas se agrupan por compás, se detectan figuras, silencios, alteraciones y la tonalidad de la pieza.",
  },
  {
    n: "03",
    title: "Visualiza y descarga",
    text: "VexFlow dibuja la partitura en SVG, ajustada al ancho de tu pantalla, y puedes exportarla en PDF.",
  },
];

export function Intro() {
  return (
    <section className={s.intro}>
      <div className={s.hero}>
        <p className={s.eyebrow}>Módulo independiente · Validación 06</p>
        <h1 className={s.title}>
          <span className={s.accent}>JSON</span> a partitura con VexFlow
        </h1>
        {/* <p className={s.lead}>
          Este módulo valida la última etapa del flujo de la tesis: tomar la
          representación en JSON de una transcripción musical y convertirla en
          una partitura legible, con claves, armadura, compás, ligaduras de
          corchea y alteraciones. Todo se procesa localmente: tu archivo nunca
          sale del navegador.
        </p> */}
      </div>

      <ol className={s.steps}>
        {STEPS.map(({ n, title, text }) => (
          <li key={n} className={s.step}>
            <span className={s.num}>{n}</span>
            <h2 className={s.stepTitle}>{title}</h2>
            <p className={s.stepText}>{text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
