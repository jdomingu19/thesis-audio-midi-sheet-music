// thesis-audio-midi-sheet-music
// @jdomingu19
// ProgressBar.jsx

import clsx from "clsx";
import styles from "./ProgressBar.module.css";

/**
 * ProgressBar — barra de progreso lineal.
 *
 * @param {number} value - valor actual (ignorado si indeterminate=true)
 * @param {number} max
 * @param {boolean} indeterminate - animación continua (ej. "processing" sin % conocido)
 * @param {'default'|'sage'|'amber'|'danger'} variant
 * @param {boolean} showLabel - muestra el porcentaje como texto
 */
function ProgressBar({
  value = 0,
  max = 100,
  indeterminate = false,
  variant = "default",
  showLabel = false,
  className,
  ...rest
}) {
  const clampedValue = Math.min(Math.max(value, 0), max);
  const percentage = Math.round((clampedValue / max) * 100);

  return (
    <div className={clsx(styles.wrapper, className)}>
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        className={clsx(
          styles.track,
          styles[`variant-${variant}`],
          indeterminate && styles.indeterminate,
        )}
        {...rest}
      >
        {!indeterminate && (
          <div className={styles.fill} style={{ width: `${percentage}%` }} />
        )}
        {indeterminate && <div className={styles.fillIndeterminate} />}
      </div>
      {showLabel && !indeterminate && (
        <span className={styles.label}>{percentage}%</span>
      )}
    </div>
  );
}

export default ProgressBar;
