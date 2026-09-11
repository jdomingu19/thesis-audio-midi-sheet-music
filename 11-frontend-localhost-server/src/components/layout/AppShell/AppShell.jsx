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
 * Áreas: topbar | inputPanel (entrada + biblioteca) | viewerPanel | bottomBar
 *
 * @param {React.ReactNode} topbar - slot para <Topbar />
 * @param {React.ReactNode} inputPanel - slot columna izquierda (UploadDropzone, RecordControl, AudioList)
 * @param {React.ReactNode} viewerPanel - slot columna derecha (<ViewerPanel />)
 * @param {React.ReactNode} bottomBar - slot barra inferior fija (PlaybackTransport + DownloadBar)
 */
function AppShell({
  topbar,
  inputPanel,
  viewerPanel,
  bottomBar,
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

      <footer className={styles.bottomBar}>{bottomBar}</footer>
    </div>
  );
}

export default AppShell;
