import { z } from "zod";

export const userSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  prenom: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  email: z.email("Adresse email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z
    .enum(["conducteur", "passager", "administrateur"])
    .default("passager"),
  phone: z.string().optional(),
  homeZoneId: z.string().optional().nullable(),
  statut: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export const registerApiSchema = userSchema.omit({
  role: true,
  statut: true,
});

export const registerFormSchema = userSchema
  .omit({ role: true })
  .extend({
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const vehiculeSchema = z.object({
  type: z.enum(["moto", "voiture", "autre"]).default("moto"),
  marque: z.string().min(1, "La marque est requise"),
  modele: z.string().min(1, "Le modèle est requis"),
  immatriculation: z
    .string()
    .min(4, "L'immatriculation doit contenir au moins 4 caractères"),
  image: z.string().optional().nullable(),
  disponibilite: z.boolean().default(true),
  statut: z.enum(["en_attente", "approuvé", "rejeté"]).default("en_attente"),
  commentaireAdmin: z.string().optional().nullable(),
  proprietaireId: z.string().min(1, "L'ID du propriétaire est requis"),
});

export const vehiculeAdminUpdateSchema = z.object({
  statut: z.enum(["en_attente", "approuvé", "rejeté"]),
  commentaireAdmin: z.string().optional().nullable(),
});

export const zoneSchema = z.object({
  nom: z.string().min(2, "Le nom de la zone doit au moins faire 2 caractères"),
  description: z.string().optional(),
});

export const trajetSchema = z.object({
  vehiculeId: z.string().optional().nullable(),
  pointDepart: z.string().min(2, "Le point de départ est requis"),
  destination: z.string().min(2, "La destination est requise"),
  departZoneId: z.string().optional().nullable(),
  arriveeZoneId: z.string().optional().nullable(),
  dateHeure: z.string().min(1, "La date et l'heure sont requises"), // Simplified for text datetime
  placesDisponibles: z
    .number()
    .int()
    .min(1, "Au moins une place requise")
    .max(4),
  conducteurId: z.string().min(1, "L'ID du conducteur est requis"),
  departureLat: z.number().optional().nullable(),
  departureLng: z.number().optional().nullable(),
  arrivalLat: z.number().optional().nullable(),
  arrivalLng: z.number().optional().nullable(),
  statut: z.enum(["ouvert", "plein", "terminé", "annulé"]).default("ouvert"),
});

export const reservationSchema = z.object({
  trajetId: z.string().min(1, "L'ID du trajet est requis"),
  etudiantId: z.string().min(1, "L'ID de l'étudiant est requis"),
  statut: z
    .enum(["en_attente", "confirmé", "refusé", "terminé", "annulé"])
    .default("en_attente"),
});

export const updateProfileSchema = z.object({
  nom: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .optional(),
  prenom: z
    .string()
    .min(2, "Le prénom doit contenir au moins 2 caractères")
    .optional(),
  email: z.email("Adresse email invalide").optional(),
  phone: z.string().optional(),
  avatar: z.url("URL de l'avatar invalide").optional().nullable(),
  homeZoneId: z.string().optional().nullable(),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "L'ancien mot de passe est requis"),
    newPassword: z
      .string()
      .min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string().min(1, "La confirmation est requise"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les nouveaux mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const onboardingRequestSchema = z.object({
  permisNumero: z.string().min(5, "Le numéro de permis est requis"),
  permisImage: z.url("L'URL de l'image du permis est invalide").optional(),
  vehiculeType: z.enum(["moto", "auto"]).default("moto"),
  vehiculeMarque: z.string().min(1, "La marque du véhicule est requise"),
  vehiculeModele: z.string().min(1, "Le modèle du véhicule est requis"),
  vehiculeImmatriculation: z.string().min(4, "L'immatriculation est requise"),
});
