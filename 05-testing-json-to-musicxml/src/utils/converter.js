// src/utils/converter.js

export function toneJsonToMusicXml(midiJson) {
  if (!midiJson || !midiJson.tracks || midiJson.tracks.length === 0) {
    throw new Error("Formato JSON inválido o sin pistas.");
  }

  // Extraer información global
  const ppq = midiJson.header.ppq || 220;
  // Tomamos la primera pista con notas para simplificar
  const track =
    midiJson.tracks.find((t) => t.notes && t.notes.length > 0) ||
    midiJson.tracks[0];
  const notes = track.notes || [];

  // Ordenar notas por tiempo (ticks) para identificar acordes
  notes.sort((a, b) => a.ticks - b.ticks);

  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n`;
  xml += `<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n`;
  xml += `<score-partwise version="4.0">\n`;

  // Lista de partes (Instrumentos)
  xml += `  <part-list>\n`;
  xml += `    <score-part id="P1">\n`;
  xml += `      <part-name>${track.instrument?.name || "Piano"}</part-name>\n`;
  xml += `    </score-part>\n`;
  xml += `  </part-list>\n`;

  // Inicio de la partitura
  xml += `  <part id="P1">\n`;

  // Para simplificar, agrupamos todo en un gran compás.
  // Un renderizador de partituras (como VexFlow o MuseScore) ajustará el flujo (reflow).
  xml += `    <measure number="1">\n`;
  xml += `      <attributes>\n`;
  xml += `        <divisions>${ppq}</divisions>\n`;
  xml += `        <clef>\n`;
  xml += `          <sign>G</sign>\n`;
  xml += `          <line>2</line>\n`;
  xml += `        </clef>\n`;
  xml += `      </attributes>\n`;

  let lastTick = -1;

  notes.forEach((note) => {
    // Analizar el nombre de la nota de Tone.js (ej. "C#4", "Bb3", "A2")
    const match = note.name.match(/^([A-G])([#b]?)(\d+)$/);
    if (!match) return;

    const step = match[1];
    const alterSign = match[2];
    const octave = match[3];

    let alter = 0;
    if (alterSign === "#") alter = 1;
    if (alterSign === "b") alter = -1;

    // Detectar si es un acorde (misma posición de inicio en ticks)
    const isChord = lastTick === note.ticks;
    lastTick = note.ticks;

    xml += `      <note>\n`;
    if (isChord) {
      xml += `        <chord/>\n`;
    }
    xml += `        <pitch>\n`;
    xml += `          <step>${step}</step>\n`;
    if (alter !== 0) xml += `          <alter>${alter}</alter>\n`;
    xml += `          <octave>${octave}</octave>\n`;
    xml += `        </pitch>\n`;
    xml += `        <duration>${Math.round(note.durationTicks)}</duration>\n`;
    xml += `      </note>\n`;
  });

  xml += `    </measure>\n`;
  xml += `  </part>\n`;
  xml += `</score-partwise>`;

  return xml;
}
