import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

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
      { valid: false, error: "Invalid or expired token" },
      { status: 200 }
    );
  }

  return NextResponse.json({
    valid: true,
    payload: {
      name: payload.name,
      role: payload.role,
      jti: payload.jti,
      issuedAt: new Date(payload.iat * 1000).toISOString(),
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    },
  });
}
