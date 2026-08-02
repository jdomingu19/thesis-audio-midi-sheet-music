# Basic Pitch Server Folder

This folder contains a local Python backend built with **FastAPI** and integrated with **Spotify’s Basic Pitch** model for audio‑to‑MIDI conversion. It exposes endpoints for health checks and audio processing, returning raw MIDI data that can be consumed by client applications. The server includes validation for file type, size, and naming, and uses a service wrapper to manage temporary files and error handling. CORS middleware is configured to allow requests from local React/Vite frontends, enabling seamless testing and integration.

The backend is designed for academic and prototyping use cases, providing a reproducible pipeline:

- Upload audio files (`.wav`, `.mp3`, `.webm`)
- Convert audio to MIDI using Basic Pitch (ONNX inference)
- Return MIDI bytes with proper headers for download or further processing

To start the server locally:

```bash
source venv/Scripts/activate
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

> Built with '\u{2665}' (♥) by Jesús Domínguez [@jdomingu19](https://github.com/jdomingu19/)
