import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "cv-presenter-token";

export async function POST(_request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
