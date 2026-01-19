# MIYI ÐEKAE - Console d'Administration Web

MIYI ÐEKAE (anciennement MOTORAGE) est une plateforme de gestion centralisée pour la flotte de véhicules de l''Université de Lomé (UL). Cette interface Web est **exclusivement dédiée à l''administration** et à la supervision du service.

![MIYI ÐEKAE Dashboard](/public/screenshots/screenshot-landing.png)

## 📌 Vision du Projet

Le projet Miyi Ðekae est scindé en deux écosystèmes :

1.  **Mobile (User-Facing)** : Réservé aux Étudiants (Passagers) et Conducteurs pour la réservation et le suivi temps réel.
2.  **Web (Admin Console)** : Réservé à l''équipe administrative pour la gestion des dossiers, la sécurité et l''analyse des flux.

## 🌟 Fonctionnalités Web (Administration)

- **Console d''Administration SaaS** : Interface moderne pilotée par les données.
  - **Tableau de Bord Stratégique** : KPIs en temps réel (Utilisateurs actifs, Validations en attente, Litiges).
  - **Supervision des Flux** : Vue d''ensemble des trajets en cours sur le campus.
- **Gestion de la Sécurité** :
  - **Validation des Motards** : Interface de contrôle des pièces justificatives (Permis, Assurance).
  - **Gestion des Litiges** : Système de traitement des signalements utilisateurs.
- **Contrôle d''Accès Strict** :
  - **Portail Sécurisé** : Authentification unique pour le personnel habilité.
  - **Pas d''Inscription Publique** : Comptes créés uniquement par les administrateurs via script sécurisé.
  - **Redirection Mobile** : Guidage intelligent des utilisateurs lambda vers les stores mobiles.
- **Documentation API Interactive** : Swagger/OpenAPI 3.0 intégré pour le développement.

## 🛠 Stack Technique

- **Framework** : [Next.js 16 (App Router)](https://nextjs.org/)
- **Bibliothèque UI** : [React 19](https://react.dev/)
- **Styling** : [Tailwind CSS 4](https://tailwindcss.com/)
- **Composants** : [Radix UI](https://www.radix-ui.com/) & [Lucide Icons](https://lucide.dev/)
- **Animations** : [Framer Motion](https://www.framer.com/motion/)
- **Gestion d''état** : [Zustand](https://github.com/pmndrs/zustand)- **Gestion des fichiers** : [Uploadthing](https://uploadthing.com/)- **Base de données** : [Turso (SQLite)](https://turso.tech/) avec [Drizzle ORM](https://orm.drizzle.team/)

## 🚀 Installation & Administration

1. **Installation**

   ```bash
   pnpm install
   ```

2. **Synchroniser la base de données**

   Nous utilisons **Atlas** pour gérer les migrations de manière déclarative (plus robuste que `drizzle-kit push` pour les renommages de tables sur Turso).

   ```bash
   # Synchroniser le schéma local avec Turso
   pnpm migrate:push
   ```

   _Note: Les commandes Drizzle standard (`db:push`, `db:generate`) restent disponibles mais l'utilisation d'Atlas est recommandée pour les changements de structure complexes._

3. **Créer le premier administrateur**
   Puisque l''inscription publique est désactivée, utilisez le script de création :

   ```bash
   pnpm admin:create "votre-email@univ-lome.tg" "votreMotDePasse"
   ```

4. **Lancer le serveur**
   ```bash
   pnpm dev
   ```

## 📖 Documentation API

L''application expose une documentation interactive :

- **Swagger UI** : `http://localhost:3000/api-docs`

## 📁 Structure du Portail

```text
src/
├── app/
│   ├── (auth)/           # Portail de connexion sécurisé
│   ├── (site)/           # Landing page institutionnelle
│   ├── dashboard/        # Console d''administration Web
│   └── api/              # Endpoints (Validations, Utilisateurs, Flux)
├── components/
│   ├── dashboard/        # Widgets KPI et Monitoring
│   └── layout/           # Sidebar administrative dynamique
├── scripts/              # Outils de maintenance (Create Admin)
└── lib/
    ├── db/               # Schéma relationnel Drizzle
    └── store.ts          # État global (Auth & Sidebar)
```

## 🧪 Qualité

- **Tests** : `pnpm test`
- **Linting** : `pnpm lint`
- **Data Browser** : `pnpm db:studio`

## 📊 État du Jalon 3

- [x] Pivot vers Interface 100% Administrative.
- [x] Suppression des fonctions User (Mobile Only).
- [x] Création du Tableau de bord SaaS moderne.
- [x] Sécurisation du portail (Désactivation inscription).
- [x] Script de provisionnement des administrateurs.
