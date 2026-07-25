/**
 * Servicio de comunicación con el backend Basic Pitch (FastAPI).
 * Aísla el fetch para que los componentes no conozcan detalles de la API.
 */

// Ajusta esta URL si usas ngrok u otro host. En local con start.bat queda en 8000.
const BACKEND_URL = "http://localhost:8000";

export class ConvertServiceError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ConvertServiceError";
    this.status = status;
  }
}

/**
 * Envía un Blob/File de audio al backend y devuelve un Blob MIDI.
 * @param {Blob} audioBlob
 * @param {string} filename - nombre con extensión (ej. "grabacion.webm")
 * @returns {Promise<Blob>} blob con media type audio/midi
 */
export async function convertAudioToMidi(audioBlob, filename) {
  const formData = new FormData();
  formData.append("file", audioBlob, filename);

  let response;
  try {
    response = await fetch(`${BACKEND_URL}/convert`, {
      method: "POST",
      body: formData,
    });
  } catch (networkError) {
    throw new ConvertServiceError(
      `${networkError} : No se pudo conectar con el servidor backend local. Verifica que esté corriendo en ` +
        BACKEND_URL,
      0,
    );
  }

  if (!response.ok) {
    let message = `Error del servidor (${response.status})`;
    try {
      const errorBody = await response.json();
      if (errorBody?.message) message = errorBody.message;
    } catch {
      // el cuerpo no era JSON, se deja el mensaje genérico
    }
    throw new ConvertServiceError(message, response.status);
  }

  const midiBuffer = await response.arrayBuffer();
  return new Blob([midiBuffer], { type: "audio/midi" });
}

/**
 * Verifica si el backend está disponible (para mostrar estado de conexión en la UI).
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/health`, { method: "GET" });
    return response.ok;
  } catch {
    return false;
  }
}

export { BACKEND_URL };
