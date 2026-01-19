import { db } from "@/lib/db";
import { reservations, trajets } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { reservationSchema } from "@/lib/validation";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { z } from "zod";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /reservations/{id}:
 *   patch:
 *     tags:
 *       - Réservations
 *     summary: Mettre à jour le statut d'une réservation
 *     description: Permet au conducteur d'accepter ou de refuser une demande.
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
 *             required:
 *               - statut
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [en_attente, confirmé, refusé, terminé, annulé]
 *     responses:
 *       200:
 *         description: Statut mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReservationResponse'
 *       400:
 *         description: Impossible de confirmer (plus de places)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 *       404:
 *         description: Réservation non trouvée
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
 *   delete:
 *     tags:
 *       - Réservations
 *     summary: Annuler une réservation
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Réservation annulée
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

export async function PATCH(
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
    const { statut } = reservationSchema.partial().parse(body);

    if (!statut) {
      return ApiErrors.validationError("Statut is required", "statut");
    }

    const result = await db.transaction(async (tx) => {
      const reservation = await tx.query.reservations.findFirst({
        where: eq(reservations.id, id),
        with: {
          trajet: true,
        },
      });

      if (!reservation) {
        return { error: ApiErrors.notFound("Réservation") };
      }

      // Permissions check
      if (
        reservation.trajet.conducteurId !== authPayload.userId &&
        authPayload.role !== "administrateur"
      ) {
        return {
          error: ApiErrors.forbidden(
            "Seul le conducteur peut modifier le statut"
          ),
        };
      }

      // Logic for confirming: decrement placesDisponibles
      if (statut === "confirmé" && reservation.statut !== "confirmé") {
        if (reservation.trajet.placesDisponibles <= 0) {
          return {
            error: ApiErrors.validationError(
              "Plus de places disponibles",
              undefined
            ),
          };
        }

        // Update trajet places
        await tx
          .update(trajets)
          .set({ placesDisponibles: reservation.trajet.placesDisponibles - 1 })
          .where(eq(trajets.id, reservation.trajetId));
      }

      // Logic for cancelling/refusing after confirmation: increment placesDisponibles
      if (
        (statut === "refusé" || statut === "annulé") &&
        reservation.statut === "confirmé"
      ) {
        await tx
          .update(trajets)
          .set({ placesDisponibles: reservation.trajet.placesDisponibles + 1 })
          .where(eq(trajets.id, reservation.trajetId));
      }

      const updated = await tx
        .update(reservations)
        .set({ statut })
        .where(eq(reservations.id, id))
        .returning();

      return { data: updated[0] };
    });

    if (result.error) {
      return result.error as Response;
    }

    return successResponse(result.data);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError(
        "Validation failed",
        undefined,
        error.issues
      );
    }
    console.error("Error updating reservation:", error);
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

    const result = await db.transaction(async (tx) => {
      const reservation = await tx.query.reservations.findFirst({
        where: eq(reservations.id, id),
        with: {
          trajet: true,
        },
      });

      if (!reservation) {
        return { error: ApiErrors.notFound("Réservation") };
      }

      // Permissions check: student, driver, or admin
      if (
        reservation.etudiantId !== authPayload.userId &&
        reservation.trajet.conducteurId !== authPayload.userId &&
        authPayload.role !== "administrateur"
      ) {
        return {
          error: ApiErrors.forbidden(
            "Vous n'êtes pas autorisé à annuler cette réservation"
          ),
        };
      }

      if (reservation.statut === "confirmé") {
        // Re-increment places if it was confirmed
        await tx
          .update(trajets)
          .set({ placesDisponibles: reservation.trajet.placesDisponibles + 1 })
          .where(eq(trajets.id, reservation.trajetId));
      }

      await tx.delete(reservations).where(eq(reservations.id, id));
      return { success: true };
    });

    if (result.error) return result.error as Response;

    return successResponse({ message: "Réservation annulée" });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    return ApiErrors.serverError();
  }
}
