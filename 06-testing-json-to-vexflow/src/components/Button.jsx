// thesis-audio-midi-sheet-music
// @jdomingu19
// Button.jsx

import s from "./Button.module.css";

export function Button({
  variant = "primary",
  className = "",
  handleFunction,
  disabled = false,
  children,
}) {
  return (
    <button
      type="button"
      className={`${s.btn} ${s[variant]} ${className}`}
      onClick={handleFunction}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
