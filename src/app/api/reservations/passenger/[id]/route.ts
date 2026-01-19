import { db } from "@/lib/db";
import { reservations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /reservations/passenger/{id}:
 *   get:
 *     tags:
 *       - Réservations
 *     summary: Historique des réservations d'un passager
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historique des réservations
 *       403:
 *         description: Interdit
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
      return ApiErrors.forbidden("Vous n'êtes pas autorisé à voir cet historique");
    }

    const history = await db.query.reservations.findMany({
      where: eq(reservations.etudiantId, id),
      with: {
        trajet: {
          with: {
            conducteur: {
              columns: {
                password: false,
                refreshToken: false,
              },
            },
          },
        },
      },
      orderBy: (reservations, { desc }) => [desc(reservations.createdAt)],
    });

    return successResponse(history);
  } catch (error) {
    console.error("Error fetching passenger history:", error);
    return ApiErrors.serverError();
  }
}
