// thesis-audio-midi-sheet-music
// @jdomingu19
// RecordingWaveform.jsx

import clsx from "clsx";
import styles from "./RecordingWaveform.module.css";

const DEFAULT_BAR_COUNT = 32;

// Amplitudes mock (0–1) para poblar visualmente la onda sin audio real todavía.
function buildMockAmplitudes(count) {
  return Array.from({ length: count }, (_, index) => {
    const wave = Math.sin(index * 0.6) * 0.5 + 0.5;
    return Math.max(0.15, wave);
  });
}

/**
 * RecordingWaveform — representación visual de onda mientras se graba.
 * En esta fase usa datos mock/estáticos con animación `waveform` vía CSS
 * cuando isActive=true.
 *
 * @param {boolean} isActive - si la grabación está en curso (activa animación)
 * @param {number} barCount
 */
function RecordingWaveform({
  isActive = false,
  barCount = DEFAULT_BAR_COUNT,
  className,
  ...rest
}) {
  const amplitudes = buildMockAmplitudes(barCount);

  return (
    <div
      className={clsx(styles.waveform, isActive && styles.active, className)}
      role="img"
      aria-label={
        isActive
          ? "Visualización de onda en vivo"
          : "Visualización de onda en pausa"
      }
      {...rest}
    >
      {amplitudes.map((amplitude, index) => (
        <span
          key={index}
          className={styles.bar}
          style={{
            "--bar-amplitude": amplitude,
            "--bar-index": index,
          }}
        />
      ))}
    </div>
  );
}

export default RecordingWaveform;
