# Codenotes - Projet Harmony

Ce fichier sert de documentation et de journal de bord pour le projet Harmony.

## Résumé du Projet

*   **Nom :** Harmony
*   **Backend :** Django
*   **Base de données :** PostgreSQL (via `psycopg2-binary`)
*   **API :** Django REST Framework (`djangorestframework`) est utilisé pour la création d'API.
*   **Dépendances :** Le fichier `requirements.txt` liste toutes les dépendances Python nécessaires au projet.
*   **Conteneurisation :** Le projet est conteneurisé avec Docker et Docker Compose.
    *   `Dockerfile` : Configure un environnement Python 3.13, installe les dépendances et lance le serveur de développement Django.
    *   `docker-compose.yml` : Définit deux services : `db` (PostgreSQL 16) et `web` (l'application Django). Il configure également un volume pour la persistance des données de la base de données.
*   **Structure du projet Django :**
    *   Le projet Django principal se nomme `harmony_backend`.
    *   Trois applications personnalisées sont présentes : `users`, `roles`, et `api_tests`.
    *   Le modèle utilisateur par défaut de Django a été remplacé par un modèle personnalisé : `users.CustomUser` (défini dans `AUTH_USER_MODEL`).
    *   La configuration `CORS_ALLOW_ALL_ORIGINS = True` est active, ce qui est pratique pour le développement mais devra être restreint en production.

## Commandes Utiles

### Git
```bash
git status                     -> Voir l'état du dépôt
git add <fichier>              -> Ajouter un fichier au prochain commit
git commit -m "message"        -> Créer un commit
git push                       -> Envoyer les commits sur GitHub
git pull                       -> Récupérer les changements depuis GitHub
git log --oneline --graph       -> Afficher l'historique de façon condensée
```

### Python & Virtualenv
```bash
python -m venv env             -> Créer un environnement virtuel
source env/Scripts/activate     -> Activer l'environnement (Windows)
python -m pip install -r requirements.txt -> Installer toutes les dépendances
pip freeze > requirements.txt   -> Mettre à jour le fichier des dépendances
```

### Django
```bash
python manage.py runserver       -> Lancer le serveur local
python manage.py makemigrations -> Créer les migrations pour les changements de modèle
python manage.py migrate        -> Appliquer les migrations
python manage.py createsuperuser -> Créer un compte admin
python manage.py shell          -> Lancer une console Django interactive
```

### Docker / Docker Compose
```bash
docker build -t monimage .       -> Créer une image depuis Dockerfile
docker run -p 8000:8000 monimage -> Lancer un conteneur local
docker-compose up                -> Lancer tous les services définis dans docker-compose.yml
docker-compose down              -> Arrêter tous les services
docker-compose logs -f           -> Voir les logs en temps réel
docker-compose exec web python manage.py check -> Lancer une commande dans le conteneur web
```
