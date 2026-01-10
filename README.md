# MOTORAGE WEB - Plateauforme d'Entraide Moto

MOTORAGE est une plateforme web moderne conçue pour faciliter l'entraide entre les étudiants motocyclistes de l'Université de Lomé (UL).

![Landing Page Screenshot](public/screenshots/screenshot-landing.png)

## Stack Technique

- **Framework** : Next.js 16 (App Router)
- **Styling** : Tailwind CSS 4
- **Langage** : TypeScript (Strict Mode)
- **Composants UI** : shadcn/ui
- **Icônes** : Lucide React

## Structure du Projet

```text
src/
├── app/                  # Routes (Pages)
│   ├── about/            # Page À propos
│   ├── contact/          # Page Contact
│   ├── dashboard/        # Dashboard (Placeholder)
│   ├── login/            # Connexion (Placeholder)
│   ├── register/         # Inscription (Placeholder)
│   └── page.tsx          # Landing Page
├── components/           # Composants réutilisables
│   ├── layout/           # Header, Footer, etc.
│   ├── sections/         # Sections de la Landing Page
│   └── ui/               # Composants shadcn/ui
├── lib/                  # Utilitaires (utils.ts)
└── app/globals.css       # Configuration Tailwind 4 & Palette de couleurs
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

- Configuration de Firebase Auth & Firestore
- Logique d'authentification complète
- Création du système d'annonces
- Espace utilisateur fonctionnel
