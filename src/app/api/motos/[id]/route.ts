import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { motos } from '@/lib/db/schema';
import { motoSchema } from '@/lib/validation';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /motos/{id}:
 *   get:
 *     tags:
 *       - Motos
 *     summary: Détails d'une moto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la moto
 *       404:
 *         description: Moto non trouvée
 *   put:
 *     tags:
 *       - Motos
 *     summary: Modifier une moto
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
 *             $ref: '#/components/schemas/Moto'
 *     responses:
 *       200:
 *         description: Moto mise à jour
 *       400:
 *         description: Données invalides
 *   delete:
 *     tags:
 *       - Motos
 *     summary: Supprimer une moto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Moto supprimée
 */

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const moto = await db.query.motos.findFirst({
            where: eq(motos.id, params.id),
        });

        if (!moto) {
            return NextResponse.json({ error: 'Moto not found' }, { status: 404 });
        }

        return NextResponse.json(moto);
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
        const validatedData = motoSchema.partial().parse(body);

        const updatedMoto = await db.update(motos)
            .set(validatedData)
            .where(eq(motos.id, params.id))
            .returning();

        if (updatedMoto.length === 0) {
            return NextResponse.json({ error: 'Moto not found' }, { status: 404 });
        }

        return NextResponse.json(updatedMoto[0]);
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
        const deletedMoto = await db.delete(motos)
            .where(eq(motos.id, params.id))
            .returning();

        if (deletedMoto.length === 0) {
            return NextResponse.json({ error: 'Moto not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Moto deleted successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
