// thesis-audio-midi-sheet-music
// @jdomingu19
// Topbar.jsx

import clsx from "clsx";
import styles from "./Topbar.module.css";

/**
 * Topbar — barra superior de identidad del proyecto.
 *   [ marca: ícono · título · subtítulo ]  [ etiqueta del proyecto ]  [ estado · firma ]
 *
 * @param {React.ReactNode} logo - ícono de marca
 * @param {string} title - nombre del proyecto (ej. "Armonía")
 * @param {string} subtitle - descriptor corto (ej. "Audio a MIDI & Partituras")
 * @param {string} projectLabel - etiqueta académica (ej. "MIR Project")
 * @param {string} projectDetail - detalle de la etiqueta (oculto en tablet)
 * @param {string} signature - firma (ej. "@jdomingu19")
 * @param {string} signatureHref - enlace de la firma
 * @param {React.ReactNode} actions - slot derecho (ej. estado del servidor)
 */
function Topbar({
  logo,
  title,
  subtitle,
  projectLabel,
  projectDetail,
  signature,
  signatureHref,
  actions,
  className,
  ...rest
}) {
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

      {projectLabel && (
        <div className={styles.project}>
          <span className={styles.projectDot} aria-hidden="true" />
          <span className={styles.projectLabel}>{projectLabel}</span>
          {projectDetail && (
            <>
              <span className={styles.projectSeparator} aria-hidden="true">
                ·
              </span>
              <span className={styles.projectDetail}>{projectDetail}</span>
            </>
          )}
        </div>
      )}

      {(actions || signature) && (
        <div className={styles.aside}>
          {actions}
          {signature &&
            (signatureHref ? (
              <a
                href={signatureHref}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.signature}
              >
                {signature}
              </a>
            ) : (
              <span className={styles.signature}>{signature}</span>
            ))}
        </div>
      )}
    </div>
  );
}

export default Topbar;
