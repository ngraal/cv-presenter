import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const AUTH_COOKIE = "cv-presenter-token";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false });
  }
  const payload = await verifyToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false });
  }
  return NextResponse.json({
    authenticated: true,
    name: payload.name,
    role: payload.role,
  });
}
