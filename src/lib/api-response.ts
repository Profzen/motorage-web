import { NextResponse } from 'next/server';

/**
 * Standardized API Response Types
 */
export interface ApiResponse<T = unknown> {
    success: boolean;
    data: T | null;
    error: ApiError | null;
    meta?: PaginationMeta;
}

export interface ApiError {
    code: string;
    message: string;
    field?: string;
    details?: unknown;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginationParams {
    page: number;
    limit: number;
}

/**
 * Parse pagination params from URL search params
 */
export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    return { page, limit };
}

/**
 * Calculate pagination meta
 */
export function calculatePaginationMeta(
    page: number,
    limit: number,
    total: number
): PaginationMeta {
    const totalPages = Math.ceil(total / limit);
    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
    };
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, meta?: PaginationMeta, status = 200) {
    const response: ApiResponse<T> = {
        success: true,
        data,
        error: null,
    };

    if (meta) {
        response.meta = meta;
    }

    return NextResponse.json(response, { status });
}

/**
 * Paginated success response helper
 */
export function paginatedResponse<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
) {
    const meta = calculatePaginationMeta(page, limit, total);
    return successResponse(data, meta);
}

/**
 * Error response helper
 */
export function errorResponse(
    code: string,
    message: string,
    status = 400,
    options?: { field?: string; details?: unknown }
) {
    const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: {
            code,
            message,
            ...options,
        },
    };

    return NextResponse.json(response, { status });
}

/**
 * Common error responses
 */
export const ApiErrors = {
    badRequest: (message = 'Requête invalide') => errorResponse('BAD_REQUEST', message, 400),
    unauthorized: (message = 'Non autorisé') => errorResponse('UNAUTHORIZED', message, 401),
    forbidden: () => errorResponse('FORBIDDEN', 'Accès refusé', 403),
    notFound: (resource = 'Ressource') => errorResponse('NOT_FOUND', `${resource} non trouvé(e)`, 404),
    validationError: (message: string, field?: string, details?: unknown) =>
        errorResponse('VALIDATION_ERROR', message, 400, { field, details }),
    serverError: (message = 'Erreur serveur interne') =>
        errorResponse('SERVER_ERROR', message, 500),
    invalidCredentials: (field: string, message: string) =>
        errorResponse('INVALID_CREDENTIALS', message, 401, { field }),
    tokenExpired: () => errorResponse('TOKEN_EXPIRED', 'Token expiré', 401),
    tokenInvalid: () => errorResponse('TOKEN_INVALID', 'Token invalide', 401),
};
