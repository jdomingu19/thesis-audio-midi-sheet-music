// thesis-audio-midi-sheet-music
// @jdomingu19
// PanelSection.jsx

import clsx from "clsx";
import styles from "./PanelSection.module.css";

/**
 * PanelSection — contenedor genérico con título + glass card.
 * Usado para agrupar zonas como "Panel de entrada", "Biblioteca", etc.
 *
 * @param {React.ReactNode} icon - ícono opcional junto al título
 * @param {string} title
 * @param {React.ReactNode} actions - slot derecho del header (ej. botón, contador)
 * @param {boolean} noPadding - quita el padding interno del body (ej. para listas con scroll propio)
 */
function PanelSection({
  icon,
  title,
  actions,
  noPadding = false,
  children,
  className,
  ...rest
}) {
  return (
    <section className={clsx(styles.panel, styles.glass, className)} {...rest}>
      {(title || actions) && (
        <header className={styles.header}>
          <div className={styles.headerTitle}>
            {icon && (
              <span className={styles.icon} aria-hidden="true">
                {icon}
              </span>
            )}
            {title && <h2 className={styles.title}>{title}</h2>}
          </div>
          {actions && <div className={styles.headerActions}>{actions}</div>}
        </header>
      )}

      <div className={clsx(styles.body, noPadding && styles.noPadding)}>
        {children}
      </div>
    </section>
  );
}

export default PanelSection;
