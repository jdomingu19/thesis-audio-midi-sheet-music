import AudioItem from '../AudioItem/AudioItem';
import styles from './AudioList.module.css';

export default function AudioList({
  audioFiles,
  playingId,
  onPlay,
  onDownload,
  onClean,
  onDelete,
}) {
  const cleanedCount = audioFiles.filter(f => f.isCleaned).length;

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>Audio Files</h2>
          <span className={styles.count}>{audioFiles.length}</span>
        </div>
        {cleanedCount > 0 && (
          <p className={styles.sub}>
            <span className={styles.subAccent}>{cleanedCount}</span> cleaned
          </p>
        )}
      </header>

      <ul className={styles.list} role="list">
        {audioFiles.map(audio => (
          <li key={audio.id}>
            <AudioItem
              audio={audio}
              isPlaying={playingId === audio.id}
              onPlay={onPlay}
              onDownload={onDownload}
              onClean={onClean}
              onDelete={onDelete}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
