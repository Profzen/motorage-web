import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { authenticateRequest, comparePassword, hashPassword } from "@/lib/auth";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { updatePasswordSchema } from "@/lib/validation";

/**
 * @openapi
 * /me/password:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Changer le mot de passe de l'utilisateur connecté
 *     description: Permet à l'utilisateur de modifier son mot de passe en fournissant l'ancien.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UpdatePasswordResponse'
 *       400:
 *         description: "Données invalides (ex: confirmation différente)"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 *       401:
 *         description: Ancien mot de passe incorrect ou non autorisé
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
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;

    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const validatedData = updatePasswordSchema.parse(body);

    // Fetch user from database to check current password
    const user = await db.query.users.findFirst({
      where: eq(users.id, authPayload.userId),
    });

    if (!user) {
      return ApiErrors.notFound("Utilisateur");
    }

    // Verify current password
    const isPasswordValid = await comparePassword(
      validatedData.currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return ApiErrors.invalidCredentials(
        "currentPassword",
        "L'ancien mot de passe est incorrect"
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.newPassword);

    // Update password in database
    await db
      .update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, authPayload.userId));

    return successResponse({
      message: "Mot de passe mis à jour avec succès",
    });
  } catch (error) {
    console.error("Update password error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: error }, { status: 400 });
    }
    return ApiErrors.serverError();
  }
}
