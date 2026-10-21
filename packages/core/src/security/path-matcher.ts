/**
 * Convert a wildcard pattern (e.g. "* /cover-*", "covers/*", "*.jpg") into a RegExp.
 */
function patternToRegExp(pattern: string): RegExp {
  const trimmed = pattern.trim();
  // Escape regex special characters except '*'
  const escaped = trimmed.replace(/[.+?^${}()|[\]\\]/g, "\\$&");
  // Replace '*' with '.*' to match any character sequence
  const wildcardRegex = escaped.replace(/\*/g, ".*");

  // If pattern starts with '/', match strictly from path root.
  // Otherwise allow matching anywhere or relative path.
  const prefix = trimmed.startsWith("/") ? "^" : "^(?:/|.*/)?";
  return new RegExp(`${prefix}${wildcardRegex}$`, "i");
}

/**
 * Check if a URL pathname matches any of the configured exclusion patterns.
 * When matched, security validation (e.g. HMAC signed-url) is bypassed.
 */
export function isPathExcluded(pathname: string, patterns?: string[]): boolean {
  if (!patterns || patterns.length === 0) {
    return false;
  }

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

  for (const pattern of patterns) {
    if (!pattern || typeof pattern !== "string") continue;
    try {
      const regex = patternToRegExp(pattern);
      if (regex.test(normalizedPath)) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}
