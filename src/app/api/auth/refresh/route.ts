import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { cookies } from 'next/headers';
import { verifyRefreshToken, signJWT, signRefreshToken } from '@/lib/auth';

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Rafraîchir les tokens de session
 *     description: Utilise un refresh token valide (via cookie) pour générer de nouveaux access et refresh tokens.
 *     responses:
 *       200:
 *         description: Tokens rafraîchis avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Refresh token invalide ou expiré
 *       500:
 *         description: Erreur serveur
 */
export async function POST() {
    try {
        const cookieStore = await cookies();
        const refreshToken = cookieStore.get('refreshToken')?.value;

        if (!refreshToken) {
            return NextResponse.json({ error: 'Refresh token manquant' }, { status: 401 });
        }

        const payload = await verifyRefreshToken(refreshToken);

        if (!payload || !payload.userId) {
            return NextResponse.json({ error: 'Refresh token invalide' }, { status: 401 });
        }

        // Verify token against database
        const user = await db.query.users.findFirst({
            where: eq(users.id, payload.userId as string),
        });

        if (!user || user.refreshToken !== refreshToken) {
            return NextResponse.json({ error: 'Session expirée ou révoquée' }, { status: 401 });
        }

        // Generate new tokens (Rotation)
        const newPayload = { userId: user.id, email: user.email, role: user.role };
        const newAccessToken = await signJWT(newPayload);
        const newRefreshToken = await signRefreshToken(newPayload);

        // Update refresh token in DB
        await db.update(users)
            .set({ refreshToken: newRefreshToken })
            .where(eq(users.id, user.id));

        // Set new cookies
        cookieStore.set('token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60, // 15 minutes
            path: '/',
        });

        cookieStore.set('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        });

        return NextResponse.json({
            token: newAccessToken,
            refreshToken: newRefreshToken
        });
    } catch (error) {
        console.error('Refresh token error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
