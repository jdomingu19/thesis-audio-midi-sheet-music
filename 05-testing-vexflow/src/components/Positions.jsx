// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/components/Positions.jsx

import { useEffect, useRef } from "react";
import VexFlow from "vexflow";
import { DownloadPdfButton } from "./DownloadPdfButton.jsx";

export function Positions() {
  const outputRef = useRef(null);

  useEffect(() => {
    const { Renderer, Stave, StaveNote, Formatter, Accidental } = VexFlow;

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
      new StaveNote({
        keys: ["g/4", "b/4", "cb/5", "e/5", "g#/5", "b/5"],
        duration: "h",
      })
        .addModifier(new Accidental("bb"), 0)
        .addModifier(new Accidental("b"), 1)
        .addModifier(new Accidental("#"), 2)
        .addModifier(new Accidental("n"), 3)
        .addModifier(new Accidental("b"), 4)
        .addModifier(new Accidental("##"), 5),
      new StaveNote({ keys: ["c/4"], duration: "h" }),
    ];

    // Helper function to justify and draw a 4/4 voice.
    Formatter.FormatAndDraw(context, stave, notes);

    // Connect it to the rendering context and draw
    stave.setContext(context).draw();
  }, []);

  return (
    <>
      <h2>Step 4: Positions</h2>
      <div
        id="outputPositions"
        className="vexflow-container"
        ref={outputRef}
      ></div>
      <DownloadPdfButton containerRef={outputRef} filename="positions.pdf" />
    </>
  );
}
