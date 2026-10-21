# @ceefex/flared-object-core

Core runtime engine, security verification, storage driver abstractions, and HTTP response pipelines for the [flared-object](https://github.com/ceefex/flared-object) edge storage gateway.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## Overview

`@ceefex/flared-object-core` provides the shared runtime foundation consumed by edge deployment targets ([`apps/worker`](../../apps/worker) and [`apps/pages`](../../apps/pages)) as well as client utilities. It is designed to be runtime-agnostic across standard Web APIs (`Request`, `Response`, `crypto.subtle`).

```
┌─────────────────────────────────────────────────────────────────┐
│                     Incoming Request                            │
└────────────────────────────────┬────────────────────────────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │    Security Layer     │
                     │  (HMAC / Referer)     │
                     └───────────┬───────────┘
                       Pass      │      Fail
             ┌───────────────────┴───────────────────┐
             ▼                                       ▼
  ┌───────────────────────┐              ┌───────────────────────┐
  │     Storage Driver    │              │  Error Response Page  │
  │      (R2 Binding)     │              │  (@ceefex/...-ui SSR) │
  └──────────┬────────────┘              └───────────────────────┘
             │
             ▼
  ┌───────────────────────┐
  │ Response & CDN Cache  │
  │   (ETag, 304, etc.)   │
  └───────────────────────┘
```

---

## Features

- **Storage Driver Abstraction**: Unified `StorageDriver` interface. Ships with `R2BindingDriver` (for Cloudflare R2 bindings) and ready for future drivers (S3, MinIO, Backblaze B2).
- **High-Performance Security Validation**:
  - Stateless HMAC-SHA256 signature verification using native Web Crypto `crypto.subtle`.
  - Referer and Origin host matching supporting wildcards (e.g. `*.example.com`).
  - Configurable security modes: `none`, `signed-url`, `referer`, `signed-url+referer`.
- **Intelligent Response Pipeline**:
  - Automatic `ETag` generation and HTTP `304 Not Modified` handling (`If-None-Match`).
  - Edge and browser caching headers (`Cache-Control`, `s-maxage`, `stale-while-revalidate`).
  - Beautiful SSR error pages with HTTP status codes (400, 403, 404, 405) powered by `@ceefex/flared-object-ui`.

---

## Exported API

### Request Handler

```typescript
import { handleRequest, R2BindingDriver } from "@ceefex/flared-object-core";

const driver = new R2BindingDriver(env.MEDIA_BUCKET);
const response = await handleRequest(request, driver, {
  mode: "signed-url+referer",
  hmacSecret: env.HMAC_SECRET,
  allowedReferers: ["example.com", "*.example.com"],
});
```

### Security Primitives

```typescript
import {
  validateRequest,
  validateSignedUrl,
  generateSignedUrl,
  validateReferer,
} from "@ceefex/flared-object-core";

// Validate full request based on SecurityConfig
const result = await validateRequest(request, securityConfig);
if (!result.valid) {
  return new Response(result.error, { status: result.status });
}

// Generate an HMAC signed URL
const signed = await generateSignedUrl({
  url: "https://media.example.com/images/hero.webp",
  secret: "your-256-bit-secret",
  ttlSeconds: 3600,
});
```

### Storage Drivers

```typescript
import { R2BindingDriver } from "@ceefex/flared-object-core";
import type { StorageDriver, StorageObject } from "@ceefex/flared-object-core";

// Implement custom drivers by satisfying the StorageDriver interface
const driver: StorageDriver = new R2BindingDriver(env.MEDIA_BUCKET);
const object: StorageObject | null = await driver.get("images/banner.jpg");
```

---

## Package Scripts

```bash
# Compile TypeScript to dist/
pnpm build

# Run type check
pnpm typecheck

# Postinstall (runs automatically in Turborepo pipeline)
pnpm postinstall
```

---

## License

MIT © [Ceefex](https://github.com/ceefex)
