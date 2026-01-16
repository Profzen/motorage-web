import { loginSchema } from '@/lib/validation';
import { comparePassword, signJWT, signRefreshToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Connecter un utilisateur
 *     description: Authentifie un utilisateur avec son email et son mot de passe, et crée une session sécurisée avec refresh token.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authentification réussie
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
 *       401:
 *         description: Identifiants invalides
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = loginSchema.parse(body);

    const user = await db.query.users.findFirst({
      where: eq(users.email, validatedData.email),
    });

    if (!user || !(await comparePassword(validatedData.password, user.password))) {
      return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 });
    }

    const { password: _, refreshToken: __, ...userWithoutPassword } = user;

    // Generate Tokens
    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = (await signJWT(payload)) as string;
    const refreshToken = (await signRefreshToken(payload)) as string;

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
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: (error as any).errors }, { status: 400 });
    }
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
