import { db } from "@/lib/db";
import { onboardingRequests, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateRequest } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { onboardingRequestSchema } from "@/lib/validation";
import { cookies } from "next/headers";
import { z } from "zod";

/**
 * @openapi
 * /onboarding:
 *   post:
 *     tags:
 *       - Onboarding
 *     summary: Soumettre une demande pour devenir conducteur
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
 *       201:
 *         description: Demande soumise avec succès
 *       400:
 *         description: Demande déjà existante ou données invalides
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized();
    }

    // 1. Vérifier si l'utilisateur est déjà conducteur
    const user = await db.query.users.findFirst({
      where: eq(users.id, authPayload.userId),
    });

    if (user?.role === "conducteur") {
      return ApiErrors.badRequest("Vous êtes déjà enregistré comme conducteur");
    }

    // 2. Valider les données
    const body = await request.json();
    const validatedData = onboardingRequestSchema.parse(body);

    // 3. Vérifier s'il y a déjà une demande en attente
    const existingRequest = await db.query.onboardingRequests.findFirst({
      where: and(
        eq(onboardingRequests.userId, authPayload.userId),
        eq(onboardingRequests.statut, "en_attente")
      ),
    });

    if (existingRequest) {
      return ApiErrors.badRequest("Vous avez déjà une demande en attente.");
    }

    // 4. Créer la demande
    const [newRequestRecord] = await db
      .insert(onboardingRequests)
      .values({
        userId: authPayload.userId,
        ...validatedData,
        statut: "en_attente",
      })
      .returning();

    // Notifier les administrateurs
    try {
      const admins = await db.query.users.findMany({
        where: eq(users.role, "administrateur"),
      });

      await Promise.all(
        admins.map((admin) =>
          createNotification({
            userId: admin.id,
            type: "system",
            title: "Nouvelle demande conducteur",
            message: `${user?.prenom} ${user?.nom} a soumis une demande pour devenir conducteur.`,
            data: { requestId: newRequestRecord.id },
          })
        )
      );
    } catch (notifError) {
      console.error(
        "Failed to notify admins about new driver application:",
        notifError
      );
    }

    return successResponse(
      {
        message: "Votre demande a été soumise avec succès.",
        application: newRequestRecord,
      },
      undefined,
      201
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError(
        "Données invalides",
        undefined,
        error.issues
      );
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
