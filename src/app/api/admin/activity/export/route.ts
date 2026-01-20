import { db } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { authenticateAdmin } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * @openapi
 * /admin/activity/export:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Exporter les logs d'audit en CSV (Admin)
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const admin = await authenticateAdmin(request, cookieToken);

    if (!admin) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch logs with user data
    const logs = await db.query.auditLogs.findMany({
      with: {
        user: {
          columns: {
            nom: true,
            prenom: true,
            email: true
          }
        }
      },
      orderBy: [desc(auditLogs.createdAt)],
      limit: 1000 // Limit for safety
    });

    // CSV Header
    let csv = "ID,Date,Utilisateur,Action,Target,Details,IP\n";

    // Data rows
    logs.forEach((log) => {
      const userName = log.user ? `${log.user.prenom} ${log.user.nom}` : "Système";
      const row = [
        log.id,
        log.createdAt,
        userName,
        log.action,
        log.targetId || "",
        `"${(log.details || "").replace(/"/g, '""')}"`,
        log.ip || ""
      ].join(",");
      csv += row + "\n";
    });

    // Return as file download
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename=audit-logs-${new Date().toISOString().split("T")[0]}.csv`
      }
    });

  } catch (error) {
    console.error("CSV Export error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
