import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { authenticateRequest } from '@/lib/auth';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { updateProfileSchema } from '@/lib/validation';

/**
 * @openapi
 * /me:
 *   get:
 *     tags:
 *       - Auth
 *     summary: Obtenir le profil de l'utilisateur connecté
 *     description: |
 *       Retourne les informations de l'utilisateur authentifié.
 *       **Mobile**: Utiliser le header `Authorization: Bearer <token>`.
 *       **Web**: Le token est lu depuis les cookies automatiquement.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse401'
 *       404:
 *         description: Utilisateur non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse404'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *   patch:
 *     tags:
 *       - Auth
 *     summary: Mettre à jour le profil de l'utilisateur connecté
 *     description: Permet à l'utilisateur de modifier ses informations personnelles (nom, prénom, email, téléphone).
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdateProfileResponse'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 *       401:
 *         description: Non autorisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse401'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 */
export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get('token')?.value;

        const authPayload = await authenticateRequest(request, cookieToken);

        if (!authPayload) {
            return ApiErrors.unauthorized();
        }

        // Fetch full user data from database
        const user = await db.query.users.findFirst({
            where: eq(users.id, authPayload.userId),
        });

        if (!user) {
            return ApiErrors.notFound('Utilisateur');
        }

        // Remove sensitive data
        const { password: _, refreshToken: __, ...userWithoutSensitiveData } = user;

        // Get user stats (could be expanded later)
        // For now, return basic stats based on role
        const stats = {
            role: user.role,
            statut: user.statut,
            // Additional stats can be added here by querying related tables
        };

        return successResponse({
            user: userWithoutSensitiveData,
            stats,
        });
    } catch (error) {
        console.error('Get profile error:', error);
        return ApiErrors.serverError();
    }
}

export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get('token')?.value;

        const authPayload = await authenticateRequest(request, cookieToken);

        if (!authPayload) {
            return ApiErrors.unauthorized();
        }

        const body = await request.json();
        const validatedData = updateProfileSchema.parse(body);

        // Check if email is being updated and if it's already taken
        if (validatedData.email) {
            const existingUser = await db.query.users.findFirst({
                where: eq(users.email, validatedData.email),
            });

            if (existingUser && existingUser.id !== authPayload.userId) {
                return ApiErrors.conflict('email', 'Cet email est déjà utilisé par un autre compte');
            }
        }

        const updated = await db.update(users)
            .set(validatedData)
            .where(eq(users.id, authPayload.userId))
            .returning();

        if (updated.length === 0) {
            return ApiErrors.notFound('Utilisateur');
        }

        const { password: _, refreshToken: __, ...userWithoutSensitiveData } = updated[0];

        return successResponse({
            message: "Profil mis à jour avec succès",
            user: userWithoutSensitiveData
        });
    } catch (error) {
        console.error('Update profile error:', error);
        if (error instanceof Error && error.name === 'ZodError') {
            return NextResponse.json({ error: error }, { status: 400 });
        }
        return ApiErrors.serverError();
    }
}
