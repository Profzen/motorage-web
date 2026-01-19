CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`action` text NOT NULL,
	`target_id` text,
	`details` text,
	`ip` text,
	`user_agent` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`data` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `onboarding_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`permis_numero` text NOT NULL,
	`permis_image` text,
	`vehicule_type` text DEFAULT 'moto' NOT NULL,
	`vehicule_marque` text NOT NULL,
	`vehicule_modele` text NOT NULL,
	`vehicule_immatriculation` text NOT NULL,
	`statut` text DEFAULT 'en_attente' NOT NULL,
	`commentaire_admin` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text NOT NULL,
	`reported_id` text,
	`trajet_id` text,
	`type` text NOT NULL,
	`titre` text NOT NULL,
	`description` text NOT NULL,
	`statut` text DEFAULT 'en_attente' NOT NULL,
	`commentaire_admin` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`reported_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`trajet_id`) REFERENCES `trajets`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`trajet_id` text NOT NULL,
	`etudiant_id` text NOT NULL,
	`statut` text DEFAULT 'en_attente' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`trajet_id`) REFERENCES `trajets`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`etudiant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `trajets` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicule_id` text,
	`point_depart` text NOT NULL,
	`destination` text NOT NULL,
	`depart_zone_id` text,
	`arrivee_zone_id` text,
	`date_heure` text NOT NULL,
	`places_disponibles` integer DEFAULT 1 NOT NULL,
	`conducteur_id` text NOT NULL,
	`statut` text DEFAULT 'ouvert' NOT NULL,
	`departure_lat` real,
	`departure_lng` real,
	`arrival_lat` real,
	`arrival_lng` real,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`vehicule_id`) REFERENCES `vehicules`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`depart_zone_id`) REFERENCES `zones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`arrivee_zone_id`) REFERENCES `zones`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`conducteur_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`nom` text NOT NULL,
	`prenom` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'passager' NOT NULL,
	`statut` text DEFAULT 'actif' NOT NULL,
	`avatar` text,
	`phone` text,
	`home_zone_id` text,
	`refresh_token` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`home_zone_id`) REFERENCES `zones`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `vehicules` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text DEFAULT 'moto' NOT NULL,
	`marque` text NOT NULL,
	`modele` text NOT NULL,
	`immatriculation` text NOT NULL,
	`image` text,
	`disponibilite` integer DEFAULT true NOT NULL,
	`proprietaire_id` text NOT NULL,
	FOREIGN KEY (`proprietaire_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vehicules_immatriculation_unique` ON `vehicules` (`immatriculation`);--> statement-breakpoint
CREATE TABLE `zones` (
	`id` text PRIMARY KEY NOT NULL,
	`nom` text NOT NULL,
	`description` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `zones_nom_unique` ON `zones` (`nom`);