// thesis-audio-midi-sheet-music
// @jdomingu19
// Slider.jsx

import { useId } from "react";
import clsx from "clsx";
import styles from "./Slider.module.css";

/**
 * Slider — control deslizante genérico (usado en volumen y seek de playback).
 *
 * @param {number} value
 * @param {(value: number) => void} onChange
 * @param {number} min
 * @param {number} max
 * @param {number} step
 * @param {boolean} disabled
 * @param {string} label - texto accesible (aria-label), ej. "Volumen" o "Progreso de reproducción"
 * @param {(value: number) => string} formatValue - formatea el valor mostrado (ej. mm:ss)
 */
function Slider({
  value = 0,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  label,
  formatValue,
  showValue = false,
  className,
  ...rest
}) {
  const inputId = useId();
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div
      className={clsx(styles.wrapper, disabled && styles.disabled, className)}
    >
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.trackWrapper}>
        <div className={styles.trackFill} style={{ width: `${percentage}%` }} />
        <input
          id={inputId}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange?.(Number(event.target.value))}
          className={styles.input}
          {...rest}
        />
      </div>
      {showValue && (
        <span className={styles.value}>
          {formatValue ? formatValue(value) : value}
        </span>
      )}
    </div>
  );
}

export default Slider;
