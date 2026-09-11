// thesis-audio-midi-sheet-music
// @jdomingu19
// AudioListEmptyState.jsx

import { AudioLines } from "lucide-react";
import clsx from "clsx";
import styles from "./AudioListEmptyState.module.css";
import EmptyState from "@/components/ui/EmptyState/EmptyState";

/**
 * AudioListEmptyState — placeholder cuando no hay audios aún en la biblioteca.
 * Envoltura semántica sobre <EmptyState /> con contenido predefinido para
 * este contexto específico.
 */
function AudioListEmptyState({ className, ...rest }) {
  return (
    <EmptyState
      icon={<AudioLines size={32} />}
      title="Aún no hay audios"
      description="Sube un archivo o graba desde el navegador para empezar."
      className={clsx(styles.wrapper, className)}
      {...rest}
    />
  );
}

export default AudioListEmptyState;
