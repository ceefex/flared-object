import { generateToken } from "@/crypto";
import type {
  FlaredClientOptions,
  ParsedFlaredUrl,
  SignOptions,
  VerificationResult,
} from "@/types";

/**
 * Normalizes an object path to always have a leading slash and no redundant slashes.
 */
function normalizePath(path: string): string {
  const trimmed = path.trim();
  const withLeading = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeading.replace(/\/+/g, "/");
}

export class FlaredClient {
  readonly baseUrl: string;
  private readonly hmacSecret: string;
  private readonly defaultTtl: number;

  constructor(options: FlaredClientOptions) {
    if (!options.baseUrl) {
      throw new Error("FlaredClient: `baseUrl` is required.");
    }
    if (!options.hmacSecret) {
      throw new Error("FlaredClient: `hmacSecret` is required.");
    }

    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.hmacSecret = options.hmacSecret;
    this.defaultTtl = options.defaultTtlSeconds ?? 3600;
  }

  /**
   * Generates a signed URL for a single object path.
   *
   * @param path The path to the file in storage (e.g. "/covers/vol-1.jpg" or "avatar.png")
   * @param options Optional TTL, expiration timestamp, or custom query parameters.
   * @returns The complete signed URL string.
   */
  async signUrl(path: string, options?: SignOptions): Promise<string> {
    const canonicalPath = normalizePath(path);
    const ttl = options?.ttlSeconds ?? this.defaultTtl;
    const expires =
      options?.expiresAt ?? Math.floor(Date.now() / 1000) + ttl;

    const token = await generateToken(canonicalPath, expires, this.hmacSecret);

    const url = new URL(`${this.baseUrl}${canonicalPath}`);
    url.searchParams.set("token", token);
    url.searchParams.set("expires", expires.toString());

    if (options?.params) {
      for (const [key, value] of Object.entries(options.params)) {
        url.searchParams.set(key, String(value));
      }
    }

    return url.toString();
  }

  /**
   * Generates signed URLs for multiple object paths in parallel.
   * Ideal for comic chapter pages, photo galleries, or batch API responses.
   *
   * @param paths Array of object paths to sign.
   * @param options Optional TTL or options applied to all paths in the batch.
   * @returns Array of signed URL strings in the same order as the input paths.
   */
  async signBatch(paths: string[], options?: SignOptions): Promise<string[]> {
    const ttl = options?.ttlSeconds ?? this.defaultTtl;
    const expires =
      options?.expiresAt ?? Math.floor(Date.now() / 1000) + ttl;

    // Sharing the exact same `expires` across the batch improves edge cache predictability
    const signPromises = paths.map((p) =>
      this.signUrl(p, { ...options, expiresAt: expires }),
    );

    return Promise.all(signPromises);
  }

  /**
   * Parses the components and expiration status of a signed URL.
   *
   * @param url The full URL string or URL object.
   */
  parseUrl(url: string | URL): ParsedFlaredUrl {
    const parsed = typeof url === "string" ? new URL(url) : url;
    const token = parsed.searchParams.get("token");
    const expiresRaw = parsed.searchParams.get("expires");

    const expires = expiresRaw ? Number(expiresRaw) : null;
    const now = Math.floor(Date.now() / 1000);
    const isExpired = expires !== null && !Number.isNaN(expires) && now > expires;

    return {
      pathname: parsed.pathname,
      token,
      expires,
      isExpired,
    };
  }

  /**
   * Verifies whether a signed URL is valid, matching signature, and not expired.
   *
   * @param url The full URL string or URL object to verify.
   */
  async verifyUrl(url: string | URL): Promise<VerificationResult> {
    const parsed = typeof url === "string" ? new URL(url) : url;
    const token = parsed.searchParams.get("token");
    const expiresRaw = parsed.searchParams.get("expires");

    if (!token || !expiresRaw) {
      return { valid: false, error: "Missing token or expires parameter" };
    }

    const expires = Number(expiresRaw);
    if (Number.isNaN(expires)) {
      return { valid: false, error: "Invalid expires parameter" };
    }

    const now = Math.floor(Date.now() / 1000);
    if (now > expires) {
      return { valid: false, error: "Token has expired" };
    }

    const canonicalPath = parsed.pathname;
    const expectedToken = await generateToken(
      canonicalPath,
      expires,
      this.hmacSecret,
    );

    if (token !== expectedToken) {
      return { valid: false, error: "Invalid token" };
    }

    return { valid: true };
  }
}

/**
 * Creates a new instance of FlaredClient.
 */
export function createFlaredClient(options: FlaredClientOptions): FlaredClient {
  return new FlaredClient(options);
}
