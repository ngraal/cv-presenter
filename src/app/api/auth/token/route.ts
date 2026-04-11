import { NextRequest, NextResponse } from "next/server";
import { signToken } from "@/lib/jwt";
import type { Role, TokenFormat } from "@/lib/types";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, role, expiresIn, format } = body;

  const tokenFormat: TokenFormat =
    format === "compact" ? "compact" : format === "mini" ? "mini" : "jwt";

  const isMini = tokenFormat === "mini";

  if (!isMini && (!name || typeof name !== "string" || name.trim().length === 0)) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  const effectiveRole: Role = isMini ? "viewer" : (role as Role);
  if (effectiveRole !== "admin" && effectiveRole !== "viewer") {
    return NextResponse.json(
      { error: "Role must be 'admin' or 'viewer'" },
      { status: 400 }
    );
  }

  const expiry =
    typeof expiresIn === "string" && expiresIn.length > 0
      ? expiresIn
      : "12w";

  const token = await signToken(
    isMini ? "" : (name as string).trim(),
    effectiveRole,
    expiry,
    tokenFormat
  );

  return NextResponse.json({ token, format: tokenFormat });
}
