// Thesis Audio to MIDI & Sheet Music
// Testing VexFlow @jdomingu19
// src/components/Button.jsx

export function Button({ className = "", handleFunction, children }) {
  return (
    <button className={className} onClick={handleFunction}>
      {children}
    </button>
  );
}
