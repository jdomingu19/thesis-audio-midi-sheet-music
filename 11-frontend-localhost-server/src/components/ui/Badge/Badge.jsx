// thesis-audio-midi-sheet-music
// @jdomingu19
// Badge.jsx

import clsx from "clsx";
import styles from "./Badge.module.css";

/**
 * Badge — etiqueta corta de estado (ready / processing / queued / error / default).
 *
 * @param {'ready'|'processing'|'queued'|'error'|'default'} status
 * @param {boolean} withDot - punto indicador antes del texto
 * @param {React.ReactNode} icon - ícono opcional (reemplaza el dot si se provee)
 */
function Badge({
  children,
  status = "default",
  withDot = false,
  icon = null,
  className,
  ...rest
}) {
  return (
    <span
      className={clsx(styles.badge, styles[`status-${status}`], className)}
      {...rest}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      {!icon && withDot && <span className={styles.dot} aria-hidden="true" />}
      <span className={styles.label}>{children}</span>
    </span>
  );
}

export default Badge;
