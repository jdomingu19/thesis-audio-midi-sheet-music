// thesis-audio-midi-sheet-music
// @jdomingu19
// Spinner.jsx

import clsx from "clsx";
import styles from "./Spinner.module.css";

/**
 * Spinner — indicador de carga circular.
 *
 * @param {'sm'|'md'|'lg'} size
 * @param {'default'|'sage'|'amber'} variant
 * @param {string} label - texto accesible (sr-only)
 */
function Spinner({
  size = "md",
  variant = "default",
  label = "Cargando",
  className,
  ...rest
}) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={clsx(
        styles.spinner,
        styles[`size-${size}`],
        styles[`variant-${variant}`],
        className,
      )}
      {...rest}
    >
      <span className={styles.circle} aria-hidden="true" />
      <span className={styles.srOnly}>{label}</span>
    </span>
  );
}

export default Spinner;
