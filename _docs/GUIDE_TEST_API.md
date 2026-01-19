# Guide de Test de l'API - MIYI ÐEKAE

Ce guide explique comment tester et valider les fonctionnalités de l'API de la console d'administration.

## 1. Documentation Interactive (Swagger)

L'API est documentée via Swagger UI. C'est l'outil privilégié pour tester rapidement les endpoints.

- **URL** : `http://localhost:3000/api-docs`
- **Utilisation** :
  1. Lancez le projet en local (`pnpm dev`).
  2. Ouvrez l'URL dans votre navigateur.
  3. Pour les endpoints protégés, vous devrez d'abord vous authentifier via `/api/auth/login`.

## 2. Authentification

La plupart des routes nécessitent un token JWT.

1. **Inscription** : `POST /api/auth/register`
   - Payload : `{ "nom": "...", "prenom": "...", "email": "...", "password": "...", "homeZoneId": "..." }`
   - _Note sur le homeZoneId_ : Pour remplir ce champ, vous devez d'abord faire un `GET /api/zones` (public) pour récupérer un UUID valide. Si vous ne le spécifiez pas, il sera mis à `null`.
   - _Sécurité_ : Les champs `role` et `statut` sont ignorés. Tout nouvel utilisateur est créé avec le rôle `passager` par défaut.
2. **Login** : `POST /api/auth/login`
   - Payload : `{ "email": "admin@example.com", "password": "..." }`
3. **Token** : Le serveur renvoie un `accessToken` et définit un cookie `refreshToken`.
4. **Usage** : Pour les tests via Postman ou curl, ajoutez le header `Authorization: Bearer <token>`.

## 3. Postman / Bruno

Pour des tests plus poussés :

- Importez le fichier JSON de définition OpenAPI disponible à l'adresse `/api/swagger`.
- Configurez une variable d'environnement `baseUrl` à `http://localhost:3000`.
- Utilisez les scripts de "Tests" dans Postman pour extraire automatiquement le token après le login.

## 4. Données et Base de données

### Drizzle Studio

Pour visualiser les changements en temps réel dans la base de données :

```bash
pnpm db:studio
```

Elle s'ouvrira sur `https://local.drizzle.studio`.

### Atlas (Migrations)

Si vous modifiez le schéma (`src/lib/db/schema.ts`) :

1. Poussez les changements : `pnpm migrate:push`
2. Vérifiez sur Turso : `npx dotenv-cli -- atlas schema inspect --env turso`

## 5. Endpoints Clés à Tester

- **Authentification** : `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/me`
- **Utilisateurs** : `GET /api/admin/users`, `GET /api/admin/users/[id]`
- **Signalements** : `GET /api/reports`, `PATCH /api/reports/[id]` (Validation admin)
- **Validation Véhicules** : `PATCH /api/admin/vehicules/[id]` (Validation ou rejet par admin)
- **Onboarding (User)** : `POST /api/onboarding` (Soumission), `GET /api/onboarding` (Statut)
- **Modération (Admin)** : `GET /api/admin/driver-applications`, `PATCH /api/admin/driver-applications/[id]`
- **Zones** : `GET /api/zones`, `POST /api/zones`

## 6. Processus : Devenir Conducteur

Le passage du rôle `passager` à `conducteur` suit un workflow strict :

1.  **Soumission (Passager)** :
    - L'utilisateur envoie ses documents via `POST /api/onboarding`.
    - **Exemple de Payload** :
      ```json
      {
        "permisNumero": "PERM-2024-00789",
        "permisImage": "https://utfs.io/f/mon-permis.jpg",
        "vehiculeMarque": "Haojue",
        "vehiculeModele": "115-S",
        "vehiculeImmatriculation": "TG-9999-BF"
      }
      ```
    - Sa demande est enregistrée avec le statut `en_attente`.
2.  **Vérification (Admin)** :
    - L'administrateur consulte les demandes via `GET /api/admin/driver-applications?statut=en_attente`.
    - L'administrateur approuve via `PATCH /api/admin/driver-applications/[id]` avec `{"statut": "approuve"}`.
3.  **Promotion automatique** :
    - Le système change le rôle de l'utilisateur de `passager` à `conducteur`.
    - Un objet `Véhicule` est automatiquement créé et lié à l'utilisateur avec le statut `approuvé`.
    - Une notification est envoyée à l'utilisateur.
4.  **Gestion des véhicules supplémentaires** :
    - Un conducteur peut ajouter d'autres véhicules via `POST /api/vehicules`.
    - Tout nouveau véhicule ajouté manuellement possède le statut `en_attente` par défaut.
    - L'administrateur doit valider ces nouveaux véhicules via `PATCH /api/admin/vehicules/[id]` avant qu'ils ne soient considérés comme "Vérifiés" sur la plateforme.
5.  **Accès aux fonctionnalités** :
    - L'utilisateur peut maintenant créer des trajets via `POST /api/trajets`.

## 7. Parcours de Test (User Journeys)

### A. Parcours Passager (Étudiant)

_Ce parcours simule un étudiant cherchant un trajet sur le campus._

1.  **Profil** : `GET /api/me` pour vérifier les informations et la zone de résidence.
2.  **Recherche** : `GET /api/trajets?departZoneId=UUID&arriveeZoneId=UUID`
3.  **Réservation** : `POST /api/reservations`
    ```json
    {
      "trajetId": "uuid-du-trajet-choisi"
    }
    ```
4.  **Suivi** : `GET /api/reservations/me` pour voir l'état de la demande.
5.  **Incident** : `POST /api/reports`
    ```json
    {
      "reportedId": "uuid-du-conducteur",
      "trajetId": "uuid-du-trajet",
      "type": "retard",
      "titre": "Conducteur non présent",
      "description": "Le conducteur n'est pas venu au point de rendez-vous après 15min."
    }
    ```

### B. Parcours Conducteur (Motard)

_Ce parcours simule un motard proposant ses services._

1.  **Onboarding** : `POST /api/onboarding`
    ```json
    {
      "permisNumero": "PERM-2024-00123",
      "permisImage": "https://utfs.io/f/sample-image.jpg",
      "vehiculeType": "moto",
      "vehiculeMarque": "Yamaha",
      "vehiculeModele": "Siriu 110",
      "vehiculeImmatriculation": "TG-4567-BJ"
    }
    ```
2.  **Statut** : Attendre validation admin ou vérifier via `GET /api/me`.
3.  **Véhicule** : `GET /api/vehicules/me`.
4.  **Création Trajet** : `POST /api/trajets`
    ```json
    {
      "pointDepart": "Entrée Campus Nord",
      "destination": "FSS / CHU",
      "departZoneId": "uuid-zone-nord",
      "arriveeZoneId": "uuid-zone-fss",
      "dateHeure": "2026-01-20T08:30:00Z",
      "placesDisponibles": 1,
      "departureLat": 6.1754,
      "departureLng": 1.2123
    }
    ```
5.  **Gestion** : `GET /api/reservations/trajet/[id]` pour voir les passagers.
6.  **Action** : `PATCH /api/trajets/[id]`
    ```json
    {
      "statut": "termine"
    }
    ```

### C. Parcours Administrateur

_Ce parcours simule la gestion globale de la plateforme._

1.  **Audit** : `GET /api/admin/stats` pour KPIs.
2.  **Modération Onboarding** :
    - `PATCH /api/admin/driver-applications/[id]`
      ```json
      {
        "statut": "approuve",
        "commentaireAdmin": "Documents vérifiés et valides."
      }
      ```
3.  **Gestion Utilisateurs** :
    - `PATCH /api/admin/users/[id]`
      ```json
      {
        "statut": "suspendu"
      }
      ```
4.  **Traitement des Litiges** :
    - `PATCH /api/reports/[id]`
      ```json
      {
        "statut": "resolu",
        "commentaireAdmin": "Avertissement envoyé au conducteur."
      }
      ```
5.  **Infrastructure** : `POST /api/zones`
    ```json
    {
      "nom": "Agora",
      "description": "Zone centrale près du bâtiment administratif"
    }
    ```

---

_Dernière mise à jour : 19 Janvier 2026_
