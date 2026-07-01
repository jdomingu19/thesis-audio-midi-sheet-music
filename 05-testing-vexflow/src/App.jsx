// Thesis Auido to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/App.jsx

import "./App.css";
import { Basics } from "./pages/Basics.jsx";
import { Notes } from "./pages/Notes.jsx";
import { Modifiers } from "./pages/Modifiers.jsx";

function App() {
  return (
    <section id="center">
      <h1>Testing VexFlow</h1>
      <p>
        VexFlow is an engraving engine for music notation and can be used as a
        rendering backend to various kinds of web-based music tools, libraries,
        and applications. It's written in TypeScript/JavaScript and works with
        both HTML5 Canvas and SVG.
      </p>
      <p>
        This tutorial expects you to have JavaScript programming experience and
        a basic understanding of music notation terminology.
      </p>
      <Basics />
      <Notes />
      <Modifiers />
    </section>
  );
}

export default App;
