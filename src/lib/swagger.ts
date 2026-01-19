import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Miyi Ðekae API Documentation",
      version: "1.0.0",
      description: "Documentation for the Miyi Ðekae student carpooling API",
    },
    servers: [
      {
        url: "/api",
        description: "Auto-détecté",
      },
      {
        url: "https://projet-motorage-web.vercel.app/api",
        description: "Serveur de Production",
      },
      {
        url: "http://localhost:3000/api",
        description: "Serveur Local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Utiliser le header Authorization: Bearer <token>",
        },
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Alias pour bearerAuth",
        },
      },
      schemas: {
        // --- ENTITIES (Pure Data Models) ---
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            nom: { type: "string" },
            prenom: { type: "string" },
            email: { type: "string", format: "email" },
            role: {
              type: "string",
              enum: ["conducteur", "passager", "administrateur"],
            },
            statut: { type: "string" },
            avatar: { type: "string", nullable: true },
            phone: { type: "string", nullable: true },
            homeZoneId: { type: "string", format: "uuid", nullable: true },
          },
          example: {
            nom: "Kouassi",
            prenom: "Jean",
            email: "jean.kouassi@univ-lome.tg",
            role: "passager",
            statut: "actif",
            phone: "+228 90 12 34 56",
            homeZoneId: "z1-zone-id-uuid",
          },
        },
        RegisterInput: {
          type: "object",
          required: ["nom", "prenom", "email", "password"],
          properties: {
            nom: { type: "string" },
            prenom: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
            phone: { type: "string", nullable: true },
            homeZoneId: { type: "string", format: "uuid", nullable: true },
          },
          example: {
            nom: "Kouassi",
            prenom: "Jean",
            email: "jean.kouassi@univ-lome.tg",
            password: "monSuperMotDePasse123",
            phone: "+228 90 12 34 56",
            homeZoneId: "z1-zone-id-uuid",
          },
        },
        Trajet: {
          type: "object",
          required: [
            "conducteurId",
            "pointDepart",
            "destination",
            "dateHeure",
            "placesDisponibles",
          ],
          properties: {
            id: { type: "string", format: "uuid" },
            vehiculeId: { type: "string", format: "uuid", nullable: true },
            conducteurId: { type: "string", format: "uuid" },
            pointDepart: { type: "string" },
            destination: { type: "string" },
            departZoneId: { type: "string", format: "uuid", nullable: true },
            arriveeZoneId: { type: "string", format: "uuid", nullable: true },
            dateHeure: { type: "string", format: "date-time" },
            placesDisponibles: { type: "integer", minimum: 1, maximum: 4 },
            departureLat: { type: "number", nullable: true },
            departureLng: { type: "number", nullable: true },
            arrivalLat: { type: "number", nullable: true },
            arrivalLng: { type: "number", nullable: true },
            statut: {
              type: "string",
              enum: ["ouvert", "plein", "terminé", "annulé"],
            },
          },
          example: {
            conducteurId: "a1b2c3d4-e5f6-4g7h-8i9j-k1l2m3n4o5p6",
            pointDepart: "Campus Nord - Amphi 600",
            destination: "Adidogomé - Carrefour Limousine",
            departZoneId: "z1-zone-id-uuid",
            arriveeZoneId: null,
            dateHeure: "2026-02-15T17:30:00Z",
            placesDisponibles: 3,
            departureLat: 6.175123,
            departureLng: 1.222456,
            arrivalLat: 6.180789,
            arrivalLng: 1.150123,
            statut: "ouvert",
          },
        },
        Reservation: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            trajetId: { type: "string", format: "uuid" },
            etudiantId: { type: "string", format: "uuid" },
            statut: {
              type: "string",
              enum: ["en_attente", "confirmé", "refusé", "terminé", "annulé"],
            },
            createdAt: { type: "string", format: "date-time" },
          },
          example: {
            id: "r1-res-id-uuid",
            trajetId: "t1-trajet-id-uuid",
            etudiantId: "u1-user-id-uuid",
            statut: "en_attente",
            createdAt: "2026-01-19T10:00:00Z",
          },
        },
        Zone: {
          type: "object",
          properties: {
            nom: { type: "string" },
            description: { type: "string", nullable: true },
          },
          example: {
            nom: "Campus Sud",
            description: "Zone regroupant les facultés de droit et de lettres.",
          },
        },
        Vehicule: {
          type: "object",
          properties: {
            id: { type: "string" },
            type: { type: "string", enum: ["moto", "voiture", "autre"] },
            marque: { type: "string" },
            modele: { type: "string" },
            immatriculation: { type: "string" },
            disponibilite: { type: "boolean" },
            proprietaireId: { type: "string", format: "uuid" },
          },
          example: {
            id: "v1-uuid",
            type: "moto",
            marque: "Haojue",
            modele: "110",
            immatriculation: "TG-1234-AZ",
            disponibilite: true,
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            type: {
              type: "string",
              enum: ["onboarding", "reservation", "system", "trajet"],
            },
            title: { type: "string" },
            message: { type: "string" },
            isRead: { type: "boolean" },
            data: {
              type: "string",
              description: "JSON string contextuel",
              nullable: true,
            },
            createdAt: { type: "string", format: "date-time" },
          },
          example: {
            id: "n1-noti-id-uuid",
            userId: "u1-user-id-uuid",
            type: "reservation",
            title: "Nouvelle demande",
            message: "Un étudiant a réservé une place.",
            isRead: false,
            data: '{"trajetId": "123"}',
            createdAt: "2026-01-17T10:00:00Z",
          },
        },
        Report: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            reporterId: { type: "string", format: "uuid" },
            reportedId: { type: "string", format: "uuid", nullable: true },
            trajetId: { type: "string", format: "uuid", nullable: true },
            type: {
              type: "string",
              enum: ["comportement", "retard", "securite", "autre"],
            },
            titre: { type: "string" },
            description: { type: "string" },
            statut: {
              type: "string",
              enum: ["en_attente", "en_cours", "resolu", "rejete"],
            },
            commentaireAdmin: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        ReportResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Report" },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        ReportListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Report" },
            },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },

        // --- SHARED COMPONENTS ---
        AuthTokensResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/AuthTokens" },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        ProfileResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                stats: {
                  type: "object",
                  properties: {
                    reservations: {
                      type: "object",
                      properties: {
                        total: { type: "integer" },
                        completed: { type: "integer" },
                      },
                    },
                    trajets: {
                      type: "object",
                      nullable: true,
                      description: "Uniquement présent si l'utilisateur est un conducteur",
                      properties: {
                        total: { type: "integer" },
                        completed: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        ApiError: {
          type: "object",
          description: "Format d'erreur standardisé",
          properties: {
            code: {
              type: "string",
              description: "Code d'erreur unique (ex: INVALID_CREDENTIALS)",
            },
            message: {
              type: "string",
              description: "Message d'erreur lisible",
            },
            field: {
              type: "string",
              nullable: true,
              description: "Champ concerné (pour les erreurs de validation)",
            },
            details: {
              type: "object",
              nullable: true,
              description: "Détails supplémentaires",
            },
          },
        },
        ErrorResponse400: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            data: { type: "object", nullable: true, example: null },
            error: {
              $ref: "#/components/schemas/ApiError",
              example: {
                code: "VALIDATION_ERROR",
                message: "Le mot de passe doit contenir au moins 8 caractères",
                field: "password",
              },
            },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        ErrorResponse401: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            data: { type: "object", nullable: true, example: null },
            error: {
              $ref: "#/components/schemas/ApiError",
              example: {
                code: "UNAUTHORIZED",
                message: "Token invalide ou expiré",
                field: null,
              },
            },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        ErrorResponse404: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            data: { type: "object", nullable: true, example: null },
            error: {
              $ref: "#/components/schemas/ApiError",
              example: {
                code: "NOT_FOUND",
                message: "Ressource non trouvée",
                field: null,
              },
            },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        ErrorResponse500: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            data: { type: "object", nullable: true, example: null },
            error: {
              $ref: "#/components/schemas/ApiError",
              example: {
                code: "INTERNAL_SERVER_ERROR",
                message: "Une erreur interne est survenue",
                field: null,
              },
            },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        PaginationMeta: {
          type: "object",
          description: "Métadonnées de pagination",
          properties: {
            page: { type: "integer", description: "Page actuelle" },
            limit: {
              type: "integer",
              description: "Nombre d'éléments par page",
            },
            total: { type: "integer", description: "Nombre total d'éléments" },
            totalPages: {
              type: "integer",
              description: "Nombre total de pages",
            },
            hasNext: {
              type: "boolean",
              description: "Existe-t-il une page suivante",
            },
            hasPrev: {
              type: "boolean",
              description: "Existe-t-il une page précédente",
            },
          },
          example: {
            page: 1,
            limit: 20,
            total: 100,
            totalPages: 5,
            hasNext: true,
            hasPrev: false,
          },
        },

        // --- API RESPONSES (Wrapped) ---
        // Generic fallback (avoid using if specific response exists)
        ApiResponse: {
          type: "object",
          properties: {
            success: { type: "boolean" },
            data: { type: "object", nullable: true },
            error: { $ref: "#/components/schemas/ApiError", nullable: true },
            meta: {
              $ref: "#/components/schemas/PaginationMeta",
              nullable: true,
            },
          },
        },
        // Specific Responses
        UserResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/User" },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        UserListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/User" },
            },
            error: { type: "object", nullable: true, example: null },
            meta: { $ref: "#/components/schemas/PaginationMeta" },
          },
        },
        TrajetResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Trajet" },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        TrajetListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Trajet" },
            },
            error: { type: "object", nullable: true, example: null },
            meta: { $ref: "#/components/schemas/PaginationMeta" },
          },
        },
        NotificationListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Notification" },
            },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        MessageResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                message: { type: "string" },
              },
            },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        ZoneResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Zone" },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        ZoneListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Zone" },
            },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        VehiculeResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Vehicule" },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        VehiculeListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Vehicule" },
            },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        ReservationResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/Reservation" },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        ReservationListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Reservation" },
            },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        UpdateProfileResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Profil mis à jour avec succès",
                },
                user: { $ref: "#/components/schemas/User" },
              },
            },
            error: { type: "object", nullable: true },
            meta: { type: "object", nullable: true },
          },
        },
        UpdatePasswordResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                message: {
                  type: "string",
                  example: "Mot de passe mis à jour avec succès",
                },
              },
            },
          },
        },
        AuthTokens: {
          type: "object",
          description: "Tokens d'authentification",
          properties: {
            token: {
              type: "string",
              description: "Access token JWT (expire en 15 minutes)",
            },
            refreshToken: {
              type: "string",
              description: "Refresh token JWT (expire en 7 jours)",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                token: { type: "string" },
                refreshToken: { type: "string" },
              },
            },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        UploadResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "object",
              properties: {
                url: {
                  type: "string",
                  example: "/uploads/2026/01/1737112345678-photo.jpg",
                },
                name: { type: "string", example: "photo.jpg" },
                size: { type: "integer", example: 102450 },
                type: { type: "string", example: "image/jpeg" },
              },
            },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        RefreshRequest: {
          type: "object",
          description: "Requête de rafraîchissement de token (pour mobile)",
          properties: {
            refreshToken: {
              type: "string",
              description: "Le refresh token à utiliser",
            },
          },
        },
        OnboardingRequest: {
          type: "object",
          required: [
            "permisNumero",
            "vehiculeType",
            "vehiculeMarque",
            "vehiculeModele",
            "vehiculeImmatriculation",
          ],
          properties: {
            permisNumero: { type: "string" },
            permisImage: { type: "string", format: "uri" },
            vehiculeType: { type: "string", enum: ["moto", "auto"] },
            vehiculeMarque: { type: "string" },
            vehiculeModele: { type: "string" },
            vehiculeImmatriculation: { type: "string" },
          },
          example: {
            permisNumero: "PERM-TG-2026-X88",
            permisImage: "https://utfs.io/f/sample-permis.jpg",
            vehiculeType: "moto",
            vehiculeMarque: "Haojue",
            vehiculeModele: "115-S",
            vehiculeImmatriculation: "TG-1234-BF",
          },
        },
        OnboardingRequestRecord: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            permisNumero: { type: "string" },
            permisImage: { type: "string", format: "uri", nullable: true },
            vehiculeType: { type: "string" },
            vehiculeMarque: { type: "string" },
            vehiculeModele: { type: "string" },
            vehiculeImmatriculation: { type: "string" },
            statut: {
              type: "string",
              enum: ["en_attente", "approuvé", "rejeté"],
            },
            commentaireAdmin: { type: "string", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        OnboardingRequestResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: { $ref: "#/components/schemas/OnboardingRequestRecord" },
            error: { type: "object", nullable: true, example: null },
            meta: { type: "object", nullable: true, example: null },
          },
        },
        OnboardingRequestListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/OnboardingRequestRecord" },
            },
            error: { type: "object", nullable: true, example: null },
            meta: { $ref: "#/components/schemas/PaginationMeta" },
          },
        },
      },
    },
  },
  apis: ["./src/app/api/**/*.ts"],
};

export const getApiDocs = () => {
  const spec = swaggerJsdoc(options);
  return spec;
};
