// thesis-audio-midi-sheet-music
// @jdomingu19
// VolumeControl.jsx

import { useEffect, useId, useRef, useState } from "react";
import { Volume2, Volume1, VolumeX } from "lucide-react";
import clsx from "clsx";
import styles from "./VolumeControl.module.css";
import IconButton from "@/components/ui/IconButton/IconButton";
import Slider from "@/components/ui/Slider/Slider";
import { useMediaQuery } from "@/hooks/useMediaQuery";

function getVolumeIcon(volume, isMuted, size = 16) {
  if (isMuted || volume === 0) return <VolumeX size={size} />;
  if (volume < 50) return <Volume1 size={size} />;
  return <Volume2 size={size} />;
}

/**
 * VolumeControl — control de volumen responsivo.
 * - Desktop (>= 1200px): ícono + slider horizontal que se expande al hover/foco.
 * - Tablet (768–1199px): ícono + slider horizontal corto siempre visible.
 * - Mobile (< 768px): ícono que abre una barra VERTICAL emergente hacia arriba,
 *   con botón de silenciar.
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
  const isCompact = useMediaQuery("(max-width: 767px)");
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const popoverId = useId();

  const isPopoverOpen = isCompact && isOpen && !disabled;

  // Cierre del popover: toque fuera o Escape
  useEffect(() => {
    if (!isPopoverOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!wrapperRef.current?.contains(event.target)) setIsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPopoverOpen]);

  const muteLabel = isMuted ? "Activar sonido" : "Silenciar";

  return (
    <div
      ref={wrapperRef}
      className={clsx(styles.wrapper, disabled && styles.disabled, className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...rest}
    >
      <IconButton
        icon={getVolumeIcon(volume, isMuted, isCompact ? 18 : 16)}
        label={isCompact ? "Volumen" : muteLabel}
        variant="ghost"
        size={isCompact ? "md" : "sm"}
        disabled={disabled}
        onClick={isCompact ? () => setIsOpen((open) => !open) : onToggleMute}
        aria-haspopup={isCompact ? "true" : undefined}
        aria-expanded={isCompact ? isPopoverOpen : undefined}
        aria-controls={isCompact ? popoverId : undefined}
      />

      <div
        id={popoverId}
        className={clsx(
          styles.sliderWrapper,
          isHovered && styles.expanded,
          isPopoverOpen && styles.open,
        )}
      >
        <div className={styles.sliderBox}>
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

        {isCompact && (
          <IconButton
            icon={getVolumeIcon(volume, isMuted, 16)}
            label={muteLabel}
            variant="ghost"
            size="sm"
            onClick={onToggleMute}
            tabIndex={isPopoverOpen ? 0 : -1}
          />
        )}
      </div>
    </div>
  );
}

export default VolumeControl;
