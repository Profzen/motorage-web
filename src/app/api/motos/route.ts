import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { motos } from '@/lib/db/schema';
import { motoSchema } from '@/lib/validation';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /motos:
 *   get:
 *     tags:
 *       - Motos
 *     summary: Liste des motos
 *     description: Récupère la liste de toutes les motos (Admin) ou filtrées par propriétaire.
 *     parameters:
 *       - in: query
 *         name: proprietaireId
 *         schema:
 *           type: string
 *         description: ID du propriétaire pour filtrer les motos
 *     responses:
 *       200:
 *         description: Succès
 *       500:
 *         description: Erreur serveur
 *   post:
 *     tags:
 *       - Motos
 *     summary: Enregistrer une nouvelle moto
 *     description: Permet à un conducteur d'ajouter un véhicule à son garage.
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
 *               disponibilite:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Moto créée
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const proprietaireId = searchParams.get('proprietaireId');

        let results;
        if (proprietaireId) {
            results = await db.select().from(motos).where(eq(motos.proprietaireId, proprietaireId));
        } else {
            results = await db.select().from(motos);
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error fetching motos:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = motoSchema.parse(body);

        if (!validatedData.proprietaireId) {
            return NextResponse.json({ error: 'proprietaireId is required' }, { status: 400 });
        }

        const newMoto = await db.insert(motos).values({
            marque: validatedData.marque,
            modele: validatedData.modele,
            immatriculation: validatedData.immatriculation,
            disponibilite: validatedData.disponibilite,
            proprietaireId: validatedData.proprietaireId,
        }).returning();

        return NextResponse.json(newMoto[0], { status: 201 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        if (error.message?.includes('UNIQUE constraint failed')) {
            return NextResponse.json({ error: 'Cette immatriculation est déjà enregistrée' }, { status: 400 });
        }
        console.error('Error creating moto:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
