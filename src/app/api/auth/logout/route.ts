import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Déconnecter l'utilisateur
 *     description: Supprime les cookies de session (token et refreshToken).
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
export async function POST() {
    const cookieStore = await cookies();

    cookieStore.delete('token');
    cookieStore.delete('refreshToken');

    return NextResponse.json({ message: 'Déconnecté avec succès' });
}
