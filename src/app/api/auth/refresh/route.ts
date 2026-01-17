import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import {
  verifyRefreshToken,
  signJWT,
  signRefreshToken,
  extractRefreshTokenFromRequest,
} from "@/lib/auth";
import { successResponse, ApiErrors } from "@/lib/api-response";

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Rafraîchir les tokens de session
 *     description: |
 *       Utilise un refresh token valide pour générer de nouveaux access et refresh tokens.
 *       **Mobile**: Envoyer le refreshToken dans le body JSON.
 *       **Web**: Le refreshToken est lu depuis les cookies automatiquement.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Le refresh token (requis pour mobile, optionnel si cookie présent)
 *     responses:
 *       200:
 *         description: Tokens rafraîchis avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthTokensResponse'
 *       401:
 *         description: Refresh token invalide ou expiré
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
    const cookieRefreshToken = cookieStore.get("refreshToken")?.value;

    // Support both body (mobile) and cookie (web)
    const refreshToken = await extractRefreshTokenFromRequest(
      request,
      cookieRefreshToken
    );

    if (!refreshToken) {
      return ApiErrors.validationError(
        "Refresh token manquant",
        "refreshToken"
      );
    }

    const payload = await verifyRefreshToken(refreshToken);

    if (!payload || !payload.userId) {
      return ApiErrors.tokenInvalid();
    }

    // Verify token against database
    const user = await db.query.users.findFirst({
      where: eq(users.id, payload.userId as string),
    });

    if (!user || user.refreshToken !== refreshToken) {
      return ApiErrors.tokenExpired();
    }

    // Generate new tokens (Rotation)
    const newPayload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = await signJWT(newPayload);
    const newRefreshToken = await signRefreshToken(newPayload);

    // Update refresh token in DB
    await db
      .update(users)
      .set({ refreshToken: newRefreshToken })
      .where(eq(users.id, user.id));

    // Set new cookies (for web clients)
    cookieStore.set("token", newAccessToken as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    cookieStore.set("refreshToken", newRefreshToken as string, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    // Return tokens in response (for mobile clients)
    return successResponse({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    return ApiErrors.serverError();
  }
}
