// thesis-audio-midi-sheet-music
// @jdomingu19
// App.jsx

import { useState } from "react";

import s from "@/App.module.css";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Intro } from "@/components/Intro";
import { UploadZone } from "@/components/UploadZone";
import { VexFlowSheetMusic } from "@/components/VexFlowSheetMusic";

import { jsonToVexflowMeasures } from "@/utils/jsonToVexflow";

function App() {
  const [score, setScore] = useState(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    setError(null);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const result = jsonToVexflowMeasures(json, 0);

      if (!result?.measures?.length) {
        throw new Error("EMPTY");
      }

      setScore(result);
      setFileName(file.name);
    } catch (err) {
      setScore(null);
      setFileName("");
      setError(
        err instanceof SyntaxError
          ? "El archivo no es un JSON válido."
          : "No se encontraron notas en la pista 0 del archivo.",
      );
    }
  };

  const handleReset = () => {
    setScore(null);
    setFileName("");
    setError(null);
  };

  return (
    <>
      <Header />

      <main className={s.main}>
        <div className={s.container}>
          <Intro />

          {!score ? (
            <UploadZone onFile={handleFile} error={error} />
          ) : (
            <VexFlowSheetMusic
              measures={score.measures}
              timeSignature={score.timeSignature}
              keyInfo={score.keyInfo}
              fileName={fileName}
              onReset={handleReset}
            />
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}

export default App;
