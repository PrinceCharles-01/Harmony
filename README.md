# Harmony - Plateforme de Gestion Académique

Harmony est une plateforme moderne de gestion académique avec un backend Django et un frontend React.

## 🚀 Fonctionnalités

### Pour les Étudiants
- 📊 Consultation des notes par UE et semestre
- 📅 Emploi du temps interactif
- 📰 Actualités universitaires
- 💬 Système de réclamations de notes

### Pour les Administrateurs
- ✍️ Saisie des notes avec interface intuitive
- 📋 Gestion des matières et UE
- 🤖 Générateur automatique d'emploi du temps (algorithme d'optimisation)
- 👥 Gestion des utilisateurs et classes
- ⚙️ Assistant de configuration d'établissement

## 🛠️ Technologies

### Backend
- Django 5.0.6
- Django REST Framework
- PostgreSQL
- OR-Tools (optimisation des plannings)

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Shadcn/ui (composants)
- TanStack Query
- FullCalendar

## 📦 Installation Locale

### Prérequis
- Python 3.12+
- Node.js 18+
- PostgreSQL 16

### 1. Backend

```bash
# Installer les dépendances
pip install -r requirements.txt

# Copier et configurer les variables d'environnement
cp .env.example .env
# Éditez .env avec vos paramètres

# Créer la base de données PostgreSQL
createdb harmony_db

# Exécuter les migrations
cd Harmony_backend
python manage.py migrate

# Créer un super utilisateur
python manage.py createsuperuser

# Lancer le serveur
python manage.py runserver
```

### 2. Frontend

```bash
cd front

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# VITE_API_URL=http://localhost:8000

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur :
- Frontend : http://localhost:8080
- Backend : http://localhost:8000
- Admin Django : http://localhost:8000/admin

## 🚢 Déploiement

Consultez le fichier [DEPLOYMENT.md](DEPLOYMENT.md) pour les instructions complètes de déploiement sur Railway (backend) et Vercel (frontend).

### Déploiement rapide

**Backend (Railway)**
1. Connectez votre repo GitHub à Railway
2. Ajoutez PostgreSQL
3. Configurez les variables d'environnement
4. Railway déploie automatiquement

**Frontend (Vercel)**
1. Importez le projet depuis GitHub
2. Configurez Root Directory : `front`
3. Ajoutez `VITE_API_URL`
4. Vercel déploie automatiquement

## 📁 Structure du Projet

```
Harmony/
├── Harmony_backend/          # Backend Django
│   ├── academics/            # Gestion académique (planning, notes)
│   ├── users/                # Gestion des utilisateurs
│   ├── roles/                # Système de rôles
│   ├── api_tests/            # Tests API
│   └── harmony_backend/      # Configuration Django
├── front/                    # Frontend React
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   ├── pages/            # Pages principales
│   │   └── lib/              # Utilitaires
│   └── public/               # Assets statiques
├── requirements.txt          # Dépendances Python
├── Procfile                  # Configuration Heroku/Railway
├── railway.toml              # Configuration Railway
├── DEPLOYMENT.md             # Guide de déploiement
└── README.md                 # Ce fichier
```

## 🔑 Variables d'Environnement

### Backend (.env)
```env
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com
DATABASE_NAME=harmony_db
DATABASE_USER=harmony_user
DATABASE_PASSWORD=your-password
DATABASE_HOST=localhost
DATABASE_PORT=5432
CORS_ALLOWED_ORIGINS=https://yourdomain.com
CSRF_TRUSTED_ORIGINS=https://yourdomain.com
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 🧪 Tests

```bash
# Backend
cd Harmony_backend
python manage.py test

# Frontend
cd front
npm run test
```

## 📝 API Endpoints

### Authentification
- `POST /api/login/` - Connexion
- `POST /api/logout/` - Déconnexion

### Notes
- `GET /api/student-grades/?user_id={id}` - Notes d'un étudiant
- `POST /api/save-grades/` - Enregistrer des notes

### Planning
- `GET /api/academics/schedule/` - Emploi du temps
- `POST /api/academics/planifier/` - Générer un planning

### Données académiques
- `GET /api/classes/` - Liste des classes
- `GET /api/semestres/` - Liste des semestres
- `GET /api/ues/` - Liste des UE
- `GET /api/subjects/` - Liste des matières

## 🤝 Contribution

Pour contribuer au projet :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

## 👥 Équipe

Développé avec ❤️ par l'équipe Harmony

## 🆘 Support

Pour toute question ou problème :
- Ouvrez une issue sur GitHub
- Consultez la documentation dans `/docs`
- Contactez l'équipe de développement

---

**Note** : Ce projet est en développement actif. Certaines fonctionnalités peuvent être en cours d'implémentation.
