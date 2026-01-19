import { db } from "@/lib/db";
import { vehicules, trajets, reservations } from "@/lib/db/schema";
import { vehiculeSchema } from "@/lib/validation";
import { eq, and, or } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { createNotification } from "@/lib/notifications";
import { authenticateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";

/**
 * @openapi
 * /vehicules/{id}:
 *   get:
 *     tags:
 *       - Véhicules
 *     summary: Détails d'un véhicule
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du véhicule
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VehiculeResponse'
 *       404:
 *         description: Véhicule non trouvé
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
 *   put:
 *     tags:
 *       - Véhicules
 *     summary: Modifier un véhicule
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
 *               marque:
 *                 type: string
 *               modele:
 *                 type: string
 *               immatriculation:
 *                 type: string
 *               disponibilite:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Véhicule mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VehiculeResponse'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 *       404:
 *         description: Véhicule non trouvé
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
 *   delete:
 *     tags:
 *       - Véhicules
 *     summary: Supprimer un véhicule
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Véhicule supprimé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Véhicule non trouvé
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
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) return ApiErrors.unauthorized();

    const { id } = await params;
    const vehicule = await db.query.vehicules.findFirst({
      where: eq(vehicules.id, id),
    });

    if (!vehicule) {
      return ApiErrors.notFound("Véhicule");
    }

    // Permission check: Only owner or admin
    if (
      vehicule.proprietaireId !== authPayload.userId &&
      authPayload.role !== "administrateur"
    ) {
      return ApiErrors.forbidden(
        "Vous n'êtes pas autorisé à voir les détails de ce véhicule"
      );
    }

    return successResponse(vehicule);
  } catch {
    return ApiErrors.serverError();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) return ApiErrors.unauthorized();

    const { id } = await params;

    // First check existence and permission
    const existing = await db.query.vehicules.findFirst({
      where: eq(vehicules.id, id),
    });

    if (!existing) {
      return ApiErrors.notFound("Véhicule");
    }

    if (
      existing.proprietaireId !== authPayload.userId &&
      authPayload.role !== "administrateur"
    ) {
      return ApiErrors.forbidden(
        "Vous n'êtes pas autorisé à modifier ce véhicule"
      );
    }

    const body = await request.json();
    const validatedData = vehiculeSchema.partial().parse(body);

    // If sensitive fields are changed, we reset the validation status
    const isSensitiveChange = 
      validatedData.immatriculation || 
      validatedData.marque || 
      validatedData.modele || 
      validatedData.type;

    if (isSensitiveChange && authPayload.role !== "administrateur") {
      (validatedData as any).statut = "en_attente";
    }

    const result = await db.transaction(async (tx) => {
      // 1. Update vehicle
      const updated = await tx
        .update(vehicules)
        .set(validatedData)
        .where(eq(vehicules.id, id))
        .returning();

      if (updated.length === 0) {
        return { error: ApiErrors.notFound("Véhicule") };
      }

      const vehicule = updated[0];

      // 2. If vehicle becomes unavailable, cancel related trips
      if (validatedData.disponibilite === false) {
        const affectedTrajets = await tx.query.trajets.findMany({
          where: and(
            eq(trajets.vehiculeId, id),
            or(eq(trajets.statut, "ouvert"), eq(trajets.statut, "plein"))
          ),
          with: {
            reservations: {
              where: eq(reservations.statut, "confirmé"),
            },
          },
        });

        if (affectedTrajets.length > 0) {
          // Cancel trips
          await tx
            .update(trajets)
            .set({ statut: "annulé" })
            .where(
              and(
                eq(trajets.vehiculeId, id),
                or(eq(trajets.statut, "ouvert"), eq(trajets.statut, "plein"))
              )
            );

          // Prepare notifications for each cancelled trip's confirmed passengers
          for (const trajet of affectedTrajets) {
            for (const res of trajet.reservations) {
              await createNotification({
                userId: res.etudiantId,
                type: "trajet",
                title: "Trajet annulé",
                message: `Le trajet "${trajet.pointDepart} → ${trajet.destination}" a été annulé car le véhicule est indisponible.`,
                data: { trajetId: trajet.id, reservationId: res.id },
              });
            }
          }
        }
      }

      return { data: vehicule };
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
    return ApiErrors.serverError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) return ApiErrors.unauthorized();

    const { id } = await params;

    // Check existence and permission
    const existing = await db.query.vehicules.findFirst({
      where: eq(vehicules.id, id),
    });

    if (!existing) {
      return ApiErrors.notFound("Véhicule");
    }

    if (
      existing.proprietaireId !== authPayload.userId &&
      authPayload.role !== "administrateur"
    ) {
      return ApiErrors.forbidden(
        "Vous n'êtes pas autorisé à supprimer ce véhicule"
      );
    }

    const deleted = await db
      .delete(vehicules)
      .where(eq(vehicules.id, id))
      .returning();

    if (deleted.length === 0) {
      return ApiErrors.notFound("Véhicule");
    }

    return successResponse({ message: "Véhicule supprimé avec succès" });
  } catch {
    return ApiErrors.serverError();
  }
}
