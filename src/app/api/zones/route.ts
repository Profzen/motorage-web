import { db } from "@/lib/db";
import { zones } from "@/lib/db/schema";
import { zoneSchema } from "@/lib/validation";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { authenticateRequest } from "@/lib/auth";
import { cookies } from "next/headers";
import { z } from "zod";
import { logAudit } from "@/lib/audit";

/**
 * @openapi
 * /zones:
 *   get:
 *     tags:
 *       - Zones
 *     summary: Liste toutes les zones
 *     responses:
 *       200:
 *         description: Liste des zones
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ZoneListResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *     security:
 *       - BearerAuth: []
 *   post:
 *     tags:
 *       - Zones
 *     summary: Créer une nouvelle zone (Admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *             properties:
 *               nom:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Zone créée
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
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *     security:
 *       - BearerAuth: []
 */

export async function GET() {
  try {
    const allZones = await db.select().from(zones).orderBy(zones.nom);
    return successResponse(allZones);
  } catch (error) {
    console.error("Error fetching zones:", error);
    return ApiErrors.serverError();
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload || authPayload.role !== "administrateur") {
      return ApiErrors.forbidden("Seul un administrateur peut créer une zone");
    }

    const body = await request.json();
    const validatedData = zoneSchema.parse(body);

    const newZone = await db
      .insert(zones)
      .values({
        nom: validatedData.nom,
        description: validatedData.description,
      })
      .returning();

    await logAudit({
      action: "zone_create",
      userId: authPayload.userId,
      targetId: newZone[0]?.id,
      details: validatedData,
    });

    return successResponse(newZone[0], undefined, 201);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError(
        "Validation failed",
        undefined,
        error.issues
      );
    }
    if (
      error instanceof Error &&
      error.message?.includes("UNIQUE constraint failed")
    ) {
      return ApiErrors.validationError("Cette zone existe déjà", "nom");
    }
    return ApiErrors.serverError();
  }
}
