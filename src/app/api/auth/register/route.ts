import { userSchema } from '@/lib/validation';
import { hashPassword, signJWT, signRefreshToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Créer un nouveau compte
 *     description: Enregistre un nouvel étudiant sur la plateforme et connecte automatiquement l'utilisateur avec un système de refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Utilisateur créé et connecté avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         description: Données invalides ou email déjà utilisé
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = userSchema.parse(body);

    const hashedPassword = await hashPassword(validatedData.password);

    const newUser = await db.insert(users).values({
      nom: validatedData.nom,
      prenom: validatedData.prenom,
      email: validatedData.email,
      password: hashedPassword,
      role: validatedData.role || 'passager',
      statut: 'actif',
    }).returning();

    const user = newUser[0];
    const { password: _, ...userWithoutPassword } = user;

    // Generate Tokens
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = await signJWT(payload);
    const refreshToken = await signRefreshToken(payload);

    // Save refresh token to DB
    await db.update(users)
      .set({ refreshToken })
      .where(eq(users.id, user.id));

    // Set cookies
    const cookieStore = await cookies();

    cookieStore.set('token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    });

    cookieStore.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      user: userWithoutPassword,
      token: accessToken,
      refreshToken
    }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    if (error.message?.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
    }
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
