import { useState } from "react";
import AudioRecorder from "./components/AudioRecorder";
import AudioList from "./components/AudioList";
import styles from "./App.module.css";

function App() {
  const [recordings, setRecordings] = useState([]);

  const handleNewRecording = (recording) => {
    setRecordings((prev) => [recording, ...prev]);
  };

  const handleDelete = (id) => {
    setRecordings((prev) => {
      const target = prev.find((r) => r.id === id);
      if (target) URL.revokeObjectURL(target.url);
      return prev.filter((r) => r.id !== id);
    });
  };

  const handleClearAll = () => {
    recordings.forEach((r) => URL.revokeObjectURL(r.url));
    setRecordings([]);
  };

  return (
    <div className={styles.app}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>◉</span>
            <div className={styles.logoText}>
              <span className={styles.logoTitle}>AudioRec</span>
              <span className={styles.logoVersion}>v1.0.0 · dev</span>
            </div>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.badge}>MediaRecorder API</span>
            <span className={styles.badge}>WebAudio</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className={styles.main}>
        <div className={styles.container}>
          {/* Page title */}
          <section className={styles.hero}>
            <p className={styles.heroLabel}>// microphone test environment</p>
            <h1 className={styles.heroTitle}>
              Audio
              <br />
              <span className={styles.heroAccent}>Recorder</span>
            </h1>
            <p className={styles.heroDesc}>
              Graba, reproduce y gestiona tus audios directamente desde el
              navegador — sin servidor, sin storage externo.
            </p>
          </section>

          {/* Recorder */}
          <AudioRecorder onNewRecording={handleNewRecording} />

          {/* Divider */}
          <div className={styles.divider}>
            <span className={styles.dividerLabel}>
              recordings · {recordings.length}
            </span>
          </div>

          {/* Audio list */}
          <AudioList
            recordings={recordings}
            onDelete={handleDelete}
            onClearAll={handleClearAll}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <span>Built with React + Vite · MediaRecorder API</span>
        <span className={styles.footerDot}>·</span>
        <span className={styles.footerAccent}>
          No audio leaves your browser
        </span>
      </footer>
    </div>
  );
}

export default App;
