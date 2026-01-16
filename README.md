# MOTORAGE - Plateforme d''Entraide Moto

MOTORAGE est une plateforme web moderne et performante conçue pour faciliter l''entraide et le partage de trajets à moto entre les membres de la communauté de l''Université de Lomé (UL).

![MOTORAGE Banner](https://motorage.com/og-image.png)

## 🌟 Fonctionnalités Clés

- **Tableau de Bord Moderne** : Une interface utilisateur sophistiquée, réactive et optimisée pour la gestion quotidienne.
  - Sidebar rétractable avec mode icônes et tooltips.
  - Navigation dynamique filtrée par rôle (Passager vs Conducteur).
  - Thème clair, sombre et système.
- **Gestion de Profil Complète** : Mise à jour des informations personnelles et suppression sécurisée du compte.
- **Système de Notifications en Temps Réel** : Alertes centralisées pour les réservations, confirmations et mises à jour système.
- **Historique de Réservations** : Suivi détaillé de l''état des trajets pour les passagers (en attente, confirmé, terminé, annulé).
- **Gestion de Garage (Conducteurs)** : Ajout et gestion du parc moto personnel.
- **Géolocalisation intelligente** : Suggestion automatique des points de départ et d''arrivée basés sur les zones clés de l''université.

## 🛠 Stack Technique

- **Framework** : [Next.js 16 (App Router)](https://nextjs.org/)
- **Bibliothèque UI** : [React 19](https://react.dev/)
- **Styling** : [Tailwind CSS 4](https://tailwindcss.com/)
- **Composants** : [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Animations** : [Framer Motion](https://www.framer.com/motion/)
- **Gestion d''état** : [Zustand](https://github.com/pmndrs/zustand)
- **Base de données** : [Turso (SQLite)](https://turso.tech/) avec [Drizzle ORM](https://orm.drizzle.team/)
- **Tests** : [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## 🚀 Installation et Configuration

1. **Cloner le dépôt**
   ```bash
   git clone <repository-url>
   cd projet-motorage-web
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configurer les variables d''environnement**
   Créez un fichier `.env` à la racine :
   ```env
   # Database (Turso)
   TURSO_DATABASE_URL=libsql://your-db-name.turso.io
   TURSO_AUTH_TOKEN=your-auth-token

   # Authentication (JWT)
   JWT_SECRET=your-secure-secret-key
   JWT_REFRESH_SECRET=your-secure-refresh-key
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   ```

4. **Synchroniser la base de données**
   ```bash
   pnpm db:push
   ```

5. **Lancer le serveur de développement**
   ```bash
   pnpm dev
   ```
   Accédez à [http://localhost:3000](http://localhost:3000).

## 📁 Structure du Projet

```text
src/
├── app/                  # Routes Next.js (Pages & API)
│   ├── api/              # Endpoints API (Auth, Trajets, etc.)
│   ├── dashboard/        # Layout et Pages du Tableau de bord
│   └── page.tsx          # Page d''accueil (Landing Page)
├── components/           # Composants UI, Layout et Sections
│   ├── ui/               # Composants atomiques (Radix/Shadcn)
│   ├── layout/           # Sidebar, Header, Footer
│   └── dashboard/        # Composants spécifiques au dashboard
├── lib/                  # Utilitaires et Logique
│   ├── db/               # Schéma Drizzle et DB config
>>   └── store.ts          # Orchestration d''état Zustand
└── app/globals.css       # Tailwind CSS 4 & Thèmes
```

## 🧪 Tests et Qualité

- Lancer les tests unitaires : `pnpm test`
- Vérifier le linting : `pnpm lint`
- Ouvrir Drizzle Studio : `pnpm db:studio`

## 📈 État d''avancement

- [x] Sprint 1 : Cadrage, Maquettage et Base technique.
- [x] Sprint 2 : Authentification, Dashboard SaaS, Notifications et Profil.
- [ ] Sprint 3 (En cours) : Logique de Matching avancée, Messagerie et Évaluations.

---
Conçu avec ❤️ pour les étudiants de l''Université de Lomé.
