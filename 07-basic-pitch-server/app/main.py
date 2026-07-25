"""
Punto de entrada FastAPI del servidor Basic Pitch.
Expone el endpoint /convert que recibe un archivo de audio y devuelve un MIDI.
"""

import logging

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response, JSONResponse

from app.config import ALLOWED_ORIGINS, ALLOWED_EXTENSIONS, MAX_FILE_SIZE_BYTES
from app.basic_pitch_service import convert_audio_bytes_to_midi, BasicPitchProcessingError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

app = FastAPI(
    title="Basic Pitch Backend",
    description="Servidor local que convierte audio a MIDI usando Spotify Basic Pitch.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    """Endpoint simple para confirmar que el servidor está vivo."""
    return {"status": "ok", "service": "basic-pitch-backend"}


@app.get("/health")
def health_check():
    """Endpoint de salud, útil para verificar antes de una demo."""
    return {"status": "healthy"}


@app.post("/convert")
async def convert_audio(file: UploadFile = File(...)):
    """
    Recibe un archivo de audio, lo valida, lo convierte a MIDI usando
    Basic Pitch, y devuelve el archivo MIDI resultante como bytes binarios.
    """

    # --- Validación 1: nombre y extensión de archivo ---
    if not file.filename:
        raise HTTPException(status_code=400, detail="No se recibió un nombre de archivo válido.")

    filename_lower = file.filename.lower()
    extension = "." + filename_lower.rsplit(".", 1)[-1] if "." in filename_lower else ""

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=(
                f"Formato de archivo no soportado: '{extension}'. "
                f"Formatos permitidos: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            ),
        )

    # --- Validación 2: leer contenido y verificar tamaño ---
    audio_bytes = await file.read()

    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="El archivo de audio está vacío.")

    if len(audio_bytes) > MAX_FILE_SIZE_BYTES:
        max_mb = MAX_FILE_SIZE_BYTES / (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"El archivo excede el tamaño máximo permitido de {max_mb:.0f} MB.",
        )

    logger.info(f"Archivo recibido: {file.filename} ({len(audio_bytes)} bytes)")

    # --- Procesamiento con Basic Pitch ---
    try:
        midi_bytes = convert_audio_bytes_to_midi(audio_bytes, file.filename)
    except BasicPitchProcessingError as exc:
        logger.error(f"Error de procesamiento: {exc}")
        raise HTTPException(status_code=422, detail=str(exc))
    except Exception as exc:
        logger.exception("Error interno no controlado")
        raise HTTPException(status_code=500, detail="Error interno del servidor al procesar el audio.")

    logger.info(f"MIDI generado correctamente ({len(midi_bytes)} bytes) para {file.filename}")

    # --- Respuesta: bytes MIDI crudos ---
    output_filename = filename_lower.rsplit(".", 1)[0] + ".mid"
    return Response(
        content=midi_bytes,
        media_type="audio/midi",
        headers={
            "Content-Disposition": f'attachment; filename="{output_filename}"'
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Formatea todos los errores HTTP como JSON consistente para el frontend."""
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": True, "message": exc.detail},
    )
