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

Generate a strong random secret (32 bytes / 256 bits) with OpenSSL:

```bash
openssl rand -hex 32
```

Copy the output and store it as a secret, not as a plain environment variable or in source control. For a Cloudflare Worker, run this from the repository root and paste the generated value when prompted:

```bash
pnpm --filter @ceefex/worker exec wrangler secret put HMAC_SECRET
```

For the named Worker `preview` environment, set its secret separately:

```bash
pnpm --filter @ceefex/worker exec wrangler secret put HMAC_SECRET --env preview
```

For Cloudflare Pages, add `HMAC_SECRET` as a secret in the Pages project's environment settings. Configure it separately for Production and Preview as needed. Use the same secret for URL generation and validation in each environment, and never expose it to browsers or include it in a URL.

URL format: `/path/to/file.jpg?token=<hmac>&expires=<unix_ts>`

`expires` is a Unix timestamp in seconds: the number of seconds since 1970-01-01 UTC at which the URL expires. When `generateSignedUrl` creates a URL, it calculates this as the current system time plus the requested lifetime (`ttlSeconds`). The URL generator includes both `expires` and an HMAC signature of the path and expiry time; the Worker or Pages Function checks the timestamp against its current time and recomputes the signature using `HMAC_SECRET` on each request.

This is stateless: no issuance or expiry record is stored in a database. The expiry timestamp travels in the URL, and the signature prevents changing it without the secret. A valid URL can be reused until it expires; to revoke URLs earlier, rotate the secret (which invalidates URLs signed with the old secret). Ensure the system generating URLs and the Cloudflare runtime have reasonably accurate clocks.

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
