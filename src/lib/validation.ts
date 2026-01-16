import { z } from 'zod';

export const userSchema = z.object({
    nom: z.string().min(2),
    prenom: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['conducteur', 'passager', 'administrateur']).default('passager'),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export const motoSchema = z.object({
    marque: z.string().min(1),
    modele: z.string().min(1),
    immatriculation: z.string().min(4),
    disponibilite: z.boolean().default(true),
    proprietaireId: z.string().uuid().optional(),
});

export const zoneSchema = z.object({
    nom: z.string().min(2),
    description: z.string().optional(),
});

export const trajetSchema = z.object({
    pointDepart: z.string().min(2),
    destination: z.string().min(2),
    departZoneId: z.string().uuid().optional().nullable(),
    arriveeZoneId: z.string().uuid().optional().nullable(),
    dateHeure: z.string().datetime(),
    placesDisponibles: z.number().int().min(1).max(4),
    conducteurId: z.string().uuid(),
    departureLat: z.number().optional().nullable(),
    departureLng: z.number().optional().nullable(),
    arrivalLat: z.number().optional().nullable(),
    arrivalLng: z.number().optional().nullable(),
    statut: z.enum(['ouvert', 'plein', 'terminé', 'annulé']).default('ouvert'),
});

export const reservationSchema = z.object({
    trajetId: z.string().uuid(),
    etudiantId: z.string().uuid(),
    statut: z.enum(['en_attente', 'confirmé', 'refusé', 'terminé', 'annulé']).default('en_attente'),
});
