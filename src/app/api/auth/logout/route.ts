import { cookies } from 'next/headers';
import { successResponse } from '@/lib/api-response';

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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
export async function POST() {
    const cookieStore = await cookies();

    cookieStore.delete('token');
    cookieStore.delete('refreshToken');

    return successResponse({ message: 'Déconnecté avec succès' });
}
