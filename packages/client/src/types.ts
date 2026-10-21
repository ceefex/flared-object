export interface FlaredClientOptions {
  /**
   * The base URL where flared-object gateway is hosted.
   * Example: "https://media.komikhq.com" or "http://localhost:8787"
   */
  baseUrl: string;

  /**
   * The HMAC secret key used to sign and verify URLs.
   * Must match HMAC_SECRET configured on the flared-object gateway.
   */
  hmacSecret: string;

  /**
   * Default time-to-live in seconds for signed URLs.
   * Default: 3600 (1 hour).
   */
  defaultTtlSeconds?: number;
}

export interface SignOptions {
  /**
   * Time-to-live in seconds from the current time.
   * Overrides `defaultTtlSeconds` if specified.
   */
  ttlSeconds?: number;

  /**
   * Explicit expiration timestamp in seconds (Unix epoch).
   * If provided, overrides `ttlSeconds`.
   */
  expiresAt?: number;

  /**
   * Optional additional search parameters to include in the signed URL.
   */
  params?: Record<string, string | number | boolean>;
}

export interface ParsedFlaredUrl {
  /**
   * The canonical pathname of the resource (e.g. "/chapters/101/01.webp").
   */
  pathname: string;

  /**
   * The HMAC signature token.
   */
  token: string | null;

  /**
   * Expiration Unix timestamp in seconds.
   */
  expires: number | null;

  /**
   * Whether the URL has already expired based on current local clock.
   */
  isExpired: boolean;
}

export interface VerificationResult {
  /**
   * Whether the URL signature is valid and has not expired.
   */
  valid: boolean;

  /**
   * Reason for failure if `valid` is false.
   */
  error?: string;
}
