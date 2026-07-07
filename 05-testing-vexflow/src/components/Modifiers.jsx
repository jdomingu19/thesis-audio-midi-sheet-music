// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/components/Modifiers.jsx

import { useEffect, useRef } from "react";
import VexFlow from "vexflow";
import { DownloadPdfButton } from "./DownloadPdfButton.jsx";

export function Modifiers() {
  const outputRef = useRef(null);

  useEffect(() => {
    const { Renderer, Stave, StaveNote, Formatter, Accidental, Dot } = VexFlow;

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
        keys: ["eb/5"],
        duration: "16",
      }).addModifier(new Accidental("b")),

      dotted(
        new StaveNote({
          keys: ["eb/4", "d/5"],
          duration: "h",
        }),
        0 /* add dot to note at index==0 */,
      ),

      dotted(
        new StaveNote({
          keys: ["c/5", "eb/5", "g#/5"],
          duration: "q",
        })
          .addModifier(new Accidental("b"), 1)
          .addModifier(new Accidental("#"), 2),
      ),
    ];

    Formatter.FormatAndDraw(context, stave, notes);

    function dotted(staveNote, noteIndex = -1) {
      if (noteIndex < 0) {
        Dot.buildAndAttach([staveNote], {
          all: true,
        });
      } else {
        Dot.buildAndAttach([staveNote], {
          index: noteIndex,
        });
      }
      return staveNote;
    }

    // Connect it to the rendering context and draw
    stave.setContext(context).draw();
  }, []);

  return (
    <>
      <h2>Step 3: Modifiers</h2>
      <div
        id="outputModifiers"
        className="vexflow-container"
        ref={outputRef}
      ></div>
      <DownloadPdfButton containerRef={outputRef} filename="modifiers.pdf" />
    </>
  );
}
