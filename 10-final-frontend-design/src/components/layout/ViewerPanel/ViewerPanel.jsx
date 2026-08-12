// thesis-audio-midi-sheet-music
// @jdomingu19
// ViewerPanel.jsx

import { Music4, FileMusic } from "lucide-react";
import clsx from "clsx";
import styles from "./ViewerPanel.module.css";
import Tabs from "@/components/ui/Tabs/Tabs";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

const VIEWER_TABS = [
  { value: "piano-roll", label: "Piano Roll", icon: <Music4 size={16} /> },
  { value: "sheet-music", label: "Sheet Music", icon: <FileMusic size={16} /> },
];

/**
 * ViewerPanel — panel principal derecho. Alterna entre Piano Roll y Sheet Music
 * mediante <Tabs />. Si no hay audio seleccionado, muestra un <EmptyState />.
 *
 * @param {boolean} hasSelection - si hay un audio activo seleccionado en la biblioteca
 * @param {'piano-roll'|'sheet-music'} activeTab
 * @param {(value: string) => void} onTabChange
 * @param {React.ReactNode} pianoRollContent - contenido de <PianoRollView />
 * @param {React.ReactNode} sheetMusicContent - contenido de <SheetMusicView />
 */
function ViewerPanel({
  hasSelection = false,
  activeTab = "piano-roll",
  onTabChange,
  pianoRollContent,
  sheetMusicContent,
  className,
  ...rest
}) {
  return (
    <div className={clsx(styles.viewerPanel, className)} {...rest}>
      {!hasSelection && (
        <EmptyState
          icon={<Music4 size={32} />}
          title="Selecciona un audio"
          description="Elige un audio de la biblioteca para ver su Piano Roll o su partitura."
          className={styles.emptyState}
        />
      )}

      {hasSelection && (
        <Tabs value={activeTab} onChange={onTabChange} className={styles.tabs}>
          <Tabs.List className={styles.tabsList}>
            {VIEWER_TABS.map((tab) => (
              <Tabs.Tab
                key={tab.value}
                value={tab.value}
                className={styles.tab}
              >
                <span className={styles.tabIcon} aria-hidden="true">
                  {tab.icon}
                </span>
                {tab.label}
              </Tabs.Tab>
            ))}
          </Tabs.List>

          <Tabs.Panels className={styles.panels}>
            <Tabs.Panel value="piano-roll" className={styles.panel}>
              {pianoRollContent}
            </Tabs.Panel>
            <Tabs.Panel value="sheet-music" className={styles.panel}>
              {sheetMusicContent}
            </Tabs.Panel>
          </Tabs.Panels>
        </Tabs>
      )}
    </div>
  );
}

export default ViewerPanel;
