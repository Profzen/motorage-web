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
