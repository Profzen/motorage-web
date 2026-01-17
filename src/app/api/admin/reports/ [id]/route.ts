import { db } from '@/lib/db';
import { reports } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { successResponse, ApiErrors } from '@/lib/api-response';
import { authenticateRequest } from '@/lib/auth';
import { cookies } from 'next/headers';
import { z } from 'zod';

const updateReportSchema = z.object({
    statut: z.enum(['en_attente', 'en_cours', 'resolu', 'rejete']),
    commentaireAdmin: z.string().optional(),
});

/**
 * @openapi
 * /admin/reports/{id}:
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Mettre à jour un signalement (Admin)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               statut: { type: string, enum: [en_attente, en_cours, resolu, rejete] }
 *               commentaireAdmin: { type: string }
 *     responses:
 *       200:
 *         description: Signalement mis à jour
 */
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = await params;
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get('token')?.value;
        const authPayload = await authenticateRequest(request, cookieToken);

        if (!authPayload || authPayload.role !== 'administrateur') {
            return ApiErrors.unauthorized('Accès réservé aux administrateurs');
        }

        const body = await request.json();
        const validatedData = updateReportSchema.parse(body);

        const [updatedReport] = await db.update(reports)
            .set({
                statut: validatedData.statut,
                commentaireAdmin: validatedData.commentaireAdmin,
            })
            .where(eq(reports.id, id))
            .returning();

        if (!updatedReport) {
            return ApiErrors.notFound('Signalement non trouvé');
        }

        return successResponse(updatedReport);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return ApiErrors.badRequest(error.errors[0].message);
        }
        console.error('Update report error:', error);
        return ApiErrors.serverError();
    }
}
