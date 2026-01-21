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
import { authenticateAdmin } from "@/lib/auth";
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
    const authPayload = await authenticateAdmin(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized("Accès réservé aux administrateurs");
    }

    // 1. Total Utilisateurs par rôle
    const userStatsRaw = await db
      .select({
        role: users.role,
        count: count(users.id),
      })
      .from(users)
      .groupBy(users.role);

    const userStats = {
      total: userStatsRaw.reduce((acc, curr) => acc + curr.count, 0),
      byRole: userStatsRaw.reduce(
        (acc, curr) => {
          acc[curr.role] = curr.count;
          return acc;
        },
        {} as Record<string, number>
      ),
    };

    // 2. Demandes de conducteurs en attente
    const pendingOnboardings = await db
      .select({
        count: count(onboardingRequests.id),
      })
      .from(onboardingRequests)
      .where(eq(onboardingRequests.statut, "en_attente"));

    // 3. Statistiques des trajets
    const today = new Date().toISOString().split("T")[0];

    // Trajets aujourd'hui
    const trajetsTodayRaw = await db
      .select({
        statut: trajets.statut,
        count: count(trajets.id),
      })
      .from(trajets)
      .where(sql`date(${trajets.dateHeure}) = ${today}`)
      .groupBy(trajets.statut);

    // Total trajets historiques
    const totalTrajetsCount = await db
      .select({
        count: count(trajets.id),
      })
      .from(trajets);

    const trajetsStats = {
      today: trajetsTodayRaw.reduce((acc, curr) => acc + curr.count, 0),
      todayByStatus: trajetsTodayRaw.reduce(
        (acc, curr) => {
          acc[curr.statut] = curr.count;
          return acc;
        },
        {} as Record<string, number>
      ),
      total: totalTrajetsCount[0]?.count || 0,
    };

    // 4. Data for Chart (Last 7 days)
    const chartData = await db
      .select({
        date: sql<string>`date(${trajets.dateHeure})`,
        count: count(trajets.id),
      })
      .from(trajets)
      .where(sql`date(${trajets.dateHeure}) >= date('now', '-7 days')`)
      .groupBy(sql`date(${trajets.dateHeure})`)
      .orderBy(sql`date(${trajets.dateHeure})`);

    // 5. Réservations
    const reservationCount = await db
      .select({
        count: count(reservations.id),
      })
      .from(reservations);

    const pendingReservations = await db
      .select({
        count: count(reservations.id),
      })
      .from(reservations)
      .where(eq(reservations.statut, "en_attente"));

    // 6. Litiges en attente
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
      trajets: {
        ...trajetsStats,
        chartData,
      },
      reservations: {
        total: reservationCount[0]?.count || 0,
        pending: pendingReservations[0]?.count || 0,
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
