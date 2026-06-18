# AudioClean — Browser-Based Noise Reduction Studio

A focused proof-of-concept application for testing browser-native audio noise cleaning capabilities. Built as a standalone mini-app to validate Web Audio API processing pipelines before integration into a larger audio toolchain. All signal processing runs entirely client-side — no audio data is ever sent to a server.

## Overview

AudioClean lets users upload audio files in the most common formats, apply targeted noise-reduction filters, preview results, and download the processed output — all without leaving the browser. It demonstrates that meaningful audio cleanup (white noise removal, background noise suppression, and distortion repair) is achievable using the standard Web Audio API and the `OfflineAudioContext` rendering pipeline.

## Features

| Feature                          | Description                                                                                                 |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Multi-format upload**          | Supports MP3, WAV, OGG, FLAC, AAC, M4A, OPUS, and WebM via drag-and-drop or file picker                     |
| **Dynamic audio list**           | Uploaded files appear immediately in a live list with metadata (size, duration, format)                     |
| **Clean modal**                  | Confirmation dialog lets users select which noise types to target before processing begins                  |
| **White noise removal**          | High-pass + high-shelf filter chain attenuates hiss, static, and frequency interference                     |
| **Background noise suppression** | 60 Hz notch filters and a gate-style dynamics compressor reduce room tone and electrical hum                |
| **Distortion repair**            | Soft brick-wall limiter and high-shelf cut smooth clipping artifacts and harshness                          |
| **In-browser playback**          | Play/pause toggle with animated waveform bars; switches automatically to the cleaned version when available |
| **One-click download**           | Exports the processed audio as a WAV file named with a `_cleaned` suffix                                    |
| **Non-destructive flow**         | Original audio is always preserved; cleaning produces a separate output blob                                |
| **Privacy-first processing**     | Zero network requests during processing — `OfflineAudioContext` renders everything locally                  |

## Tech Stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| Framework  | React 18                                                                   |
| Language   | JavaScript (ES2022+)                                                       |
| Build tool | Vite 6                                                                     |
| Styling    | CSS Modules                                                                |
| Runtime    | Node.js (dev server only)                                                  |
| Audio APIs | Web Audio API · `OfflineAudioContext` · MediaElement · File API · Blob API |

## Project Structure

```
audio-noise-cleaner/
├── src/
│   ├── components/
│   │   ├── Header/          # App branding and status indicator
│   │   ├── UploadZone/      # Drag-and-drop + file input with format validation
│   │   ├── AudioList/       # Dynamic list container with count and status summary
│   │   ├── AudioItem/       # Individual audio card — waveform, metadata, actions
│   │   ├── CleanModal/      # Noise-type selection dialog
│   │   └── EmptyState/      # Placeholder when no files are loaded
│   ├── hooks/
│   │   └── useAudioManager.js   # Centralized state: upload, play, process, delete
│   ├── utils/
│   │   └── audioProcessing.js   # DSP pipeline, WAV encoder, format helpers
│   ├── App.jsx
│   ├── App.module.css
│   ├── main.jsx
│   └── index.css            # Global design tokens (CSS custom properties)
├── index.html
├── vite.config.js
└── package.json
```

## Audio Processing Pipeline

Each cleaning stage is applied as a sequential node graph inside an `OfflineAudioContext`, so rendering is faster than real-time and non-blocking:

```
Source buffer
    │
    ├─ [White Noise]       HighPass(80Hz) → HighShelf(10kHz, −6dB) → LowPass(16kHz)
    │
    ├─ [Background Noise]  Notch(60Hz) → Notch(120Hz) → DynamicsCompressor(gate)
    │
    └─ [Distortion]        HighShelf(5kHz, −4dB) → DynamicsCompressor(limiter) → GainTrim(0.9)
         │
    OfflineContext destination → render → WAV encode → Blob URL
```

Processed audio is exported as 16-bit PCM WAV, encoded entirely in JavaScript using a `DataView` writer — no external encoding libraries required.

## Design System

The UI is built around a dark, minimal aesthetic using a forest-and-sage green palette.

| Token            | Value          | Role                                 |
| ---------------- | -------------- | ------------------------------------ |
| `--color-forest` | `#16423C`      | Primary brand / surface color        |
| `--color-sage`   | `#6A9C89`      | Accent, interactive states, waveform |
| `--bg-base`      | `#0B1F1C`      | App background                       |
| `--font-mono`    | JetBrains Mono | Data, filenames, labels              |
| `--font-ui`      | Inter          | Body text, buttons                   |

Responsive breakpoints: **768 px** (tablet) and **480 px** (mobile).

## Getting Started

**Prerequisites:** Node.js 18 or later.

```bash
# 1. Clone or unzip the project
cd audio-noise-cleaner

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

```bash
# Build for production
npm run build

# Preview the production build locally
npm run preview
```

## Browser Compatibility

| Feature                        | Minimum support                       |
| ------------------------------ | ------------------------------------- |
| `OfflineAudioContext`          | Chrome 35+, Firefox 25+, Safari 14.1+ |
| `AudioContext.decodeAudioData` | All modern browsers                   |
| `File.arrayBuffer()`           | Chrome 76+, Firefox 69+, Safari 14+   |
| `crypto.randomUUID()`          | Chrome 92+, Firefox 95+, Safari 15.4+ |

## Notes

- Noise reduction algorithms implemented here are DSP approximations using standard Web Audio API nodes. They are sufficient for demonstrating the concept and improving real recordings, but are not a substitute for dedicated tools like iZotope RX or Audacity's spectral repair.

- Large files (>50 MB) may take several seconds to render due to `OfflineAudioContext` CPU usage. This is expected behavior.

- Processed output is always WAV regardless of the input format, since WAV is the only format the Web Audio API can encode natively without additional codecs.

##

> Built with '\u{2665}' (♥) by Jesús Domínguez [@jdomingu19](https://github.com/jdomingu19/)
