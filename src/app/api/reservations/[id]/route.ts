import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reservations, trajets } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

/**
 * @openapi
 * /reservations/{id}:
 *   patch:
 *     tags:
 *       - Réservations
 *     summary: Mettre à jour le statut d'une réservation
 *     description: Permet au conducteur d'accepter ou de refuser une demande.
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
 *             required:
 *               - statut
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [en_attente, confirmé, refusé, terminé, annulé]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Reservation'
 *       400:
 *         description: Impossible de confirmer (plus de places)
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags:
 *       - Réservations
 *     summary: Annuler une réservation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Réservation annulée
 *     security:
 *       - bearerAuth: []
 */


import { reservationSchema } from '@/lib/validation';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const { statut } = reservationSchema.partial().parse(body);

        if (!statut) {
            return NextResponse.json({ error: 'Statut is required' }, { status: 400 });
        }

        const result = await db.transaction(async (tx) => {
            const reservation = await tx.query.reservations.findFirst({
                where: eq(reservations.id, params.id),
                with: {
                    trajet: true,
                }
            });

            if (!reservation) {
                return { error: 'Réservation non trouvée', status: 404 };
            }

            // Logic for confirming: decrement placesDisponibles
            if (statut === 'confirmé' && reservation.statut !== 'confirmé') {
                if (reservation.trajet.placesDisponibles <= 0) {
                    return { error: 'Plus de places disponibles', status: 400 };
                }

                // Update trajet places
                await tx.update(trajets)
                    .set({ placesDisponibles: reservation.trajet.placesDisponibles - 1 })
                    .where(eq(trajets.id, reservation.trajetId));
            }

            // Logic for cancelling/refusing after confirmation: increment placesDisponibles
            if ((statut === 'refusé' || statut === 'annulé') && reservation.statut === 'confirmé') {
                await tx.update(trajets)
                    .set({ placesDisponibles: reservation.trajet.placesDisponibles + 1 })
                    .where(eq(trajets.id, reservation.trajetId));
            }

            const updated = await tx.update(reservations)
                .set({ statut })
                .where(eq(reservations.id, params.id))
                .returning();

            return { data: updated[0], status: 200 };
        });

        if ('error' in result) {
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json(result.data);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        console.error('Error updating reservation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await db.transaction(async (tx) => {
            const reservation = await tx.query.reservations.findFirst({
                where: eq(reservations.id, params.id),
            });

            if (reservation?.statut === 'confirmé') {
                // Re-increment places if it was confirmed
                const trajet = await tx.query.trajets.findFirst({ where: eq(trajets.id, reservation.trajetId) });
                if (trajet) {
                    await tx.update(trajets)
                        .set({ placesDisponibles: trajet.placesDisponibles + 1 })
                        .where(eq(trajets.id, trajet.id));
                }
            }

            await tx.delete(reservations).where(eq(reservations.id, params.id));
        });

        return NextResponse.json({ message: 'Réservation annulée' });
    } catch (error) {
        console.error('Error deleting reservation:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
