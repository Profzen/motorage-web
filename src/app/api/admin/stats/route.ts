import { db } from "@/lib/db";
import {
  users,
  onboardingRequests,
  trajets,
  reservations,
  reports,
} from "@/lib/db/schema";
import { eq, sql, count } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateRequest } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * @openapi
 * /admin/stats:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Statistiques globales du système (Admin)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload || authPayload.role !== "administrateur") {
      return ApiErrors.unauthorized("Accès réservé aux administrateurs");
    }

    // 1. Total Utilisateurs par rôle
    const userStats = await db
      .select({
        role: users.role,
        count: count(users.id),
      })
      .from(users)
      .groupBy(users.role);

    // 2. Demandes de conducteurs en attente
    const pendingOnboardings = await db
      .select({
        count: count(onboardingRequests.id),
      })
      .from(onboardingRequests)
      .where(eq(onboardingRequests.statut, "en_attente"));

    // 3. Statistiques des trajets (Aujourd'hui + total)
    const today = new Date().toISOString().split("T")[0];
    const trajetStatsToday = await db
      .select({
        statut: trajets.statut,
        count: count(trajets.id),
      })
      .from(trajets)
      .where(sql`date(${trajets.dateHeure}) = ${today}`)
      .groupBy(trajets.statut);

    const trajetStatsTotal = await db
      .select({
        statut: trajets.statut,
        count: count(trajets.id),
      })
      .from(trajets)
      .groupBy(trajets.statut);

    // 3b. Trajets - évolution 7 derniers jours (par date)
    const trajetsLast7Days = await db
      .select({
        date: sql<string>`date(${trajets.dateHeure})`,
        count: count(trajets.id),
      })
      .from(trajets)
      .where(sql`date(${trajets.dateHeure}) >= date('now','-6 day')`)
      .groupBy(sql`date(${trajets.dateHeure})`)
      .orderBy(sql`date(${trajets.dateHeure})`);

    // 4. Réservations totales + en attente/confirmées
    const reservationCount = await db
      .select({
        count: count(reservations.id),
      })
      .from(reservations);

    const reservationByStatus = await db
      .select({ statut: reservations.statut, count: count(reservations.id) })
      .from(reservations)
      .groupBy(reservations.statut);

    // 5. Litiges en attente
    const pendingReports = await db
      .select({
        count: count(reports.id),
      })
      .from(reports)
      .where(eq(reports.statut, "en_attente"));

    return successResponse({
      users: userStats,
      onboarding: {
        pending: pendingOnboardings[0]?.count || 0,
      },
      trajetsToday: trajetStatsToday,
      trajetsTotal: trajetStatsTotal,
      trajetsLast7Days,
      reservations: {
        total: reservationCount[0]?.count || 0,
        byStatus: reservationByStatus,
      },
      reports: {
        pending: pendingReports[0]?.count || 0,
      },
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return ApiErrors.serverError();
  }
}
