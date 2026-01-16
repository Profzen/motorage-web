import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { trajets } from '@/lib/db/schema';
import { trajetSchema } from '@/lib/validation';
import { eq } from 'drizzle-orm';

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
 *       404:
 *         description: Trajet non trouvé
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
 *             $ref: '#/components/schemas/Trajet'
 *     responses:
 *       200:
 *         description: Trajet mis à jour
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
            return NextResponse.json({ error: 'Trajet non trouvé' }, { status: 404 });
        }

        return NextResponse.json(trajet);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
            return NextResponse.json({ error: 'Trajet non trouvé' }, { status: 404 });
        }

        return NextResponse.json(updated[0]);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
            return NextResponse.json({ error: 'Trajet non trouvé' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Trajet supprimé avec succès' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
