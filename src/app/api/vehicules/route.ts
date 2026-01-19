import { db } from "@/lib/db";
import { vehicules } from "@/lib/db/schema";
import { vehiculeSchema } from "@/lib/validation";
import { eq, sql, and } from "drizzle-orm";
import {
  successResponse,
  paginatedResponse,
  ApiErrors,
  parsePaginationParams,
} from "@/lib/api-response";
import { authenticateRequest } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * @openapi
 * /vehicules:
 *   get:
 *     tags:
 *       - Véhicules
 *     summary: Liste des véhicules
 *     description: Récupère la liste de tous les véhicules (Admin) ou filtrés par propriétaire.
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: proprietaireId
 *         schema:
 *           type: string
 *         description: ID du propriétaire pour filtrer les véhicules
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Liste des véhicules
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VehiculeListResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *   post:
 *     tags:
 *       - Véhicules
 *     summary: Enregistrer un nouveau véhicule
 *     description: Permet à un conducteur d'ajouter un véhicule à son garage.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - marque
 *               - modele
 *               - immatriculation
 *               - proprietaireId
 *             properties:
 *               marque:
 *                 type: string
 *               modele:
 *                 type: string
 *               immatriculation:
 *                 type: string
 *               proprietaireId:
 *                 type: string
 *                 format: uuid
 *               disponibilite:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Véhicule créé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/VehiculeResponse'
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
    const proprietaireId = searchParams.get("proprietaireId");
    const statut = searchParams.get("statut");

    // Permissions check: If no filter by ID, must be admin. If filter by ID, must be that user or admin.
    if (!proprietaireId && authPayload.role !== "administrateur") {
      return ApiErrors.forbidden(
        "Seul un administrateur peut lister tous les véhicules"
      );
    }

    if (
      proprietaireId &&
      proprietaireId !== authPayload.userId &&
      authPayload.role !== "administrateur"
    ) {
      return ApiErrors.forbidden(
        "Vous n'êtes pas autorisé à voir les véhicules de cet utilisateur"
      );
    }

    const conditions = [];
    if (proprietaireId)
      conditions.push(eq(vehicules.proprietaireId, proprietaireId));
    if (statut) conditions.push(eq(vehicules.statut, statut));

    const whereClause =
      conditions.length > 0
        ? conditions.length > 1
          ? and(...conditions)
          : conditions[0]
        : undefined;

    const results = await db
      .select()
      .from(vehicules)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(vehicules)
      .where(whereClause);

    return paginatedResponse(results, page, limit, totalResult[0].count);
  } catch (error) {
    console.error("Error fetching vehicules:", error);
    return ApiErrors.serverError();
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get("token")?.value;
    const authPayload = await authenticateRequest(request, cookieToken);

    if (!authPayload) return ApiErrors.unauthorized();

    const body = await request.json();
    const validatedData = vehiculeSchema.parse(body);

    // Security check: cannot add vehicle for someone else unless admin
    if (
      validatedData.proprietaireId !== authPayload.userId &&
      authPayload.role !== "administrateur"
    ) {
      return ApiErrors.forbidden(
        "Vous ne pouvez pas ajouter un véhicule pour un autre utilisateur"
      );
    }

    const [newVehicule] = await db
      .insert(vehicules)
      .values({
        type: validatedData.type,
        marque: validatedData.marque,
        modele: validatedData.modele,
        immatriculation: validatedData.immatriculation,
        image: validatedData.image,
        disponibilite: validatedData.disponibilite,
        proprietaireId: validatedData.proprietaireId,
        statut: "en_attente",
      })
      .returning();

    return successResponse(newVehicule, undefined, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes("UNIQUE constraint failed")) {
      return ApiErrors.validationError(
        "Cette immatriculation est déjà enregistrée",
        "immatriculation"
      );
    }
    console.error("Error creating vehicule:", error);
    return ApiErrors.serverError();
  }
}
