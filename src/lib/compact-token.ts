import type { Role, TokenPayload } from "./types";
import { computeHmac, constantTimeEqual, parseExpiresIn } from "./crypto-utils";

const VERSION = 0x01;
const HMAC_LENGTH = 16;
const ROLE_TO_BYTE: Record<Role, number> = { viewer: 0x01, admin: 0x02 };
const BYTE_TO_ROLE: Record<number, Role> = { 0x01: "viewer", 0x02: "admin" };

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

  const hmac = await computeHmac(payload, HMAC_LENGTH);
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

    const expectedHmac = await computeHmac(payload, HMAC_LENGTH);

    if (!constantTimeEqual(expectedHmac, receivedHmac)) return null;

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
