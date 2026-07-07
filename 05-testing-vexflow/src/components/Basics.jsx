// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/components/Basics.jsx

import { useEffect, useRef } from "react";
import VexFlow from "vexflow";
import { DownloadPdfButton } from "./DownloadPdfButton.jsx";

export function Basics() {
  const outputRef = useRef(null);

  useEffect(() => {
    const { Renderer, Stave } = VexFlow;

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

    // Connect it to the rendering context and draw
    stave.setContext(context).draw();
  }, []);

  return (
    <>
      <h2>Step 1: The Basics</h2>
      <div
        id="outputBasics"
        className="vexflow-container"
        ref={outputRef}
      ></div>
      <DownloadPdfButton containerRef={outputRef} filename="basics.pdf" />
    </>
  );
}
