// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/components/VexFlowSheetMusic.jsx

import { useEffect, useRef } from "react";
import {
  Renderer,
  Stave,
  StaveNote,
  Voice,
  Formatter,
  Beam,
  Accidental,
} from "vexflow";

import { Button } from "@/components/Button";
import { downloadPDF } from "@/utils/handlers";

const STAVE_WIDTH = 260;
const STAVES_PER_LINE = 4;

export function VexFlowSheetMusic({
  measures,
  timeSignature = "4/4",
  keyInfo,
}) {
  const outputRef = useRef(null);

  useEffect(() => {
    if (!outputRef.current || !measures?.length) return;
    outputRef.current.innerHTML = "";

    const lines = Math.ceil(measures.length / STAVES_PER_LINE);
    const renderer = new Renderer(outputRef.current, Renderer.Backends.SVG);
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
          // FIX: usamos el accidental explícito, no un .includes() ambiguo
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
    <>
      <div className="output-vexflow" ref={outputRef}></div>
      <Button
        className="btn-download"
        handleFunction={() => downloadPDF(outputRef.current, "Sheet Music")}
        children="Download PDF"
      />
    </>
  );
}
