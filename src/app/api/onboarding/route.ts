import { db } from "@/lib/db";
import { onboardingRequests } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";

const onboardingSchema = z.object({
  permisNumero: z.string().min(5, "Numéro de permis invalide"),
  motoMarque: z.string().min(2, "Marque de moto requise"),
  motoModele: z.string().min(2, "Modèle de moto requis"),
  motoImmatriculation: z.string().min(3, "Plaque d'immatriculation requise"),
  permisImage: z.string().url("URL de l'image du permis invalide"),
});

/**
 * @openapi
 * /onboarding:
 *   post:
 *     tags:
 *       - Onboarding
 *     summary: Soumettre une demande pour devenir conducteur
 *     description: Permet à un passager de soumettre ses informations de conducteur et de moto.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permisNumero
 *               - motoMarque
 *               - motoModele
 *               - motoImmatriculation
 *               - permisImage
 *             properties:
 *               permisNumero:
 *                 type: string
 *               motoMarque:
 *                 type: string
 *               motoModele:
 *                 type: string
 *               motoImmatriculation:
 *                 type: string
 *               permisImage:
 *                 type: string
 *     responses:
 *       201:
 *         description: Demande soumise avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Demande déjà existante ou données invalides
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
    const validatedData = onboardingSchema.parse(body);

    // Check if there's already a pending or approved request
    const existingRequest = await db.query.onboardingRequests.findFirst({
      where: and(
        eq(onboardingRequests.userId, authPayload.userId),
        eq(onboardingRequests.statut, "en_attente")
      ),
    });

    if (existingRequest) {
      return ApiErrors.badRequest("Vous avez déjà une demande en attente.");
    }

    // Create the request
    await db.insert(onboardingRequests).values({
      userId: authPayload.userId,
      permisNumero: validatedData.permisNumero,
      motoMarque: validatedData.motoMarque,
      motoModele: validatedData.motoModele,
      motoImmatriculation: validatedData.motoImmatriculation,
      permisImage: validatedData.permisImage,
      statut: "en_attente",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return successResponse(
      {
        message:
          "Votre demande a été soumise avec succès et est en attente de validation.",
      },
      undefined,
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiErrors.badRequest(error.issues[0].message);
    }
    console.error("Onboarding submission error:", error);
    return ApiErrors.serverError();
  }
}

/**
 * @openapi
 * /onboarding:
 *   get:
 *     tags:
 *       - Onboarding
 *     summary: Voir le statut de ma demande d'onboarding
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statut de la demande
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnboardingRequestResponse'
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized();
    }

    const myRequest = await db.query.onboardingRequests.findFirst({
      where: eq(onboardingRequests.userId, authPayload.userId),
      orderBy: (onboardingRequests, { desc }) => [
        desc(onboardingRequests.createdAt),
      ],
    });

    return successResponse(myRequest || { message: "Aucune demande trouvée" });
  } catch (error) {
    console.error("Get onboarding status error:", error);
    return ApiErrors.serverError();
  }
}
