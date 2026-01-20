import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

// Table UTILISATEURS
export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  nom: text("nom").notNull(),
  prenom: text("prenom").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Pour l'authentification
  role: text("role").notNull().default("passager"), // passager, conducteur, administrateur
  statut: text("statut").notNull().default("actif"), // actif, suspendu, etc.
  avatar: text("avatar"),
  phone: text("phone"),
  homeZoneId: text("home_zone_id").references(() => zones.id),
  refreshToken: text("refresh_token"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const usersRelations = relations(users, ({ many, one }) => ({
  vehicules: many(vehicules),
  trajets: many(trajets),
  reservations: many(reservations),
  homeZone: one(zones, {
    fields: [users.homeZoneId],
    references: [zones.id],
  }),
}));

// Table ZONES
export const zones = sqliteTable("zones", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  nom: text("nom").notNull().unique(),
  description: text("description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const zonesRelations = relations(zones, ({ many }) => ({
  trajetsDepart: many(trajets, { relationName: "departZone" }),
  trajetsArrivee: many(trajets, { relationName: "arriveeZone" }),
}));

// Table VÉHICULES
export const vehicules = sqliteTable("vehicules", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  type: text("type").notNull().default("moto"), // moto, voiture, etc.
  marque: text("marque").notNull(),
  modele: text("modele").notNull(),
  immatriculation: text("immatriculation").notNull().unique(),
  image: text("image"), // URL de l'image (Uploadthing)
  disponibilite: integer("disponibilite", { mode: "boolean" })
    .notNull()
    .default(true),
  statut: text("statut").notNull().default("en_attente"), // en_attente, approuvé, rejeté
  commentaireAdmin: text("commentaire_admin"),
  proprietaireId: text("proprietaire_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const vehiculesRelations = relations(vehicules, ({ one, many }) => ({
  proprietaire: one(users, {
    fields: [vehicules.proprietaireId],
    references: [users.id],
  }),
  trajets: many(trajets),
}));

// Table TRAJETS
export const trajets = sqliteTable("trajets", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  vehiculeId: text("vehicule_id").references(() => vehicules.id, {
    onDelete: "set null",
  }),
  pointDepart: text("point_depart").notNull(),
  destination: text("destination").notNull(),
  departZoneId: text("depart_zone_id").references(() => zones.id),
  arriveeZoneId: text("arrivee_zone_id").references(() => zones.id),
  dateHeure: text("date_heure").notNull(), // Datetime string
  placesDisponibles: integer("places_disponibles").notNull().default(1),
  conducteurId: text("conducteur_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  statut: text("statut").notNull().default("ouvert"), // ouvert, plein, terminé, annulé

  // Champs techniques pour la carte (Next.js MapView)
  departureLat: real("departure_lat"),
  departureLng: real("departure_lng"),
  arrivalLat: real("arrival_lat"),
  arrivalLng: real("arrival_lng"),

  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const trajetsRelations = relations(trajets, ({ one, many }) => ({
  conducteur: one(users, {
    fields: [trajets.conducteurId],
    references: [users.id],
  }),
  vehicule: one(vehicules, {
    fields: [trajets.vehiculeId],
    references: [vehicules.id],
  }),
  departZone: one(zones, {
    fields: [trajets.departZoneId],
    references: [zones.id],
    relationName: "departZone",
  }),
  arriveeZone: one(zones, {
    fields: [trajets.arriveeZoneId],
    references: [zones.id],
    relationName: "arriveeZone",
  }),
  reservations: many(reservations),
}));

// Table RESERVATIONS
export const reservations = sqliteTable("reservations", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  trajetId: text("trajet_id")
    .notNull()
    .references(() => trajets.id, { onDelete: "cascade" }),
  etudiantId: text("etudiant_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  statut: text("statut").notNull().default("en_attente"), // en_attente, confirmé, refusé, terminé
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const reservationsRelations = relations(reservations, ({ one }) => ({
  trajet: one(trajets, {
    fields: [reservations.trajetId],
    references: [trajets.id],
  }),
  etudiant: one(users, {
    fields: [reservations.etudiantId],
    references: [users.id],
  }),
}));
// Table DEMANDES CONDUCTEURS (Onboarding Requests)
export const onboardingRequests = sqliteTable("onboarding_requests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  permisNumero: text("permis_numero").notNull(),
  permisImage: text("permis_image"), // URL de l'image stockée
  vehiculeType: text("vehicule_type").notNull().default("moto"),
  vehiculeMarque: text("vehicule_marque").notNull(),
  vehiculeModele: text("vehicule_modele").notNull(),
  vehiculeImmatriculation: text("vehicule_immatriculation").notNull(),
  statut: text("statut").notNull().default("en_attente"), // en_attente, approuvé, rejeté
  commentaireAdmin: text("commentaire_admin"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const onboardingRequestsRelations = relations(
  onboardingRequests,
  ({ one }) => ({
    user: one(users, {
      fields: [onboardingRequests.userId],
      references: [users.id],
    }),
  })
);

// Table NOTIFICATIONS
export const notifications = sqliteTable("notifications", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // onboarding, reservation, system, trajet
  title: text("title").notNull(),
  message: text("message").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  data: text("data"), // JSON string for extra info
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
// Table SIGNALEMENTS & LITIGES
export const reports = sqliteTable("reports", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  reportedId: text("reported_id").references(() => users.id, {
    onDelete: "cascade",
  }),
  trajetId: text("trajet_id").references(() => trajets.id, {
    onDelete: "set null",
  }),
  type: text("type").notNull(), // comportement, retard, securite, autre
  titre: text("titre").notNull(),
  description: text("description").notNull(),
  statut: text("statut").notNull().default("en_attente"), // en_attente, en_cours, resolu, rejete
  commentaireAdmin: text("commentaire_admin"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, {
    fields: [reports.reporterId],
    references: [users.id],
    relationName: "reporter",
  }),
  reported: one(users, {
    fields: [reports.reportedId],
    references: [users.id],
    relationName: "reported",
  }),
  trajet: one(trajets, {
    fields: [reports.trajetId],
    references: [trajets.id],
  }),
}));
// Table LOGS D'AUDIT (Analytics & Sécurité)
export const auditLogs = sqliteTable("audit_logs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(), // login, update_profile, approve_driver, create_trajet, etc.
  targetId: text("target_id"), // ID de la ressource concernée
  details: text("details"), // JSON string contextuel
  ip: text("ip"),
  userAgent: text("user_agent"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

// Table PUSH_SUBSCRIPTIONS (Pour les notifications mobiles)
export const pushSubscriptions = sqliteTable("push_subscriptions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const pushSubscriptionsRelations = relations(
  pushSubscriptions,
  ({ one }) => ({
    user: one(users, {
      fields: [pushSubscriptions.userId],
      references: [users.id],
    }),
  })
);
