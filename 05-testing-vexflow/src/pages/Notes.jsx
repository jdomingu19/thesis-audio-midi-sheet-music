// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/pages/Notes.jsx

import { useEffect, useRef } from "react";
import VexFlow from "vexflow";

export function Notes() {
  const outputRef = useRef(null);

  useEffect(() => {
    const { Renderer, Stave, StaveNote, Voice, Formatter } = VexFlow;

    // Clean the container to avoid duplicates
    outputRef.current.innerHTML = "";

    // Create an SVG renderer and attach it to the DIV element via ref
    const renderer = new Renderer(outputRef.current, Renderer.Backends.SVG);

    // Configure the rendering context
    renderer.resize(400, 190);
    const context = renderer.getContext();

    // Set color theme to white
    context.setFillStyle("white");
    context.setStrokeStyle("white");

    // Create a stave of width 400 at position 10, 10 on the canvas
    const stave = new Stave(10, 10, 400);

    // Add a clef and time signature
    stave.addClef("treble").addTimeSignature("4/4");

    const notes = [
      new StaveNote({
        keys: ["c/5"],
        duration: "q",
      }),
      new StaveNote({
        keys: ["d/4"],
        duration: "q",
      }),
      new StaveNote({
        keys: ["b/4"],
        duration: "qr",
      }),
      new StaveNote({
        keys: ["c/4", "e/4", "g/4"],
        duration: "q",
      }),
    ];

    const notes2 = [
      new StaveNote({
        keys: ["c/4"],
        duration: "w",
      }),
    ];

    // Create a voice in 4/4 and add above notes
    const voices = [
      new Voice({
        numBeats: 4,
        beatValue: 4,
      }).addTickables(notes),
      new Voice({
        numBeats: 4,
        beatValue: 4,
      }).addTickables(notes2),
    ];

    // Format and justify the notes to 400 pixels.
    new Formatter().joinVoices(voices).format(voices, 350);

    // Render voices.
    voices.forEach(function (v) {
      v.draw(context, stave);
    });

    // Connect it to the rendering context and draw
    stave.setContext(context).draw();
  }, []);

  return (
    <>
      <h2>Step 2: The Notes</h2>
      <div id="outputNotes" ref={outputRef}></div>
    </>
  );
}
