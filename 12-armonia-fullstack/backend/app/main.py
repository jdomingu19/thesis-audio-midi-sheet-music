# Thesis Audio to MIDI and Sheet Music
# @jdomingu19
# main.py

"""
Punto de entrada FastAPI de Armonía.

- /health   : verificación de salud.
- /convert  : recibe audio y devuelve un MIDI (Basic Pitch).
- /*        : sirve el frontend compilado (React/Vite) si existe backend/static.
"""

import asyncio
import logging
import re
from contextlib import asynccontextmanager
from pathlib import Path
from urllib.parse import quote

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, Response
from fastapi.staticfiles import StaticFiles
from starlette.concurrency import run_in_threadpool
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.basic_pitch_service import (
    BasicPitchProcessingError,
    convert_audio_bytes_to_midi,
    warm_up_model,
)
from app.config import (
    ALLOWED_EXTENSIONS,
    ALLOWED_ORIGINS,
    MAX_CONCURRENT_CONVERSIONS,
    MAX_FILE_SIZE_BYTES,
    STATIC_DIR,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

# Limita cuántas inferencias corren a la vez en esta instancia; el resto espera.
_conversion_slots = asyncio.Semaphore(MAX_CONCURRENT_CONVERSIONS)

UPLOAD_CHUNK_BYTES = 1024 * 1024  # 1 MB


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Precarga el modelo al arrancar para que la primera conversión no pague la carga."""
    try:
        await run_in_threadpool(warm_up_model)
        logger.info("Modelo Basic Pitch precargado.")
    except Exception:
        logger.exception(
            "No se pudo precargar el modelo; se cargará en la primera conversión."
        )
    yield


app = FastAPI(
    title="Armonía — Basic Pitch Backend",
    description="Convierte audio a MIDI con Spotify Basic Pitch y sirve el frontend de Armonía.",
    version="1.1.0",
    lifespan=lifespan,
)

# Comprime JS/CSS/JSON: reduce la transferencia saliente (el bundle incluye Tone.js y VexFlow).
app.add_middleware(GZipMiddleware, minimum_size=1024)

# CORS solo hace falta en desarrollo (Vite en otro puerto). En producción
# frontend y API comparten origen.
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


# --- Manejo de errores: siempre JSON { error, message } para el frontend ----
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(_request, exc: StarletteHTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "message": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_request, _exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": True,
            "message": "Solicitud inválida: falta el archivo de audio (campo 'file').",
        },
    )


# --- Endpoints --------------------------------------------------------------
@app.get("/health")
def health_check():
    """Endpoint de salud, útil para verificar antes de una demo."""
    return {"status": "healthy"}


async def _read_upload_limited(file: UploadFile, max_bytes: int) -> bytes:
    """Lee el archivo por trozos y aborta en cuanto supera el límite."""
    chunks: list[bytes] = []
    total = 0
    while True:
        chunk = await file.read(UPLOAD_CHUNK_BYTES)
        if not chunk:
            break
        total += len(chunk)
        if total > max_bytes:
            max_mb = max_bytes / (1024 * 1024)
            raise HTTPException(
                status_code=413,
                detail=f"El archivo excede el tamaño máximo permitido de {max_mb:.0f} MB.",
            )
        chunks.append(chunk)
    return b"".join(chunks)


def _build_content_disposition(original_filename: str) -> str:
    """
    Cabecera segura para nombres con tildes o caracteres no latinos:
    nombre ASCII de respaldo + filename* (RFC 5987) en UTF-8.
    """
    stem = Path(original_filename).stem or "resultado"
    ascii_stem = re.sub(r"[^A-Za-z0-9._-]+", "_", stem).strip("_") or "resultado"
    return (
        f'attachment; filename="{ascii_stem}.mid"; '
        f"filename*=UTF-8''{quote(stem + '.mid')}"
    )


@app.post("/convert")
async def convert_audio(file: UploadFile = File(...)):
    """
    Recibe un archivo de audio, lo valida, lo convierte a MIDI con Basic Pitch
    y devuelve el MIDI como bytes binarios.
    """

    # --- Validación 1: nombre y extensión ---
    if not file.filename:
        raise HTTPException(
            status_code=400, detail="No se recibió un nombre de archivo válido."
        )

    extension = Path(file.filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Formato de archivo no soportado: '{extension or 'sin extensión'}'. "
                f"Formatos permitidos: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            ),
        )

    # --- Validación 2: tamaño (lectura limitada) ---
    audio_bytes = await _read_upload_limited(file, MAX_FILE_SIZE_BYTES)
    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="El archivo de audio está vacío.")

    logger.info(f"Archivo recibido: {file.filename} ({len(audio_bytes)} bytes)")

    # --- Procesamiento: en hilo aparte y con cola, sin bloquear el event loop ---
    try:
        async with _conversion_slots:
            midi_bytes = await run_in_threadpool(
                convert_audio_bytes_to_midi, audio_bytes, file.filename
            )
    except BasicPitchProcessingError as exc:
        logger.error(f"Error de procesamiento: {exc}")
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception:
        logger.exception("Error interno no controlado")
        raise HTTPException(
            status_code=500,
            detail="Error interno del servidor al procesar el audio.",
        )

    logger.info(
        f"MIDI generado correctamente ({len(midi_bytes)} bytes) para {file.filename}"
    )

    return Response(
        content=midi_bytes,
        media_type="audio/midi",
        headers={
            "Content-Disposition": _build_content_disposition(file.filename),
            "Cache-Control": "no-store",
        },
    )


# --- Frontend compilado (SIEMPRE al final) ---------------------------------
# El mount en "/" captura cualquier ruta no definida antes, por eso va último.
# Sin backend/static (desarrollo) se expone solo un endpoint raíz informativo.
if STATIC_DIR.is_dir():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="frontend")
    logger.info(f"Sirviendo frontend desde: {STATIC_DIR}")
else:

    @app.get("/")
    def root():
        """Confirma que el servidor está vivo cuando no hay frontend compilado."""
        return {"status": "ok", "service": "basic-pitch-backend"}
