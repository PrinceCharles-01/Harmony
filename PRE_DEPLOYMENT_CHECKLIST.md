# ✅ Checklist Pré-Déploiement - Harmony

## 📋 Vérifications Backend

### Configuration Django
- [x] `settings.py` utilise des variables d'environnement
- [x] `DEBUG = False` en production (via variable d'environnement)
- [x] `SECRET_KEY` sécurisée (via variable d'environnement)
- [x] `ALLOWED_HOSTS` configuré
- [x] CORS configuré correctement
- [x] WhiteNoise ajouté pour les fichiers statiques
- [x] Gunicorn installé

### Base de données
- [x] PostgreSQL configuré
- [x] Variables de connexion dans `.env`
- [ ] Migrations à jour (`python manage.py makemigrations`)
- [ ] Migrations appliquées (`python manage.py migrate`)

### Fichiers de configuration
- [x] `requirements.txt` complet
- [x] `Procfile` créé
- [x] `railway.toml` créé
- [x] `runtime.txt` créé
- [x] `.env.example` documenté
- [x] `.gitignore` à jour

### Tests locaux
- [ ] Backend démarre sans erreur
- [ ] Admin Django accessible
- [ ] API endpoints répondent correctement
- [ ] CORS fonctionne avec le frontend

## 🎨 Vérifications Frontend

### Configuration React
- [x] `.env` avec `VITE_API_URL`
- [x] `.env.example` créé
- [x] Build production réussit (`npm run build`)
- [x] Pas de console.log en production

### API Integration
- [x] Tous les fetch() utilisent la bonne URL
- [x] Gestion d'erreurs robuste
- [x] États de chargement sur tous les composants
- [x] Messages utilisateur clairs

### Tests locaux
- [ ] Frontend démarre sans erreur
- [ ] Build production sans warning critique
- [ ] Connexion au backend fonctionne
- [ ] Toutes les pages principales accessibles

## 🚀 Avant Railway

### Compte & Setup
- [ ] Compte Railway créé
- [ ] GitHub connecté à Railway
- [ ] Repository accessible

### Variables d'environnement préparées
```env
SECRET_KEY=<générer-avec-django>
DEBUG=False
ALLOWED_HOSTS=<sera-fourni-par-railway>.railway.app
DATABASE_NAME=${{Postgres.PGDATABASE}}
DATABASE_USER=${{Postgres.PGUSER}}
DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
DATABASE_HOST=${{Postgres.PGHOST}}
DATABASE_PORT=${{Postgres.PGPORT}}
CORS_ALLOWED_ORIGINS=<sera-fourni-par-vercel>
CSRF_TRUSTED_ORIGINS=<railway-url>,<vercel-url>
```

### Commandes à exécuter après déploiement
```bash
cd Harmony_backend
python manage.py collectstatic --noinput
python manage.py migrate
python manage.py createsuperuser
```

## 🎯 Avant Vercel

### Compte & Setup
- [ ] Compte Vercel créé
- [ ] GitHub connecté à Vercel

### Variables d'environnement préparées
```env
VITE_API_URL=<url-railway>
```

### Configuration projet
- Root Directory: `front`
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`

## 🔍 Tests Post-Déploiement

### Backend (Railway)
- [ ] URL Railway accessible
- [ ] `/admin` fonctionne
- [ ] Connexion superuser réussie
- [ ] API endpoints répondent
- [ ] Pas d'erreurs dans les logs

### Frontend (Vercel)
- [ ] URL Vercel accessible
- [ ] Page de login s'affiche
- [ ] Connexion au backend réussie
- [ ] Données chargées correctement
- [ ] Pas d'erreurs CORS
- [ ] Console propre (pas d'erreurs)

### Intégration
- [ ] Login fonctionne end-to-end
- [ ] Notes s'affichent
- [ ] Emploi du temps se charge
- [ ] Admin peut saisir des notes
- [ ] Générateur de planning fonctionne

## 🐛 Dépannage Commun

### Si les migrations échouent
```bash
# Dans Railway terminal
cd Harmony_backend
python manage.py migrate --run-syncdb
```

### Si les fichiers statiques manquent
```bash
cd Harmony_backend
python manage.py collectstatic --noinput --clear
```

### Si CORS bloque
Vérifier que dans Railway :
- `CORS_ALLOWED_ORIGINS` contient l'URL Vercel exacte
- `CSRF_TRUSTED_ORIGINS` contient les deux URLs

### Si le frontend ne se connecte pas
Vérifier dans Vercel :
- Variable `VITE_API_URL` sans `/` à la fin
- Redéployer après modification

## 📊 Métriques de Succès

- [ ] Backend répond en < 500ms
- [ ] Frontend se charge en < 3s
- [ ] Pas d'erreurs 500 dans Railway
- [ ] Pas d'erreurs de build dans Vercel
- [ ] Score Lighthouse > 80

## 🎉 Prêt pour la Démo !

Une fois toutes les cases cochées :
1. Testez le flow complet utilisateur
2. Testez le flow admin
3. Préparez quelques données de démonstration
4. Notez vos identifiants de test
5. Partagez les URLs avec l'équipe

---

**Bon déploiement ! 🚀**
