# flared-object

> **Edge CDN + Security Gateway** for R2/S3 storage, deployable as Cloudflare Workers or Pages.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ceefex/flared-object)

## Features

- **CDN Caching** — Edge caching via Cloudflare Cache API with `Cache-Control`, `ETag`, `stale-while-revalidate`
- **Security Layer** — Signed URLs (HMAC-SHA256), Referer/Origin whitelisting, Hotlink protection
- **Dual Runtime** — Deploy as Workers (via `wrangler.jsonc`) or Pages (via Dashboard + Functions)
- **Storage Driver Abstraction** — Currently R2 binding, future support for S3-compatible (B2, AWS, MinIO)
- **Modular Monorepo** — Turborepo-powered with shared `@ceefex/flared-object-core`, `@ceefex/flared-object-ui`, and `@ceefex/flared-object-client`

## Quick Start

```bash
pnpm install
pnpm dev:worker    # Start Worker dev server
pnpm dev:pages     # Start Pages dev server
```

## Security Modes

Configure via `SECURITY_MODE` environment variable:

| Mode | Description |
|------|-------------|
| `none` | Open access (default) |
| `signed-url` | HMAC-SHA256 signed URL required |
| `referer` | Referer/Origin whitelist |
| `signed-url+referer` | Both required |

### Signed URL

Generate a strong random secret (32 bytes / 256 bits) with OpenSSL:

```bash
openssl rand -hex 32
```

Copy the output and store it as a secret, not as a plain environment variable or in source control. For a Cloudflare Worker, run this from the repository root and paste the generated value when prompted:

```bash
pnpm --filter @ceefex/flared-object-worker exec wrangler secret put HMAC_SECRET
```

For the named Worker `preview` environment, set its secret separately:

```bash
pnpm --filter @ceefex/flared-object-worker exec wrangler secret put HMAC_SECRET --env preview
```

For Cloudflare Pages, add `HMAC_SECRET` as a secret in the Pages project's environment settings. Configure it separately for Production and Preview as needed. Use the same secret for URL generation and validation in each environment, and never expose it to browsers or include it in a URL.

URL format: `/path/to/file.jpg?token=<hmac>&expires=<unix_ts>`

`expires` is a Unix timestamp in seconds: the number of seconds since 1970-01-01 UTC at which the URL expires. When `generateSignedUrl` creates a URL, it calculates this as the current system time plus the requested lifetime (`ttlSeconds`). The URL generator includes both `expires` and an HMAC signature of the path and expiry time; the Worker or Pages Function checks the timestamp against its current time and recomputes the signature using `HMAC_SECRET` on each request.

This is stateless: no issuance or expiry record is stored in a database. The expiry timestamp travels in the URL, and the signature prevents changing it without the secret. A valid URL can be reused until it expires; to revoke URLs earlier, rotate the secret (which invalidates URLs signed with the old secret). Ensure the system generating URLs and the Cloudflare runtime have reasonably accurate clocks.

### Referer Protection

Set the runtime variable `ALLOWED_REFERERS` as a JSON array in the Cloudflare Worker or Pages project settings:
```json
["example.com", "*.example.com"]
```

## Deploy

This project supports two Cloudflare runtime targets: **Standalone Worker** and **Cloudflare Pages**. Both can be deployed automatically via Git or manually via CLI.

### 1. Cloudflare Worker (via Workers Builds / GitHub Import)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ceefex/flared-object)

The Cloudflare Workers Builds CI/CD pipeline separates build and deploy into two distinct steps:
1. **Build Step (`pnpm build:worker`)**: Executes `scripts/build/index.ts`, generating `apps/worker/wrangler.deploy.jsonc` from build-time environment variables.
2. **Deploy Step (`pnpm deploy:worker`)**: Runs `wrangler deploy --config wrangler.deploy.jsonc` to deploy the Worker.

#### Cloudflare Dashboard Settings (Workers & Pages > Settings > Builds)
- **Root directory**: `/`
- **Build command**: `pnpm build:worker`
- **Deploy command**: `pnpm deploy:worker`
- **Preview / Version command**: `pnpm deploy:worker:preview`

#### Build-time Variables
Configured under **Settings → Build variables**:
| Variable | Purpose |
|----------|---------|
| `DEPLOY_WORKER_NAME` | Production Worker name (e.g. `flared-object-media`) |
| `DEPLOY_WORKER_PREVIEW_NAME` | Named preview Worker name (e.g. `flared-object-media-preview`) |
| `DEPLOY_R2_BUCKET_NAME` | Production R2 bucket name |
| `DEPLOY_R2_PREVIEW_BUCKET_NAME` | Named preview environment R2 bucket |
| `DEPLOY_R2_BUILDS_PREVIEW_BUCKET_NAME` | Workers Builds Preview R2 bucket |

#### Runtime Variables & Secrets
Configured under **Settings → Variables and secrets**:
| Setting | Type | Purpose |
|---------|------|---------|
| `SECURITY_MODE` | Variable | `none`, `signed-url`, `referer`, or `signed-url+referer` |
| `ALLOWED_REFERERS` | Variable | JSON array of allowed referer hostnames, for example `["example.com", "*.example.com"]` |
| `HMAC_SECRET` | Secret | HMAC secret key required for signed URL modes |

---

### 2. Cloudflare Pages (via Git Integration)

Cloudflare Pages serves static assets from `apps/pages/public/` and executes Edge Functions from `apps/pages/functions/`.

#### Cloudflare Dashboard Settings (Pages > Settings > Builds & deployments)
- **Framework preset**: `None`
- **Root directory**: `apps/pages`
- **Build command**: `pnpm build` *(runs `wrangler pages functions build functions` to validate the TypeScript functions bundle)*
- **Build output directory**: `public`

> *Note: If Root Directory is set to `/` (repository root), use Build Command: `pnpm build:pages` and Output Directory: `apps/pages/public`.*

#### Bindings & Variables in Pages Dashboard
Configured under **Settings → Functions → Compatibility flags** & **Settings → Bindings**:
1. **R2 Bucket Binding**:
   - Binding name: `MEDIA_BUCKET` (select the R2 bucket for Production and Preview).
2. **Environment Variables & Secrets**:
   - `SECURITY_MODE`: `none`, `signed-url`, `referer`, or `signed-url+referer`
   - `ALLOWED_REFERERS`: JSON array of allowed referer hostnames
   - `HMAC_SECRET`: Secret key for HMAC signed URL validation

---

### 3. Manual Deployment via CLI

To deploy directly from your local machine:

```bash
# Worker
pnpm build:worker           # Generate wrangler.deploy.jsonc
pnpm deploy:worker          # Deploy production Worker
pnpm deploy:worker:preview  # Deploy preview Worker

# Pages
pnpm build:pages            # Validate Pages functions bundle
pnpm deploy:pages           # Deploy production Pages
pnpm deploy:pages:preview   # Deploy Pages preview branch
```

## Architecture

```
packages/core/     — Shared logic (drivers, security, cache, pipeline)
packages/ui/       — Error pages & branding (from komikhq/media)
apps/worker/       — Cloudflare Worker runtime
apps/pages/        — Cloudflare Pages Functions runtime
```
