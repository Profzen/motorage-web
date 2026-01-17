import { db } from "@/lib/db";
import { motos } from "@/lib/db/schema";
import { motoSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";
import { successResponse, ApiErrors } from "@/lib/api-response";

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
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const moto = await db.query.motos.findFirst({
      where: eq(motos.id, params.id),
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = motoSchema.partial().parse(body);

    const updatedMoto = await db
      .update(motos)
      .set(validatedData)
      .where(eq(motos.id, params.id))
      .returning();

    if (updatedMoto.length === 0) {
      return ApiErrors.notFound("Moto");
    }

    return successResponse(updatedMoto[0]);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "ZodError") {
      return ApiErrors.validationError(
        "Validation failed",
        undefined,
        (error as { errors: unknown[] }).errors
      );
    }
    return ApiErrors.serverError();
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deletedMoto = await db
      .delete(motos)
      .where(eq(motos.id, params.id))
      .returning();

    if (deletedMoto.length === 0) {
      return ApiErrors.notFound("Moto");
    }

    return successResponse({ message: "Moto deleted successfully" });
  } catch {
    return ApiErrors.serverError();
  }
}
