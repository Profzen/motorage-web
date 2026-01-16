import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, not } from 'drizzle-orm';

/**
 * @openapi
 * /admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Liste tous les utilisateurs (Admin)
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *     security:
 *       - bearerAuth: []
 */

export async function GET() {
    try {
        const allUsers = await db.query.users.findMany({
            columns: {
                password: false,
            },
            orderBy: (users, { desc }) => [desc(users.createdAt)],
        });

        return NextResponse.json(allUsers);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
