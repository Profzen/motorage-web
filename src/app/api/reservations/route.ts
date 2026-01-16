import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reservations, trajets } from '@/lib/db/schema';
import { reservationSchema } from '@/lib/validation';
import { eq, sql } from 'drizzle-orm';

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
 *               - etudiantId
 *             properties:
 *               trajetId:
 *                 type: string
 *                 format: uuid
 *               etudiantId:
 *                 type: string
 *                 format: uuid
 *               statut:
 *                 type: string
 *                 enum: [en_attente, confirmé, refusé, terminé, annulé]
 *                 default: en_attente
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Pas de places disponibles ou données invalides
 *       500:
 *         description: Erreur serveur
 *     security:
 *       - bearerAuth: []
 */

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = reservationSchema.parse(body);

        const result = await db.transaction(async (tx) => {
            // Check if trajet still has places
            const trajet = await tx.query.trajets.findFirst({
                where: eq(trajets.id, validatedData.trajetId),
            });

            if (!trajet) {
                return { error: 'Trajet non trouvé', status: 404 };
            }

            if (trajet.placesDisponibles <= 0) {
                return { error: 'Plus de places disponibles', status: 400 };
            }

            const newReservation = await tx.insert(reservations).values({
                trajetId: validatedData.trajetId,
                etudiantId: validatedData.etudiantId,
                statut: 'en_attente',
            }).returning();

            return { data: newReservation[0], status: 201 };
        });

        if ('error' in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result.data, { status: 201 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Reservation error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
