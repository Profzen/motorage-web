import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { sql, count } from "drizzle-orm";
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

    const totalCount = await db.select({ count: count() }).from(users);
    
    const activeCount = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.statut} = 'actif'`);
      
    const suspendedCount = await db
      .select({ count: count() })
      .from(users)
      .where(sql`${users.statut} = 'suspendu'`);

    // Optionally: count new users this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const dateStr = oneWeekAgo.toISOString().replace("T", " ").split(".")[0];
    const newUsers = await db
        .select({ count: count() })
        .from(users)
        .where(sql`datetime(${users.createdAt}) >= datetime(${dateStr})`);

    return successResponse({
      total: totalCount[0].count,
      active: activeCount[0].count,
      suspended: suspendedCount[0].count,
      newlyJoined: newUsers[0].count,
    });
  } catch (error) {
    console.error("User summary error:", error);
    return ApiErrors.serverError();
  }
}
