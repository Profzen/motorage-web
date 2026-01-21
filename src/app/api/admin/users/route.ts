import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sql, eq, and, or, like } from "drizzle-orm";
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
 * /admin/users:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Liste tous les utilisateurs avec pagination (Admin)
 *     description: Retourne la liste paginée des utilisateurs. Requiert le rôle administrateur.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [passager, conducteur, administrateur]
 *         description: Filtrer par rôle
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [actif, suspendu]
 *         description: Filtrer par statut
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Rechercher par nom, prénom ou email
 *     responses:
 *       200:
 *         description: Liste des utilisateurs paginée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *     security:
 *       - BearerAuth: []
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
    const offset = (page - 1) * limit;
    const role = searchParams.get("role");
    const statut = searchParams.get("statut");
    const search = searchParams.get("search");

    // Build conditions
    const conditions = [];
    if (role) conditions.push(eq(users.role, role));
    if (statut) conditions.push(eq(users.statut, statut));

    if (search) {
      const searchTerm = `%${search}%`;
      conditions.push(
        or(
          like(users.nom, searchTerm),
          like(users.prenom, searchTerm),
          like(users.email, searchTerm)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);
    const total = Number(countResult[0]?.count || 0);

    // Get paginated data
    const allUsers = await db.query.users.findMany({
      where: whereClause,
      columns: {
        password: false,
        refreshToken: false,
      },
      orderBy: (users, { desc }) => [desc(users.createdAt)],
      limit,
      offset,
    });

    return paginatedResponse(allUsers, page, limit, total);
  } catch (error) {
    console.error("Error fetching users:", error);
    return ApiErrors.serverError();
  }
}
