// thesis-audio-midi-sheet-music
// @jdomingu19
// InstrumentSelector.jsx

import { AlertTriangle, ChevronDown, Loader2, Music2 } from "lucide-react";
import clsx from "clsx";
import styles from "./InstrumentSelector.module.css";

/**
 * InstrumentSelector — selector del instrumento de reproducción.
 * Usa un <select> nativo (accesible y cómodo en móvil) con ícono de estado:
 * cargando (spinner), listo (nota musical) o aviso (muestras no disponibles,
 * se usa el sintetizador).
 *
 * @param {Array<{ id: string, label: string, description?: string }>} instruments
 * @param {string} value - id del instrumento elegido
 * @param {(id: string) => void} onChange
 * @param {boolean} isLoading
 * @param {boolean} hasError - true si se usa el sintetizador de respaldo
 */
function InstrumentSelector({
  instruments = [],
  value,
  onChange,
  isLoading = false,
  hasError = false,
  className,
  ...rest
}) {
  const selected = instruments.find((item) => item.id === value);

  const statusText = isLoading
    ? "Cargando sonido…"
    : hasError
      ? "No se pudieron cargar las muestras; se usa el sintetizador básico."
      : (selected?.description ?? "");

  return (
    <div className={clsx(styles.wrapper, className)} {...rest}>
      <label className={clsx(styles.field, hasError && styles.warning)}>
        <span className={styles.prefix}>Sonido</span>

        <span className={styles.icon} aria-hidden="true">
          {isLoading ? (
            <Loader2 size={16} className="icon-spin" />
          ) : hasError ? (
            <AlertTriangle size={16} />
          ) : (
            <Music2 size={16} />
          )}
        </span>

        <select
          className={styles.select}
          value={value}
          onChange={(event) => onChange?.(event.target.value)}
          aria-label="Instrumento de reproducción"
          aria-busy={isLoading}
          title={statusText}
        >
          {instruments.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>

        <ChevronDown size={14} className={styles.chevron} aria-hidden="true" />
      </label>

      <span className={styles.srOnly} role="status" aria-live="polite">
        {statusText}
      </span>
    </div>
  );
}

export default InstrumentSelector;
