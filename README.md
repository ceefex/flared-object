# flared-object

> **Edge CDN + Security Gateway** for R2/S3 storage, deployable as Cloudflare Workers or Pages.

## Features

- **CDN Caching** — Edge caching via Cloudflare Cache API with `Cache-Control`, `ETag`, `stale-while-revalidate`
- **Security Layer** — Signed URLs (HMAC-SHA256), Referer/Origin whitelisting, Hotlink protection
- **Dual Runtime** — Deploy as Workers (via `wrangler.jsonc`) or Pages (via Dashboard + Functions)
- **Storage Driver Abstraction** — Currently R2 binding, future support for S3-compatible (B2, AWS, MinIO)
- **Modular Monorepo** — Turborepo-powered with shared `@ceefex/flared-object-core` and `@ceefex/flared-object-ui`

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

When importing via Git to Cloudflare Workers (Workers Builds), the CI/CD pipeline separates build and deploy into two distinct steps:
1. **Build Step (`pnpm build`)**: Executes `scripts/build/index.ts`, generating `apps/worker/wrangler.deploy.jsonc` from build-time environment variables.
2. **Deploy Step (`pnpm deploy:worker`)**: Runs `wrangler deploy --config wrangler.deploy.jsonc` to deploy the Worker.

The `.env` file is strictly for local development and local type checking/testing. In Cloudflare Git Import CI, all build variables are injected directly via Cloudflare's Build environment variables.

Build/deploy configuration and runtime configuration have separate responsibilities. Build variables are used by the Worker build step (`scripts/build/index.ts`) to select deployment resources; they are not application runtime variables. Runtime variables and secrets are configured in Cloudflare and are not generated into the Worker config.

### Build-time variables

For local Worker deployment, copy `.env.example` to `.env` in the repository root and replace the sample resource names. In CI, define these as build variables:

| Variable | Purpose |
|----------|---------|
| `DEPLOY_WORKER_NAME` | Production Worker name |
| `DEPLOY_WORKER_PREVIEW_NAME` | Named preview Worker name |
| `DEPLOY_R2_BUCKET_NAME` | Production R2 bucket name |
| `DEPLOY_R2_PREVIEW_BUCKET_NAME` | Named preview environment R2 bucket |
| `DEPLOY_R2_BUILDS_PREVIEW_BUCKET_NAME` | Workers Builds Preview R2 bucket |
| `DEPLOY_R2_LOCAL_BUCKET_NAME` | Local development R2 simulation name |

These values are consumed during the build step (`scripts/build/index.ts`, invoked as the Worker's `build` script) and written to `apps/worker/wrangler.deploy.jsonc` (Worker name and R2 resource names). This serves as the Worker build step in Cloudflare Workers CI / Workers Builds. The root `.env` is for local use and ignored by Git; CI environment variables take precedence over values from `.env`. Do not put secrets in `.env.example` or in build variables.

### Build-time secrets

CI deployment credentials are build secrets, not application runtime secrets. If deployment runs in CI, provide a Cloudflare API token (with only the permissions required to deploy the Worker) using that CI platform's secret store, commonly named `CLOUDFLARE_API_TOKEN`. Never commit it or put it in `.env.example`.

### Runtime variables and secrets

Set these on the Cloudflare Worker project, separately for Production and the named `preview` environment as appropriate:

| Runtime setting | Type | Purpose |
|-----------------|------|---------|
| `SECURITY_MODE` | Variable | `none`, `signed-url`, `referer`, or `signed-url+referer` |
| `ALLOWED_REFERERS` | Variable | JSON array of allowed referer hostnames, for example `["example.com", "*.example.com"]` |
| `HMAC_SECRET` | Secret | HMAC key required for signed URL modes |

The generated Worker config sets `keep_vars` so deployment preserves runtime variables configured in Cloudflare instead of replacing them with build-time values. Add `HMAC_SECRET` as a Cloudflare Worker secret (for example with `wrangler secret put`); never expose it in build output.

Cloudflare Pages does not use a Wrangler configuration file in this project. Set its R2 binding, runtime variables (`SECURITY_MODE`, `ALLOWED_REFERERS`), and runtime secret (`HMAC_SECRET`) in the Pages dashboard, independently for Production and Preview as appropriate.

```bash
pnpm deploy:worker          # Deploy Worker
pnpm deploy:worker:preview  # Deploy Worker preview
pnpm deploy:pages           # Deploy Pages
pnpm deploy:pages:preview   # Deploy Pages preview branch
```

## Architecture

```
packages/core/     — Shared logic (drivers, security, cache, pipeline)
packages/ui/       — Error pages & branding (from komikhq/media)
apps/worker/       — Cloudflare Worker runtime
apps/pages/        — Cloudflare Pages Functions runtime
```
