# Thesis Audio Midi Sheet Music

![Static Badge](https://img.shields.io/badge/react-18+-1C2024?style=for-the-badge&logo=react&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/javascript-ES6+-1C2024?style=for-the-badge&logo=javascript&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/node.js-20+-1C2024?style=for-the-badge&logo=node.js&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/HTML-HTML5+-1C2024?style=for-the-badge&logo=html5&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/css-css3+-1C2024?style=for-the-badge&logo=css&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/vite-7+-1C2024?style=for-the-badge&logo=vite&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/babel-7.27+-1C2024?style=for-the-badge&logo=babel&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/gemini-pro-1C2024?style=for-the-badge&logo=googlegemini&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/claude-sonnet-1C2024?style=for-the-badge&logo=claude&logoColor=white&labelColor=101010)

This repository demonstrates a complete academic pipeline for transforming audio recordings into interactive musical representations. It combines modern web technologies with audio‑to‑MIDI inference and client‑side visualization, enabling reproducible experiments and modular testing environments. Each module validates a specific stage of the workflow, from capturing audio to rendering sheet music and piano rolls, ensuring clarity, accessibility, and technical rigor.

> The project affirms the following goals:
>
> - Provide isolated test apps for each functionality to guarantee reproducibility.
> - Integrate **Spotify’s Basic Pitch** model via a local FastAPI backend for audio‑to‑MIDI conversion.
> - Use **Tone.js** to parse and transform MIDI into JSON for client‑side editing.
> - Render professional sheet music with **VexFlow** and export to PDF.
> - Visualize MIDI interactively with a **falling‑notes piano roll player**.
> - Maintain a clean, modular architecture with responsive design and accessible documentation.

## Functional Testing Modules

This repository contains isolated test environments for each core functionality of the thesis project.

Every module is deployed independently to validate specific workflows before integration into the final MVP.

- [Testing Thesis Audio Recording](https://thesis-audio-recording.netlify.app/)  
  Mini React + Vite app that captures microphone input using the MediaRecorder API, visualizes real‑time waveforms, and manages recording states with playback and download options.

- [Testing Thesis Audio Upload](https://thesis-audio-upload.netlify.app/)  
  Upload interface with drag‑and‑drop zone, dynamic audio list, and format‑specific badges (MP3, WAV, OGG, FLAC, AAC, WebM, M4A). Designed with responsive UI and animated feedback.

- [Testing Thesis Audio Cleaning](https://thesis-audio-cleaning.netlify.app/)  
  Proof‑of‑concept app for browser‑based noise reduction. Uses the Web Audio API and `OfflineAudioContext` to apply filters for white noise removal, background noise suppression, and distortion repair. Provides in‑browser playback, non‑destructive processing, and one‑click download of cleaned WAV files.

- [Testing Thesis MIDI to JSON](https://thesis-midi-to-json.netlify.app/)  
  Minimal browser‑based MIDI parser and editor built with React + Vite. Uses `@tonejs/midi` to convert `.mid` files into live JavaScript objects, enabling in‑memory editing of BPM, time signature, track names, and note properties (pitch, duration, velocity). Supports drag‑and‑drop upload and exports the modified file back to `.mid` format — all client‑side with zero network requests.

- [Testing Thesis VexFlow](https://thesis-vexflow.netlify.app/)  
  Interactive React + Vite app showcasing VexFlow’s engraving engine for music notation and tablature. Includes modular examples (staves, notes, beams, ties, modifiers, guitar tabs, barlines) with a unified white‑background theme. Features a reusable **Download PDF** button powered by native browser print APIs, ensuring correct rendering of Bravura and Academico fonts without external libraries.

- [Testing Thesis JSON to VexFlow](https://thesis-json-to-vexflow.netlify.app/)  
  React + Vite mini‑app that demonstrates the transformation of `.json` files exported from **Tone.js MIDI parsing** into engraved sheet music using **VexFlow**. Implements the `jsonToVexflowMeasures` algorithm to handle quantization, chords, rests, and basic durations, simplifying polyphony into a single voice per rhythmic slot. The app supports tonal key detection via the Krumhansl‑Kessler correlation algorithm, rendering accurate key signatures alongside staves. Features include a file upload interface, dynamic stave layout with multiple measures per line, explicit accidental handling, and a reusable **Download PDF** button for exporting clean, correctly formatted sheet music. Designed as a proof‑of‑concept for bridging MIDI data structures with professional notation rendering in the browser.

- [Testing Thesis Fetching Local Backend](https://thesis-fetching-local-backend.netlify.app/)  
  React + Vite mini‑app designed to test integration with the local FastAPI backend powered by Spotify’s Basic Pitch model. Provides an **UploadZone** with drag‑and‑drop support, format validation, and error banners, as well as an **AudioRecorder** with waveform visualization and playback controls. Each audio item can be converted individually, with the resulting MIDI available for download. Includes a backend connection status indicator and a dark forest‑green themed UI for end‑to‑end pipeline validation.

- [Testing Piano Roll JSON Player](https://thesis-piano-json-player.netlify.app/)  
  Experimental React + Vite app implementing a canvas‑based falling‑notes piano roll synchronized with a rendered keyboard. Accepts `.json` files exported from Tone.js, validates track format, and visualizes notes with per‑track colors. Features playback via Tone.js PolySynth, transport controls (play, pause, stop, seek), and responsive design with custom typography and dark palette. Built to demonstrate interactive MIDI visualization and extend the thesis pipeline beyond static sheet music.

- [Testing Final Frontend Design](https://thesis-final-frontend.netlify.app/)  
  React + Vite scaffold for the **final thesis frontend**, consolidating the design system established in earlier prototypes. Includes a progressive architecture guide (`frontend-architecture-guide.md`) detailing folder structure, responsive strategy, design tokens, and UI states. Provides the initial set of 10 reusable UI primitives (Button, Badge, Tabs, Modal, Tooltip, etc.), each implemented as pure `.jsx` components with predictable class naming patterns for future `.module.css` styling. This deployment validates the foundation of the frontend design system before integrating business logic, ensuring modularity, consistency, and scalability across the thesis project.

### Free Online MIDI Tools

- [MIDI Toolbox](https://miditoolbox.com/player)  
  A free browser‑based platform to visualize and interact with MIDI files on a virtual piano. It allows you to upload `.mid` tracks and see them rendered in real time as keys are played, making it useful for practice, analysis, or demonstration. Beyond playback, MIDI Toolbox also provides utilities for editing, transposing, and manipulating MIDI data directly in the browser, offering a lightweight alternative to desktop DAWs for quick experimentation.

- [WaveRoll [ISMIR 2025 LBD]](https://github.com/crescent-stdio/wave-roll)  
  WaveRoll is an interactive JavaScript library that enables comparative visualization and synchronized playback of multiple MIDI piano rolls on a browser.

## ⚖️ License

This repository is licensed under the terms of the [Apache License 2.0](LICENSE). The license grants permission to use, modify, and distribute the code with proper attribution, while ensuring that improvements and extensions remain open and accessible to the community.

##

> Built with '\u{2665}' (♥) by Jesús Domínguez [@jdomingu19](https://github.com/jdomingu19/)
