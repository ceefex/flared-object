import { handleRequest, R2BindingDriver } from "@ceefex/flared-object-core";
import type { SecurityConfig, SecurityMode } from "@ceefex/flared-object-core";

declare global {
  interface Env {
    HMAC_SECRET?: string;
    EXCLUDE_PATHS?: string;
  }
}

function parseSecurityConfig(env: Env): SecurityConfig {
  const mode = (env.SECURITY_MODE ?? "none") as SecurityMode;
  let allowedReferers: string[] = [];
  try {
    if (env.ALLOWED_REFERERS) {
      allowedReferers = JSON.parse(env.ALLOWED_REFERERS);
    }
  } catch {
    console.error("Invalid ALLOWED_REFERERS JSON");
  }

  let excludePaths: string[] = [];
  try {
    if (env.EXCLUDE_PATHS) {
      excludePaths = JSON.parse(env.EXCLUDE_PATHS);
    }
  } catch {
    console.error("Invalid EXCLUDE_PATHS JSON");
  }

  return {
    mode,
    hmacSecret: env.HMAC_SECRET,
    allowedReferers,
    excludePaths,
  };
}

export default {
  async fetch(request, env) {
    const driver = new R2BindingDriver(env.MEDIA_BUCKET);
    const securityConfig = parseSecurityConfig(env);
    return handleRequest(request, driver, securityConfig);
  },
} satisfies ExportedHandler<Env>;
