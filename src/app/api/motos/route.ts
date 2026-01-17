import { db } from '@/lib/db';
import { motos } from '@/lib/db/schema';
import { motoSchema } from '@/lib/validation';
import { eq } from 'drizzle-orm';
import { successResponse, ApiErrors } from '@/lib/api-response';

/**
 * @openapi
 * /motos:
 *   get:
 *     tags:
 *       - Motos
 *     summary: Liste des motos
 *     description: Récupère la liste de toutes les motos (Admin) ou filtrées par propriétaire.
 *     parameters:
 *       - in: query
 *         name: proprietaireId
 *         schema:
 *           type: string
 *         description: ID du propriétaire pour filtrer les motos
 *     responses:
 *       200:
 *         description: Liste des motos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MotoListResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *     security:
 *       - BearerAuth: []
 *   post:
 *     tags:
 *       - Motos
 *     summary: Enregistrer une nouvelle moto
 *     description: Permet à un conducteur d'ajouter un véhicule à son garage.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - marque
 *               - modele
 *               - immatriculation
 *               - proprietaireId
 *             properties:
 *               marque:
 *                 type: string
 *               modele:
 *                 type: string
 *               immatriculation:
 *                 type: string
 *               proprietaireId:
 *                 type: string
 *                 format: uuid
 *               disponibilite:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Moto créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MotoResponse'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *     security:
 *       - BearerAuth: []
 */

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const proprietaireId = searchParams.get('proprietaireId');

        let results;
        if (proprietaireId) {
            results = await db.select().from(motos).where(eq(motos.proprietaireId, proprietaireId));
        } else {
            results = await db.select().from(motos);
        }

        return successResponse(results);
    } catch (error) {
        console.error('Error fetching motos:', error);
        return ApiErrors.serverError();
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = motoSchema.parse(body);

        if (!validatedData.proprietaireId) {
            return ApiErrors.validationError('proprietaireId is required', 'proprietaireId');
        }

        const newMoto = await db.insert(motos).values({
            marque: validatedData.marque,
            modele: validatedData.modele,
            immatriculation: validatedData.immatriculation,
            disponibilite: validatedData.disponibilite,
            proprietaireId: validatedData.proprietaireId,
        }).returning();

        return successResponse(newMoto[0], undefined, 201);
    } catch (error) {
        if (error instanceof Error && error.name === 'ZodError') {
            return ApiErrors.validationError('Validation failed', undefined, (error as { errors?: unknown[] }).errors);
        }
        const message = error instanceof Error ? error.message : String(error);
        if (message.includes('UNIQUE constraint failed')) {
            return ApiErrors.validationError('Cette immatriculation est déjà enregistrée', 'immatriculation');
        }
        console.error('Error creating moto:', error);
        return ApiErrors.serverError();
    }
}
