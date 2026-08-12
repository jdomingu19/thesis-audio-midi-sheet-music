// thesis-audio-midi-sheet-music
// @jdomingu19
// AudioListItem.jsx

import { UploadCloud, Mic, AlertCircle } from "lucide-react";
import clsx from "clsx";
import styles from "./AudioListItem.module.css";
import AudioStatusBadge from "@/components/audio-library/AudioStatusBadge/AudioStatusBadge";
import Tooltip from "@/components/ui/Tooltip/Tooltip";

/**
 * AudioListItem — item individual de la biblioteca de audios.
 *
 * @param {string} name - nombre de archivo
 * @param {string} duration - duración mock (ej. "02:14")
 * @param {string} timestamp - fecha/hora mock (ej. "hace 3 min")
 * @param {'ready'|'processing'|'queued'|'error'} status
 * @param {'uploaded'|'recorded'} source - tipo de origen del audio
 * @param {string | null} errorMessage - mensaje corto de error mock (tooltip)
 * @param {boolean} isSelected - item activo, sincronizado con ViewerPanel
 * @param {boolean} isNew - aplica animación de entrada `rise-in`
 * @param {() => void} onSelect
 */
function AudioListItem({
  name,
  duration,
  timestamp,
  status = "queued",
  source = "uploaded",
  errorMessage = null,
  isSelected = false,
  isNew = false,
  onSelect,
  className,
  ...rest
}) {
  const SourceIcon = source === "recorded" ? Mic : UploadCloud;

  return (
    <li
      className={clsx(
        styles.item,
        isSelected && styles.selected,
        isNew && styles.riseIn,
        className,
      )}
      {...rest}
    >
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={isSelected}
        className={styles.itemButton}
      >
        <span className={styles.sourceIcon} aria-hidden="true">
          <SourceIcon size={16} />
        </span>

        <span className={styles.info}>
          <span className={styles.name}>{name}</span>
          <span className={styles.meta}>
            <span className={styles.duration}>{duration}</span>
            <span className={styles.dotSeparator} aria-hidden="true">
              ·
            </span>
            <span className={styles.timestamp}>{timestamp}</span>
          </span>
        </span>

        <span className={styles.statusArea}>
          {status === "error" && errorMessage ? (
            <Tooltip content={errorMessage} placement="left">
              <span className={styles.errorIconWrapper} aria-hidden="true">
                <AlertCircle size={14} />
              </span>
            </Tooltip>
          ) : null}
          <AudioStatusBadge status={status} />
        </span>
      </button>
    </li>
  );
}

export default AudioListItem;
