Git
# Git
git status                     -> Voir l'état du dépôt
git add <fichier>              -> Ajouter un fichier au prochain commit
git commit -m "message"        -> Créer un commit
git push                       -> Envoyer les commits sur GitHub
git pull                       -> Récupérer les changements depuis GitHub
git log --oneline --graph       -> Afficher l'historique de façon condensée

Python / Virtualenv
# Python & Virtualenv
python -m venv env             -> Créer un environnement virtuel
source env/Scripts/activate     -> Activer l'environnement (Windows)
python -m pip install -r requirements.txt -> Installer toutes les dépendances
pip freeze > requirements.txt   -> Mettre à jour le fichier des dépendances

Django
# Django
python manage.py runserver       -> Lancer le serveur local
python manage.py makemigrations -> Créer les migrations pour les changements de modèle
python manage.py migrate        -> Appliquer les migrations
python manage.py createsuperuser -> Créer un compte admin
python manage.py shell          -> Lancer une console Django interactive

Docker / Docker Compose
# Docker
docker build -t monimage .       -> Créer une image depuis Dockerfile
docker run -p 8000:8000 monimage -> Lancer un conteneur local
docker-compose up                -> Lancer tous les services définis dans docker-compose.yml
docker-compose down              -> Arrêter tous les services
docker-compose logs -f           -> Voir les logs en temps réel
docker-compose exec web python manage.py check
