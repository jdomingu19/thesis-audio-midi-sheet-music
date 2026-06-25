# MIDI Editor

A minimal browser-based MIDI parser and editor. Upload a `.mid` file, inspect and edit its tracks/notes in memory, then export the modified file — all client-side.

## Stack

| Layer        | Tool              |
| ------------ | ----------------- |
| Framework    | React 18 + Vite 5 |
| MIDI parsing | `@tonejs/midi`    |
| Styling      | CSS Modules       |

## Features

- Drag-and-drop or click to upload any `.mid` / `.midi` file
- Parses MIDI into a live JS object via `@tonejs/midi`
- Edit **BPM**, **time signature**, **track names**, **note pitch / time / duration / velocity**
- Export the modified MIDI as a downloadable `.mid` file
- Zero network requests — everything runs in the browser

## Dev

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

> Built with '\u{2665}' (♥) by Jesús Domínguez [@jdomingu19](https://github.com/jdomingu19/)
