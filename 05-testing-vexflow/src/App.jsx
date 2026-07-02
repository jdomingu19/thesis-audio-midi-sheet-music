// Thesis Auido to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/App.jsx

import "./App.css";
import { Intro } from "./components/Intro.jsx";
import { Basics } from "./components/Basics.jsx";
import { Notes } from "./components/Notes.jsx";
import { Modifiers } from "./components/Modifiers.jsx";
import { Positions } from "./components/Positions.jsx";
import { Beams } from "./components/Beams.jsx";
import { AutomaticBeams } from "./components/AutomaticBeams.jsx";
import { Ties } from "./components/Ties.jsx";
import { GuitarTablature } from "./components/GuitarTablature.jsx";
import { Barlines } from "./components/Barlines.jsx";

function App() {
  return (
    <section id="center">
      <Intro />
      <Basics />
      <Notes />
      <Modifiers />
      <Positions />
      <Beams />
      <AutomaticBeams />
      <Ties />
      <GuitarTablature />
      <Barlines />
    </section>
  );
}

export default App;
