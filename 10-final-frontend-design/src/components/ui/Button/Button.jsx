// thesis-audio-midi-sheet-music
// @jdomingu19
// Button.jsx

import { forwardRef } from "react";
import clsx from "clsx";
import styles from "./Button.module.css";
import Spinner from "@/components/ui/Spinner/Spinner";

/**
 * Button — primitivo de acción genérico.
 *
 * @param {'primary'|'secondary'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {React.ReactNode} leftIcon - ícono (componente Lucide) a la izquierda del label
 * @param {React.ReactNode} rightIcon - ícono (componente Lucide) a la derecha del label
 * @param {boolean} isLoading - muestra Spinner y deshabilita el botón
 * @param {boolean} disabled
 * @param {boolean} fullWidth
 * @param {'button'|'submit'|'reset'} type
 */
const Button = forwardRef(function Button(
  {
    children,
    variant = "primary",
    size = "md",
    leftIcon = null,
    rightIcon = null,
    isLoading = false,
    disabled = false,
    fullWidth = false,
    type = "button",
    className,
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={clsx(
        styles.button,
        styles[`variant-${variant}`],
        styles[`size-${size}`],
        fullWidth && styles.fullWidth,
        isLoading && styles.isLoading,
        className,
      )}
      {...rest}
    >
      {isLoading && (
        <Spinner size="sm" className={styles.spinner} label="Cargando" />
      )}
      {!isLoading && leftIcon && (
        <span className={styles.icon} aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className={styles.label}>{children}</span>
      {!isLoading && rightIcon && (
        <span className={styles.icon} aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  );
});

export default Button;
