# Utiliser Python 3.13 comme image de base
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

# Exposer le port 8000 pour Django
EXPOSE 8000

# Commande par défaut pour lancer le serveur Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
