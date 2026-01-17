import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { onboardingRequests, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { authenticateRequest } from "@/lib/auth";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { onboardingRequestSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

/**
 * @openapi
 * /me/apply-driver:
 *   post:
 *     tags:
 *       - Profile
 *     summary: Postuler pour devenir conducteur
 *     description: Permet à un passager de soumettre ses informations pour devenir conducteur. La demande sera examinée par un administrateur.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OnboardingRequest'
 *     responses:
 *       200:
 *         description: Demande soumise avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnboardingRequestResponse'
 *       400:
 *         description: Données invalides ou demande déjà en cours
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
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;

    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized();
    }

    // Vérifier si l'utilisateur est déjà conducteur
    const user = await db.query.users.findFirst({
      where: eq(users.id, authPayload.userId),
    });

    if (user?.role === "conducteur") {
      return ApiErrors.badRequest("Vous êtes déjà enregistré comme conducteur");
    }

    // Vérifier s'il y a déjà une demande en attente
    const existingApplication = await db.query.onboardingRequests.findFirst({
      where: eq(onboardingRequests.userId, authPayload.userId),
    });

    if (existingApplication && existingApplication.statut === "en_attente") {
      return ApiErrors.badRequest(
        "Une demande est déjà en cours de traitement"
      );
    }

    const body = await request.json();
    const validatedData = onboardingRequestSchema.parse(body);

    // Créer la demande
    const newApplication = await db
      .insert(onboardingRequests)
      .values({
        userId: authPayload.userId,
        ...validatedData,
        statut: "en_attente",
      })
      .returning();

    return successResponse({
      message:
        "Votre demande a été soumise avec succès et est en attente de validation.",
      application: newApplication[0],
    });
  } catch (error) {
    console.error("Driver application error:", error);
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json({ error: error }, { status: 400 });
    }
    return ApiErrors.serverError();
  }
}
