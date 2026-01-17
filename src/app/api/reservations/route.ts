import { db } from '@/lib/db';
import { reservations, trajets } from '@/lib/db/schema';
import { reservationSchema } from '@/lib/validation';
import { eq } from 'drizzle-orm';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { authenticateRequest } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { cookies } from 'next/headers';

/**
 * @openapi
 * /reservations:
 *   post:
 *     tags:
 *       - Réservations
 *     summary: Réserver une place sur un trajet
 *     description: Permet à un étudiant de demander une place sur un trajet moto.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trajetId
 *             properties:
 *               trajetId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResponse'
 *       400:
 *         description: Pas de places disponibles ou données invalides
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Trajet non trouvé
 *     security:
 *       - BearerAuth: []
 */

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get('token')?.value;
        const authPayload = await authenticateRequest(request, cookieToken);

        if (!authPayload) {
            return ApiErrors.unauthorized();
        }

        const body = await request.json();
        const validatedData = reservationSchema.parse(body);

        const result = await db.transaction(async (tx) => {
            // Check if trajet exists
            const trajet = await tx.query.trajets.findFirst({
                where: eq(trajets.id, validatedData.trajetId),
            });

            if (!trajet) {
                return { error: ApiErrors.notFound('Trajet') };
            }

            if (trajet.placesDisponibles <= 0) {
                return { error: ApiErrors.badRequest('Plus de places disponibles') };
            }

            // Create reservation
            const newReservation = await tx.insert(reservations).values({
                trajetId: validatedData.trajetId,
                etudiantId: authPayload.userId,
                statut: 'en_attente',
            }).returning();

            return { data: newReservation[0], trajet };
        });

        if (result.error) {
            return result.error as any;
        }

        // Send notification to conductor
        await createNotification({
            userId: result.trajet!.conducteurId,
            type: 'reservation',
            title: 'Nouvelle demande',
            message: 'Un étudiant souhaite réserver une place sur votre trajet.',
            data: { reservationId: result.data!.id, trajetId: result.trajet!.id }
        });

        return successResponse(result.data, undefined, 201);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return ApiErrors.badRequest(error.errors[0].message);
        }
        console.error('Reservation error:', error);
        return ApiErrors.serverError();
    }
}

