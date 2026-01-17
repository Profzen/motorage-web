import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { trajets } from '@/lib/db/schema';
import { trajetSchema } from '@/lib/validation';
import { eq } from 'drizzle-orm';
import { successResponse, ApiErrors } from '@/lib/api-response';

/**
 * @openapi
 * /trajets/{id}:
 *   get:
 *     tags:
 *       - Trajets
 *     summary: Détails d'un trajet
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du trajet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrajetResponse'
 *       404:
 *         description: Trajet non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse404'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *     security:
 *       - bearerAuth: []
 *   put:
 *     tags:
 *       - Trajets
 *     summary: Modifier un trajet
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pointDepart:
 *                 type: string
 *               destination:
 *                 type: string
 *               dateHeure:
 *                 type: string
 *                 format: date-time
 *               placesDisponibles:
 *                 type: integer
 *               statut:
 *                 type: string
 *                 enum: [ouvert, plein, terminé, annulé]
 *     responses:
 *       200:
 *         description: Trajet mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrajetResponse'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 *       404:
 *         description: Trajet non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse404'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags:
 *       - Trajets
 *     summary: Supprimer un trajet
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trajet supprimé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Trajet non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse404'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *     security:
 *       - bearerAuth: []
 */

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const trajet = await db.query.trajets.findFirst({
            where: eq(trajets.id, params.id),
            with: {
                conducteur: {
                    columns: {
                        password: false,
                    },
                },
                departZone: true,
                arriveeZone: true,
                reservations: {
                    with: {
                        etudiant: {
                            columns: {
                                password: false,
                            },
                        },
                    },
                },
            },
        });

        if (!trajet) {
            return ApiErrors.notFound('Trajet');
        }

        return successResponse(trajet);
    } catch (error) {
        return ApiErrors.serverError();
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const validatedData = trajetSchema.partial().parse(body);

        const updated = await db.update(trajets)
            .set(validatedData)
            .where(eq(trajets.id, params.id))
            .returning();

        if (updated.length === 0) {
            return ApiErrors.notFound('Trajet');
        }

        return successResponse(updated[0]);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return ApiErrors.validationError('Validation failed', undefined, error.errors);
        }
        return ApiErrors.serverError();
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const deleted = await db.delete(trajets)
            .where(eq(trajets.id, params.id))
            .returning();

        if (deleted.length === 0) {
            return ApiErrors.notFound('Trajet');
        }

        return successResponse({ message: 'Trajet supprimé avec succès' });
    } catch (error) {
        return ApiErrors.serverError();
    }
}
