import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const AUTH_COOKIE = "cv-presenter-token";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { token } = body;

  if (!token || typeof token !== "string") {
    return NextResponse.json(
      { error: "Token is required" },
      { status: 400 }
    );
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }

  console.log(
    `[AUTH] Token used: name="${payload.name}", role=${payload.role}, expires=${new Date(payload.exp * 1000).toISOString()}, at ${new Date().toISOString()}`
  );

  const response = NextResponse.json({
    success: true,
    role: payload.role,
    name: payload.name,
  });

  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}
