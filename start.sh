#!/bin/bash

# Script de démarrage pour Railway

echo "Starting Gunicorn on port 8000..."

cd Harmony_backend
gunicorn --bind 0.0.0.0:8000 harmony_backend.wsgi:application --log-file -
