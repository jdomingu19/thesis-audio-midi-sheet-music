// thesis-audio-midi-sheet-music
// @jdomingu19
// IconButton.jsx

import { forwardRef } from "react";
import clsx from "clsx";
import styles from "./IconButton.module.css";

/**
 * IconButton — botón circular/cuadrado de solo ícono.
 *
 * @param {React.ReactNode} icon - componente de ícono (Lucide)
 * @param {string} label - texto accesible obligatorio (aria-label)
 * @param {'default'|'primary'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} active - estado visual "presionado/activo" (ej. tab seleccionado)
 * @param {boolean} disabled
 */
const IconButton = forwardRef(function IconButton(
  {
    icon,
    label,
    variant = "default",
    size = "md",
    active = false,
    disabled = false,
    type = "button",
    className,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active || undefined}
      title={label}
      className={clsx(
        styles.iconButton,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        active && styles.active,
        className,
      )}
      {...rest}
    >
      <span className={styles.iconWrapper} aria-hidden="true">
        {icon}
      </span>
    </button>
  );
});

export default IconButton;
