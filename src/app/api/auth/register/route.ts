import { registerApiSchema } from "@/lib/validation";
import { hashPassword, signJWT, signRefreshToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Créer un nouveau compte
 *     description: |
 *       Enregistre un nouvel étudiant sur la plateforme et connecte automatiquement l'utilisateur avec un système de refresh token.
 *       Renvoie les tokens dans le corps de la réponse pour les clients mobiles.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterInput'
 *     responses:
 *       201:
 *         description: Utilisateur créé et connecté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Données invalides ou email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = registerApiSchema.parse(body);

    const hashedPassword = await hashPassword(validatedData.password);

    const newUser = await db
      .insert(users)
      .values({
        nom: validatedData.nom,
        prenom: validatedData.prenom,
        email: validatedData.email,
        password: hashedPassword,
        role: "passager",
        statut: "actif",
        phone: validatedData.phone || null,
        homeZoneId: validatedData.homeZoneId || null,
      })
      .returning();

    const user = newUser[0];
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const {
      password: _password,
      refreshToken: _refreshTokenInDb,
      ...userWithoutPassword
    } = user;
    /* eslint-enable @typescript-eslint/no-unused-vars */

    // Generate Tokens
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = (await signJWT(payload)) as string;
    const refreshToken = (await signRefreshToken(payload)) as string;

    // Save refresh token to DB
    await db.update(users).set({ refreshToken }).where(eq(users.id, user.id));

    // Set cookies
    const cookieStore = await cookies();

    cookieStore.set("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Log activity
    await logAudit({
      userId: user.id,
      action: "REGISTER",
      details: `${user.nom} a rejoint la plateforme`,
    });

    return successResponse(
      {
        user: userWithoutPassword,
        token: accessToken,
        refreshToken,
      },
      undefined,
      201
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "";
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError(
        "Validation failed",
        undefined,
        error.issues
      );
    }
    if (errorMsg.includes("UNIQUE constraint failed")) {
      return ApiErrors.validationError("Cet email est déjà utilisé", "email");
    }
    console.error("Registration error:", error);
    return ApiErrors.serverError();
  }
}
