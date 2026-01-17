import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJWT } from "@/lib/auth";

// Add paths that don't require authentication
const publicPaths = [
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/refresh",
  "/api-docs",
  "/api/swagger", // The JSON definition route
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is an API route and not public
  if (
    pathname.startsWith("/api") &&
    !publicPaths.some((path) => pathname.startsWith(path))
  ) {
    let token = request.cookies.get("token")?.value;

    // Fallback to Authorization header
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

    // Add user info to headers for downstream routes if needed
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId as string);
    requestHeaders.set("x-user-role", payload.role as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: "/api/:path*",
};
