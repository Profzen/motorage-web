import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { zones } from '@/lib/db/schema';
import { zoneSchema } from '@/lib/validation';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /zones/{id}:
 *   get:
 *     tags:
 *       - Zones
 *     summary: Détails d'une zone
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la zone
 *       404:
 *         description: Zone non trouvée
 *   patch:
 *     tags:
 *       - Zones
 *     summary: Modifier une zone (Admin)
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
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Zone mise à jour
 *       400:
 *         description: Données invalides
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags:
 *       - Zones
 *     summary: Supprimer une zone (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Zone supprimée
 *     security:
 *       - bearerAuth: []
 */

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const zone = await db.query.zones.findFirst({
            where: eq(zones.id, params.id),
        });

        if (!zone) {
            return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
        }

        return NextResponse.json(zone);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const validatedData = zoneSchema.partial().parse(body);

        const updated = await db.update(zones)
            .set(validatedData)
            .where(eq(zones.id, params.id))
            .returning();

        if (updated.length === 0) {
            return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
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
        const deleted = await db.delete(zones)
            .where(eq(zones.id, params.id))
            .returning();

        if (deleted.length === 0) {
            return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Zone supprimée avec succès' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
