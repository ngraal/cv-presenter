export function getSecretBytes(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "JWT_SECRET environment variable must be set and at least 32 characters long"
    );
  }
  return new TextEncoder().encode(secret);
}

export async function getHmacKey(): Promise<CryptoKey> {
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

export async function computeHmac(
  data: Uint8Array,
  truncateLength: number = 16
): Promise<Uint8Array> {
  const key = await getHmacKey();
  const buf = new ArrayBuffer(data.byteLength);
  new Uint8Array(buf).set(data);
  const sig = await crypto.subtle.sign("HMAC", key, buf);
  return new Uint8Array(sig).slice(0, truncateLength);
}

export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export function parseExpiresIn(expiresIn: string): number {
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
