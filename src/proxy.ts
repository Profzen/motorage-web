import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

// Paths that don't require authentication
const publicPaths = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api-docs",
  "/api/swagger",
];

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://projet-motorage-web.vercel.app",
];

export async function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");
  const { pathname } = request.nextUrl;

  // Handle preflight requests (CORS)
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, PATCH, DELETE, OPTIONS"
      );
      response.headers.set("Access-Control-Allow-Credentials", "true");
      response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, X-Requested-With"
      );
    }
    return response;
  }

  // Auth checking logic
  const requestHeaders = new Headers(request.headers);

  if (
    pathname.startsWith("/api") &&
    !publicPaths.some((path) => pathname.startsWith(path))
  ) {
    let token = request.cookies.get("token")?.value;
    const authHeader = request.headers.get("Authorization");

    if (!token && authHeader?.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    requestHeaders.set("x-user-id", payload.userId as string);
    requestHeaders.set("x-user-role", payload.role as string);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Add CORS headers to the response
  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
  }

  return response;
}

export const middleware = proxy;

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/:path*",
};
