import { db } from "@/lib/db";
import { reservations, trajets } from "@/lib/db/schema";
import { reservationSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateRequest } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { cookies } from "next/headers";
import { z } from "zod";

/**
 * @openapi
 * /reservations:
 *   post:
 *     tags:
 *       - Réservations
 *     summary: Réserver une place sur un trajet
 *     description: Permet à un étudiant de demander une place sur un trajet véhicule.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trajetId
 *             properties:
 *               trajetId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResponse'
 *       400:
 *         description: Pas de places disponibles ou données invalides
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Trajet non trouvé
 *     security:
 *       - BearerAuth: []
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
    const validatedData = reservationSchema.parse(body);

    // Check if trajet exists
    const trajet = await db.query.trajets.findFirst({
      where: eq(trajets.id, validatedData.trajetId),
    });

    if (!trajet) {
      return ApiErrors.notFound("Trajet");
    }

    if (trajet.placesDisponibles <= 0) {
      return ApiErrors.badRequest("Plus de places disponibles");
    }

    // Create reservation
    const newReservation = await db
      .insert(reservations)
      .values({
        trajetId: validatedData.trajetId,
        etudiantId: authPayload.userId,
        statut: "en_attente",
      })
      .returning();

    // Send notification to conductor
    await createNotification({
      userId: trajet.conducteurId,
      type: "reservation",
      title: "Nouvelle demande",
      message: "Un étudiant souhaite réserver une place sur votre trajet.",
      data: { reservationId: newReservation[0].id, trajetId: trajet.id },
    });

    return successResponse(newReservation[0], undefined, 201);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError(
        "Validation failed",
        undefined,
        error.issues
      );
    }
    console.error("Reservation error:", error);
    return ApiErrors.serverError();
  }
}
