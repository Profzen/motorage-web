# Miyi Ðekae - Plateforme d'Entraide Moto

Miyi Ðekae est une plateforme web moderne conçue pour faciliter l'entraide entre les étudiants motocyclistes de l'Université de Lomé (UL).

![Landing Page Screenshot](public/screenshots/screenshot-landing.png)

## Stack Technique

- **Framework** : Next.js 16 (App Router)
- **Base de données** : Turso (SQLite) avec Drizzle ORM
- **Styling** : Tailwind CSS 4
- **Gestion d'état** : Zustand
- **Icônes** : Lucide React
- **Tests** : Vitest & React Testing Library

## Configuration de la base de données (Turso)

1. Installez la CLI Turso et créez une base de données.
2. Copiez les informations dans un fichier `.env` :
   ```env
   TURSO_DATABASE_URL=libsql://your-db-name.turso.io
   TURSO_AUTH_TOKEN=your-auth-token
   ```
3. Poussez le schéma vers la base de données :
   ```bash
   pnpm db:push
   ```
4. Visualisez vos données :
   ```bash
   pnpm db:studio
   ```

## Structure du Projet

```text
src/
├── app/                  # Routes (Pages & API)
│   ├── api/              # API Routes (Auth, Routes, etc.)
│   ├── dashboard/        # Dashboard
│   └── page.tsx          # Landing Page
├── components/           # Composants réutilisables
├── lib/
│   ├── db/               # Configuration Drizzle & Schéma
│   └── store.ts          # Gestion d'état Zustand
└── app/globals.css       # Configuration Tailwind 4
```

## Installation et Démarrage

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd projet-motorage-web
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configurer les variables d'environnement**
   ```bash
   cp .env.local.example .env.local
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm dev
   ```
   L'application sera accessible sur [http://localhost:3000](http://localhost:3000).

## Scripts Disponibles

- `npm run dev` : Lance le serveur en mode développement.
- `npm run build` : Prépare l'application pour la production.
- `npm run start` : Lance l'application construite.
- `npm run lint` : Vérifie la qualité du code avec ESLint.

## Prochaines Étapes (Sprint 2)

- Finalisation de la logique SQL (Relations, Contraintes)
- Logique d'authentification complète de bout en bout
- Création du système d'annonces dynamique
- Espace utilisateur fonctionnel avec données réelles
