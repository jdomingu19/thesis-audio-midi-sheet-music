"""
Wrapper de inferencia de Basic Pitch.
Aísla toda la lógica del modelo para que main.py solo se preocupe de la capa HTTP.
"""

import io
import os
import tempfile
import logging

from basic_pitch.inference import predict
from basic_pitch import ICASSP_2022_MODEL_PATH

logger = logging.getLogger("basic_pitch_service")


class BasicPitchProcessingError(Exception):
    """Error controlado durante el procesamiento de audio con Basic Pitch."""
    pass


def convert_audio_bytes_to_midi(audio_bytes: bytes, original_filename: str) -> bytes:
    """
    Recibe bytes crudos de un archivo de audio y su nombre original (para
    preservar la extensión), lo procesa con Basic Pitch, y devuelve los
    bytes del archivo MIDI resultante.

    Lanza BasicPitchProcessingError si algo falla durante la inferencia.
    """
    suffix = os.path.splitext(original_filename)[1] or ".wav"
    tmp_path = None

    try:
        # Basic Pitch necesita un path físico, no acepta bytes en memoria directamente
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp_file:
            tmp_file.write(audio_bytes)
            tmp_path = tmp_file.name

        logger.info(f"Procesando archivo temporal: {tmp_path}")

        model_output, midi_data, note_events = predict(tmp_path, ICASSP_2022_MODEL_PATH)

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
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                logger.warning(f"No se pudo eliminar el archivo temporal: {tmp_path}")
