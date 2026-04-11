import type { Role, TokenPayload } from "./types";

const VERSION = 0x01;
const HMAC_LENGTH = 16;
const ROLE_TO_BYTE: Record<Role, number> = { viewer: 0x01, admin: 0x02 };
const BYTE_TO_ROLE: Record<number, Role> = { 0x01: "viewer", 0x02: "admin" };

function getSecretBytes(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET environment variable must be set and at least 32 characters long"
    );
  }
  return new TextEncoder().encode(secret);
}

async function getHmacKey(): Promise<CryptoKey> {
  const secret = getSecretBytes();
  const keyData = new ArrayBuffer(secret.byteLength);
  new Uint8Array(keyData).set(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
}

async function computeHmac(data: Uint8Array): Promise<Uint8Array> {
  const key = await getHmacKey();
  const buf = new ArrayBuffer(data.byteLength);
  new Uint8Array(buf).set(data);
  const sig = await crypto.subtle.sign("HMAC", key, buf);
  return new Uint8Array(sig).slice(0, HMAC_LENGTH);
}

function base64urlEncode(data: Uint8Array): string {
  let binary = "";
  for (const byte of data) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function parseExpiresIn(expiresIn: string): number {
  const now = Math.floor(Date.now() / 1000);
  const match = expiresIn.match(/^(\d+)(h|d|w)$/);
  if (!match) throw new Error(`Invalid expiresIn format: ${expiresIn}`);
  const value = parseInt(match[1]);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    h: 3600,
    d: 86400,
    w: 604800,
  };
  return now + value * multipliers[unit];
}

export async function signCompactToken(
  name: string,
  role: Role,
  expiresIn: string = "12w"
): Promise<string> {
  const exp = parseExpiresIn(expiresIn);
  const nameBytes = new TextEncoder().encode(name);
  const payloadLen = 6 + nameBytes.length;
  const payload = new Uint8Array(payloadLen);
  const view = new DataView(payload.buffer);

  payload[0] = VERSION;
  payload[1] = ROLE_TO_BYTE[role];
  view.setUint32(2, exp, false);
  payload.set(nameBytes, 6);

  const hmac = await computeHmac(payload);
  const full = new Uint8Array(payloadLen + HMAC_LENGTH);
  full.set(payload);
  full.set(hmac, payloadLen);

  return base64urlEncode(full);
}

export async function verifyCompactToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const data = base64urlDecode(token);
    // Minimum: version(1) + role(1) + exp(4) + hmac(16) + name(1) = 23
    if (data.length < 6 + HMAC_LENGTH + 1) return null;

    if (data[0] !== VERSION) return null;

    const role = BYTE_TO_ROLE[data[1]];
    if (!role) return null;

    const payloadLen = data.length - HMAC_LENGTH;
    const payload = data.slice(0, payloadLen);
    const receivedHmac = data.slice(payloadLen);

    const expectedHmac = await computeHmac(payload);

    // Constant-time comparison
    if (expectedHmac.length !== receivedHmac.length) return null;
    let diff = 0;
    for (let i = 0; i < expectedHmac.length; i++) {
      diff |= expectedHmac[i] ^ receivedHmac[i];
    }
    if (diff !== 0) return null;

    const view = new DataView(
      payload.buffer,
      payload.byteOffset,
      payload.byteLength
    );
    const exp = view.getUint32(2, false);

    if (exp < Math.floor(Date.now() / 1000)) return null;

    const name = new TextDecoder().decode(payload.slice(6));
    if (!name) return null;

    return { name, role, jti: "", iat: 0, exp };
  } catch {
    return null;
  }
}
