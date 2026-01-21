import { db } from "@/lib/db";
import { reports, users } from "@/lib/db/schema";
import {
  successResponse,
  paginatedResponse,
  ApiErrors,
  parsePaginationParams,
} from "@/lib/api-response";
import { authenticateRequest } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { cookies } from "next/headers";
import { z } from "zod";
import { eq, desc, sql } from "drizzle-orm";

const reportSchema = z.object({
  reportedId: z.string().optional(),
  trajetId: z.string().optional(),
  type: z.enum(["comportement", "retard", "securite", "autre"]),
  titre: z.string().min(3, "Le titre doit faire au moins 3 caractères"),
  description: z
    .string()
    .min(10, "La description doit faire au moins 10 caractères"),
});

/**
 * @openapi
 * /reports:
 *   post:
 *     tags:
 *       - Litiges
 *     summary: Signaler un problème ou un utilisateur
 *     description: Permet à n'importe quel utilisateur authentifié de créer un signalement.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - titre
 *               - description
 *             properties:
 *               reportedId:
 *                 type: string
 *               trajetId:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [comportement, retard, securite, autre]
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Signalement créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportResponse'
 *       401:
 *         description: Non autorisé
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) {
      return ApiErrors.unauthorized();
    }

    const body = await request.json();
    const validatedData = reportSchema.parse(body);

    const [newReport] = await db
      .insert(reports)
      .values({
        reporterId: authPayload.userId,
        reportedId: validatedData.reportedId,
        trajetId: validatedData.trajetId,
        type: validatedData.type,
        titre: validatedData.titre,
        description: validatedData.description,
        statut: "en_attente",
      })
      .returning();

    // Notifier les administrateurs
    try {
      const admins = await db.query.users.findMany({
        where: eq(users.role, "administrateur"),
      });

      await Promise.all(
        admins.map((admin) =>
          createNotification({
            userId: admin.id,
            type: "system",
            title: "Nouveau signalement",
            message: `Un nouveau signalement de type "${validatedData.type}" a été soumis : ${validatedData.titre}`,
            data: { reportId: newReport.id },
          })
        )
      );
    } catch (notifError) {
      console.error("Failed to notify admins about new report:", notifError);
    }

    return successResponse(newReport, undefined, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return ApiErrors.badRequest(error.issues[0].message);
    }
    console.error("Create report error:", error);
    return ApiErrors.serverError();
  }
}

/**
 * @openapi
 * /reports:
 *   get:
 *     tags:
 *       - Litiges
 *     summary: Voir mes signalements passés
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Liste de vos signalements
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ReportListResponse'
 */
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) return ApiErrors.unauthorized();

    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePaginationParams(searchParams);
    const offset = (page - 1) * limit;

    const myReports = await db.query.reports.findMany({
      where: eq(reports.reporterId, authPayload.userId),
      orderBy: [desc(reports.createdAt)],
      limit,
      offset,
    });

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(reports)
      .where(eq(reports.reporterId, authPayload.userId));

    return paginatedResponse(myReports, page, limit, totalResult[0].count);
  } catch {
    return ApiErrors.serverError();
  }
}
