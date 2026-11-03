# Thesis Audio to MIDI and Sheet Music
# @jdomingu19
# Dockerfile

# Etapa 1: compilar el frontend (Vite)
FROM node:22-slim AS frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Etapa 2: backend FastAPI + frontend compilado
FROM python:3.11-slim

ENV PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    NUMBA_CACHE_DIR=/tmp/numba_cache \
    PORT=8080

RUN apt-get update \
    && apt-get install -y --no-install-recommends libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Basic Pitch se instala sin dependencias para no arrastrar TensorFlow
COPY backend/requirements.txt ./
RUN pip install -r requirements.txt \
    && pip install --no-deps basic-pitch==0.4.0

RUN useradd --create-home --uid 10001 appuser

COPY --chown=appuser:appuser backend/ ./
COPY --from=frontend-build --chown=appuser:appuser /frontend/dist ./static

USER appuser

CMD ["sh", "-c", "exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
