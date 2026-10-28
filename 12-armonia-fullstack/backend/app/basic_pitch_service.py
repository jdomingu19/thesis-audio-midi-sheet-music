"""
Wrapper de inferencia de Basic Pitch.
Aísla toda la lógica del modelo para que main.py solo se preocupe de la capa HTTP.
"""

import io
import os
import subprocess
import tempfile
import logging

import imageio_ffmpeg  # nuevo import

from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH

logger = logging.getLogger("basic_pitch_service")

# Ruta al binario de FFmpeg empaquetado dentro del venv, sin depender del PATH del sistema.
FFMPEG_PATH = imageio_ffmpeg.get_ffmpeg_exe()


class BasicPitchProcessingError(Exception):
    """Error controlado durante el procesamiento de audio con Basic Pitch."""
    pass


def _convert_to_wav(input_path: str) -> str:
    """
    Normaliza cualquier formato de audio de entrada (webm, mp3, m4a, etc.)
    a un WAV PCM 16-bit mono 22050Hz usando el FFmpeg empaquetado por imageio-ffmpeg.
    """
    output_path = input_path + "_converted.wav"

    command = [
        FFMPEG_PATH,  # antes: "ffmpeg"
        "-y",
        "-i", input_path,
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
            timeout=60,
        )
    except FileNotFoundError as exc:
        raise BasicPitchProcessingError(
            f"No se encontró el binario de FFmpeg en la ruta esperada: {FFMPEG_PATH}"
        ) from exc
    except subprocess.TimeoutExpired as exc:
        raise BasicPitchProcessingError(
            "La conversión del audio tardó demasiado (timeout de 60s)."
        ) from exc

    if result.returncode != 0:
        logger.error(f"FFmpeg stderr: {result.stderr}")
        raise BasicPitchProcessingError(
            "No se pudo convertir el audio de entrada. El archivo podría estar "
            "corrupto o en un formato no soportado por FFmpeg."
        )

    if not os.path.exists(output_path):
        raise BasicPitchProcessingError("La conversión de audio no generó ningún archivo de salida.")

    return output_path

def convert_audio_bytes_to_midi(audio_bytes: bytes, original_filename: str) -> bytes:
    """
    Recibe bytes crudos de un archivo de audio y su nombre original (para
    preservar la extensión), lo normaliza a WAV, lo procesa con Basic Pitch,
    y devuelve los bytes del archivo MIDI resultante.

    Lanza BasicPitchProcessingError si algo falla durante la inferencia.
    """
    suffix = os.path.splitext(original_filename)[1] or ".wav"
    tmp_path = None
    wav_path = None

    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp_file:
            tmp_file.write(audio_bytes)
            tmp_path = tmp_file.name

        logger.info(f"Archivo temporal original: {tmp_path}")

        # Siempre normalizamos a WAV, incluso si ya viene en .wav,
        # para garantizar un formato consistente y evitar sorpresas.
        wav_path = _convert_to_wav(tmp_path)
        logger.info(f"Audio normalizado a WAV: {wav_path}")

        model_output, midi_data, note_events = predict(wav_path, ICASSP_2022_MODEL_PATH)

        if midi_data is None:
            raise BasicPitchProcessingError(
                "Basic Pitch no pudo generar datos MIDI a partir del audio proporcionado."
            )

        midi_buffer = io.BytesIO()
        midi_data.write(midi_buffer)
        midi_buffer.seek(0)

        logger.info("Conversión a MIDI completada correctamente.")
        return midi_buffer.read()

    except BasicPitchProcessingError:
        raise
    except Exception as exc:
        logger.exception("Error inesperado durante la inferencia de Basic Pitch")
        raise BasicPitchProcessingError(f"Fallo al procesar el audio: {str(exc)}") from exc

    finally:
        for path in (tmp_path, wav_path):
            if path and os.path.exists(path):
                try:
                    os.remove(path)
                except OSError:
                    logger.warning(f"No se pudo eliminar el archivo temporal: {path}")
