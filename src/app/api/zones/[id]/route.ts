import { db } from '@/lib/db';
import { zones } from '@/lib/db/schema';
import { zoneSchema } from '@/lib/validation';
import { eq } from 'drizzle-orm';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { z } from 'zod';

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
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const zone = await db.query.zones.findFirst({
            where: eq(zones.id, params.id),
        });

        if (!zone) {
            return ApiErrors.notFound('Zone');
        }

        return successResponse(zone);
    } catch {
        return ApiErrors.serverError();
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const validatedData = zoneSchema.partial().parse(body);

        const updated = await db.update(zones)
            .set(validatedData)
            .where(eq(zones.id, params.id))
            .returning();

        if (updated.length === 0) {
            return ApiErrors.notFound('Zone');
        }

        return successResponse(updated[0]);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return ApiErrors.validationError('Validation failed', undefined, error.issues);
        }
        return ApiErrors.serverError();
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const deleted = await db.delete(zones)
            .where(eq(zones.id, params.id))
            .returning();

        if (deleted.length === 0) {
            return ApiErrors.notFound('Zone');
        }

        return successResponse({ message: 'Zone supprimée avec succès' });
    } catch {
        return ApiErrors.serverError();
    }
}
