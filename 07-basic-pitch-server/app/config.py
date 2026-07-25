"""
Configuración centralizada del servidor Basic Pitch.
Aquí se define todo lo que podrías necesitar ajustar sin tocar la lógica del endpoint.
"""

# Orígenes permitidos para CORS.
# En local (defensa/pruebas) puedes dejar "*", pero si conectas tu frontend
# publicado en Netlify, reemplaza por la URL exacta, ej:
# ["http://localhost:5173", "https://tu-proyecto.netlify.app"]
ALLOWED_ORIGINS = [
    "http://localhost:5173",   # Vite dev server por defecto
    "http://localhost:4173",   # Vite preview
    "http://127.0.0.1:5173",
]

# Extensiones de audio aceptadas (en minúsculas, con punto)
ALLOWED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".flac", ".ogg", ".webm"}

# Tamaño máximo de archivo permitido (en bytes). 25 MB por defecto.
MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

# Host y puerto (informativo, uvicorn ya se lanza con estos valores en start.bat)
HOST = "0.0.0.0"
PORT = 8000
