#!/bin/bash

# Script de démarrage pour Railway
# Utilise la variable PORT fournie par Railway, ou 8000 par défaut

PORT=${PORT:-8000}

echo "Starting Gunicorn on port $PORT..."

cd Harmony_backend
gunicorn --bind 0.0.0.0:$PORT harmony_backend.wsgi:application --log-file -
