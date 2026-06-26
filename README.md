# Thesis Audio Midi Sheet Music

![Static Badge](https://img.shields.io/badge/react-18+-1C2024?style=for-the-badge&logo=react&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/javascript-ES6+-1C2024?style=for-the-badge&logo=javascript&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/node.js-20+-1C2024?style=for-the-badge&logo=node.js&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/HTML-HTML5+-1C2024?style=for-the-badge&logo=html5&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/css-css3+-1C2024?style=for-the-badge&logo=css&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/vite-7+-1C2024?style=for-the-badge&logo=vite&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/babel-7.27+-1C2024?style=for-the-badge&logo=babel&logoColor=white&labelColor=101010)
![Static Badge](https://img.shields.io/badge/claude-sonnet-1C2024?style=for-the-badge&logo=claude&logoColor=white&labelColor=101010)

Lorem elit officia excepteur sint occaecat qui cupidatat ipsum. Eu irure incididunt irure nulla voluptate aute. Velit aliquip in aliqua mollit nostrud. Aliqua commodo laboris enim eu occaecat adipisicing minim adipisicing sint cillum voluptate laboris ipsum exercitation. Lorem ad minim minim elit ipsum. Enim consectetur laboris cillum duis est ex adipisicing incididunt irure.

> Dolor voluptate veniam in amet tempor mollit incididunt. Aliqua id anim sunt reprehenderit pariatur. Ut duis adipisicing ut eiusmod qui sit ipsum Lorem adipisicing nostrud velit in consectetur.

## 🎼 Functional Testing Modules

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

- [Testing Thesis JSON to MusicXML](https://thesis-json-to-musicxml.netlify.app/)  
  Eu mollit incididunt commodo exercitation cupidatat aliqua labore exercitation consectetur elit magna. Ea laboris ex cillum labore minim enim nostrud voluptate dolore amet qui. Commodo ut reprehenderit velit nulla quis commodo veniam fugiat eu anim et nostrud laborum.

### Free Online MIDI Tools

- [MIDI Toolbox](https://miditoolbox.com/player)  
  A free browser‑based platform to visualize and interact with MIDI files on a virtual piano. It allows you to upload `.mid` tracks and see them rendered in real time as keys are played, making it useful for practice, analysis, or demonstration. Beyond playback, MIDI Toolbox also provides utilities for editing, transposing, and manipulating MIDI data directly in the browser, offering a lightweight alternative to desktop DAWs for quick experimentation.

## ⚖️ License

This repository is licensed under the terms of the [Apache License 2.0](LICENSE). The license grants permission to use, modify, and distribute the code with proper attribution, while ensuring that improvements and extensions remain open and accessible to the community.

##

> Built with '\u{2665}' (♥) by Jesús Domínguez [@jdomingu19](https://github.com/jdomingu19/)
