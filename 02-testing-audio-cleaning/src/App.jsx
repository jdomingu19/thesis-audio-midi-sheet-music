import Header from './components/Header/Header';
import UploadZone from './components/UploadZone/UploadZone';
import AudioList from './components/AudioList/AudioList';
import CleanModal from './components/CleanModal/CleanModal';
import EmptyState from './components/EmptyState/EmptyState';
import { useAudioManager } from './hooks/useAudioManager';
import styles from './App.module.css';

export default function App() {
  const {
    audioFiles,
    playingId,
    modalState,
    handleUpload,
    handlePlay,
    handleDownload,
    handleOpenClean,
    handleCloseModal,
    handleConfirmClean,
    handleDelete,
  } = useAudioManager();

  const modalAudio = audioFiles.find(f => f.id === modalState.audioId);

  return (
    <>
      <Header />

      <main className={styles.main}>
        <div className={styles.container}>

          {/* ── Upload Zone ──────────────────────────── */}
          <UploadZone onUpload={handleUpload} />

          {/* ── Separator ────────────────────────────── */}
          {audioFiles.length > 0 && (
            <div className={styles.separator} aria-hidden="true" />
          )}

          {/* ── Audio list or empty state ─────────────── */}
          {audioFiles.length === 0 ? (
            <EmptyState />
          ) : (
            <AudioList
              audioFiles={audioFiles}
              playingId={playingId}
              onPlay={handlePlay}
              onDownload={handleDownload}
              onClean={handleOpenClean}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className={styles.footer}>
        <p className={styles.footerText}>
          <span className={styles.footerMono}>AudioClean</span>
          &nbsp;·&nbsp; All processing happens locally in your browser
        </p>
      </footer>

      {/* ── Modal ───────────────────────────────────── */}
      <CleanModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirmClean}
        audioName={modalAudio?.name}
      />
    </>
  );
}
