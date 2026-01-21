import { db } from "@/lib/db";
import { trajets } from "@/lib/db/schema";
import { trajetSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";
import { NextRequest } from "next/server";
import { logAudit } from "@/lib/audit";

/**
 * @openapi
 * /trajets/{id}:
 *   get:
 *     tags:
 *       - Trajets
 *     summary: Détails d'un trajet
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du trajet
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrajetResponse'
 *       404:
 *         description: Trajet non trouvé
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
 *       - bearerAuth: []
 *   put:
 *     tags:
 *       - Trajets
 *     summary: Modifier un trajet
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
 *               pointDepart:
 *                 type: string
 *               destination:
 *                 type: string
 *               dateHeure:
 *                 type: string
 *                 format: date-time
 *               placesDisponibles:
 *                 type: integer
 *               statut:
 *                 type: string
 *                 enum: [ouvert, plein, terminé, annulé]
 *     responses:
 *       200:
 *         description: Trajet mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrajetResponse'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 *       404:
 *         description: Trajet non trouvé
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
 *       - bearerAuth: []
 *   delete:
 *     tags:
 *       - Trajets
 *     summary: Supprimer un trajet
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trajet supprimé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Trajet non trouvé
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
 *       - bearerAuth: []
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    // Fetch trip with all needed relations in one go
    const trajet = await db.query.trajets.findFirst({
      where: eq(trajets.id, id),
      with: {
        conducteur: {
          columns: { password: false, refreshToken: false },
        },
        vehicule: true,
        departZone: true,
        arriveeZone: true,
        reservations: {
          with: {
            etudiant: { columns: { password: false, refreshToken: false } },
          },
        },
      },
    });

    if (!trajet) return ApiErrors.notFound("Trajet");

    // Check if requester is the driver or admin to show reservations
    const isDriverOrAdmin =
      authPayload &&
      (authPayload.userId === trajet.conducteurId ||
        authPayload.role === "administrateur");

    if (!isDriverOrAdmin) {
      // Omit reservations and internal data for non-owner/non-admin
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { reservations, ...basicTrajet } = trajet;
      return successResponse(basicTrajet);
    }

    return successResponse(trajet);
  } catch (error) {
    console.error("Error fetching trajet:", error);
    return ApiErrors.serverError();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) return ApiErrors.unauthorized();

    const body = await request.json();
    const validatedData = trajetSchema.partial().parse(body) as Record<
      string,
      unknown
    >;

    // Security: never allow changing the driver or the ID via PUT
    delete validatedData.conducteurId;
    delete validatedData.id;

    const existing = await db.query.trajets.findFirst({
      where: eq(trajets.id, id),
    });

    if (!existing) return ApiErrors.notFound("Trajet");

    if (
      existing.conducteurId !== authPayload.userId &&
      authPayload.role !== "administrateur"
    ) {
      return ApiErrors.forbidden("Seul le conducteur peut modifier ce trajet");
    }

    const [updated] = await db
      .update(trajets)
      .set({
        ...validatedData,
        // Ensure values are not undefined for Drizzle if they were deleted above
      })
      .where(eq(trajets.id, id))
      .returning();

    if (!updated) return ApiErrors.serverError("Échec de la mise à jour");

    await logAudit({
      action: "trajet_update",
      userId: authPayload.userId,
      targetId: id,
      details: validatedData,
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      userAgent: request.headers.get("user-agent"),
    });

    return successResponse(updated);
  } catch (error: unknown) {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) return ApiErrors.unauthorized();

    const existing = await db.query.trajets.findFirst({
      where: eq(trajets.id, id),
    });

    if (!existing) return ApiErrors.notFound("Trajet");

    if (
      existing.conducteurId !== authPayload.userId &&
      authPayload.role !== "administrateur"
    ) {
      return ApiErrors.forbidden("Seul le conducteur peut supprimer ce trajet");
    }

    await db.delete(trajets).where(eq(trajets.id, id));

    await logAudit({
      action: "trajet_delete",
      userId: authPayload.userId,
      targetId: id,
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      userAgent: request.headers.get("user-agent"),
    });

    return successResponse({ message: "Trajet supprimé avec succès" });
  } catch {
    return ApiErrors.serverError();
  }
}
