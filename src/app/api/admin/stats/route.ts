import { db } from "@/lib/db";
import {
  users,
  onboardingRequests,
  trajets,
  reservations,
  reports,
  zones,
  vehicules,
} from "@/lib/db/schema";
import { eq, sql, count, and, gte, lt } from "drizzle-orm";
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

    // 2. Demandes de conducteurs en attente
    const pendingOnboardings = await db
      .select({
        count: count(onboardingRequests.id),
      })
      .from(onboardingRequests)
      .where(eq(onboardingRequests.statut, "en_attente"));

    // 3. Statistiques des trajets
    const today = new Date().toISOString().split("T")[0];

    // Trajets aujourd'hui (total)
    const trajetsToday = await db
      .select({
        count: count(trajets.id),
      })
      .from(trajets)
      .where(sql`date(${trajets.dateHeure}) = ${today}`);

    // 4. Activité hebdomadaire (7 derniers jours)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const activityHistory = await db
      .select({
        date: sql`date(${trajets.dateHeure})`,
        count: count(trajets.id),
      })
      .from(trajets)
      .where(
        sql`date(${trajets.dateHeure}) >= ${sevenDaysAgo.toISOString().split("T")[0]}`
      )
      .groupBy(sql`date(${trajets.dateHeure})`)
      .orderBy(sql`date(${trajets.dateHeure})`);

    // 5. Réservations
    const reservationStats = await db
      .select({
        statut: reservations.statut,
        count: count(reservations.id),
      })
      .from(reservations)
      .groupBy(reservations.statut);

    const totalReservations = reservationStats.reduce(
      (acc, curr) => acc + curr.count,
      0
    );
    const pendingReservations =
      reservationStats.find((s) => s.statut === "en_attente")?.count || 0;

    // 6. Litiges en attente
    const pendingReports = await db
      .select({
        count: count(reports.id),
      })
      .from(reports)
      .where(eq(reports.statut, "en_attente"));

    // 7. Zones actives
    const zonesCount = await db
      .select({
        count: count(zones.id),
      })
      .from(zones);

    // 8. Véhicules en attente
    const pendingVehicules = await db
      .select({ count: count() })
      .from(vehicules)
      .where(eq(vehicules.statut, "en_attente"));

    // 9. Taux de croissance (utilisateurs ce mois vs mois dernier)
    const now = new Date();
    const firstDayThisMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    ).toISOString();
    const firstDayLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    ).toISOString();

    const usersThisMonth = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, firstDayThisMonth));

    const usersLastMonth = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          gte(users.createdAt, firstDayLastMonth),
          lt(users.createdAt, firstDayThisMonth)
        )
      );

    const countThisMonth = Number(usersThisMonth[0]?.count || 0);
    const countLastMonth = Number(usersLastMonth[0]?.count || 0);

    let growthRate = 0;
    if (countLastMonth > 0) {
      growthRate = Math.round(
        ((countThisMonth - countLastMonth) / countLastMonth) * 100
      );
    } else if (countThisMonth > 0) {
      growthRate = 100;
    }

    // Process activity history to fill missing days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    const filledActivity = last7Days.map((date) => {
      const found = activityHistory.find((a) => a.date === date);
      return {
        date,
        count: found ? Number(found.count) : 0,
      };
    });

    return successResponse({
      users: {
        total: userStatsRaw.reduce((acc, curr) => acc + curr.count, 0),
        byRole: {
          conducteur:
            userStatsRaw.find((s) => s.role === "conducteur")?.count || 0,
          passager: userStatsRaw.find((s) => s.role === "passager")?.count || 0,
        },
        distribution: userStatsRaw,
      },
      onboarding: {
        pending: pendingOnboardings[0]?.count || 0,
      },
      trajets: {
        today: trajetsToday[0]?.count || 0,
        weekly: filledActivity,
      },
      reservations: {
        total: totalReservations,
        pending: pendingReservations,
        byStatut: reservationStats,
      },
      reports: {
        pending: pendingReports[0]?.count || 0,
      },
      vehicules: {
        pending: pendingVehicules[0]?.count || 0,
      },
      zones: {
        count: zonesCount[0]?.count || 0,
      },
      growth: {
        rate: growthRate,
        thisMonth: countThisMonth,
        lastMonth: countLastMonth,
      },
    });
  } catch (error) {
    console.error("Stats Error:", error);
    return ApiErrors.serverError();
  }
}
