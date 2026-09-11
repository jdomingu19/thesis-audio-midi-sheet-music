// thesis-audio-midi-sheet-music
// @jdomingu19
// Topbar.jsx

import clsx from "clsx";
import styles from "./Topbar.module.css";

/**
 * Topbar — barra superior con logo/nombre del proyecto y acciones globales.
 *
 * @param {React.ReactNode} logo - ícono o marca (opcional)
 * @param {string} title - nombre del proyecto (ej. "Armonía")
 * @param {string} subtitle - texto secundario opcional (ej. "Audio a Partitura")
 * @param {React.ReactNode} actions - slot derecho para botones/íconos globales
 */
function Topbar({ logo, title, subtitle, actions, className, ...rest }) {
  return (
    <div className={clsx(styles.topbar, className)} {...rest}>
      <div className={styles.brand}>
        {logo && (
          <span className={styles.logo} aria-hidden="true">
            {logo}
          </span>
        )}
        <div className={styles.titleGroup}>
          {title && <span className={styles.title}>{title}</span>}
          {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
        </div>
      </div>

      {actions && <div className={styles.actions}>{actions}</div>}
    </div>
  );
}

export default Topbar;
