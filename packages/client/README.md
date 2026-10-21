# @ceefex/flared-object-client

Universal, zero-dependency client SDK for the [flared-object](https://github.com/ceefex/flared-object) edge storage & security gateway.

[![npm version](https://img.shields.io/npm/v/@ceefex/flared-object-client.svg?style=flat-square)](https://www.npmjs.com/package/@ceefex/flared-object-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

## Features

- **Zero Dependencies** — Pure Web Crypto API (`crypto.subtle`). Tiny footprint (~5 KB).
- **Universal Runtime** — Runs identically in Node.js (>=18), Cloudflare Workers, Bun, Deno, and Edge environments.
- **HMAC-SHA256 Signed URLs** — Securely protects private R2/S3 storage while keeping Cloudflare CDN Edge Caching active.
- **High-Throughput Batch Signing** — Sign hundreds of paths (e.g. comic panels, photo galleries) in parallel with shared expiry.
- **Dual Module Output** — Full native support for ESM (`import`) and CommonJS (`require`) with TypeScript type definitions.

---

## Installation

```bash
# pnpm
pnpm add @ceefex/flared-object-client

# npm
npm install @ceefex/flared-object-client

# bun
bun add @ceefex/flared-object-client
```

---

## Quick Start

```typescript
import { createFlaredClient } from "@ceefex/flared-object-client";

// Initialize client once on your backend
const flared = createFlaredClient({
  baseUrl: "https://media.yourdomain.com",
  hmacSecret: process.env.FLARED_HMAC_SECRET!,
  defaultTtlSeconds: 3600, // 1 hour (default)
});

// 1. Sign a single URL
const avatarUrl = await flared.signUrl("/avatars/user-101.webp");
console.log(avatarUrl);
// Output: https://media.yourdomain.com/avatars/user-101.webp?token=a8f...&expires=1730003600

// 2. Batch sign multiple URLs (e.g. for comic chapters or image galleries)
const pagePaths = [
  "/chapters/101/01.webp",
  "/chapters/101/02.webp",
  "/chapters/101/03.webp",
];

const signedPages = await flared.signBatch(pagePaths, {
  ttlSeconds: 7200, // 2 hours
});

// 3. Verify an existing URL (stateless server-side check)
const result = await flared.verifyUrl(avatarUrl);
if (result.valid) {
  console.log("URL is valid and not expired!");
} else {
  console.error("Invalid URL:", result.error);
}
```

---

## Framework Integration Examples

### 1. Hono (Cloudflare Workers / Node)

```typescript
import { Hono } from "hono";
import { createFlaredClient } from "@ceefex/flared-object-client";

type Bindings = {
  MEDIA_BASE_URL: string;
  FLARED_HMAC_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.get("/api/v1/chapters/:id", async (c) => {
  const flared = createFlaredClient({
    baseUrl: c.env.MEDIA_BASE_URL,
    hmacSecret: c.env.FLARED_HMAC_SECRET,
  });

  // Query raw storage keys from database (e.g. Drizzle or Prisma)
  const rawPages = ["/comics/ch1/01.webp", "/comics/ch1/02.webp"];

  // Sign URLs before returning to client
  const pages = await flared.signBatch(rawPages, { ttlSeconds: 7200 });

  return c.json({ pages });
});

export default app;
```

### 2. Next.js (App Router / Server Component)

```typescript
// app/users/[id]/page.tsx
import { createFlaredClient } from "@ceefex/flared-object-client";
import { db } from "@/lib/db";

const flared = createFlaredClient({
  baseUrl: process.env.NEXT_PUBLIC_MEDIA_URL!,
  hmacSecret: process.env.FLARED_HMAC_SECRET!,
});

export default async function UserProfile({ params }: { params: { id: string } }) {
  const user = await db.user.findUnique({ where: { id: params.id } });
  const avatarUrl = user?.avatarKey ? await flared.signUrl(user.avatarKey) : "/default.png";

  return (
    <div>
      <h1>{user?.name}</h1>
      <img src={avatarUrl} alt={user?.name} />
    </div>
  );
}
```

---

## API Reference

### `createFlaredClient(options: FlaredClientOptions): FlaredClient`

Creates a new `FlaredClient` instance.

#### Options:
- `baseUrl` (`string`, required): Base URL of your flared-object proxy (e.g. `https://media.example.com`).
- `hmacSecret` (`string`, required): Shared secret matching `HMAC_SECRET` on your gateway.
- `defaultTtlSeconds` (`number`, optional): Default expiration time in seconds (Default: `3600`).

### Methods:

- **`signUrl(path: string, options?: SignOptions): Promise<string>`**
  Signs a single object path and returns the complete URL.
- **`signBatch(paths: string[], options?: SignOptions): Promise<string[]>`**
  Signs multiple paths in parallel with a shared expiration timestamp.
- **`verifyUrl(url: string | URL): Promise<{ valid: boolean; error?: string }>`**
  Statelessly checks if a URL is valid and unexpired.
- **`parseUrl(url: string | URL): ParsedFlaredUrl`**
  Parses path, token, expiry timestamp, and checks `isExpired` flag.

---

## License

MIT © [Ceefex](https://github.com/ceefex)
