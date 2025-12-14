# Guide de Déploiement - Harmony

Ce guide vous explique comment déployer Harmony en production.

## 🚀 Architecture de Déploiement

- **Backend Django** → Railway.app (avec PostgreSQL)
- **Frontend React** → Vercel

---

## 📦 Partie 1 : Déploiement du Backend (Railway)

### Étape 1 : Créer un compte Railway

1. Allez sur [railway.app](https://railway.app)
2. Connectez-vous avec GitHub
3. Cliquez sur "New Project"

### Étape 2 : Créer le projet

1. Sélectionnez "Deploy from GitHub repo"
2. Autorisez Railway à accéder à votre dépôt GitHub
3. Sélectionnez le repository `Harmony`
4. Railway détectera automatiquement que c'est un projet Python

### Étape 3 : Ajouter PostgreSQL

1. Dans votre projet Railway, cliquez sur "+ New"
2. Sélectionnez "Database" → "PostgreSQL"
3. Railway créera automatiquement la base de données
4. Les variables `DATABASE_URL` seront automatiquement disponibles

### Étape 4 : Configurer les variables d'environnement

Dans Railway, allez dans l'onglet "Variables" et ajoutez :

```env
SECRET_KEY=<générez-une-clé-secrète-forte>
DEBUG=False
ALLOWED_HOSTS=<votre-domaine-railway>.railway.app
CORS_ALLOWED_ORIGINS=https://<votre-app-vercel>.vercel.app
CSRF_TRUSTED_ORIGINS=https://<votre-app-vercel>.vercel.app,https://<votre-domaine-railway>.railway.app
```

**Important** : Railway fournit automatiquement `DATABASE_URL`. Notre code dans `settings.py` utilise les variables individuelles (`DATABASE_NAME`, `DATABASE_USER`, etc.). Pour Railway, vous devez aussi ajouter :

```env
DATABASE_NAME=${{Postgres.PGDATABASE}}
DATABASE_USER=${{Postgres.PGUSER}}
DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
DATABASE_HOST=${{Postgres.PGHOST}}
DATABASE_PORT=${{Postgres.PGPORT}}
```

### Étape 5 : Déployer

1. Railway détectera le fichier `railway.toml`
2. Il exécutera automatiquement :
   - Installation des dépendances
   - `collectstatic`
   - Migrations de la base de données
3. Attendez que le déploiement se termine (2-3 minutes)

### Étape 6 : Vérifier le déploiement

1. Cliquez sur l'URL générée par Railway
2. Ajoutez `/admin` à l'URL
3. Vous devriez voir l'interface d'administration Django

### Étape 7 : Créer un super utilisateur

Dans Railway, ouvrez le terminal (onglet "Terminal") et exécutez :

```bash
cd Harmony_backend
python manage.py createsuperuser
```

---

## 🎨 Partie 2 : Déploiement du Frontend (Vercel)

### Étape 1 : Préparer le frontend

1. Assurez-vous que le fichier `front/.env` contient :

```env
VITE_API_URL=https://<votre-domaine-railway>.railway.app
```

2. Committez et poussez les changements sur GitHub

### Étape 2 : Créer un compte Vercel

1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec GitHub

### Étape 3 : Importer le projet

1. Cliquez sur "Add New..." → "Project"
2. Sélectionnez votre repository `Harmony`
3. Configurez le projet :
   - **Framework Preset** : Vite
   - **Root Directory** : `front`
   - **Build Command** : `npm run build`
   - **Output Directory** : `dist`

### Étape 4 : Configurer les variables d'environnement

Dans les paramètres du projet Vercel, ajoutez :

```env
VITE_API_URL=https://<votre-domaine-railway>.railway.app
```

### Étape 5 : Déployer

1. Cliquez sur "Deploy"
2. Vercel construira et déploiera automatiquement votre app
3. Attendez que le déploiement se termine (1-2 minutes)

### Étape 6 : Mettre à jour les CORS dans Railway

1. Retournez dans Railway
2. Mettez à jour la variable `CORS_ALLOWED_ORIGINS` :

```env
CORS_ALLOWED_ORIGINS=https://<votre-app-vercel>.vercel.app
```

3. Railway redémarrera automatiquement

### Étape 7 : Tester l'application

1. Ouvrez l'URL Vercel
2. Essayez de vous connecter
3. Vérifiez que les données se chargent depuis le backend

---

## 🔧 Dépannage

### Erreur CORS

Si vous avez des erreurs CORS :
- Vérifiez que `CORS_ALLOWED_ORIGINS` dans Railway contient l'URL Vercel exacte
- Vérifiez que `CSRF_TRUSTED_ORIGINS` contient les deux URLs (Railway + Vercel)

### Erreur de base de données

Si les migrations ne passent pas :
- Allez dans le terminal Railway
- Exécutez manuellement : `cd Harmony_backend && python manage.py migrate`

### Fichiers statiques manquants

Si les fichiers statiques ne se chargent pas :
- Exécutez : `cd Harmony_backend && python manage.py collectstatic --noinput`

### Frontend ne se connecte pas au backend

- Vérifiez la variable `VITE_API_URL` dans Vercel
- Assurez-vous qu'il n'y a pas de `/` à la fin de l'URL
- Redéployez le frontend après modification

---

## 📝 Checklist Finale

### Backend (Railway)
- [ ] PostgreSQL créé et connecté
- [ ] Toutes les variables d'environnement configurées
- [ ] Migrations exécutées avec succès
- [ ] Super utilisateur créé
- [ ] `/admin` accessible

### Frontend (Vercel)
- [ ] Variable `VITE_API_URL` configurée
- [ ] Build réussi sans erreurs
- [ ] Application accessible via l'URL Vercel
- [ ] Connexion au backend fonctionnelle
- [ ] Pas d'erreurs CORS dans la console

---

## 🎯 URLs à conserver

Notez vos URLs de déploiement :

- **Backend** : `https://<votre-projet>.railway.app`
- **Frontend** : `https://<votre-projet>.vercel.app`
- **Admin Django** : `https://<votre-projet>.railway.app/admin`

---

## 🔄 Redéploiement

### Backend
- Push sur la branche principale → Railway redéploie automatiquement

### Frontend
- Push sur la branche principale → Vercel redéploie automatiquement

---

## 💡 Conseils

1. **Domaines personnalisés** : Railway et Vercel permettent d'ajouter vos propres domaines
2. **Logs** : Consultez les logs dans Railway/Vercel en cas d'erreur
3. **Scaling** : Railway et Vercel s'adaptent automatiquement au trafic
4. **Sauvegardes** : Railway sauvegarde automatiquement PostgreSQL

---

## 🆘 Support

En cas de problème :
- Railway : [docs.railway.app](https://docs.railway.app)
- Vercel : [vercel.com/docs](https://vercel.com/docs)
