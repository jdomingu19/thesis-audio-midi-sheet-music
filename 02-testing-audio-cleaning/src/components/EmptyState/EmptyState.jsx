import styles from './EmptyState.module.css';

export default function EmptyState() {
  return (
    <div className={styles.empty}>
      <div className={styles.visual} aria-hidden="true">
        {/* Decorative waveform bars */}
        {[0.2, 0.5, 0.8, 0.4, 0.9, 0.3, 0.7, 0.5, 0.6, 0.2, 0.85, 0.4].map((h, i) => (
          <span
            key={i}
            className={styles.demoBar}
            style={{ '--h': h, '--delay': `${i * 80}ms` }}
          />
        ))}
      </div>
      <p className={styles.text}>No audio files yet</p>
      <p className={styles.sub}>Upload files above to get started</p>
    </div>
  );
}
