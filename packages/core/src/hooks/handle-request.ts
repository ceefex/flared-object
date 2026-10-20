import { errorResponseForRequest, responseForObject } from "../lib/response-builder.js";
import { objectKeyFromPath } from "../lib/object-key.js";
import { validateRequest } from "../security/index.js";
import type { SecurityConfig, StorageDriver } from "../types/index.js";

export async function handleRequest(
  request: Request,
  driver: StorageDriver,
  securityConfig: SecurityConfig,
): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return errorResponseForRequest(request, 405, { Allow: "GET, HEAD" });
  }

  // Security validation
  const securityResult = await validateRequest(request, securityConfig);
  if (!securityResult.allowed) {
    return errorResponseForRequest(request, 403);
  }

  const url = new URL(request.url);
  const key = objectKeyFromPath(url.pathname);
  if (key === null) {
    return errorResponseForRequest(request, 400);
  }

  try {
    const object =
      request.method === "HEAD"
        ? await driver.head(key)
        : await driver.get(key);

    if (object === null) {
      return errorResponseForRequest(request, 404);
    }

    if (request.method === "HEAD") {
      return responseForObject(object, null);
    }

    if (object.body === undefined) {
      throw new Error(`Storage returned no body for GET key "${key}"`);
    }

    return responseForObject(object, object.body);
  } catch (error) {
    const requestId = request.headers.get("cf-ray") ?? request.headers.get("x-request-id");
    console.error("Media delivery failed", { requestId, error });
    return errorResponseForRequest(request, 500);
  }
}
