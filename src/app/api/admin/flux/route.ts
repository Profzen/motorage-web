import { db } from "@/lib/db";
import { trajets, users, vehicules, zones, reservations } from "@/lib/db/schema";
import { eq, sql, desc, and, like, or } from "drizzle-orm";
import {
  paginatedResponse,
  ApiErrors,
  parsePaginationParams,
  successResponse,
} from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, offset } = parsePaginationParams(searchParams);
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateAdmin(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized("Accès réservé aux administrateurs");
    }

    // Filtres
    const filters = [];
    if (status && status !== "all") {
      filters.push(eq(trajets.statut, status));
    }
    if (search) {
      filters.push(
        or(
          like(trajets.pointDepart, `%${search}%`),
          like(trajets.destination, `%${search}%`)
        )
      );
    }

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    // Fetch trajets with relations
    const [data, totalCount] = await Promise.all([
      db.query.trajets.findMany({
        where: whereClause,
        with: {
          conducteur: {
            columns: {
              id: true,
              nom: true,
              prenom: true,
              email: true,
              phone: true,
              avatar: true,
            },
          },
          vehicule: true,
          departZone: true,
          arriveeZone: true,
          reservations: {
            with: {
              etudiant: {
                columns: {
                  nom: true,
                  prenom: true,
                }
              }
            }
          },
        },
        orderBy: [desc(trajets.dateHeure)],
        limit,
        offset,
      }),
      db
        .select({ count: sql<number>`count(*)` })
        .from(trajets)
        .where(whereClause),
    ]);

    return paginatedResponse(data, page, limit, Number(totalCount[0].count));
  } catch (error) {
    console.error("Admin Flux Error:", error);
    return ApiErrors.serverError();
  }
}
