// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/pages/Ties.jsx

import { useEffect, useRef } from "react";
import VexFlow from "vexflow";

export function Ties() {
  const outputRef = useRef(null);

  useEffect(() => {
    const {
      Renderer,
      Stave,
      StaveNote,
      Formatter,
      Accidental,
      Beam,
      Dot,
      StaveTie,
    } = VexFlow;

    // Clean the container to avoid duplicates
    outputRef.current.innerHTML = "";

    // Create an SVG renderer and attach it to the DIV element via ref
    const renderer = new Renderer(outputRef.current, Renderer.Backends.SVG);

    // Configure the rendering context
    renderer.resize(720, 130);
    const context = renderer.getContext();

    // Create a stave of width 400 at position 10, 10 on the canvas
    const stave = new Stave(10, 10, 400);

    // Add a clef and time signature
    stave.addClef("treble").addTimeSignature("4/4");

    const notes = [
      dotted(
        new StaveNote({
          keys: ["e##/5"],
          duration: "8d",
        }).addModifier(new Accidental("##")),
      ),
      new StaveNote({
        keys: ["b/4"],
        duration: "16",
      }).addModifier(new Accidental("b")),
      new StaveNote({
        keys: ["c/4"],
        duration: "8",
      }),
      new StaveNote({
        keys: ["d/4"],
        duration: "16",
      }),
      new StaveNote({
        keys: ["d/4"],
        duration: "16",
      }),
      new StaveNote({
        keys: ["d/4"],
        duration: "q",
      }),
      new StaveNote({
        keys: ["d/4"],
        duration: "q",
      }),
    ];

    const beams = Beam.generateBeams(notes);
    Formatter.FormatAndDraw(context, stave, notes);
    beams.forEach(function (b) {
      b.setContext(context).draw();
    });

    const ties = [
      new StaveTie({
        firstNote: notes[4],
        lastNote: notes[5],
        firstIndices: [0],
        lastIndices: [0],
      }),
      new StaveTie({
        firstNote: notes[5],
        lastNote: notes[6],
        firstIndices: [0],
        lastIndices: [0],
      }),
    ];

    ties.forEach((t) => {
      t.setContext(context).draw();
    });

    // A helper function to add a dot to a note.
    function dotted(note) {
      Dot.buildAndAttach([note]);
      return note;
    }

    // Connect it to the rendering context and draw
    stave.setContext(context).draw();
  }, []);

  return (
    <>
      <h2>Step 7: Ties</h2>
      <div id="outputTies" className="vexflow-container" ref={outputRef}></div>
    </>
  );
}
