// thesis-audio-midi-sheet-music
// @jdomingu19
// Chip.jsx

import { X } from "lucide-react";
import clsx from "clsx";
import styles from "./Chip.module.css";

/**
 * Chip — etiqueta compacta seleccionable/removible.
 *
 * @param {React.ReactNode} icon - ícono opcional a la izquierda
 * @param {boolean} selected - estado visual activo
 * @param {boolean} disabled
 * @param {() => void} onRemove - si se provee, muestra botón de cierre (X)
 * @param {() => void} onClick - si se provee, el chip completo es clickeable
 */
function Chip({
  children,
  icon = null,
  selected = false,
  disabled = false,
  onRemove,
  onClick,
  className,
  ...rest
}) {
  const isInteractive = Boolean(onClick) && !disabled;
  const Element = isInteractive ? "button" : "span";

  return (
    <Element
      type={isInteractive ? "button" : undefined}
      onClick={isInteractive ? onClick : undefined}
      disabled={isInteractive ? disabled : undefined}
      aria-pressed={isInteractive ? selected : undefined}
      className={clsx(
        styles.chip,
        selected && styles.selected,
        disabled && styles.disabled,
        isInteractive && styles.interactive,
        className,
      )}
      {...rest}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{children}</span>
      {onRemove && (
        <button
          type="button"
          className={styles.removeButton}
          aria-label="Quitar"
          disabled={disabled}
          onClick={(event) => {
            event.stopPropagation();
            onRemove();
          }}
        >
          <X size={12} aria-hidden="true" />
        </button>
      )}
    </Element>
  );
}

export default Chip;
