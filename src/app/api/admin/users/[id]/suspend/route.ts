import { db } from "@/lib/db";
import { users, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";

const suspendSchema = z.object({
  reason: z.string().min(5, "Une raison de minimum 5 caractères est requise"),
  durationInDays: z.number().optional().default(0), // 0 means permanent
});

/**
 * @openapi
 * /admin/users/{id}/suspend:
 *   post:
 *     tags:
 *       - Admin
 *     summary: Suspendre ou bannir un utilisateur (Admin)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const admin = await authenticateAdmin(request, cookieToken);

    if (!admin) {
      return ApiErrors.unauthorized("Accès administratif requis");
    }

    const { id } = await params;
    const body = await request.json();
    const { reason, durationInDays } = suspendSchema.parse(body);

    const userToSuspend = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!userToSuspend) {
      return ApiErrors.notFound("Utilisateur");
    }

    if (userToSuspend.role === "administrateur") {
      return ApiErrors.badRequest("Impossible de suspendre un administrateur");
    }

    // Update user status
    await db.update(users).set({ statut: "suspendu" }).where(eq(users.id, id));

    // Log the action
    await db.insert(auditLogs).values({
      userId: admin.userId,
      targetId: id,
      action: "SUSPEND_USER",
      details: `Utilisateur suspendu. Raison: ${reason}${durationInDays > 0 ? ` pour ${durationInDays} jours` : " (Permanent)"}`,
    });

    return successResponse({ message: "Utilisateur suspendu avec succès" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError(
        "Validation failed",
        undefined,
        error.issues
      );
    }
    console.error("Suspend user error:", error);
    return ApiErrors.serverError();
  }
}
