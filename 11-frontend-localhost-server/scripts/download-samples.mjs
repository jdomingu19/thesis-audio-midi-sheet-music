// thesis-audio-midi-sheet-music
// @jdomingu19
// download-samples.mjs

/**
 * Descarga las muestras de audio de los instrumentos a public/samples/<folder>/
 * para que la app funcione sin internet (defensa en vivo).
 *
 *   npm run samples                  -> todos los instrumentos
 *   npm run samples -- grand-piano   -> solo los ids indicados
 */

import { mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { INSTRUMENTS } from "../src/data/instruments.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(root, "public", "samples");
const onlyIds = process.argv.slice(2);
const CONCURRENCY = 6;

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function download(url, file) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  await writeFile(file, Buffer.from(await response.arrayBuffer()));
}

const targets = INSTRUMENTS.filter(
  (item) =>
    item.kind === "sampler" && (!onlyIds.length || onlyIds.includes(item.id)),
);

let failed = 0;

for (const instrument of targets) {
  const directory = path.join(outputRoot, instrument.folder);
  await mkdir(directory, { recursive: true });
  console.log(`\n▸ ${instrument.label} (${instrument.notes.length} muestras)`);

  for (let i = 0; i < instrument.notes.length; i += CONCURRENCY) {
    const batch = instrument.notes.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async (stem) => {
        const file = path.join(directory, `${stem}.mp3`);
        if (await exists(file)) return;
        try {
          await download(`${instrument.downloadBase}${stem}.mp3`, file);
        } catch (error) {
          failed += 1;
          console.error(`  ✗ ${stem}: ${error.message}`);
        }
      }),
    );
  }
  console.log("  ✓ listo");
}

if (failed) {
  console.error(
    `\n${failed} archivo(s) fallaron. Vuelve a ejecutar el script.`,
  );
  process.exit(1);
}
console.log("\nMuestras descargadas en public/samples/");
