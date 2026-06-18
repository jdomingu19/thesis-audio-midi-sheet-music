import styles from './Header.module.css';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <div className={styles.logo} aria-hidden="true">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="7" fill="var(--color-sage)" fillOpacity=".15" />
              <path d="M6 14c0 0 2-5 4-5s3 3 4 3 2-6 4-6 4 8 4 8" stroke="var(--color-sage)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <circle cx="14" cy="14" r="2" fill="var(--color-sage)" fillOpacity=".5"/>
            </svg>
          </div>
          <div className={styles.wordmark}>
            <span className={styles.wordmarkPrimary}>Audio</span>
            <span className={styles.wordmarkAccent}>Clean</span>
          </div>
        </div>

        <p className={styles.tagline}>
          Browser-based noise reduction studio
        </p>

        <div className={styles.badge}>
          <span className={styles.badgeDot} aria-hidden="true" />
          Web Audio API
        </div>
      </div>
    </header>
  );
}
