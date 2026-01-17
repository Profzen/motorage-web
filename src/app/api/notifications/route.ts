import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { paginatedResponse, successResponse, ApiErrors, parsePaginationParams } from '@/lib/api-response';
import { authenticateRequest } from '@/lib/auth';
import { cookies } from 'next/headers';
import { sql } from 'drizzle-orm';

/**
 * @openapi
 * /notifications:
 *   get:
 *     tags:
 *       - Notifications
 *     summary: Liste des notifications de l'utilisateur
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des notifications
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationListResponse'
 */
export async function GET(request: Request) {
    try {
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get('token')?.value;
        const authPayload = await authenticateRequest(request, cookieToken);

        if (!authPayload) return ApiErrors.unauthorized();

        const { searchParams } = new URL(request.url);
        const { page, limit } = parsePaginationParams(searchParams);
        const offset = (page - 1) * limit;

        const data = await db.query.notifications.findMany({
            where: eq(notifications.userId, authPayload.userId),
            orderBy: [desc(notifications.createdAt)],
            limit,
            offset
        });

        const totalResult = await db.select({ count: sql<number>`count(*)` })
            .from(notifications)
            .where(eq(notifications.userId, authPayload.userId));
        const total = totalResult[0].count;

        return paginatedResponse(data, page, limit, total);
    } catch (error) {
        console.error('Get Notifications Error:', error);
        return ApiErrors.serverError();
    }
}

/**
 * @openapi
 * /notifications/read-all:
 *   patch:
 *     tags:
 *       - Notifications
 *     summary: Marquer toutes les notifications comme lues
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 */
export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies();
        const cookieToken = cookieStore.get('token')?.value;
        const authPayload = await authenticateRequest(request, cookieToken);

        if (!authPayload) return ApiErrors.unauthorized();

        await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.userId, authPayload.userId));

        return successResponse({ message: 'Toutes les notifications ont été marquées comme lues' });
    } catch {
        return ApiErrors.serverError();
    }
}
