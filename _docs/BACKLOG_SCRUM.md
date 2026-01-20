# Backlog SCRUM - Miyi Ðekae (Console d'Administration)

Ce document se concentre exclusivement sur les tâches nécessaires pour finaliser l'interface d'administration et les APIs de gestion du projet **Miyi Ðekae**.

---

## Dashboard & Monitoring (Statistiques)

**Objectif** : Fournir une vue d'ensemble réelle de l'activité de la plateforme au Rectorat.

### Backend (Admin API)

- [ ] **API Stats Réelles** : Finaliser `GET /api/admin/stats` pour agréger les données (Utilisateurs, Trajets, Onboarding en attente).
- [ ] **Sécurité** : Implémenter une vérification stricte du rôle `administrateur` dans le middleware Next.js pour toutes les routes `/api/admin/*`.

### Web Frontend (Admin)

- [ ] **Liaison AdminDashboard** : Remplacer les données statiques dans `src/components/dashboard/AdminDashboard.tsx` par des appels à l'API stats.
- [ ] **Graphiques d'activité** : Intégrer une bibliothèque de graphiques (ex: Recharts) pour visualiser l'évolution des trajets.
- [ ] **Flux d'activité en direct** : Connecter le composant "Flux d'activité" aux derniers `audit_logs` de la base de données.

---

## Gestion des Conducteurs & Véhicules

**Objectif** : Gérer le processus d'onboarding et la validité du matériel.

### Backend (Admin API)

- [ ] **Validation de dossier** : Créer l'endpoint `PATCH /api/admin/driver-applications/[id]` pour approuver ou rejeter une demande.
- [ ] **Gestion Véhicules** : API pour lister et modifier le statut des véhicules (`en_attente`, `approuvé`, `rejeté`).

### Web Frontend (Admin)

- [ ] **Interface de validation** : Développer la page `/dashboard/drivers` avec liste filtrable et vue détaillée (affichage du permis).
- [ ] **Modale de décision** : Formulaire permettant de donner une raison lors d'un rejet (envoi d'une notification).

---

## Gestion des Utilisateurs & Audit

**Objectif** : Contrôler la base utilisateur et assurer la traçabilité des actions.

### Backend (Admin API)

- [ ] **User Management API** : Finaliser `GET /api/admin/users` avec recherche et filtrage.
- [ ] **Actions de modération** : Endpoint `POST /api/admin/users/[id]/suspend` pour bannir un compte.
- [ ] **Audit Logs Export** : Extraction des logs d'audit en format CSV.

### Web Frontend (Admin)

- [ ] **Console Utilisateurs** : Créer l'interface `/dashboard/users` pour la gestion globale des profils.
- [ ] **Historique Individuel** : Vue permettant de voir les actions passées d'un utilisateur spécifique.

---

## Signalements & Résolution des Litiges

**Objectif** : Assurer la sécurité des passagers en traitant les incidents signalés.

### Backend (Admin API)

- [x] **API Signalements** : Finaliser `GET /api/admin/reports` pour lister les litiges.
- [x] **Résolution** : Endpoint pour marquer un signalement comme `résolu` ou `rejeté`.

### Web Frontend (Admin)

- [x] **Interface Litiges** : Créer `/dashboard/reports` pour visualiser et traiter les plaintes.

---

## Tâches Critiques Immédiates

1. **Liaison API Stats** : Priorité absolue pour le monitoring.
2. **Affichage du Permis** : Intégration des images Uploadthing dans le back-office.
3. **Journal d'Audit** : Traçabilité systématique des actions administratives.
