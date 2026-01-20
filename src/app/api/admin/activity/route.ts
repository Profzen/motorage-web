import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * @openapi
 * /admin/activity:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Flux d'activité récent (Audit Logs)
 *     description: Récupère les logs d'audit globaux ou filtrés par utilisateur
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur pour lequel filtrer les logs
 *     security:
 *       - BearerAuth: []
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateAdmin(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized("Accès réservé aux administrateurs");
    }

    const activities = await db.query.auditLogs.findMany({
      where: userId ? eq(auditLogs.targetId, userId) : undefined,
      with: {
        user: {
          columns: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
          },
        },
      },
      limit: 50,
      orderBy: [desc(auditLogs.createdAt)],
    });

    return successResponse(activities);
  } catch (error) {
    console.error("Activity Stream Error:", error);
    return ApiErrors.serverError();
  }
}
