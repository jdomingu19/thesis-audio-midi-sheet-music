# Thesis Audio to MIDI and Sheet Music
# @jdomingu19
# basic_pitch_service.py

"""
Wrapper de inferencia de Basic Pitch (backend ONNX, sin TensorFlow).
Aísla toda la lógica del modelo para que main.py solo se preocupe de la capa HTTP.
"""

import io
import logging
import os
import subprocess
import tempfile
import wave
from functools import lru_cache
from pathlib import Path

import imageio_ffmpeg

from basic_pitch import ICASSP_2022_MODEL_PATH
from basic_pitch.inference import predict

try:
    # Reutilizar un objeto Model evita recargar el modelo en cada petición.
    from basic_pitch.inference import Model
except ImportError:  # versiones antiguas: se pasa la ruta y el modelo se carga por llamada
    Model = None

from app.config import (
    ALLOWED_EXTENSIONS,
    FFMPEG_TIMEOUT_SECONDS,
    MAX_AUDIO_SECONDS,
)

logger = logging.getLogger("basic_pitch_service")

# Binario de FFmpeg empaquetado por imageio-ffmpeg: no depende del PATH del sistema.
FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()


class BasicPitchProcessingError(Exception):
    """Error controlado durante el procesamiento de audio con Basic Pitch."""


@lru_cache(maxsize=1)
def get_model():
    """Carga el modelo una sola vez y lo reutiliza en todas las conversiones."""
    logger.info(f"Cargando modelo Basic Pitch desde: {ICASSP_2022_MODEL_PATH}")
    if Model is None:
        return ICASSP_2022_MODEL_PATH
    return Model(ICASSP_2022_MODEL_PATH)


def warm_up_model() -> None:
    """Precarga el modelo (se llama al arrancar para evitar latencia en la 1ª petición)."""
    get_model()


def _convert_to_wav(input_path: str, output_path: str) -> str:
    """
    Normaliza cualquier formato de entrada (webm, mp3, m4a, etc.) a WAV PCM
    16-bit mono 22050 Hz usando el FFmpeg empaquetado.
    """
    command = [
        FFMPEG_PATH,
        "-nostdin",
        "-y",
        "-loglevel", "error",
        "-i", input_path,
        "-vn",
        "-ar", "22050",
        "-ac", "1",
        "-f", "wav",
        output_path,
    ]

    try:
        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            timeout=FFMPEG_TIMEOUT_SECONDS,
        )
    except FileNotFoundError as exc:
        raise BasicPitchProcessingError(
            f"No se encontró el binario de FFmpeg en la ruta esperada: {FFMPEG_PATH}"
        ) from exc
    except subprocess.TimeoutExpired as exc:
        raise BasicPitchProcessingError(
            f"La conversión del audio tardó demasiado (timeout de {FFMPEG_TIMEOUT_SECONDS}s)."
        ) from exc

    if result.returncode != 0:
        logger.error(f"FFmpeg stderr: {result.stderr}")
        raise BasicPitchProcessingError(
            "No se pudo convertir el audio de entrada. El archivo podría estar "
            "corrupto o en un formato no soportado."
        )

    if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
        raise BasicPitchProcessingError(
            "La conversión de audio no generó ningún archivo de salida."
        )

    return output_path


def _validate_duration(wav_path: str) -> None:
    """Rechaza audios más largos que MAX_AUDIO_SECONDS para acotar el uso de CPU."""
    try:
        with wave.open(wav_path, "rb") as wav_file:
            duration = wav_file.getnframes() / float(wav_file.getframerate())
    except (wave.Error, EOFError) as exc:
        raise BasicPitchProcessingError(
            "No se pudo leer la duración del audio normalizado."
        ) from exc

    if duration > MAX_AUDIO_SECONDS:
        raise BasicPitchProcessingError(
            f"El audio dura {duration:.0f} s y el máximo permitido es "
            f"{MAX_AUDIO_SECONDS} s. Recórtalo e inténtalo de nuevo."
        )
    if duration <= 0:
        raise BasicPitchProcessingError("El audio no contiene datos reproducibles.")


def convert_audio_bytes_to_midi(audio_bytes: bytes, original_filename: str) -> bytes:
    """
    Recibe los bytes de un archivo de audio y su nombre original, lo normaliza a
    WAV, lo procesa con Basic Pitch y devuelve los bytes del MIDI resultante.

    Los archivos temporales viven en un directorio que se borra por completo al
    terminar (en Cloud Run /tmp está en memoria, así que conviene no dejar basura).

    Lanza BasicPitchProcessingError si algo falla.
    """
    suffix = Path(original_filename).suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        suffix = ".audio"  # FFmpeg detecta el formato por contenido

    try:
        with tempfile.TemporaryDirectory(prefix="armonia_") as tmp_dir:
            input_path = os.path.join(tmp_dir, f"input{suffix}")
            wav_path = os.path.join(tmp_dir, "normalized.wav")

            with open(input_path, "wb") as input_file:
                input_file.write(audio_bytes)

            _convert_to_wav(input_path, wav_path)
            _validate_duration(wav_path)
            logger.info("Audio normalizado a WAV, iniciando inferencia.")

            _model_output, midi_data, _note_events = predict(wav_path, get_model())

            if midi_data is None:
                raise BasicPitchProcessingError(
                    "Basic Pitch no pudo generar datos MIDI a partir del audio proporcionado."
                )

            midi_buffer = io.BytesIO()
            midi_data.write(midi_buffer)
            logger.info("Conversión a MIDI completada correctamente.")
            return midi_buffer.getvalue()

    except BasicPitchProcessingError:
        raise
    except Exception as exc:
        logger.exception("Error inesperado durante la inferencia de Basic Pitch")
        raise BasicPitchProcessingError(
            "Fallo inesperado al procesar el audio."
        ) from exc
