import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { cookies } from "next/headers";
import { z } from "zod";
import { NextRequest } from "next/server";

const updateReportSchema = z.object({
  statut: z.enum(["en_cours", "resolu", "rejete"]),
  commentaireAdmin: z.string().optional(),
});

/**
 * @openapi
 * /admin/reports/{id}:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Traiter un signalement (Admin)
 *     description: Met à jour le statut d'un signalement et ajoute un commentaire.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statut: { type: string, enum: [en_cours, resolu, rejete] }
 *               commentaireAdmin: { type: string }
 *     responses:
 *       200:
 *         description: Signalement mis à jour
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

    const body = await request.json();
    const { statut, commentaireAdmin } = updateReportSchema.parse(body);
    const { id } = await params;

    const report = await db.query.reports.findFirst({
      where: eq(reports.id, id),
    });

    if (!report) return ApiErrors.notFound("Signalement");

    await db
      .update(reports)
      .set({
        statut,
        commentaireAdmin,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(reports.id, id));

    // Notify the reporter
    await createNotification({
      userId: report.reporterId,
      type: "system",
      title: "Signalement mis à jour",
      message: `Votre signalement "${report.titre}" est désormais : ${statut}.`,
      data: { reportId: id },
    });

    return successResponse({ message: "Signalement traité avec succès" });
  } catch (error) {
    if (error instanceof z.ZodError)
      return ApiErrors.badRequest(error.issues[0].message);
    console.error("Update report error:", error);
    return ApiErrors.serverError();
  }
}

/**
 * @openapi
 * /admin/reports/{id}:
 *   delete:
 *     tags:
 *       - Admin
 *     summary: Supprimer un signalement (Admin)
 */
export async function DELETE(
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
    await db.delete(reports).where(eq(reports.id, id));

    return successResponse({ message: "Signalement supprimé avec succès" });
  } catch (error) {
    console.error("Delete report error:", error);
    return ApiErrors.serverError();
  }
}
