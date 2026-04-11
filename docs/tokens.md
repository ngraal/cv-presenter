# Token Formats

CV Presenter supports three token formats for authentication. All formats are **stateless** — the server does not store tokens but verifies them cryptographically on each request.

## Overview

| Property          | JWT                        | Compact                      | Mini                       |
|-------------------|----------------------------|------------------------------|----------------------------|
| **Length**        | ~170 characters            | ~31+ characters              | **exactly 8 characters**   |
| **Roles**         | admin, viewer              | admin, viewer                | viewer only (implicit)     |
| **Name**          | yes                        | yes                          | no                         |
| **Expiry**        | second-precision           | second-precision             | day-precision (end of day UTC) |
| **Signature**     | HMAC-SHA256 (full)         | HMAC-SHA256 (16 bytes)       | HMAC-SHA256 (4 bytes)      |
| **Encoding**      | Base64url (standard JWT)   | Base64url (binary)           | Base64-Custom (64-char alphabet) |
| **URL-safe**      | yes                        | yes                          | yes                        |
| **Use case**      | Standard, API integration  | QR codes, short URLs         | Sharing by phone, paper, chat |

## Format Detection

Detection is automatic based on the token structure:

```
Token contains "."  →  JWT
Token is exactly 8 characters from the Mini alphabet  →  Mini
Everything else  →  Compact
```

Compact tokens are always ≥31 characters (Base64url), so there is no collision with 8-character Mini tokens.

---

## 1. JWT (JSON Web Token)

Standard JWT with HS256 signature via the [jose](https://github.com/panva/jose) library.

### Structure

```
header.payload.signature
```

Three Base64url-encoded parts separated by dots.

### Payload Fields

| Field  | Type   | Description                         |
|--------|--------|-------------------------------------|
| `name` | string | Name of the token holder            |
| `role` | string | `"admin"` or `"viewer"`             |
| `jti`  | string | Unique token ID (UUID v4)           |
| `iat`  | number | Issued-at timestamp (Unix seconds)  |
| `exp`  | number | Expiration timestamp (Unix seconds) |

### Example

```
eyJhbGciOiJIUzI1NiJ9.eyJuYW1lIjoiSm9obiBEb2UiLCJyb2xlIjoidmlld2VyIiwianRpIjoiYTFiMmMzZDQtZTVmNi03ODkwLWFiY2QtZWYxMjM0NTY3ODkwIiwiaWF0IjoxNzEyODAwMDAwLCJleHAiOjE3MjAwMDAwMDB9.HMAC_SIGNATURE
```

Decoded payload:
```json
{
  "name": "John Doe",
  "role": "viewer",
  "jti": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "iat": 1712800000,
  "exp": 1720000000
}
```

### Signature

```
HMAC-SHA256(base64url(header) + "." + base64url(payload), JWT_SECRET)
```

The full HMAC-SHA256 signature (32 bytes) is Base64url-encoded and appended.

---

## 2. Compact Token

Binary-encoded token with a fixed header and variable-length name. Significantly shorter than JWT, ideal for QR codes.

### Binary Structure

```
[VERSION 1B] [ROLE 1B] [EXP 4B] [NAME variable] [HMAC 16B]
```

| Field     | Offset  | Size      | Description                          |
|-----------|---------|-----------|--------------------------------------|
| Version   | 0       | 1 byte    | Always `0x01`                        |
| Role      | 1       | 1 byte    | `0x01` = viewer, `0x02` = admin      |
| Exp       | 2–5     | 4 bytes   | Expiration as uint32 big-endian (Unix seconds) |
| Name      | 6–N     | variable  | UTF-8 encoded name                   |
| HMAC      | N–(N+16)| 16 bytes  | Truncated HMAC-SHA256 signature      |

### Signature Method

```
payload = [version, role, exp_bytes..., name_bytes...]
hmac    = HMAC-SHA256(payload, JWT_SECRET)[0:16]
token   = base64url(payload + hmac)
```

The signature is computed over the entire payload (excluding HMAC) and truncated to 16 bytes (128 bits).

### Example

For `name="Firma XYZ"`, `role=viewer`, `exp=2026-07-10T00:00:00Z`:

```
Binary (Hex):
01 01 6B 2C 5C 00 46 69 72 6D 61 20 58 59 5A [16 bytes HMAC]
│  │  └──────────┘ └──────────────────────┘ └──────────────┘
│  │   Exp uint32        "Firma XYZ"          HMAC-SHA256
│  └ Role (viewer)                            (first 16 bytes)
└ Version 1

Base64url-encoded: AQFrLFwARmlybWEgWFla... (~31 characters)
```

### Verification

1. Base64url decode
2. Split off the last 16 bytes as the received HMAC
3. Recompute HMAC over the remaining payload bytes
4. Constant-time comparison of both HMACs
5. Check expiration (exp ≥ current time)

### Brute-Force Effort

The HMAC signature is 16 bytes (128 bits) long. An attacker who does not know the secret must guess the HMAC for a chosen payload:

- **Search space**: 2¹²⁸ ≈ 3.4 × 10³⁸ possible HMAC values
- **Expected attempts**: 2¹²⁷ ≈ 1.7 × 10³⁸

| Attack speed | Duration | Context |
|-------------|----------|---------|
| 10⁹ attempts/s (fast GPU) | ~5.4 × 10²¹ years | 390 billion × age of the universe |
| 10¹² attempts/s (supercomputer) | ~5.4 × 10¹⁸ years | 390 million × age of the universe |
| 10¹⁵ attempts/s (theoretical) | ~5.4 × 10¹⁵ years | 390,000 × age of the universe |

For reference: the age of the universe is ~1.38 × 10¹⁰ years. A brute-force attack on a Compact token is **practically impossible**.

---

## 3. Mini Token

Ultra-short 8-character token for the simplest use case: time-limited viewer access. Can easily be dictated over the phone or written on a piece of paper.

### Design Principles

- **Exactly 8 characters** — easy to remember and type
- **Viewer role only** — no admin access possible
- **No name** — anonymous access
- **Day precision** — expires at end of the encoded day (23:59:59 UTC)
- **URL-safe** — all characters can be used directly in URLs
- **Unambiguous** — visually similar characters (`0`/`O`, `1`/`l`/`I`) removed

### Alphabet (64 Characters)

```
abcdefghijkmnopqrstuvwxyz    (25 lowercase, without l)
ABCDEFGHJKLMNPQRSTUVWXYZ     (24 uppercase, without I and O)
23456789                      (8 digits, without 0 and 1)
-_!$*@~                       (7 special characters, all URL-safe)
                              ─────────────────────────────────
                              = 64 characters
```

64 characters = 6 bits per character. With 8 characters: 64⁸ = 2⁴⁸ — this corresponds to **exactly 6 bytes** with zero waste.

### Binary Structure (6 Bytes)

```
[DATE 2B] [HMAC 4B]
```

| Field | Offset | Size     | Description                                   |
|-------|--------|----------|-----------------------------------------------|
| Date  | 0–1    | 2 bytes  | Expiry day as uint16 big-endian (days since Unix epoch) |
| HMAC  | 2–5    | 4 bytes  | Truncated HMAC-SHA256 signature               |

- **Date**: Days since 1970-01-01. uint16 covers up to day 65,535 = **approx. 2149**.
- **HMAC**: The first 4 bytes of HMAC-SHA256 over the 2 date bytes.

### Signature Method

```
days       = ceil(expiration_timestamp / 86400)
date_bytes = uint16_big_endian(days)
hmac       = HMAC-SHA256(date_bytes, JWT_SECRET)[0:4]
raw        = date_bytes + hmac                          (6 bytes)
token      = base64_custom_encode(raw)                  (8 characters)
```

### Encoding Method (Base64-Custom)

The 6 bytes are interpreted as a large number (big integer) and converted to base 64:

```
Example: Expiry day 20,548 (= 2026-04-18)

1. Date bytes:     0x50 0x44  (20,548 as uint16 big-endian)
2. HMAC(0x5044):   e.g. 0xA3 0x7F 0x12 0xBE  (first 4 bytes)
3. 6 bytes:        [0x50, 0x44, 0xA3, 0x7F, 0x12, 0xBE]
4. As BigInt:      88,182,834,528,958
5. Base-64 encoding (right to left):
   88182834528958 % 64 = 30  →  MINI_ALPHABET[30] = 'F'
   88182834528958 / 64 = 1378169289514
   1378169289514 % 64  = 42  →  MINI_ALPHABET[42] = 'R'
   ... (6 more divisions)
6. Result:         e.g. "k4Rf$xFR"
```

### Verification

1. Check: Token is exactly 8 characters, all from the Mini alphabet
2. Base64-Custom decode → 6 bytes
3. Split bytes 0–1 as date, bytes 2–5 as received HMAC
4. Recompute HMAC over date bytes (first 4 bytes)
5. Constant-time comparison of both HMACs
6. Check expiry: `days * 86400 + 86399 ≥ current Unix time`
7. On success: role = viewer, name = empty

### Security Considerations

- **4 bytes HMAC = 2³² ≈ 4.3 billion possible values** per expiry day
- A brute-force attack on a specific expiry date requires on average ~2.15 billion attempts
- Sufficient for viewer-only access with server-side rate limiting
- No admin access possible — even a forged Mini token only grants read permissions

### Brute-Force Effort

The HMAC signature is 4 bytes (32 bits) long — deliberately compact for maximum brevity at acceptable risk.

**Scenario 1: Attacker knows the expiry date** (e.g. knows the token is valid for 12 weeks)

The attacker must guess the 4-byte HMAC for a specific date:

- **Search space**: 2³² ≈ 4.3 billion possible HMAC values
- **Expected attempts**: 2³¹ ≈ 2.15 billion

| Attack speed | Duration | Scenario |
|-------------|----------|----------|
| 100 req/s (strict rate limiting) | **~249 days** | Realistic with server protection |
| 1,000 req/s (moderate rate limiting) | **~24.9 days** | Well-protected server |
| 10,000 req/s (no rate limiting) | **~2.5 days** | Unprotected server |
| 100,000 req/s (unrestricted) | **~6 hours** | Worst case |

**Scenario 2: Attacker does not know the expiry date** (any valid token will do)

The attacker tries random 8-character strings from the Mini alphabet:

- **Total token space**: 64⁸ = 2⁴⁸ ≈ 2.81 × 10¹⁴
- **Valid tokens**: 1 per future day (e.g. ~36,500 for the next 100 years)
- **Expected attempts**: 2⁴⁸ / 36,500 / 2 ≈ **3.85 billion** — same order of magnitude as Scenario 1

**Conclusion**: Rate limiting on the verify endpoint (e.g. 100 req/s per IP) makes brute-force attacks on Mini tokens impractical. Even in case of success, the attacker only gains viewer read-only access.

---

## Shared Infrastructure

### Secret

All three formats use the same `JWT_SECRET` (environment variable, at least 32 characters). The secret is used as the key for HMAC-SHA256 computation.

### Cookie

After successful verification, the token is set as an httpOnly cookie (`cv-presenter-token`):

```
httpOnly: true       (no JavaScript access → XSS protection)
secure: true         (HTTPS only, in production)
sameSite: "lax"      (CSRF protection)
path: "/"            (for all routes)
```

### Token Creation (API)

```http
POST /api/auth/token
Content-Type: application/json

{
  "name": "John Doe",      // required for jwt/compact, ignored for mini
  "role": "viewer",         // "admin" or "viewer", always "viewer" for mini
  "expiresIn": "12w",       // optional, format: "1h", "7d", "4w", "12w", "52w"
  "format": "mini"          // "jwt", "compact", or "mini"
}
```

Response:
```json
{
  "token": "k4Rf$xFR",
  "format": "mini"
}
```

### Expiry Duration Formats

| Value  | Meaning    |
|--------|------------|
| `1h`   | 1 hour     |
| `24h`  | 24 hours   |
| `7d`   | 1 week     |
| `4w`   | 4 weeks    |
| `12w`  | 12 weeks (default) |
| `26w`  | 26 weeks   |
| `52w`  | 1 year     |
