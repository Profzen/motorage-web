import { loginSchema } from "@/lib/validation";
import { comparePassword, signJWT, signRefreshToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { logAudit } from "@/lib/audit";
import { z } from "zod";

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Connecter un utilisateur
 *     description: |
 *       Authentifie un utilisateur avec son email et son mot de passe.
 *       **Mobile**: Les tokens sont retournés dans le body JSON.
 *       **Web**: Les tokens sont également stockés dans des cookies HttpOnly.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentification réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse401'
 *       429:
 *         description: Trop de tentatives
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 */
export async function POST(request: Request) {
  try {
    // Rate limit: 5 attempts per minute per IP for login
    const ip = request.headers.get("x-forwarded-for") || "anonymous";
    const limit = rateLimit(ip, 5, 60000); // 5 attempts per 60s

    if (!limit.success) {
      return ApiErrors.custom(
        "Trop de tentatives. Veuillez réessayer plus tard.",
        429
      );
    }

    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    // Vérifier si l'utilisateur existe
    if (!user) {
      return ApiErrors.invalidCredentials(
        "email",
        "Aucun compte trouvé avec cet email"
      );
    }

    // Vérifier le mot de passe
    const isPasswordValid = await comparePassword(
      validatedData.password,
      user.password
    );
    if (!isPasswordValid) {
      return ApiErrors.invalidCredentials("password", "Mot de passe incorrect");
    }

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

    // Set cookies (for web clients)
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
      action: "LOGIN",
      details: `${user.nom} s'est connecté`,
    });

    // Return standardized response (for mobile and web)
    return successResponse({
      user: userWithoutPassword,
      token: accessToken,
      refreshToken,
    });
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError(
        "Validation failed",
        undefined,
        error.issues
      );
    }
    console.error("Login error:", error);
    return ApiErrors.serverError();
  }
}
