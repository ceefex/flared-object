import type { SecurityConfig } from "../types/index.js";
import { validateReferer } from "./referer-guard.js";
import { validateSignedUrl } from "./signed-url.js";
import { isPathExcluded } from "./path-matcher.js";

export { validateReferer } from "./referer-guard.js";
export { validateSignedUrl, generateSignedUrl } from "./signed-url.js";
export { isPathExcluded } from "./path-matcher.js";

export async function validateRequest(
  request: Request,
  config: SecurityConfig,
): Promise<{ allowed: boolean; error?: string }> {
  if (config.mode === "none") {
    return { allowed: true };
  }

  const url = new URL(request.url);

  // Bypass security validation if request matches any excluded pattern
  if (config.excludePaths && config.excludePaths.length > 0) {
    if (isPathExcluded(url.pathname, config.excludePaths)) {
      return { allowed: true };
    }
  }

  if (config.mode === "signed-url" || config.mode === "signed-url+referer") {
    if (!config.hmacSecret) {
      console.error("Security misconfiguration: signed-url mode requires HMAC_SECRET");
      return { allowed: false, error: "Server misconfiguration" };
    }
    const signedResult = await validateSignedUrl(url, config.hmacSecret);
    if (!signedResult.valid) {
      return { allowed: false, error: signedResult.error };
    }
  }

  if (config.mode === "referer" || config.mode === "signed-url+referer") {
    const refererResult = validateReferer(request, config.allowedReferers ?? []);
    if (!refererResult.valid) {
      return { allowed: false, error: refererResult.error };
    }
  }

  return { allowed: true };
}
