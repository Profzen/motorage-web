import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users, reservations, trajets } from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { updateProfileSchema } from "@/lib/validation";
import { z } from "zod";

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
    const cookieToken = cookieStore.get("token")?.value;

    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized();
    }

    // Fetch full user data from database without sensitive fields
    const user = await db.query.users.findFirst({
      where: eq(users.id, authPayload.userId),
      columns: {
        password: false,
        refreshToken: false,
      },
    });

    if (!user) {
      return ApiErrors.notFound("Utilisateur");
    }

    const { ...userProfile } = user;

    // Get user stats depending on role
    const stats: any = {};

    // 1. Reservations stats (for everyone, as a driver can also be a passenger)
    const [resTotal, resCompleted] = await Promise.all([
      db.select({ value: count() }).from(reservations).where(eq(reservations.etudiantId, user.id)),
      db.select({ value: count() }).from(reservations).where(and(eq(reservations.etudiantId, user.id), eq(reservations.statut, "terminé"))),
    ]);

    stats.reservations = {
      total: resTotal[0]?.value || 0,
      completed: resCompleted[0]?.value || 0,
    };

    // 2. Trajets stats (only for conducteurs)
    if (user.role === "conducteur") {
      const [traTotal, traCompleted] = await Promise.all([
        db.select({ value: count() }).from(trajets).where(eq(trajets.conducteurId, user.id)),
        db.select({ value: count() }).from(trajets).where(and(eq(trajets.conducteurId, user.id), eq(trajets.statut, "terminé")))
      ]);

      stats.trajets = {
        total: traTotal[0]?.value || 0,
        completed: traCompleted[0]?.value || 0,
      };
    }

    return successResponse({
      user,
      stats,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return ApiErrors.serverError();
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;

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
        return ApiErrors.conflict(
          "email",
          "Cet email est déjà utilisé par un autre compte"
        );
      }
    }

    const updated = await db
      .update(users)
      .set(validatedData)
      .where(eq(users.id, authPayload.userId))
      .returning();

    if (updated.length === 0) {
      return ApiErrors.notFound("Utilisateur");
    }

    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      password: _p,
      refreshToken: _rt,
      ...userWithoutSensitiveData
    } = updated[0];
    /* eslint-enable @typescript-eslint/no-unused-vars */

    return successResponse({
      message: "Profil mis à jour avec succès",
      user: userWithoutSensitiveData,
    });
  } catch (error: unknown) {
    console.error("Update profile error:", error);
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError(
        "Validation failed",
        undefined,
        error.issues
      );
    }
    return ApiErrors.serverError();
  }
}
