import { db } from "@/lib/db";
import { zones } from "@/lib/db/schema";
import { zoneSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { logAudit } from "@/lib/audit";
import { z } from "zod";
import { NextRequest } from "next/server";

/**
 * @openapi
 * /zones/{id}:
 *   get:
 *     tags:
 *       - Zones
 *     summary: Détails d'une zone
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la zone
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ZoneResponse'
 *       404:
 *         description: Zone non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse404'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *   patch:
 *     tags:
 *       - Zones
 *     summary: Modifier une zone (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Zone mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ZoneResponse'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 *       404:
 *         description: Zone non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse404'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *     security:
 *       - BearerAuth: []
 *   delete:
 *     tags:
 *       - Zones
 *     summary: Supprimer une zone (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Zone supprimée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Zone non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse404'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *     security:
 *       - BearerAuth: []
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const zone = await db.query.zones.findFirst({
      where: eq(zones.id, id),
    });

    if (!zone) {
      return ApiErrors.notFound("Zone");
    }

    return successResponse(zone);
  } catch {
    return ApiErrors.serverError();
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);
    if (!authPayload || authPayload.role !== "administrateur") {
      return ApiErrors.forbidden("Seul un administrateur peut modifier une zone");
    }

    const { id } = await params;
    const body = await request.json();
    const validatedData = zoneSchema.partial().parse(body);

    const updated = await db
      .update(zones)
      .set(validatedData)
      .where(eq(zones.id, id))
      .returning();

    if (updated.length === 0) {
      return ApiErrors.notFound("Zone");
    }

    await logAudit({
      action: "zone_update",
      userId: authPayload.userId,
      targetId: id,
      details: validatedData,
    });

    return successResponse(updated[0]);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError(
        "Validation failed",
        undefined,
        error.issues
      );
    }
    return ApiErrors.serverError();
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);
    if (!authPayload || authPayload.role !== "administrateur") {
      return ApiErrors.forbidden("Seul un administrateur peut supprimer une zone");
    }

    const { id } = await params;
    const deleted = await db.delete(zones).where(eq(zones.id, id)).returning();

    if (deleted.length === 0) {
      return ApiErrors.notFound("Zone");
    }

    await logAudit({
      action: "zone_delete",
      userId: authPayload.userId,
      targetId: id,
    });

    return successResponse({ message: "Zone supprimée avec succès" });
  } catch {
    return ApiErrors.serverError();
  }
}
