# @ceefex/flared-object-worker

Standalone Cloudflare Worker deployment target for the [flared-object](https://github.com/ceefex/flared-object) edge storage & security gateway.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ceefex/flared-object)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## Overview

`@ceefex/flared-object-worker` packages the flared-object gateway as a native Cloudflare Worker (`ExportedHandler<Env>`). It handles requests directly at Cloudflare's global edge network, proxies R2 storage objects, enforces HMAC-SHA256 signed URL validation and referer whitelisting, and returns CDN-cached HTTP responses.

---

## Architecture

```
Internet Request
       │
       ▼
Cloudflare Worker (apps/worker/src/index.ts)
       │
       ├─► parseSecurityConfig(env)
       │
       ├─► @ceefex/flared-object-core
       │     ├─► Security Validation (HMAC / Referer)
       │     ├─► Storage Driver (R2BindingDriver -> MEDIA_BUCKET)
       │     ├─► HTTP Cache & ETag Headers
       │     └─► Error Handling (HTML SSR via @ceefex/flared-object-ui)
       │
       ▼
HTTP Response (Streamed Media or Error Page)
```

---

## Configuration

### 1. Bindings (`wrangler.jsonc`)

- **R2 Bucket Binding**: `MEDIA_BUCKET` bound to your Cloudflare R2 bucket.
- **Assets Binding**: `ASSETS` for optional static asset fallbacks.

### 2. Runtime Variables & Secrets

| Name | Type | Description |
|------|------|-------------|
| `SECURITY_MODE` | Variable | `none` \| `signed-url` \| `referer` \| `signed-url+referer` (Default: `none`) |
| `ALLOWED_REFERERS` | Variable | JSON string array of allowed hosts, e.g. `'["example.com", "*.example.com"]'` |
| `HMAC_SECRET` | **Secret** | 256-bit hexadecimal string matching client signing key |

#### Setting Secrets with Wrangler CLI

From the workspace root:

```bash
# Production secret
pnpm --filter @ceefex/flared-object-worker exec wrangler secret put HMAC_SECRET

# Preview environment secret
pnpm --filter @ceefex/flared-object-worker exec wrangler secret put HMAC_SECRET --env preview
```

---

## Development

```bash
# Generate Cloudflare Worker TypeScript types
pnpm types

# Start local Worker development server (simulated R2 bucket)
pnpm dev

# Start local development server targeting preview environment
pnpm dev:preview

# Run type check
pnpm typecheck
```

---

## Build & Deployment

### Cloudflare Workers Builds (CI/CD)

The Cloudflare Workers Builds pipeline separates build and deploy into two distinct steps:

1. **Build Step (`pnpm build:worker`)**:
   Executes `scripts/build/index.ts`, dynamically generating `wrangler.deploy.jsonc` from build-time environment variables (`DEPLOY_WORKER_NAME`, `DEPLOY_R2_BUCKET_NAME`, etc.).
2. **Deploy Step (`pnpm deploy:worker`)**:
   Executes `wrangler deploy --config wrangler.deploy.jsonc` to deploy the Worker.

#### Dashboard Settings (Workers & Pages > Settings > Builds)
- **Root directory**: `/`
- **Build command**: `pnpm build:worker`
- **Deploy command**: `pnpm deploy:worker`
- **Preview command**: `pnpm deploy:worker:preview`

### Manual CLI Deployment

```bash
# Build deploy config and deploy to production
pnpm build
pnpm deploy

# Deploy to named preview environment
pnpm deploy:preview
```

---

## License

MIT © [Ceefex](https://github.com/ceefex)
