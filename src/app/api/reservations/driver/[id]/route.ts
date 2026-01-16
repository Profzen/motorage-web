import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { reservations, trajets } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

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
                    }
                },
            }
        });

        return NextResponse.json(receivedRequests);
    } catch (error) {
        console.error('Error fetching driver requests:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
