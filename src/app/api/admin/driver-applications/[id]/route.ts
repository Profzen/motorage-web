import { db } from "@/lib/db";
import { onboardingRequests, users, vehicules } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { deletePublicFile } from "@/lib/file-storage";
import { createNotification } from "@/lib/notifications";
import { cookies } from "next/headers";
import { z } from "zod";
import { NextRequest } from "next/server";

const validateSchema = z.object({
  statut: z.enum(["approuvé", "rejeté"]),
  commentaireAdmin: z.string().optional(),
});

/**
 * @openapi
 * /admin/driver-applications/{id}:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Valider ou rejeter une demande de conducteur (Admin)
 *     description: Met à jour le statut d'une demande. Si approuvée, change le rôle de l'utilisateur et crée son véhicule.
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
 *             properties:
 *               statut:
 *                 type: string
 *                 enum: [approuvé, rejeté]
 *               commentaireAdmin:
 *                 type: string
 *     responses:
 *       200:
 *         description: Demande traitée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Demande déjà traitée ou données invalides
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
 *       404:
 *         description: Demande non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse404'
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
      return ApiErrors.unauthorized("Accès réservé aux administrateurs");
    }

    const { id } = await params;
    const body = await request.json();
    const { statut, commentaireAdmin } = validateSchema.parse(body);

    // Get the application
    const application = await db.query.onboardingRequests.findFirst({
      where: eq(onboardingRequests.id, id),
    });

    if (!application) {
      return ApiErrors.notFound("Demande non trouvée");
    }

    if (application.statut !== "en_attente") {
      return ApiErrors.badRequest("Cette demande a déjà été traitée");
    }

    // 1. Update Application Status
    await db
      .update(onboardingRequests)
      .set({ statut, commentaireAdmin, updatedAt: new Date().toISOString() })
      .where(eq(onboardingRequests.id, id));

    if (statut === "approuvé") {
      // 2. Update User Role
      await db
        .update(users)
        .set({ role: "conducteur" })
        .where(eq(users.id, application.userId));

      // 3. Create or Update Vehicule entry
      const existingVehicle = await db.query.vehicules.findFirst({
        where: eq(
          vehicules.immatriculation,
          application.vehiculeImmatriculation
        ),
      });

      if (existingVehicle) {
        await db
          .update(vehicules)
          .set({
            statut: "approuvé",
            proprietaireId: application.userId,
          })
          .where(eq(vehicules.id, existingVehicle.id));
      } else {
        await db.insert(vehicules).values({
          type: application.vehiculeType || "moto",
          marque: application.vehiculeMarque,
          modele: application.vehiculeModele,
          immatriculation: application.vehiculeImmatriculation,
          proprietaireId: application.userId,
          disponibilite: true,
          statut: "approuvé",
        });
      }

      // 4. Send Notification
      await createNotification({
        userId: application.userId,
        type: "onboarding",
        title: "Demande approuvée !",
        message:
          "Félicitations, vous êtes désormais conducteur sur Miyi Ðekae.",
        data: { onboardingId: id },
      });
    } else {
      // Send Rejection Notification
      await createNotification({
        userId: application.userId,
        type: "onboarding",
        title: "Demande refusée",
        message:
          commentaireAdmin ||
          "Votre demande pour devenir conducteur a été rejetée.",
        data: { onboardingId: id },
      });
    }

    await logAudit({
      action: `onboarding_${statut}`,
      userId: authPayload.userId,
      targetId: application.userId,
      details: { onboardingId: id, commentaireAdmin },
      ip:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip"),
      userAgent: request.headers.get("user-agent"),
    });

    if (application.permisImage) {
      try {
        await deletePublicFile(application.permisImage);
        await db
          .update(onboardingRequests)
          .set({ permisImage: null })
          .where(eq(onboardingRequests.id, id));
      } catch (error) {
        console.warn("Could not delete file:", error);
      }
    }

    return successResponse({
      message: `Demande ${statut} avec succès.`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError(
        "Données invalides",
        undefined,
        error.issues
      );
    }
    console.error("Validate driver application error:", error);
    return ApiErrors.serverError();
  }
}
