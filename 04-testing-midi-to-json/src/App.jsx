import { useState } from "react";
import { Midi } from "@tonejs/midi";
import Uploader from "./components/Uploader.jsx";
import Editor from "./components/Editor.jsx";
import s from "./App.module.css";

export default function App() {
  const [midi, setMidi] = useState(null);
  const [filename, setFilename] = useState("");

  async function handleFile(file) {
    const buf = await file.arrayBuffer();
    setMidi(new Midi(buf));
    setFilename(file.name);
  }

  function handleDownload() {
    const bytes = midi.toArray();
    const blob = new Blob([bytes], { type: "audio/midi" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.replace(".mid", "_edited.mid");
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleDownloadJson() {
    const json = JSON.stringify(midi.toJSON(), null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.replace(/\.midi?$/, ".json");
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className={s.app}>
      <header className={s.header}>
        <span className={s.logo}>♩</span>
        <h1>MIDI Editor</h1>
        <p className={s.sub}>Upload · Parse · Edit · Export</p>
      </header>

      {!midi ? (
        <Uploader onFile={handleFile} />
      ) : (
        <>
          <div className={s.toolbar}>
            <span className={s.file}>⬛ {filename}</span>
            <button className={s.reset} onClick={() => setMidi(null)}>
              New file
            </button>
            <button className={s.dl} onClick={handleDownload}>
              ⬇ Download MIDI
            </button>
            <button
              className={`${s.dl} ${s.json}`}
              onClick={handleDownloadJson}
            >
              ⬇ Download JSON
            </button>
          </div>
          <Editor
            midi={midi}
            onChange={() =>
              setMidi(
                midi.clone
                  ? midi.clone()
                  : Object.assign(
                      Object.create(Object.getPrototypeOf(midi)),
                      midi,
                    ),
              )
            }
          />
        </>
      )}
    </div>
  );
}
