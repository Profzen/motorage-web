import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ApiErrors, successResponse } from "@/lib/api-response";
import { authenticateAdmin } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { cookies } from "next/headers";
import { z } from "zod";
import { NextRequest } from "next/server";

const suspendSchema = z.object({
  statut: z.enum(["suspendu", "actif"]).default("suspendu"),
  motif: z.string().optional(),
  reason: z.string().optional(),
  durationInDays: z.number().optional(),
});

/**
 * @openapi
 * /admin/users/{id}/suspend:
 *   post:
 *     tags:
 *       - Admin
<<<<<<< HEAD
 *     summary: Suspendre ou réactiver un utilisateur
 *     description: Permet à un administrateur de suspendre ou réactiver un compte utilisateur.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateAdmin(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized("Accès réservé aux administrateurs");
    }

    const body = await request.json();
    const { statut, motif, reason, durationInDays } = suspendSchema.parse(body);
    const { id } = await params;

    const existing = await db.query.users.findFirst({ where: eq(users.id, id) });
    if (!existing) return ApiErrors.notFound("Utilisateur");

    if (existing.role === "administrateur" && statut === "suspendu") {
      return ApiErrors.badRequest("Impossible de suspendre un administrateur");
    }

    await db.update(users).set({ statut }).where(eq(users.id, id));

    await logAudit({
      action: statut === "suspendu" ? "user_suspend" : "user_reactivate",
      userId: authPayload.userId,
      targetId: id,
      details: { motif: motif || reason, statut, durationInDays },
      ip:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip"),
      userAgent: request.headers.get("user-agent"),
    });

    return successResponse({ message: "Statut mis à jour" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError(
        "Corps de requête invalide",
        undefined,
        error.issues
      );
    }
    return ApiErrors.serverError();
  }
}
