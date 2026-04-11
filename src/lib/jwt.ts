import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { v4 as uuidv4 } from "uuid";
import { signCompactToken, verifyCompactToken } from "./compact-token";
import { isMiniToken, signMiniToken, verifyMiniToken } from "./mini-token";
import type { Role, TokenFormat, TokenPayload } from "./types";

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET environment variable must be set and at least 32 characters long"
    );
  }
  return new TextEncoder().encode(secret);
}

/** Detect token format: JWTs contain dots, mini tokens are 8 chars, rest is compact */
export function detectTokenFormat(token: string): TokenFormat {
  if (token.includes(".")) return "jwt";
  if (isMiniToken(token)) return "mini";
  return "compact";
}

async function signJWT(
  name: string,
  role: Role,
  expiresIn: string
): Promise<string> {
  const secret = getSecret();
  return new SignJWT({ name, role })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(uuidv4())
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}

async function verifyJWT(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getSecret();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (
      typeof payload.name !== "string" ||
      (payload.role !== "admin" && payload.role !== "viewer")
    ) {
      return null;
    }
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

export async function signToken(
  name: string,
  role: Role,
  expiresIn: string = "12w",
  format: TokenFormat = "jwt"
): Promise<string> {
  if (format === "mini") {
    return signMiniToken(expiresIn);
  }
  if (format === "compact") {
    return signCompactToken(name, role, expiresIn);
  }
  return signJWT(name, role, expiresIn);
}

export async function verifyToken(
  token: string
): Promise<TokenPayload | null> {
  const format = detectTokenFormat(token);
  if (format === "mini") {
    return verifyMiniToken(token);
  }
  if (format === "compact") {
    return verifyCompactToken(token);
  }
  return verifyJWT(token);
}
