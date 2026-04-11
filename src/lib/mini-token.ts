import type { TokenPayload } from "./types";
import { computeHmac, constantTimeEqual, parseExpiresIn } from "./crypto-utils";

// URL-safe, human-readable alphabet (no confusable chars: 0, 1, l, I, O)
const MINI_ALPHABET =
  "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789-_!$*@~";
const BASE = BigInt(MINI_ALPHABET.length); // 64
const TOKEN_LENGTH = 8;
const MINI_HMAC_LENGTH = 4;

const CHAR_TO_INDEX = new Map<string, number>();
for (let i = 0; i < MINI_ALPHABET.length; i++) {
  CHAR_TO_INDEX.set(MINI_ALPHABET[i], i);
}

function bytesToBigInt(bytes: Uint8Array): bigint {
  let result = BigInt(0);
  for (const byte of bytes) {
    result = (result << BigInt(8)) | BigInt(byte);
  }
  return result;
}

function bigIntToBytes(value: bigint, length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  for (let i = length - 1; i >= 0; i--) {
    bytes[i] = Number(value & BigInt(0xff));
    value >>= BigInt(8);
  }
  return bytes;
}

function base64CustomEncode(bytes: Uint8Array): string {
  let value = bytesToBigInt(bytes);
  const chars: string[] = new Array(TOKEN_LENGTH);
  for (let i = TOKEN_LENGTH - 1; i >= 0; i--) {
    chars[i] = MINI_ALPHABET[Number(value % BASE)];
    value /= BASE;
  }
  return chars.join("");
}

function base64CustomDecode(str: string): Uint8Array | null {
  if (str.length !== TOKEN_LENGTH) return null;
  let value = BigInt(0);
  for (const char of str) {
    const idx = CHAR_TO_INDEX.get(char);
    if (idx === undefined) return null;
    value = value * BASE + BigInt(idx);
  }
  return bigIntToBytes(value, 6);
}

function expiresInToDays(expiresIn: string): number {
  const expTimestamp = parseExpiresIn(expiresIn);
  return Math.ceil(expTimestamp / 86400);
}

export function isMiniToken(token: string): boolean {
  if (token.length !== TOKEN_LENGTH) return false;
  for (const char of token) {
    if (!CHAR_TO_INDEX.has(char)) return false;
  }
  return true;
}

export async function signMiniToken(
  expiresIn: string = "12w"
): Promise<string> {
  const days = expiresInToDays(expiresIn);
  const dateBytes = new Uint8Array(2);
  const view = new DataView(dateBytes.buffer);
  view.setUint16(0, days, false);

  const hmac = await computeHmac(dateBytes, MINI_HMAC_LENGTH);

  const full = new Uint8Array(6);
  full.set(dateBytes);
  full.set(hmac, 2);

  return base64CustomEncode(full);
}

export async function verifyMiniToken(
  token: string
): Promise<TokenPayload | null> {
  try {
    const bytes = base64CustomDecode(token);
    if (!bytes) return null;

    const dateBytes = bytes.slice(0, 2);
    const receivedHmac = bytes.slice(2, 6);

    const expectedHmac = await computeHmac(dateBytes, MINI_HMAC_LENGTH);
    if (!constantTimeEqual(expectedHmac, receivedHmac)) return null;

    const view = new DataView(
      dateBytes.buffer,
      dateBytes.byteOffset,
      dateBytes.byteLength
    );
    const days = view.getUint16(0, false);

    // Token expires at end of the day (UTC)
    const expTimestamp = days * 86400 + 86399;
    if (expTimestamp < Math.floor(Date.now() / 1000)) return null;

    return { name: "", role: "viewer", jti: "", iat: 0, exp: expTimestamp };
  } catch {
    return null;
  }
}
