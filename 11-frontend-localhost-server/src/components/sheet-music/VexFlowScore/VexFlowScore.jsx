// thesis-audio-midi-sheet-music
// @jdomingu19
// VexFlowScore.jsx

import { forwardRef, useEffect, useRef } from "react";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Beam,
  Accidental,
} from "vexflow";
import styles from "./VexFlowScore.module.css";

const STAVE_WIDTH = 260;
const STAVES_PER_LINE = 4;

/**
 * VexFlowScore — renderiza compases ya procesados por jsonToVexflow.js
 * como SVG de VexFlow. `ref` apunta al contenedor DOM (usado para exportar PDF).
 *
 * @param {Array} measures - measures[] devuelto por jsonToVexflowMeasures
 * @param {string} timeSignature
 * @param {object} keyInfo
 */
const VexFlowScore = forwardRef(function VexFlowScore(
  { measures = [], timeSignature = "4/4", keyInfo = null },
  forwardedRef,
) {
  const localRef = useRef(null);

  useEffect(() => {
    const container = localRef.current;
    if (!container || !measures?.length) return;
    container.innerHTML = "";

    const lines = Math.ceil(measures.length / STAVES_PER_LINE);
    const renderer = new Renderer(container, Renderer.Backends.SVG);
    renderer.resize(STAVE_WIDTH * STAVES_PER_LINE + 40, lines * 150 + 40);
    const context = renderer.getContext();

    measures.forEach((measureEvents, i) => {
      const col = i % STAVES_PER_LINE;
      const row = Math.floor(i / STAVES_PER_LINE);
      const x = 20 + col * STAVE_WIDTH;
      const y = 20 + row * 150;

      const stave = new Stave(x, y, STAVE_WIDTH);
      if (i === 0) {
        stave.addClef("treble").addTimeSignature(timeSignature);
        if (keyInfo?.vexKey) stave.addKeySignature(keyInfo.vexKey);
      }
      stave.setContext(context).draw();

      const staveNotes = measureEvents.map((ev) => {
        const note = new StaveNote({ keys: ev.keys, duration: ev.duration });
        if (!ev.isRest) {
          ev.accidentals.forEach((acc, idx) => {
            if (acc === "#" || acc === "b") {
              note.addModifier(new Accidental(acc), idx);
            }
          });
        }
        return note;
      });

      const voice = new Voice({ numBeats: 4, beatValue: 4 });
      voice.setStrict(false);
      voice.addTickables(staveNotes);

      new Formatter().joinVoices([voice]).format([voice], STAVE_WIDTH - 40);

      const beams = Beam.generateBeams(staveNotes.filter((n) => !n.isRest));
      voice.draw(context, stave);
      beams.forEach((b) => b.setContext(context).draw());
    });
  }, [measures, timeSignature, keyInfo]);

  return (
    <div
      ref={(node) => {
        localRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      className={styles.output}
    />
  );
});

export default VexFlowScore;
