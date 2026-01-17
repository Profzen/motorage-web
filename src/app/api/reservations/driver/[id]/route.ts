import { db } from '@/lib/db';
import { trajets } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { successResponse, ApiErrors } from '@/lib/api-response';

/**
 * @openapi
 * /reservations/driver/{id}:
 *   get:
 *     tags:
 *       - Réservations
 *     summary: Liste des demandes reçues par un conducteur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des demandes
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
        const receivedRequests = await db.query.reservations.findMany({
            where: (reservations, { exists }) =>
                exists(
                    db.select().from(trajets).where(sql`${trajets.id} = ${reservations.trajetId} AND ${trajets.conducteurId} = ${params.id}`)
                ),
            with: {
                trajet: true,
                etudiant: {
                    columns: {
                        password: false,
                        refreshToken: false,
                    }
                },
            }
        });

        return successResponse(receivedRequests);
    } catch (error) {
        console.error('Error fetching driver requests:', error);
        return ApiErrors.serverError();
    }
}
