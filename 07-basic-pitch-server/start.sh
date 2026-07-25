#!/bin/bash
# start.sh

# Activar entorno virtual
source venv/bin/activate

echo "Iniciando servidor Basic Pitch en http://localhost:8000"
echo "Documentación interactiva en http://localhost:8000/docs"

# Ejecutar uvicorn
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
