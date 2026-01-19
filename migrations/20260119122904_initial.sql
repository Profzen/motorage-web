-- Create "audit_logs" table
CREATE TABLE `audit_logs` (
  `id` text NOT NULL,
  `user_id` text NULL,
  `action` text NOT NULL,
  `target_id` text NULL,
  `details` text NULL,
  `ip` text NULL,
  `user_agent` text NULL,
  `created_at` text NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`id`),
  CONSTRAINT `0` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE NO ACTION ON DELETE SET NULL
);
-- Create "notifications" table
CREATE TABLE `notifications` (
  `id` text NOT NULL,
  `user_id` text NOT NULL,
  `type` text NOT NULL,
  `title` text NOT NULL,
  `message` text NOT NULL,
  `is_read` integer NOT NULL DEFAULT false,
  `data` text NULL,
  `created_at` text NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`id`),
  CONSTRAINT `0` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create "onboarding_requests" table
CREATE TABLE `onboarding_requests` (
  `id` text NOT NULL,
  `user_id` text NOT NULL,
  `permis_numero` text NOT NULL,
  `permis_image` text NULL,
  `vehicule_type` text NOT NULL DEFAULT 'moto',
  `vehicule_marque` text NOT NULL,
  `vehicule_modele` text NOT NULL,
  `vehicule_immatriculation` text NOT NULL,
  `statut` text NOT NULL DEFAULT 'en_attente',
  `commentaire_admin` text NULL,
  `created_at` text NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` text NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`id`),
  CONSTRAINT `0` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create "reports" table
CREATE TABLE `reports` (
  `id` text NOT NULL,
  `reporter_id` text NOT NULL,
  `reported_id` text NULL,
  `trajet_id` text NULL,
  `type` text NOT NULL,
  `titre` text NOT NULL,
  `description` text NOT NULL,
  `statut` text NOT NULL DEFAULT 'en_attente',
  `commentaire_admin` text NULL,
  `created_at` text NULL DEFAULT (CURRENT_TIMESTAMP),
  `updated_at` text NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`id`),
  CONSTRAINT `0` FOREIGN KEY (`trajet_id`) REFERENCES `trajets` (`id`) ON UPDATE NO ACTION ON DELETE SET NULL,
  CONSTRAINT `1` FOREIGN KEY (`reported_id`) REFERENCES `users` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT `2` FOREIGN KEY (`reporter_id`) REFERENCES `users` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create "reservations" table
CREATE TABLE `reservations` (
  `id` text NOT NULL,
  `trajet_id` text NOT NULL,
  `etudiant_id` text NOT NULL,
  `statut` text NOT NULL DEFAULT 'en_attente',
  `created_at` text NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`id`),
  CONSTRAINT `0` FOREIGN KEY (`etudiant_id`) REFERENCES `users` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT `1` FOREIGN KEY (`trajet_id`) REFERENCES `trajets` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create "trajets" table
CREATE TABLE `trajets` (
  `id` text NOT NULL,
  `vehicule_id` text NULL,
  `point_depart` text NOT NULL,
  `destination` text NOT NULL,
  `depart_zone_id` text NULL,
  `arrivee_zone_id` text NULL,
  `date_heure` text NOT NULL,
  `places_disponibles` integer NOT NULL DEFAULT 1,
  `conducteur_id` text NOT NULL,
  `statut` text NOT NULL DEFAULT 'ouvert',
  `departure_lat` real NULL,
  `departure_lng` real NULL,
  `arrival_lat` real NULL,
  `arrival_lng` real NULL,
  `created_at` text NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`id`),
  CONSTRAINT `0` FOREIGN KEY (`conducteur_id`) REFERENCES `users` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE,
  CONSTRAINT `1` FOREIGN KEY (`arrivee_zone_id`) REFERENCES `zones` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT `2` FOREIGN KEY (`depart_zone_id`) REFERENCES `zones` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION,
  CONSTRAINT `3` FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules` (`id`) ON UPDATE NO ACTION ON DELETE SET NULL
);
-- Create "users" table
CREATE TABLE `users` (
  `id` text NOT NULL,
  `nom` text NOT NULL,
  `prenom` text NOT NULL,
  `email` text NOT NULL,
  `password` text NOT NULL,
  `role` text NOT NULL DEFAULT 'passager',
  `statut` text NOT NULL DEFAULT 'actif',
  `avatar` text NULL,
  `phone` text NULL,
  `home_zone_id` text NULL,
  `refresh_token` text NULL,
  `created_at` text NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`id`),
  CONSTRAINT `0` FOREIGN KEY (`home_zone_id`) REFERENCES `zones` (`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- Create index "users_email_unique" to table: "users"
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
-- Create "vehicules" table
CREATE TABLE `vehicules` (
  `id` text NOT NULL,
  `type` text NOT NULL DEFAULT 'moto',
  `marque` text NOT NULL,
  `modele` text NOT NULL,
  `immatriculation` text NOT NULL,
  `image` text NULL,
  `disponibilite` integer NOT NULL DEFAULT true,
  `proprietaire_id` text NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `0` FOREIGN KEY (`proprietaire_id`) REFERENCES `users` (`id`) ON UPDATE NO ACTION ON DELETE CASCADE
);
-- Create index "vehicules_immatriculation_unique" to table: "vehicules"
CREATE UNIQUE INDEX `vehicules_immatriculation_unique` ON `vehicules` (`immatriculation`);
-- Create "zones" table
CREATE TABLE `zones` (
  `id` text NOT NULL,
  `nom` text NOT NULL,
  `description` text NULL,
  `created_at` text NULL DEFAULT (CURRENT_TIMESTAMP),
  PRIMARY KEY (`id`)
);
-- Create index "zones_nom_unique" to table: "zones"
CREATE UNIQUE INDEX `zones_nom_unique` ON `zones` (`nom`);
