import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { trajets, users } from '@/lib/db/schema';
import { eq, and, like } from 'drizzle-orm'; // Added 'and', 'like'
import { z } from 'zod'; // Added Zod import

import { trajetSchema } from '@/lib/validation';

/**
 * @openapi
 * /trajets:
 *   get:
 *     tags:
 *       - Trajets
 *     summary: Récupérer tous les trajets avec filtres
 *     description: Retourne la liste des trajets. Supporte le filtrage par départ, destination, zones et conducteur.
 *     parameters:
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
 *     responses:
 *       200:
 *         description: Liste des trajets
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Trajet'
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const departZoneId = searchParams.get('departZoneId');
    const arriveeZoneId = searchParams.get('arriveeZoneId');
    const conducteurId = searchParams.get('conducteurId');

    const query = db.query.trajets.findMany({
      where: (trajets, { and, eq, like }) => {
        const conditions = [];
        if (from) conditions.push(like(trajets.pointDepart, `%${from}%`));
        if (to) conditions.push(like(trajets.destination, `%${to}%`));
        if (departZoneId) conditions.push(eq(trajets.departZoneId, departZoneId));
        if (arriveeZoneId) conditions.push(eq(trajets.arriveeZoneId, arriveeZoneId));
        if (conducteurId) conditions.push(eq(trajets.conducteurId, conducteurId));
        return and(...conditions);
      },
      with: {
        conducteur: {
          columns: {
            password: false,
          },
        },
        departZone: true,
        arriveeZone: true,
      },
      orderBy: (trajets, { desc }) => [desc(trajets.createdAt)],
    });

    const allTrajets = await query;
    return NextResponse.json(allTrajets);
  } catch (error) {
    console.error('Error fetching trajets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * @openapi
 * /trajets:
 *   post:
 *     tags:
 *       - Trajets
 *     summary: Publier un nouveau trajet
 *     description: Permet à un conducteur de proposer un nouveau trajet. Tous les détails (zones, coordonnées) peuvent être renseignés.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Trajet'
 *     responses:
 *       201:
 *         description: Trajet publié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Trajet'
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
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

    return NextResponse.json(newTrajet[0], { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    console.error('Error creating trajet:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
