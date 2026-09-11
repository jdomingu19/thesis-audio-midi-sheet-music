// thesis-audio-midi-sheet-music
// @jdomingu19
// VolumeControl.jsx

import { useState } from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import clsx from "clsx";
import styles from "./VolumeControl.module.css";
import IconButton from "@/components/ui/IconButton/IconButton";
import Slider from "@/components/ui/Slider/Slider";

function getVolumeIcon(volume, isMuted) {
  if (isMuted || volume === 0) return <VolumeX size={16} />;
  if (volume < 50) return <Volume1 size={16} />;
  return <Volume2 size={16} />;
}

/**
 * VolumeControl — control de volumen de reproducción.
 *
 * @param {number} volume - 0–100
 * @param {boolean} isMuted
 * @param {boolean} disabled
 * @param {(volume: number) => void} onChange
 * @param {() => void} onToggleMute
 */
function VolumeControl({
  volume = 80,
  isMuted = false,
  disabled = false,
  onChange,
  onToggleMute,
  className,
  ...rest
}) {
  // Fallback de estado local por si el padre no controla onToggleMute todavía.
  const [localExpanded, setLocalExpanded] = useState(false);

  return (
    <div
      className={clsx(styles.wrapper, disabled && styles.disabled, className)}
      onMouseEnter={() => setLocalExpanded(true)}
      onMouseLeave={() => setLocalExpanded(false)}
      {...rest}
    >
      <IconButton
        icon={getVolumeIcon(volume, isMuted)}
        label={isMuted ? "Activar sonido" : "Silenciar"}
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={onToggleMute}
      />

      <div
        className={clsx(styles.sliderWrapper, localExpanded && styles.expanded)}
      >
        <Slider
          value={isMuted ? 0 : volume}
          min={0}
          max={100}
          step={1}
          disabled={disabled}
          onChange={onChange}
          label="Volumen"
          className={styles.slider}
        />
      </div>
    </div>
  );
}

export default VolumeControl;
