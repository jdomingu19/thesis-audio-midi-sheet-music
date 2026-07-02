// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/components/Beams.jsx

import { useEffect, useRef } from "react";
import VexFlow from "vexflow";

export function Beams() {
  const outputRef = useRef(null);

  useEffect(() => {
    const { Renderer, Stave, StaveNote, Formatter, Accidental, Beam, Dot } =
      VexFlow;

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

    const notes1 = [
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
    ];

    const notes2 = [
      new StaveNote({
        keys: ["c/4"],
        duration: "8",
      }),
      new StaveNote({
        keys: ["d/4"],
        duration: "16",
      }),
      new StaveNote({
        keys: ["e/4"],
        duration: "16",
      }).addModifier(new Accidental("b")),
    ];

    const notes3 = [
      new StaveNote({
        keys: ["d/4"],
        duration: "16",
      }),
      new StaveNote({
        keys: ["e/4"],
        duration: "16",
      }).addModifier(new Accidental("#")),
      new StaveNote({
        keys: ["g/4"],
        duration: "32",
      }),
      new StaveNote({
        keys: ["a/4"],
        duration: "32",
      }),
      new StaveNote({
        keys: ["g/4"],
        duration: "16",
      }),
    ];

    const notes4 = [
      new StaveNote({
        keys: ["d/4"],
        duration: "q",
      }),
    ];

    const allNotes = notes1.concat(notes2).concat(notes3).concat(notes4);

    // Create the beams for the first three groups.
    // This hides the normal stems and flags.
    const beams = [new Beam(notes1), new Beam(notes2), new Beam(notes3)];

    Formatter.FormatAndDraw(context, stave, allNotes);

    // Draw the beams and stems.
    beams.forEach((b) => {
      b.setContext(context).draw();
    });

    // Helper function.
    function dotted(staveNote) {
      Dot.buildAndAttach([staveNote]);
      return staveNote;
    }

    // Connect it to the rendering context and draw
    stave.setContext(context).draw();
  }, []);

  return (
    <>
      <h2>Step 5: Beams</h2>
      <div id="outputBeams" className="vexflow-container" ref={outputRef}></div>
    </>
  );
}
