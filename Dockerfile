# Utiliser Python 3.12 comme image de base
FROM python:3.12

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Installer les dépendances système nécessaires pour psycopg2
RUN apt-get update && apt-get install -y build-essential libpq-dev

# Copier les fichiers requirements
COPY requirements.txt .

# Installer les dépendances
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Copier tout le projet dans le conteneur
COPY . .

# Rendre le script de démarrage exécutable
RUN chmod +x start.sh

# Collecter les fichiers statiques
RUN python Harmony_backend/manage.py collectstatic --noinput || true

# Exposer le port
EXPOSE 8000

# Commande pour lancer Gunicorn en production
CMD ["./start.sh"]
