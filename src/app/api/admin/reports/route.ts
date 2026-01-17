import { db } from '@/lib/db';
import { reports } from '@/lib/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
import { paginatedResponse, ApiErrors, parsePaginationParams } from '@/lib/api-response';
import { authenticateRequest } from '@/lib/auth';
import { cookies } from 'next/headers';

/**
 * @openapi
 * /admin/reports:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Lister les signalements et litiges (Admin)
 *     description: Permet d'obtenir tous les signalements avec pagination.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *       - in: query
 *         name: statut
 *         schema: { type: string, enum: [en_attente, en_cours, resolu, rejete] }
 *     responses:
 *       200:
 *         description: Liste des signalements
 */
export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get('token')?.value;
        const authPayload = await authenticateRequest(request, cookieToken);

        if (!authPayload || authPayload.role !== 'administrateur') {
            return ApiErrors.unauthorized('Accès réservé aux administrateurs');
        }

        const { searchParams } = new URL(request.url);
        const { page, limit } = parsePaginationParams(searchParams);
        const statut = searchParams.get('statut');
        const offset = (page - 1) * limit;

        const whereClause = statut ? eq(reports.statut, statut) : undefined;

        const data = await db.query.reports.findMany({
            where: whereClause,
            with: {
                reporter: true,
                reported: true,
                trajet: true
            },
            limit,
            offset,
            orderBy: [desc(reports.createdAt)]
        });

        const totalResult = await db.select({ count: sql<number>`count(*)` })
            .from(reports)
            .where(whereClause);
        
        const total = totalResult[0].count;

        return paginatedResponse(data, page, limit, total);
    } catch (error) {
        console.error('List reports error:', error);
        return ApiErrors.serverError();
    }
}
