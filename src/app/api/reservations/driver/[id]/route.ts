import { db } from "@/lib/db";
import { trajets } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /reservations/driver/{id}:
 *   get:
 *     tags:
 *       - Réservations
 *     summary: Liste des demandes reçues par un conducteur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des demandes
 *     security:
 *       - BearerAuth: []
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

    if (!authPayload) return ApiErrors.unauthorized();

    // Check ownership or admin
    if (authPayload.userId !== id && authPayload.role !== "administrateur") {
      return ApiErrors.forbidden(
        "Vous n'êtes pas autorisé à voir ces demandes"
      );
    }

    const receivedRequests = await db.query.reservations.findMany({
      where: (reservations, { exists }) =>
        exists(
          db
            .select()
            .from(trajets)
            .where(
              sql`${trajets.id} = ${reservations.trajetId} AND ${trajets.conducteurId} = ${id}`
            )
        ),
      with: {
        trajet: true,
        etudiant: {
          columns: {
            password: false,
            refreshToken: false,
          },
        },
      },
      orderBy: (reservations, { desc }) => [desc(reservations.createdAt)],
    });

    return successResponse(receivedRequests);
  } catch (error) {
    console.error("Error fetching driver requests:", error);
    return ApiErrors.serverError();
  }
}
