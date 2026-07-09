// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/App.jsx

import { useState } from "react";

import "@/App.css";

import { Intro } from "@/components/Intro.jsx";
import { VexFlowSheetMusic } from "@/components/VexFlowSheetMusic";

import { jsonToVexflowMeasures } from "@/utils/jsonToVexflow";

function App() {
  const [score, setScore] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const json = JSON.parse(event.target.result);
      setScore(jsonToVexflowMeasures(json, 0));
    };
    reader.readAsText(file);
  };

  return (
    <>
      <section id="center">
        <Intro />
        <input type="file" accept=".json" onChange={handleUpload} />
        {score && (
          <VexFlowSheetMusic
            measures={score.measures}
            timeSignature={score.timeSignature}
          />
        )}
      </section>
    </>
  );
}

export default App;
