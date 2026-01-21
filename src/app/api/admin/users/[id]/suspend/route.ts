import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ApiErrors, successResponse } from "@/lib/api-response";
import { authenticateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { logAudit } from "@/lib/audit";
import { z } from "zod";
import { NextRequest } from "next/server";

const suspendSchema = z.object({
  statut: z.enum(["suspendu", "actif"]),
  motif: z.string().optional(),
});

/**
 * @openapi
 * /admin/users/{id}/suspend:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Suspendre ou réactiver un utilisateur
 *     description: Permet à un administrateur de suspendre ou réactiver un compte utilisateur.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'utilisateur
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
 *                 enum: [suspendu, actif]
 *                 description: Nouveau statut de l'utilisateur
 *               motif:
 *                 type: string
 *                 nullable: true
 *                 description: Raison optionnelle de la suspension
 *     responses:
 *       200:
 *         description: Utilisateur suspendu/réactivé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Statut mis à jour"
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 *       401:
 *         description: Non autorisé ou accès réservé aux administrateurs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse401'
 *       404:
 *         description: Utilisateur non trouvé
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
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload || authPayload.role !== "administrateur") {
      return ApiErrors.unauthorized("Accès réservé aux administrateurs");
    }

    const body = await request.json();
    const { statut, motif } = suspendSchema.parse(body);
    const { id } = await params;

    const existing = await db.query.users.findFirst({ where: eq(users.id, id) });
    if (!existing) return ApiErrors.notFound("Utilisateur");

    await db.update(users).set({ statut }).where(eq(users.id, id));

    await logAudit({
      action: statut === "suspendu" ? "user_suspend" : "user_reactivate",
      userId: authPayload.userId,
      targetId: id,
      details: { motif, statut },
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
      userAgent: request.headers.get("user-agent"),
    });

    return successResponse({ message: "Statut mis à jour" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError("Corps de requête invalide", undefined, error.issues);
    }
    return ApiErrors.serverError();
  }
}
