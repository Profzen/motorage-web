import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { zones } from '@/lib/db/schema';
import { zoneSchema } from '@/lib/validation';
import { eq } from 'drizzle-orm';

/**
 * @openapi
 * /zones:
 *   get:
 *     tags:
 *       - Zones
 *     summary: Liste toutes les zones
 *       200:
 *         description: Liste des zones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Zone'
 *     security:
 *       - bearerAuth: []
 *   post:
 *     tags:
 *       - Zones
 *     summary: Créer une nouvelle zone (Admin)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Zone'
 *     responses:
 *       201:
 *         description: Zone créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Zone'
 *       400:
 *         description: Données invalides
 *     security:
 *       - bearerAuth: []
 */

export async function GET() {
    try {
        const allZones = await db.select().from(zones).orderBy(zones.nom);
        return NextResponse.json(allZones);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validatedData = zoneSchema.parse(body);

        const newZone = await db.insert(zones).values({
            nom: validatedData.nom,
            description: validatedData.description,
        }).returning();

        return NextResponse.json(newZone[0], { status: 201 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
        }
        if (error.message?.includes('UNIQUE constraint failed')) {
            return NextResponse.json({ error: 'Cette zone existe déjà' }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
