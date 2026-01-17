import { db } from '@/lib/db';
import { trajets } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';
import { trajetSchema } from '@/lib/validation';
import { successResponse, paginatedResponse, ApiErrors, parsePaginationParams } from '@/lib/api-response';
import { z } from 'zod';

/**
 * @openapi
 * /trajets:
 *   get:
 *     tags:
 *       - Trajets
 *     summary: Récupérer tous les trajets avec filtres et pagination
 *     description: Retourne la liste des trajets paginée. Supporte le filtrage par départ, destination, zones et conducteur.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 100
 *         description: Nombre d'éléments par page
 *       - in: query
 *         name: from
 *         schema:
 *           type: string
 *         description: Texte de départ
 *       - in: query
 *         name: to
 *         schema:
 *           type: string
 *         description: Texte de destination
 *       - in: query
 *         name: departZoneId
 *         schema:
 *           type: string
 *         description: ID de la zone de départ
 *       - in: query
 *         name: arriveeZoneId
 *         schema:
 *           type: string
 *         description: ID de la zone d'arrivée
 *       - in: query
 *         name: conducteurId
 *         schema:
 *           type: string
 *         description: Filtrer par conducteur
 *       - in: query
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [ouvert, plein, terminé, annulé]
 *         description: Filtrer par statut
 *     responses:
 *       200:
 *         description: Liste des trajets paginée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrajetListResponse'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse500'
 *     security:
 *       - BearerAuth: []
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit } = parsePaginationParams(searchParams);
    const offset = (page - 1) * limit;

    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const departZoneId = searchParams.get('departZoneId');
    const arriveeZoneId = searchParams.get('arriveeZoneId');
    const conducteurId = searchParams.get('conducteurId');
    const statut = searchParams.get('statut');

    // Get total count
    const countResult = await db.select({ count: sql<number>`count(*)` })
      .from(trajets)
      .where((t, { and, eq, like }) => {
        const conditions = [];
        if (from) conditions.push(like(t.pointDepart, `%${from}%`));
        if (to) conditions.push(like(t.destination, `%${to}%`));
        if (departZoneId) conditions.push(eq(t.departZoneId, departZoneId));
        if (arriveeZoneId) conditions.push(eq(t.arriveeZoneId, arriveeZoneId));
        if (conducteurId) conditions.push(eq(t.conducteurId, conducteurId));
        if (statut) conditions.push(eq(t.statut, statut));
        return conditions.length > 0 ? and(...conditions) : undefined;
      });
    const total = Number(countResult[0]?.count || 0);

    // Get paginated data
    const data = await db.query.trajets.findMany({
      where: (t, { and, eq, like }) => {
        const conditions = [];
        if (from) conditions.push(like(t.pointDepart, `%${from}%`));
        if (to) conditions.push(like(t.destination, `%${to}%`));
        if (departZoneId) conditions.push(eq(t.departZoneId, departZoneId));
        if (arriveeZoneId) conditions.push(eq(t.arriveeZoneId, arriveeZoneId));
        if (conducteurId) conditions.push(eq(t.conducteurId, conducteurId));
        if (statut) conditions.push(eq(t.statut, statut));
        return conditions.length > 0 ? and(...conditions) : undefined;
      },
      with: {
        conducteur: {
          columns: {
            password: false,
            refreshToken: false,
          },
        },
        departZone: true,
        arriveeZone: true,
      },
      orderBy: (trajets, { desc }) => [desc(trajets.createdAt)],
      limit,
      offset,
    });

    return paginatedResponse(data, page, limit, total);
  } catch (error) {
    console.error('Error fetching trajets:', error);
    return ApiErrors.serverError();
  }
}

/**
 * @openapi
 * /trajets:
 *   post:
 *     tags:
 *       - Trajets
 *     summary: Publier un nouveau trajet
 *     description: Permet à un conducteur de proposer un nouveau trajet.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pointDepart
 *               - destination
 *               - dateHeure
 *               - placesDisponibles
 *               - conducteurId
 *             properties:
 *               pointDepart:
 *                 type: string
 *               destination:
 *                 type: string
 *               departZoneId:
 *                 type: string
 *                 nullable: true
 *               arriveeZoneId:
 *                 type: string
 *                 nullable: true
 *               dateHeure:
 *                 type: string
 *                 format: date-time
 *               placesDisponibles:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 4
 *               conducteurId:
 *                 type: string
 *               departureLat:
 *                 type: number
 *                 nullable: true
 *               departureLng:
 *                 type: number
 *                 nullable: true
 *               arrivalLat:
 *                 type: number
 *                 nullable: true
 *               arrivalLng:
 *                 type: number
 *                 nullable: true
 *               statut:
 *                 type: string
 *                 enum: [ouvert, plein, terminé, annulé]
 *     responses:
 *       201:
 *         description: Trajet publié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TrajetResponse'
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
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = trajetSchema.parse(body);

    const newTrajet = await db.insert(trajets).values({
      conducteurId: validatedData.conducteurId,
      pointDepart: validatedData.pointDepart,
      destination: validatedData.destination,
      departZoneId: validatedData.departZoneId,
      arriveeZoneId: validatedData.arriveeZoneId,
      dateHeure: validatedData.dateHeure,
      placesDisponibles: validatedData.placesDisponibles,
      departureLat: validatedData.departureLat,
      departureLng: validatedData.departureLng,
      arrivalLat: validatedData.arrivalLat,
      arrivalLng: validatedData.arrivalLng,
      statut: validatedData.statut || 'ouvert',
    }).returning();

    return successResponse(newTrajet[0], undefined, 201);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return ApiErrors.validationError('Validation failed', undefined, error.issues);
    }
    console.error('Error creating trajet:', error);
    return ApiErrors.serverError();
  }
}
