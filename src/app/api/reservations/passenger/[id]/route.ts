import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reservations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
                            }
                        }
                    }
                },
            },
            orderBy: (reservations, { desc }) => [desc(reservations.createdAt)],
        });

        return NextResponse.json(history);
    } catch (error) {
        console.error('Error fetching passenger history:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
