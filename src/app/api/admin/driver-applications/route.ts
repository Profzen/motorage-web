import { db } from "@/lib/db";
import { onboardingRequests, users } from "@/lib/db/schema";
import { eq, sql, desc } from "drizzle-orm";
import {
  paginatedResponse,
  ApiErrors,
  parsePaginationParams,
} from "@/lib/api-response";
import { authenticateRequest } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * @openapi
 * /admin/driver-applications:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Liste les demandes pour devenir conducteur (Admin)
 *     description: Récupère la liste des demandes de statut conducteur. Requiert le rôle administrateur.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [en_attente, approuvé, rejeté]
 *     responses:
 *       200:
 *         description: Liste des demandes récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnboardingRequestListResponse'
 *       401:
 *         description: Accès réservé aux administrateurs
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse401'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload || authPayload.role !== "administrateur") {
      return ApiErrors.unauthorized("Accès réservé aux administrateurs");
    }

    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePaginationParams(searchParams);
    const offset = (page - 1) * limit;
    const statut = searchParams.get("statut");

    const query = db
      .select({
        id: onboardingRequests.id,
        permisNumero: onboardingRequests.permisNumero,
        permisImage: onboardingRequests.permisImage,
        motoMarque: onboardingRequests.motoMarque,
        motoModele: onboardingRequests.motoModele,
        motoImmatriculation: onboardingRequests.motoImmatriculation,
        statut: onboardingRequests.statut,
        createdAt: onboardingRequests.createdAt,
        user: {
          id: users.id,
          nom: users.nom,
          prenom: users.prenom,
          email: users.email,
          phone: users.phone,
        },
      })
      .from(onboardingRequests)
      .innerJoin(users, eq(onboardingRequests.userId, users.id))
      .orderBy(desc(onboardingRequests.createdAt))
      .limit(limit)
      .offset(offset);

    if (statut) {
      query.where(eq(onboardingRequests.statut, statut));
    }

    const data = await query;

    // Count for pagination
    const countQuery = db
      .select({ count: sql<number>`count(*)` })
      .from(onboardingRequests);
    if (statut) countQuery.where(eq(onboardingRequests.statut, statut));
    const totalResult = await countQuery;
    const total = totalResult[0].count;

    return paginatedResponse(data, page, limit, total);
  } catch (error) {
    console.error("Get driver applications error:", error);
    return ApiErrors.serverError();
  }
}
