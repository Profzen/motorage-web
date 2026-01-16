import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

// Table UTILISATEURS
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  nom: text('nom').notNull(),
  prenom: text('prenom').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // Pour l'authentification
  role: text('role').notNull().default('passager'), // visiteur, passager, conducteur, administrateur
  statut: text('statut').notNull().default('actif'), // actif, suspendu, etc.
  avatar: text('avatar'),
  phone: text('phone'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const usersRelations = relations(users, ({ many }) => ({
  motos: many(motos),
  trajets: many(trajets),
  reservations: many(reservations),
  zones: many(zones), // Admin who created the zone if needed, but zones are global here
}));

// Table ZONES
export const zones = sqliteTable('zones', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  nom: text('nom').notNull().unique(),
  description: text('description'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const zonesRelations = relations(zones, ({ many }) => ({
  trajetsDepart: many(trajets, { relationName: 'departZone' }),
  trajetsArrivee: many(trajets, { relationName: 'arriveeZone' }),
}));

// Table MOTOS
export const motos = sqliteTable('motos', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  marque: text('marque').notNull(),
  modele: text('modele').notNull(),
  immatriculation: text('immatriculation').notNull().unique(),
  disponibilite: integer('disponibilite', { mode: 'boolean' }).notNull().default(true),
  proprietaireId: text('proprietaire_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
});

export const motosRelations = relations(motos, ({ one }) => ({
  proprietaire: one(users, {
    fields: [motos.proprietaireId],
    references: [users.id],
  }),
}));

// Table TRAJETS
export const trajets = sqliteTable('trajets', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  pointDepart: text('point_depart').notNull(),
  destination: text('destination').notNull(),
  departZoneId: text('depart_zone_id').references(() => zones.id),
  arriveeZoneId: text('arrivee_zone_id').references(() => zones.id),
  dateHeure: text('date_heure').notNull(), // Datetime string
  placesDisponibles: integer('places_disponibles').notNull().default(1),
  conducteurId: text('conducteur_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  statut: text('statut').notNull().default('ouvert'), // ouvert, plein, terminé, annulé

  // Champs techniques pour la carte (Next.js MapView)
  departureLat: real('departure_lat'),
  departureLng: real('departure_lng'),
  arrivalLat: real('arrival_lat'),
  arrivalLng: real('arrival_lng'),

  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const trajetsRelations = relations(trajets, ({ one, many }) => ({
  conducteur: one(users, {
    fields: [trajets.conducteurId],
    references: [users.id],
  }),
  departZone: one(zones, {
    fields: [trajets.departZoneId],
    references: [zones.id],
    relationName: 'departZone',
  }),
  arriveeZone: one(zones, {
    fields: [trajets.arriveeZoneId],
    references: [zones.id],
    relationName: 'arriveeZone',
  }),
  reservations: many(reservations),
}));

// Table RESERVATIONS
export const reservations = sqliteTable('reservations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  trajetId: text('trajet_id').notNull().references(() => trajets.id, { onDelete: 'cascade' }),
  etudiantId: text('etudiant_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  statut: text('statut').notNull().default('en_attente'), // en_attente, confirmé, refusé, terminé
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
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
