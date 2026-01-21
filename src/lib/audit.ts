import { db } from "./db";
import { auditLogs } from "./db/schema";

interface AuditInput {
  action: string;
  userId?: string | null;
  targetId?: string | null;
  details?: unknown;
  ip?: string | null;
  userAgent?: string | null;
}

export async function logAudit({
  action,
  userId,
  targetId,
  details,
  ip,
  userAgent,
}: AuditInput) {
  try {
    await db.insert(auditLogs).values({
      action,
      userId: userId || null,
      targetId: targetId || null,
      details: details ? JSON.stringify(details) : null,
      ip: ip || null,
      userAgent: userAgent || null,
    });
  } catch (error) {
    console.error("Audit log error", error);
  }
}
