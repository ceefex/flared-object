export function validateReferer(
  request: Request,
  allowedReferers: string[],
): { valid: boolean; error?: string } {
  if (allowedReferers.length === 0) {
    return { valid: true };
  }

  const referer = request.headers.get("Referer");
  const origin = request.headers.get("Origin");

  const source = referer || origin;

  if (!source) {
    return { valid: false, error: "Missing Referer or Origin header" };
  }

  let sourceHostname: string;
  try {
    sourceHostname = new URL(source).hostname;
  } catch {
    return { valid: false, error: "Invalid Referer or Origin header" };
  }

  const isAllowed = allowedReferers.some((allowed) => {
    if (allowed.startsWith("*.")) {
      const domain = allowed.slice(2);
      return sourceHostname === domain || sourceHostname.endsWith(`.${domain}`);
    }
    return sourceHostname === allowed;
  });

  if (!isAllowed) {
    return { valid: false, error: "Referer not allowed" };
  }

  return { valid: true };
}
