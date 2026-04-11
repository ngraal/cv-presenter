import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";
import type { Role, TokenFormat } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, role, expiresIn, format } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  if (role !== "admin" && role !== "viewer") {
    return NextResponse.json(
      { error: "Role must be 'admin' or 'viewer'" },
      { status: 400 }
    );
  }

  const tokenFormat: TokenFormat =
    format === "compact" ? "compact" : "jwt";

  const expiry =
    typeof expiresIn === "string" && expiresIn.length > 0
      ? expiresIn
      : "12w";

  const token = await signToken(name.trim(), role as Role, expiry, tokenFormat);

  return NextResponse.json({ token, format: tokenFormat });
}
