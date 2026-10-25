// thesis-audio-midi-sheet-music
// @jdomingu19
// AppShell.jsx

import clsx from "clsx";
import styles from "./AppShell.module.css";

/**
 * AppShell — wrapper raíz de la app. Define el grid de layout responsive
 * mediante áreas nombradas (CSS Grid + media queries en el .module.css,
 * sin JS de detección de breakpoint).
 *
 * Áreas: topbar | inputPanel | viewerPanel | bottomBar | footer
 *
 * @param {React.ReactNode} topbar - slot para <Topbar />
 * @param {React.ReactNode} inputPanel - columna izquierda (entrada + biblioteca)
 * @param {React.ReactNode} viewerPanel - zona del visor (<ViewerPanel />)
 * @param {React.ReactNode} bottomBar - barra fija de reproducción + descargas
 * @param {React.ReactNode} footer - pie informativo al final del scroll
 */
function AppShell({
  topbar,
  inputPanel,
  viewerPanel,
  bottomBar,
  footer,
  className,
  ...rest
}) {
  return (
    <div className={clsx(styles.shell, className)} {...rest}>
      <header className={styles.topbar}>{topbar}</header>

      <aside
        className={styles.inputPanel}
        aria-label="Panel de entrada y biblioteca de audios"
      >
        {inputPanel}
      </aside>

      <main className={styles.viewerPanel} aria-label="Panel de visualización">
        {viewerPanel}
      </main>

      <div
        className={styles.bottomBar}
        role="region"
        aria-label="Reproducción y descargas"
      >
        {bottomBar}
      </div>

      {footer && <footer className={styles.footer}>{footer}</footer>}
    </div>
  );
}

export default AppShell;
