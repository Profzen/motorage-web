import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'your-fallback-secret-at-least-32-chars-long'
);

const JWT_REFRESH_SECRET = new TextEncoder().encode(
    process.env.JWT_REFRESH_SECRET || 'your-fallback-refresh-secret-at-least-32-chars-long'
);

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function signJWT(payload: Record<string, unknown>) {
    try {
        return await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(JWT_EXPIRES_IN)
            .sign(JWT_SECRET);
    } catch {
        return null;
    }
}

export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload;
    } catch {
        return null;
    }
}

export async function signRefreshToken(payload: Record<string, unknown>) {
    try {
        return await new SignJWT(payload)
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime(JWT_REFRESH_EXPIRES_IN)
            .sign(JWT_REFRESH_SECRET);
    } catch {
        return null;
    }
}

export async function verifyRefreshToken(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
        return payload;
    } catch (error) {
        return null;
    }
}

/**
 * Extract access token from request (supports both cookies and Authorization header)
 * Priority: Authorization header > Cookie
 */
export function extractTokenFromRequest(request: Request, cookieToken?: string): string | null {
    // Priority 1: Authorization header (for mobile)
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    // Priority 2: Cookie (for web)
    if (cookieToken) {
        return cookieToken;
    }

    return null;
}

/**
 * Extract refresh token from request (supports both body and cookies)
 */
export async function extractRefreshTokenFromRequest(
    request: Request,
    cookieToken?: string
): Promise<string | null> {
    // Priority 1: Request body (for mobile)
    try {
        const clonedRequest = request.clone();
        const body = await clonedRequest.json();
        if (body?.refreshToken && typeof body.refreshToken === 'string') {
            return body.refreshToken;
        }
    } catch {
        // Body is not JSON or doesn't have refreshToken
    }

    // Priority 2: Cookie (for web)
    if (cookieToken) {
        return cookieToken;
    }

    return null;
}

/**
 * Authenticate a request and return the user payload
 */
export async function authenticateRequest(
    request: Request,
    cookieToken?: string
): Promise<{ userId: string; email: string; role: string } | null> {
    const token = extractTokenFromRequest(request, cookieToken);

    if (!token) {
        return null;
    }

    const payload = await verifyJWT(token);

    if (!payload || !payload.userId) {
        return null;
    }

    return {
        userId: payload.userId as string,
        email: payload.email as string,
        role: payload.role as string,
    };
}
