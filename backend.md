# Basic Pitch Backend

A lightweight, local-first REST service that transcribes audio into MIDI. It wraps Spotify's [Basic Pitch](https://github.com/spotify/basic-pitch) model behind a [FastAPI](https://fastapi.tiangolo.com/) interface and runs inference through [ONNX Runtime](https://onnxruntime.ai/).

Developed as the transcription layer of the thesis project _Armonía_ (audio → MIDI → sheet music).

---

## Overview

```
audio file ──▶ validation ──▶ FFmpeg normalization ──▶ Basic Pitch ──▶ MIDI bytes
 (multipart)   (type, size)    (WAV, mono, 22.05 kHz)    (inference)    (audio/midi)
```

| Stage             | Description                                                                                                                                  |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Validation**    | Rejects unsupported extensions, empty files and files above the size limit.                                                                  |
| **Normalization** | Any input is converted to PCM 16-bit mono WAV at 22,050 Hz using the FFmpeg binary bundled by `imageio-ffmpeg` (no system install required). |
| **Inference**     | Basic Pitch predicts frame-level pitch activations and note events.                                                                          |
| **Serialization** | Note events are written as a standard MIDI file and returned as raw bytes.                                                                   |
| **Cleanup**       | Temporary files are always removed, including on failure.                                                                                    |

---

## Features

- **Polyphonic, instrument-agnostic transcription** based on Basic Pitch.
- **Format-tolerant input:** `.wav`, `.mp3`, `.m4a`, `.flac`, `.ogg`, `.webm` (the last one covers browser `MediaRecorder` output).
- **Self-contained:** FFmpeg is shipped inside the virtual environment.
- **Consistent error contract:** every failure returns JSON of the form `{ "error": true, "message": "..." }`.
- **Interactive API documentation** generated automatically at `/docs` (OpenAPI).
- **CORS preconfigured** for local Vite frontends.

---

## Why this stack

| Choice                  | Rationale                                                                                                                                                                                                                         |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Basic Pitch**         | A lightweight model (under 17 K parameters in the original paper) that performs polyphonic note transcription and pitch-bend detection on any instrument, with accuracy competitive with larger, instrument-specific systems [1]. |
| **ONNX Runtime**        | A portable, hardware-agnostic inference engine that runs efficiently on commodity CPUs, which suits a live thesis defense on a laptop [2].                                                                                        |
| **FastAPI**             | Type-driven request handling, native async I/O and automatic OpenAPI documentation with minimal boilerplate [3].                                                                                                                  |
| **Local execution**     | No network dependency, no data leaves the machine, and latency is predictable during demonstrations.                                                                                                                              |
| **Pinned dependencies** | A fully frozen `requirements.txt` makes the environment reproducible, which matters for academic work.                                                                                                                            |

---

## Requirements

- Python **3.10 or 3.11** (constrained by TensorFlow 2.15, a transitive requirement of `basic-pitch`)
- `pip` and `venv`

### Pinned versions (excerpt from `requirements.txt`)

| Package            | Version | Role                                   |
| ------------------ | ------- | -------------------------------------- |
| `basic-pitch`      | 0.4.0   | Transcription model and inference API  |
| `onnxruntime`      | 1.27.0  | ONNX inference engine                  |
| `fastapi`          | 0.139.2 | HTTP framework                         |
| `uvicorn`          | 0.51.0  | ASGI server                            |
| `starlette`        | 1.3.1   | ASGI toolkit (FastAPI dependency)      |
| `pydantic`         | 2.13.4  | Data validation                        |
| `python-multipart` | 0.0.32  | Multipart file uploads                 |
| `imageio-ffmpeg`   | 0.6.0   | Bundled FFmpeg binary                  |
| `pretty_midi`      | 0.2.11  | MIDI object model and serialization    |
| `librosa`          | 0.11.0  | Audio analysis utilities               |
| `numpy`            | 1.26.4  | Numerical computing                    |
| `tensorflow`       | 2.15.0  | Required transitively by `basic-pitch` |

---

## Installation

```bash
cd 07-basic-pitch-server

python -m venv venv

# Windows (PowerShell / CMD)
venv\Scripts\activate
# Windows (Git Bash)
source venv/Scripts/activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

## Running the server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Convenience scripts are also provided: `start.bat` (Windows) and `start.sh` (macOS / Linux).

Once running:

- API: <http://localhost:8000>
- Interactive docs: <http://localhost:8000/docs>

---

## API reference

| Method | Endpoint   | Description                                  |
| ------ | ---------- | -------------------------------------------- |
| `GET`  | `/`        | Liveness check.                              |
| `GET`  | `/health`  | Health check, useful before a demonstration. |
| `POST` | `/convert` | Converts an uploaded audio file to MIDI.     |

### `POST /convert`

- **Request:** `multipart/form-data` with a single field named `file`.
- **Success (`200`):** raw MIDI bytes, `Content-Type: audio/midi`, with a `Content-Disposition` header carrying the output filename.
- **Errors:**

| Status | Cause                                      |
| ------ | ------------------------------------------ |
| `400`  | Missing filename or empty file.            |
| `413`  | File exceeds the maximum size (25 MB).     |
| `415`  | Unsupported file extension.                |
| `422`  | Audio could not be decoded or transcribed. |
| `500`  | Unexpected internal error.                 |

---

## Testing locally

**Health check**

```bash
curl http://localhost:8000/health
# {"status":"healthy"}
```

**Convert an audio file (curl)**

```bash
curl -X POST http://localhost:8000/convert \
  -F "file=@melody.wav" \
  --output melody.mid
```

**Convert an audio file (PowerShell)**

```powershell
curl.exe -X POST http://localhost:8000/convert -F "file=@melody.wav" --output melody.mid
```

**Convert an audio file (Python)**

```python
import requests

with open("melody.wav", "rb") as f:
    response = requests.post("http://localhost:8000/convert", files={"file": f})

response.raise_for_status()
with open("melody.mid", "wb") as out:
    out.write(response.content)
```

**Inspect the generated MIDI**

```bash
python -c "import pretty_midi as pm; m = pm.PrettyMIDI('melody.mid'); print(len(m.instruments[0].notes), 'notes,', round(m.get_end_time(), 2), 's')"
```

**Check error handling**

```bash
curl -X POST http://localhost:8000/convert -F "file=@notes.txt"
# {"error":true,"message":"Formato de archivo no soportado: '.txt'. ..."}
```

---

## Configuration

All tunable values live in `app/config.py`:

| Setting               | Default                                                   | Purpose                             |
| --------------------- | --------------------------------------------------------- | ----------------------------------- |
| `ALLOWED_ORIGINS`     | `localhost:5173–5175`, `localhost:4173`, `127.0.0.1:5173` | CORS whitelist for local frontends. |
| `ALLOWED_EXTENSIONS`  | `.wav .mp3 .m4a .flac .ogg .webm`                         | Accepted input formats.             |
| `MAX_FILE_SIZE_BYTES` | 25 MB                                                     | Upload size limit.                  |

## Project structure

```
07-basic-pitch-server/
├── app/
│   ├── main.py                 # FastAPI app, routes, validation, error handler
│   ├── basic_pitch_service.py  # FFmpeg normalization + Basic Pitch inference
│   └── config.py               # CORS, formats, size limit
├── requirements.txt
├── start.bat
└── start.sh
```

---

## Limitations

- Transcription quality depends on recording quality; noisy or heavily layered audio may yield spurious notes.
- Output is a performance-style transcription: it does not quantize rhythm or infer tempo changes.
- The service has no authentication and is intended for local use only.

---

## References

[1] R. M. Bittner, J. J. Bosch, D. Rubinstein, G. Meseguer-Brocal and S. Ewert, "A Lightweight Instrument-Agnostic Model for Polyphonic Note Transcription and Multipitch Estimation," in _Proc. IEEE Int. Conf. Acoustics, Speech and Signal Processing (ICASSP)_, 2022, pp. 781–785. doi: [10.1109/ICASSP43922.2022.9747286](https://doi.org/10.1109/ICASSP43922.2022.9747286)

[2] ONNX Runtime developers, _ONNX Runtime_ (v1.27.0), Microsoft, 2026. <https://onnxruntime.ai/>

[3] S. Ramírez, _FastAPI_ (v0.139.2), 2026. <https://fastapi.tiangolo.com/>

[4] Spotify, _Basic Pitch_ (v0.4.0), GitHub repository. <https://github.com/spotify/basic-pitch>

---

> Built with ♥ by Jesús Domínguez [@jdomingu19](https://github.com/jdomingu19/)
