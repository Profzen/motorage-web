import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reservations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { successResponse, ApiErrors } from '@/lib/api-response';

/**
 * @openapi
 * /reservations/passenger/{id}:
 *   get:
 *     tags:
 *       - Réservations
 *     summary: Historique des réservations d'un passager
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historique des réservations
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationListResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *     security:
 *       - BearerAuth: []
 */

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const history = await db.query.reservations.findMany({
            where: eq(reservations.etudiantId, params.id),
            with: {
                trajet: {
                    with: {
                        conducteur: {
                            columns: {
                                password: false,
                                refreshToken: false,
                            }
                        }
                    }
                },
            },
            orderBy: (reservations, { desc }) => [desc(reservations.createdAt)],
        });

        return successResponse(history);
    } catch (error) {
        console.error('Error fetching passenger history:', error);
        return ApiErrors.serverError();
    }
}
