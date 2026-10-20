export async function validateSignedUrl(
  url: URL,
  secret: string,
): Promise<{ valid: boolean; error?: string }> {
  const token = url.searchParams.get("token");
  const expires = url.searchParams.get("expires");

  if (!token || !expires) {
    return { valid: false, error: "Missing token or expires parameter" };
  }

  const expiresTimestamp = Number(expires);
  if (Number.isNaN(expiresTimestamp)) {
    return { valid: false, error: "Invalid expires parameter" };
  }

  if (Date.now() > expiresTimestamp * 1000) {
    return { valid: false, error: "Token has expired" };
  }

  const path = url.pathname;
  const message = `${path}:${expires}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const expectedToken = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  if (token !== expectedToken) {
    return { valid: false, error: "Invalid token" };
  }

  return { valid: true };
}

export async function generateSignedUrl(
  baseUrl: string,
  path: string,
  secret: string,
  ttlSeconds: number,
): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const message = `${path}:${expires}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  const token = btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  return `${baseUrl}${path}?token=${token}&expires=${expires}`;
}
