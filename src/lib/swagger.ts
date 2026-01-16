import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Miyi Ðekae API Documentation',
            version: '1.0.0',
            description: 'Documentation for the Miyi Ðekae student carpooling API',
        },
        servers: [
            {
                url: '/api',
                description: 'Miyi Ðekae API',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        nom: { type: 'string' },
                        prenom: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        role: { type: 'string', enum: ['conducteur', 'passager', 'administrateur'] },
                        statut: { type: 'string' },
                        avatar: { type: 'string', nullable: true },
                        phone: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                    example: {
                        id: '550e8400-e29b-41d4-a716-446655440000',
                        nom: 'Doe',
                        prenom: 'John',
                        email: 'john.doe@univ-lome.tg',
                        role: 'passager',
                        statut: 'actif',
                        phone: '+228 90 00 0000',
                    }
                },
                Trajet: {
                    type: 'object',
                    required: ['conducteurId', 'pointDepart', 'destination', 'dateHeure', 'placesDisponibles'],
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        conducteurId: { type: 'string', format: 'uuid' },
                        pointDepart: { type: 'string' },
                        destination: { type: 'string' },
                        departZoneId: { type: 'string', format: 'uuid', nullable: true },
                        arriveeZoneId: { type: 'string', format: 'uuid', nullable: true },
                        dateHeure: { type: 'string', format: 'date-time' },
                        placesDisponibles: { type: 'integer', minimum: 1, maximum: 4 },
                        departureLat: { type: 'number', nullable: true },
                        departureLng: { type: 'number', nullable: true },
                        arrivalLat: { type: 'number', nullable: true },
                        arrivalLng: { type: 'number', nullable: true },
                        statut: { type: 'string', enum: ['ouvert', 'plein', 'terminé', 'annulé'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                    example: {
                        conducteurId: 'a1b2c3d4-e5f6-4g7h-8i9j-k1l2m3n4o5p6',
                        pointDepart: 'Campus Nord - Amphi 600',
                        destination: 'Adidogomé - Total',
                        departZoneId: 'z1-zone-id',
                        arriveeZoneId: 'z2-zone-id',
                        dateHeure: '2026-01-20T17:30:00Z',
                        placesDisponibles: 1,
                        departureLat: 6.175,
                        departureLng: 1.222,
                        arrivalLat: 6.180,
                        arrivalLng: 1.150,
                        statut: 'ouvert'
                    }
                },
                Reservation: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        trajetId: { type: 'string', format: 'uuid' },
                        etudiantId: { type: 'string', format: 'uuid' },
                        statut: { type: 'string', enum: ['en_attente', 'confirmé', 'refusé', 'terminé', 'annulé'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                    example: {
                        trajetId: 't1-trajet-id',
                        etudiantId: 'u1-user-id',
                        statut: 'en_attente'
                    }
                },
                Zone: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        nom: { type: 'string' },
                        description: { type: 'string', nullable: true },
                    },
                    example: {
                        nom: 'Campus Nord',
                        description: 'Zone principale regroupant les amphithéâtres 500, 600 et 1000.'
                    }
                },
                Moto: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        marque: { type: 'string' },
                        modele: { type: 'string' },
                        immatriculation: { type: 'string' },
                        disponibilite: { type: 'boolean' },
                        proprietaireId: { type: 'string', format: 'uuid' },
                    },
                    example: {
                        marque: 'Yamaha',
                        modele: 'Crypton',
                        immatriculation: 'TG-1234-AB',
                        disponibilite: true
                    }
                }
            },
        },
    },
    apis: ['./src/app/api/**/*.ts'], // Path to the API docs
};

export const getApiDocs = () => {
    const spec = swaggerJsdoc(options);
    return spec;
};
