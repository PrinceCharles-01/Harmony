# Plan et Liens des Fichiers Importants

Ce document a pour but de décrire l'architecture du projet Harmony, en identifiant les fichiers et dossiers clés, leur rôle et leur emplacement.

## Backend (Django)

Le backend est un projet Django situé dans le dossier `Harmony_backend/`.

-   **`Harmony_backend/harmony_backend/settings.py`**: Fichier de configuration principal de Django. C'est ici que sont définis les paramètres de la base de données, les applications installées, les middlewares, etc.
-   **`Harmony_backend/harmony_backend/urls.py`**: Fichier de routage principal de Django. Il inclut les URLs des différentes applications.
-   **`manage.py`**: Utilitaire en ligne de commande de Django pour les tâches d'administration (lancer le serveur, créer des migrations, etc.).
-   **`requirements.txt`**: Liste des dépendances Python du projet.

### Application `academics`

Cette application semble gérer la logique principale de l'application (cours, notes, etc.).

-   **`Harmony_backend/academics/models/`**: Ce dossier contient les modèles de données de l'application, répartis en plusieurs fichiers (`common.py`, `lmd.py`, `scheduling.py`). C'est ici que le schéma de la base de données est défini.
-   **`Harmony_backend/academics/views.py`**: Contient les vues de l'application, qui gèrent la logique métier et les réponses aux requêtes HTTP.
-   **`Harmony_backend/academics/serializers.py`**: Gère la sérialisation et la désérialisation des données, principalement pour les APIs REST.
-   **`Harmony_backend/academics/urls.py`**: Définit les routes (URLs) spécifiques à l'application `academics`.

### Application `roles` et `users`

-   **`Harmony_backend/roles/models.py`**: Définit les modèles pour les rôles des utilisateurs (par exemple, étudiant, professeur, administrateur).
-   **`Harmony_backend/users/models.py`**: Définit le modèle utilisateur personnalisé, qui étend probablement le modèle utilisateur de base de Django.

## Frontend (React)

Le frontend est une application React située dans le dossier `front/`.

-   **`front/package.json`**: Fichier de configuration de Node.js. Il liste les dépendances du projet et les scripts pour lancer, construire et tester l'application.
-   **`front/vite.config.ts`**: Fichier de configuration de Vite, le build tool utilisé pour le frontend.
-   **`front/src/main.tsx`**: Point d'entrée de l'application React. C'est ici que l'application est "montée" dans le DOM.
-   **`front/src/App.tsx`**: Composant racine de l'application.
-   **`front/src/routes.tsx`**: Fichier de configuration du routage côté client avec React Router.
-   **`front/src/pages/`**: Dossier contenant les composants qui représentent les différentes pages de l'application (Dashboard, Login, etc.).
-   **`front/src/components/`**: Dossier contenant les composants React réutilisables (boutons, graphiques, etc.).

## Docker

-   **`docker-compose.yml`**: Permet de définir et de lancer l'application multi-conteneurs (backend, frontend, base de données).
-   **`Dockerfile`**: Définit l'image Docker pour le backend Django.
