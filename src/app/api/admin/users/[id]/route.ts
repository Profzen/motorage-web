import { db } from "@/lib/db";
import { users, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { userSchema } from "@/lib/validation";
import { authenticateAdmin } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

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
 *               $ref: '#/components/schemas/UserResponse'
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
 *     security:
 *       - BearerAuth: []
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateAdmin(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized("Accès réservé aux administrateurs");
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = userSchema.partial().parse(body);

    // Security: Don't allow password updates through this admin endpoint
    const { ...updateFields } = validatedData;

    const updated = await db
      .update(users)
      .set(updateFields)
      .where(eq(users.id, id))
      .returning();

    if (updated.length === 0) {
      return ApiErrors.notFound("Utilisateur");
    }

    // Log update action
    await db.insert(auditLogs).values({
      userId: authPayload.userId,
      targetId: id,
      action: "UPDATE_USER_ADMIN",
      details: `Changement : ${Object.keys(updateFields).join(", ")}`,
    });

    const user = updated[0];
    const { password: _p, refreshToken: _r, ...userWithoutPassword } = user;
    void _p;
    void _r;
    return successResponse(userWithoutPassword);
  } catch {
    return ApiErrors.serverError();
  }
}

/**
 * @openapi
 * /admin/users/{id}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Supprimer un utilisateur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *     security:
 *       - BearerAuth: []
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateAdmin(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized("Accès réservé aux administrateurs");
    }

    const { id } = await params;

    // Log before delete
    await db.insert(auditLogs).values({
      userId: authPayload.userId,
      targetId: id,
      action: "DELETE_USER_ADMIN",
      details: "Suppression définitive du compte par un administrateur",
    });

    await db.delete(users).where(eq(users.id, id));
    return successResponse({ message: "Utilisateur supprimé avec succès" });
  } catch {
    return ApiErrors.serverError();
  }
}
