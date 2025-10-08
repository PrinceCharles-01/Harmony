# Activer l'environnement virtuel
 C:\Users\Charles\Desktop\Harmony
.\env\Scripts\Activate.ps1

# Lancer le back-end Django
Start-Process "python" -ArgumentList "manage.py runserver"

# Lancer Docker pour les services conteneurisés (si besoin)
Start-Process "docker-compose" -ArgumentList "up"

# Plus tard, lancer le front-end React
# Start-Process "npm" -ArgumentList "start" -WorkingDirectory "C:\Users\Charles\Desktop\Harmony\frontend"
