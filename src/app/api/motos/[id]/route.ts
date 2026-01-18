import { db } from "@/lib/db";
import { motos } from "@/lib/db/schema";
import { motoSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";
import { NextRequest } from "next/server";
import { z } from "zod";

/**
 * @openapi
 * /motos/{id}:
 *   get:
 *     tags:
 *       - Motos
 *     summary: Détails d'une moto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la moto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MotoResponse'
 *       404:
 *         description: Moto non trouvée
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
 *   put:
 *     tags:
 *       - Motos
 *     summary: Modifier une moto
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
 *               marque:
 *                 type: string
 *               modele:
 *                 type: string
 *               immatriculation:
 *                 type: string
 *               disponibilite:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Moto mise à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MotoResponse'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse400'
 *       404:
 *         description: Moto non trouvée
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
 *   delete:
 *     tags:
 *       - Motos
 *     summary: Supprimer une moto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Moto supprimée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Moto non trouvée
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
 */

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const moto = await db.query.motos.findFirst({
      where: eq(motos.id, id),
    });

    if (!moto) {
      return ApiErrors.notFound("Moto");
    }

    return successResponse(moto);
  } catch {
    return ApiErrors.serverError();
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validatedData = motoSchema.partial().parse(body);

    const updated = await db
      .update(motos)
      .set(validatedData)
      .where(eq(motos.id, id))
      .returning();

    if (updated.length === 0) {
      return ApiErrors.notFound("Moto");
    }

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
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await db.delete(motos).where(eq(motos.id, id)).returning();

    if (deleted.length === 0) {
      return ApiErrors.notFound("Moto");
    }

    return successResponse({ message: "Moto deleted successfully" });
  } catch {
    return ApiErrors.serverError();
  }
}
