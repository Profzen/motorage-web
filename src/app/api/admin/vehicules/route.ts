import { db } from "@/lib/db";
import { vehicules } from "@/lib/db/schema";
import {
  ApiErrors,
  parsePaginationParams,
  paginatedResponse,
} from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { desc, eq, sql } from "drizzle-orm";

/**
 * @openapi
 * /admin/vehicules:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Lister tous les véhicules (Admin)
 *     description: Retourne la liste des véhicules avec pagination et filtrage par statut.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [en_attente, approuvé, rejeté]
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateAdmin(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.forbidden("Accès réservé aux administrateurs");
    }

    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePaginationParams(searchParams);
    const statut = searchParams.get("statut");

    const offset = (page - 1) * limit;

    const whereClause = statut ? eq(vehicules.statut, statut) : undefined;

    const [data, countResult] = await Promise.all([
      db.query.vehicules.findMany({
        where: whereClause,
        with: {
          proprietaire: {
            columns: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              avatar: true,
            },
          },
        },
        orderBy: [desc(vehicules.createdAt)],
        limit,
        offset,
      }),
      db
        .select({ count: sql<number>`count(*)` })
        .from(vehicules)
        .where(whereClause),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return paginatedResponse(data, page, limit, total);
  } catch (error) {
    console.error("Error fetching admin vehicules:", error);
    return ApiErrors.serverError();
  }
}
