import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /admin/users/{id}:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Modifier le statut d'un utilisateur
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
 *               statut:
 *                 type: string
 *                 enum: [actif, suspendu, banni]
 *               role:
 *                 type: string
 *                 enum: [passager, conducteur, administrateur]
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *     security:
 *       - bearerAuth: []
 */

import { userSchema } from '@/lib/validation';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const validatedData = userSchema.partial().parse(body);

        // Security: Don't allow password updates through this admin endpoint
        // or handle it with appropriate hashing if needed. For now, omit it.
        const { password: __, ...updateFields } = validatedData;

        const updated = await db.update(users)
            .set(updateFields)
            .where(eq(users.id, params.id))
            .returning();

        if (updated.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { password: _, refreshToken: ___, ...userWithoutPassword } = updated[0];
        return NextResponse.json(userWithoutPassword);
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
        await db.delete(users).where(eq(users.id, params.id));
        return NextResponse.json({ message: 'User deleted' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
