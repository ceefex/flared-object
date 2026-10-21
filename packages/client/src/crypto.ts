const subtle = globalThis.crypto?.subtle;

/**
 * Cache CryptoKey in memory to avoid repeated importKey calls on high-volume signing
 */
let cachedSecret: string | null = null;
let cachedKey: CryptoKey | null = null;

async function getHmacKey(secret: string): Promise<CryptoKey> {
  if (cachedKey && cachedSecret === secret) {
    return cachedKey;
  }

  if (!subtle) {
    throw new Error(
      "Web Crypto API is not available in the current environment. Ensure globalThis.crypto.subtle is present.",
    );
  }

  const encoder = new TextEncoder();
  const key = await subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );

  cachedSecret = secret;
  cachedKey = key;
  return key;
}

/**
 * Encodes Uint8Array to base64url format (URL-safe, no padding)
 */
export function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Generates an HMAC-SHA256 token for a given path and expiration timestamp.
 * Matches the validation algorithm of flared-object gateway:
 * message = `${pathname}:${expires}`
 */
export async function generateToken(
  pathname: string,
  expires: number,
  secret: string,
): Promise<string> {
  const key = await getHmacKey(secret);
  const encoder = new TextEncoder();
  const message = `${pathname}:${expires}`;
  const signature = await subtle.sign("HMAC", key, encoder.encode(message));
  return toBase64Url(new Uint8Array(signature));
}
