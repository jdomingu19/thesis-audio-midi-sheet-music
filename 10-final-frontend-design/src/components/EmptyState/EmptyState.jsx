// thesis-audio-midi-sheet-music
// @jdomingu19
// EmptyState.jsx

import clsx from "clsx";
import styles from "./EmptyState.module.css";

/**
 * EmptyState — placeholder para listas/paneles sin contenido.
 *
 * @param {React.ReactNode} icon - ícono o ilustración (componente Lucide u otro)
 * @param {string} title
 * @param {string} description
 * @param {React.ReactNode} action - contenido opcional (ej. <Button>) para una acción sugerida
 */
function EmptyState({ icon, title, description, action, className, ...rest }) {
  return (
    <div className={clsx(styles.emptyState, className)} {...rest}>
      {icon && (
        <div className={styles.icon} aria-hidden="true">
          {icon}
        </div>
      )}
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

export default EmptyState;
