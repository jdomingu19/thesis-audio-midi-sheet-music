// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/pages/GuitarTablature.jsx

import { useEffect, useRef } from "react";
import VexFlow from "vexflow";

export function GuitarTablature() {
  const outputRef = useRef(null);

  useEffect(() => {
    const { Renderer, TabStave, TabNote, Bend, Vibrato, Formatter } = VexFlow;

    // Clean the container to avoid duplicates
    outputRef.current.innerHTML = "";

    // Create an SVG renderer and attach it to the DIV element via ref
    const renderer = new Renderer(outputRef.current, Renderer.Backends.SVG);

    // Configure the rendering context
    renderer.resize(720, 130);
    const context = renderer.getContext();

    // Create a tab stave of width 400 at position 10, 40 on the canvas
    const stave = new TabStave(10, 0, 400);
    stave.addClef("tab").setContext(context).draw();

    // Define notes with modern configuration syntax
    const notes = [
      // Single note
      new TabNote({
        positions: [{ str: 3, fret: 7 }],
        duration: "q",
      }),

      // Chord with bend on 3rd string
      new TabNote({
        positions: [
          { str: 2, fret: 10 },
          { str: 3, fret: 9 },
        ],
        duration: "q",
      }).addModifier(new Bend([{ type: Bend.UP, text: "Full" }]), 1),

      // Single note with harsh vibrato
      new TabNote({
        positions: [{ str: 2, fret: 5 }],
        duration: "h",
      }).addModifier(new Vibrato({ harsh: true, vibrato_width: 70 }), 0),
    ];

    // Format and draw notes
    Formatter.FormatAndDraw(context, stave, notes);
  }, []);

  return (
    <>
      <h2>Step 8: Guitar Tablature</h2>
      <div
        id="outputGuitarTablature"
        className="vexflow-container"
        ref={outputRef}
      ></div>
    </>
  );
}
