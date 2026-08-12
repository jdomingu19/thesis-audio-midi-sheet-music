// thesis-audio-midi-sheet-music
// @jdomingu19
// AudioList.jsx

import clsx from "clsx";
import styles from "./AudioList.module.css";
import AudioListItem from "@/components/audio-library/AudioListItem/AudioListItem";
import AudioListEmptyState from "@/components/audio-library/AudioListEmptyState/AudioListEmptyState";

/**
 * AudioList — listado dinámico de audios subidos/grabados.
 * Renderiza <AudioListItem /> por cada entrada, o <AudioListEmptyState />
 * si `items` está vacío.
 *
 * @param {Array<{
 *   id: string,
 *   name: string,
 *   duration: string,
 *   timestamp: string,
 *   status: 'ready'|'processing'|'queued'|'error',
 *   source: 'uploaded'|'recorded',
 *   errorMessage?: string,
 *   isNew?: boolean,
 * }>} items
 * @param {string | null} selectedId - id del audio actualmente seleccionado
 * @param {(id: string) => void} onSelect
 */
function AudioList({
  items = [],
  selectedId = null,
  onSelect,
  className,
  ...rest
}) {
  if (items.length === 0) {
    return <AudioListEmptyState className={className} />;
  }

  return (
    <ul className={clsx(styles.list, className)} {...rest}>
      {items.map((item) => (
        <AudioListItem
          key={item.id}
          name={item.name}
          duration={item.duration}
          timestamp={item.timestamp}
          status={item.status}
          source={item.source}
          errorMessage={item.errorMessage}
          isNew={item.isNew}
          isSelected={item.id === selectedId}
          onSelect={() => onSelect?.(item.id)}
        />
      ))}
    </ul>
  );
}

export default AudioList;
