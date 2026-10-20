# flared-object

> **Edge CDN + Security Gateway** for R2/S3 storage, deployable as Cloudflare Workers or Pages.

## Features

- **CDN Caching** — Edge caching via Cloudflare Cache API with `Cache-Control`, `ETag`, `stale-while-revalidate`
- **Security Layer** — Signed URLs (HMAC-SHA256), Referer/Origin whitelisting, Hotlink protection
- **Dual Runtime** — Deploy as Workers (via `wrangler.jsonc`) or Pages (via Dashboard + Functions)
- **Storage Driver Abstraction** — Currently R2 binding, future support for S3-compatible (B2, AWS, MinIO)
- **Modular Monorepo** — Turborepo-powered with shared `@ceefex/core` and `@ceefex/ui`

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

Set `HMAC_SECRET` via `wrangler secret put HMAC_SECRET`.

URL format: `/path/to/file.jpg?token=<hmac>&expires=<unix_ts>`

### Referer Protection

Set `ALLOWED_REFERERS` as a JSON array:
```json
["example.com", "*.example.com"]
```

## Deploy

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
