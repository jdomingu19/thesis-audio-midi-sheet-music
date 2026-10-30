# Thesis Audio to MIDI and Sheet Music
# @jdomingu19
# config.py

"""
Configuración centralizada del servidor Basic Pitch.

Todo se puede ajustar por variables de entorno (útil en Cloud Run con
--set-env-vars) sin tocar la lógica de los endpoints. Los valores por
defecto sirven para desarrollo local.
"""

import os
from pathlib import Path


def _env_int(name: str, default: int) -> int:
    """Lee un entero de una variable de entorno; si es inválido, usa el default."""
    try:
        return int(os.getenv(name, default))
    except (TypeError, ValueError):
        return default


def _env_list(name: str) -> list[str]:
    """Lee una lista separada por comas de una variable de entorno."""
    raw = os.getenv(name, "")
    return [item.strip() for item in raw.split(",") if item.strip()]


# --- CORS -----------------------------------------------------------------
# En producción (app 12) frontend y API comparten origen, así que CORS no se
# usa. Estos orígenes solo sirven en desarrollo (Vite en otro puerto).
# Si algún día publicas el frontend aparte (ej. Netlify), agrega su URL con:
#   EXTRA_ALLOWED_ORIGINS=https://tu-proyecto.netlify.app
DEV_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:5174",  # Vite dev server (puerto alterno)
    "http://localhost:5175",  # Vite dev server (puerto alterno)
    "http://localhost:4173",  # Vite preview
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
]
ALLOWED_ORIGINS = DEV_ALLOWED_ORIGINS + _env_list("EXTRA_ALLOWED_ORIGINS")

# --- Validación de archivos ----------------------------------------------
# Extensiones de audio aceptadas (en minúsculas, con punto).
# Debe coincidir con ACCEPTED_EXTENSIONS de frontend/src/App.jsx.
ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".flac", ".ogg", ".webm"}

# Tamaño máximo de archivo (MB). Cloud Run limita el cuerpo de la petición
# (32 MiB con HTTP/1, según la documentación); no subas este valor sin verificar.
MAX_FILE_SIZE_BYTES = _env_int("MAX_FILE_SIZE_MB", 25) * 1024 * 1024

# Duración máxima del audio ya normalizado (segundos). Acota el tiempo de CPU
# por conversión. Ajusta según lo que midas en local.
MAX_AUDIO_SECONDS = _env_int("MAX_AUDIO_SECONDS", 360)

# --- Rendimiento ------------------------------------------------------------
# Conversiones de Basic Pitch simultáneas dentro de una misma instancia.
# Las demás esperan en cola. Con 1 vCPU, 1 es lo más sensato.
MAX_CONCURRENT_CONVERSIONS = _env_int("MAX_CONCURRENT_CONVERSIONS", 1)

# Timeout de FFmpeg al normalizar el audio (segundos).
FFMPEG_TIMEOUT_SECONDS = _env_int("FFMPEG_TIMEOUT_SECONDS", 60)

# --- Frontend compilado ---------------------------------------------------
# En Docker, el build de Vite se copia a backend/static (ver Dockerfile).
STATIC_DIR = Path(
    os.getenv("STATIC_DIR", Path(__file__).resolve().parent.parent / "static")
)

# --- Servidor -------------------------------------------------------------
# Informativo: uvicorn recibe el puerto por línea de comandos. Cloud Run
# inyecta PORT (normalmente 8080); en local se usa 8000.
HOST = "0.0.0.0"
PORT = _env_int("PORT", 8000)
