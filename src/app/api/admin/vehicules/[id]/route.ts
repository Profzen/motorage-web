import { db } from "@/lib/db";
import { vehicules, auditLogs } from "@/lib/db/schema";
import { vehiculeAdminUpdateSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth";
import { cookies } from "next/headers";
import { createNotification } from "@/lib/notifications";
import { NextRequest } from "next/server";
import { z } from "zod";

/**
 * @openapi
 * /admin/vehicules/{id}:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Valider ou rejeter un véhicule (Admin)
 *     description: Permet à l'administrateur de changer le statut d'un véhicule.
 *     security:
 *       - BearerAuth: []
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
 *                 enum: [en_attente, approuvé, rejeté]
 *               commentaireAdmin:
 *                 type: string
 */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateAdmin(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.forbidden("Accès réservé aux administrateurs");
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = vehiculeAdminUpdateSchema.parse(body);

    const result = await db.transaction(async (tx) => {
      const existing = await tx.query.vehicules.findFirst({
        where: eq(vehicules.id, id),
      });

      if (!existing) {
        return { error: ApiErrors.notFound("Véhicule") };
      }

      const updated = await tx
        .update(vehicules)
        .set({
          statut: validatedData.statut,
          commentaireAdmin: validatedData.commentaireAdmin,
        })
        .where(eq(vehicules.id, id))
        .returning();

      // Notify the owner
      const statusLabel =
        validatedData.statut === "approuvé" ? "validé" : "refusé";

      await createNotification({
        userId: existing.proprietaireId,
        type: "system",
        title: `Véhicule ${statusLabel}`,
        message: `Votre véhicule ${existing.marque} ${existing.modele} (${existing.immatriculation}) a été ${statusLabel} par l'administration.${
          validatedData.commentaireAdmin
            ? ` Motif : ${validatedData.commentaireAdmin}`
            : ""
        }`,
        data: { vehiculeId: id, statut: validatedData.statut },
      });

      return { data: updated[0] };
    });

    if (result.error) return result.error as Response;

    // Log the action
    await db.insert(auditLogs).values({
      userId: authPayload.userId,
      action: "UPDATE_VEHICLE_STATUS",
      targetId: id,
      details: `Changement statut véhicule: ${validatedData.statut} (Commentaire: ${validatedData.commentaireAdmin || "Aucun"})`,
    });

    return successResponse(result.data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError(
        "Validation échouée",
        undefined,
        error.issues
      );
    }
    console.error("Admin vehicle validation error:", error);
    return ApiErrors.serverError();
  }
}
