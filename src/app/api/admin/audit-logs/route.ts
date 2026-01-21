import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { auditLogs, users } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import {
  ApiErrors,
  paginatedResponse,
  parsePaginationParams,
} from "@/lib/api-response";
import { authenticateRequest } from "@/lib/auth";
import { cookies } from "next/headers";

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (val: unknown) => {
    if (val === null || val === undefined) return "";
    const str = String(val).replace(/"/g, '""');
    return str.includes(",") || str.includes("\n") ? `"${str}"` : str;
  };
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escape(row[h])).join(","));
  }
  return lines.join("\n");
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload || authPayload.role !== "administrateur") {
      return ApiErrors.unauthorized("Accès réservé aux administrateurs");
    }

    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePaginationParams(searchParams);
    const format = searchParams.get("format");

    const whereUser = searchParams.get("userId");

    const baseQuery = db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        targetId: auditLogs.targetId,
        details: auditLogs.details,
        userId: auditLogs.userId,
        ip: auditLogs.ip,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
        userEmail: users.email,
        userNom: users.nom,
        userPrenom: users.prenom,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.userId, users.id))
      .where(whereUser ? eq(auditLogs.userId, whereUser) : undefined)
      .orderBy(desc(auditLogs.createdAt));

    // Count total
    const totalRows = await db
      .select({ count: auditLogs.id })
      .from(auditLogs)
      .where(whereUser ? eq(auditLogs.userId, whereUser) : undefined);
    const total = Number(totalRows?.[0]?.count ?? 0);

    // Fetch paginated data
    const offset = (page - 1) * limit;
    const rows = await baseQuery.limit(limit).offset(offset);

    if (format === "csv") {
      const csv = toCsv(rows);
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=audit_logs.csv",
        },
      });
    }

    return paginatedResponse(rows, page, limit, total);
  } catch (error) {
    console.error("Audit logs error:", error);
    return ApiErrors.serverError();
  }
}
