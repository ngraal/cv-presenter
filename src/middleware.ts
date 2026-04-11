import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { verifyCompactToken } from "@/lib/compact-token";
import { isMiniToken, verifyMiniToken } from "@/lib/mini-token";
import { checkRateLimit } from "@/lib/rate-limit";

const AUTH_COOKIE = "cv-presenter-token";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) return new Uint8Array();
  return new TextEncoder().encode(secret);
}

async function verifyTokenMiddleware(
  token: string
): Promise<{ name: string; role: string; exp?: number } | null> {
  // Mini tokens: exactly 8 chars from the mini alphabet
  if (isMiniToken(token)) {
    const payload = await verifyMiniToken(token);
    if (payload) return { name: payload.name, role: payload.role, exp: payload.exp };
    return null;
  }

  // Compact tokens don't contain dots, JWTs always do
  if (!token.includes(".")) {
    const payload = await verifyCompactToken(token);
    if (payload) return { name: payload.name, role: payload.role, exp: payload.exp };
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.name === "string" &&
      (payload.role === "admin" || payload.role === "viewer")
    ) {
      return { name: payload.name, role: payload.role as string, exp: payload.exp as number | undefined };
    }
    return null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Skip auth for static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/api/auth/verify"
  ) {
    return NextResponse.next();
  }

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    const { allowed, retryAfterMs } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
        }
      );
    }
  }

  // Check for token in query parameter
  const queryToken = searchParams.get("token");
  if (queryToken) {
    const payload = await verifyTokenMiddleware(queryToken);
    if (payload) {
      console.log(
        `[AUTH] Token used: name="${payload.name}", role=${payload.role}, expires=${payload.exp ? new Date(payload.exp * 1000).toISOString() : "unknown"}, at ${new Date().toISOString()}`
      );
      // Set cookie and redirect without token param
      const url = request.nextUrl.clone();
      url.searchParams.delete("token");
      const response = NextResponse.redirect(url);
      response.cookies.set(AUTH_COOKIE, queryToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });
      return response;
    }
    // Invalid token in query — strip it and continue to login
    const url = request.nextUrl.clone();
    url.searchParams.delete("token");
    return NextResponse.redirect(url);
  }

  // For API routes (except auth), check cookie
  if (pathname.startsWith("/api/")) {
    const token = request.cookies.get(AUTH_COOKIE)?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const payload = await verifyTokenMiddleware(token);
    if (!payload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    // Admin-only routes
    const adminPaths = ["/api/auth/token", "/api/cv", "/api/pdf/upload"];
    const isAdminRoute = adminPaths.some(
      (p) =>
        (pathname === p && request.method !== "GET") ||
        (pathname === "/api/auth/token")
    );
    if (isAdminRoute && payload.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    // Pass role info via headers
    const response = NextResponse.next();
    response.headers.set("x-user-role", payload.role);
    response.headers.set("x-user-name", payload.name);
    return response;
  }

  // For page routes — check if authenticated
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    // If trying to access any page without auth, the page itself will show login form
    // We only need to block /admin for non-authenticated users
    if (pathname.startsWith("/admin")) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const payload = await verifyTokenMiddleware(token);
  if (!payload) {
    // Expired/invalid cookie — clear it
    const response = NextResponse.next();
    response.cookies.delete(AUTH_COOKIE);
    return response;
  }

  // Block non-admin from /admin routes
  if (pathname.startsWith("/admin") && payload.role !== "admin") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // Pass user info to pages via headers
  const response = NextResponse.next();
  response.headers.set("x-user-role", payload.role);
  response.headers.set("x-user-name", payload.name);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
