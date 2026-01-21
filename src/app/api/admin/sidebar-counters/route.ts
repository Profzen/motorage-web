import { db } from "@/lib/db";
import {
  reports,
  onboardingRequests,
  trajets,
  vehicules,
} from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateAdmin(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized("Accès réservé aux administrateurs");
    }

    // 1. Pending reports
    const pendingReports = await db
      .select({ count: count() })
      .from(reports)
      .where(eq(reports.statut, "en_attente"));

    // 2. Pending driver validations
    const pendingOnboarding = await db
      .select({ count: count() })
      .from(onboardingRequests)
      .where(eq(onboardingRequests.statut, "en_attente"));

    // 3. Active trajets (Flux live)
    const activeTrajets = await db
      .select({ count: count() })
      .from(trajets)
      .where(eq(trajets.statut, "ouvert"));

    // 4. Pending vehicles (that are not part of an active onboarding)
    // Actually, simple count is fine
    const pendingVehicules = await db
      .select({ count: count() })
      .from(vehicules)
      .where(eq(vehicules.statut, "en_attente"));

    return successResponse({
      reports: pendingReports[0]?.count || 0,
      onboarding: pendingOnboarding[0]?.count || 0,
      activeTrajets: activeTrajets[0]?.count || 0,
      vehicules: pendingVehicules[0]?.count || 0,
    });
  } catch (error) {
    console.error("Sidebar counters error:", error);
    return ApiErrors.serverError();
  }
}
