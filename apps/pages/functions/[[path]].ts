import { handleRequest, R2BindingDriver } from "@ceefex/flared-object-core";
import type { SecurityConfig, SecurityMode } from "@ceefex/flared-object-core";

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
  return {
    mode,
    hmacSecret: env.HMAC_SECRET,
    allowedReferers,
  };
}

export const onRequest: PagesFunction<Env> = ({ request, env }) => {
  const driver = new R2BindingDriver(env.MEDIA_BUCKET);
  const securityConfig = parseSecurityConfig(env);
  return handleRequest(request, driver, securityConfig);
};
