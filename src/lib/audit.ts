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

function safeStringify(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  try {
    return JSON.stringify(value);
  } catch (error) {
    // Fallback minimal description when circular/BigInt/etc.
    return `unserializable_details: ${String(error)}`;
  }
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
      details: safeStringify(details),
      ip: ip || null,
      userAgent: userAgent || null,
    });
  } catch (error) {
    const cause = (error as { cause?: unknown })?.cause as
      | { status?: number; message?: string }
      | undefined;
    const status = cause?.status;
    const message = (error as Error)?.message || "Unknown audit error";
    console.error("Audit log error", {
      action,
      userId,
      targetId,
      status,
      message,
      cause,
    });
  }
}
