import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { desc, eq, sql, and, or, like } from "drizzle-orm";
import {
  paginatedResponse,
  ApiErrors,
  parsePaginationParams,
} from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /admin/reports:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Lister les signalements et litiges (Admin)
 *     description: Permet d'obtenir tous les signalements avec pagination, filtres et recherche.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: statut
 *         schema: { type: string, enum: [en_attente, en_cours, resolu, rejete] }
 *       - in: query
 *         name: type
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Liste des signalements
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateAdmin(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized("Accès réservé aux administrateurs");
    }

    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePaginationParams(searchParams);
    const statut = searchParams.get("statut");
    const type = searchParams.get("type");
    const search = searchParams.get("search");
    const offset = (page - 1) * limit;

    const conditions = [];
    if (statut) conditions.push(eq(reports.statut, statut));
    if (type) conditions.push(eq(reports.type, type));
    
    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(reports.titre, searchTerm),
          like(reports.description, searchTerm)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const data = await db.query.reports.findMany({
      where: whereClause,
      with: {
        reporter: {
          columns: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
          },
        },
        reported: {
          columns: {
            id: true,
            nom: true,
            prenom: true,
            email: true,
            role: true,
          },
        },
        trajet: true,
      },
      limit,
      offset,
      orderBy: [desc(reports.createdAt)],
    });

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(whereClause);

    const total = Number(totalResult[0]?.count || 0);

    return paginatedResponse(data, page, limit, total);
  } catch (error) {
    console.error("List reports error:", error);
    return ApiErrors.serverError();
  }
}
