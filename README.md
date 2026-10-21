# flared-object

> **Edge CDN + Security Gateway** for R2/S3 storage, deployable as Cloudflare Workers or Pages.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ceefex/flared-object)

## Features

- **CDN Caching** — Edge caching via Cloudflare Cache API with `Cache-Control`, `ETag`, `stale-while-revalidate`
- **Security Layer** — Signed URLs (HMAC-SHA256), Referer/Origin whitelisting, Hotlink protection
- **Granular Path Exclusions** — Declarative glob bypass (`EXCLUDE_PATHS`) for public assets (e.g. covers, banners)
- **Dual Runtime** — Deploy as Workers (via `wrangler.jsonc`) or Pages (via Dashboard + Functions)
- **Storage Driver Abstraction** — Currently R2 binding, future support for S3-compatible (B2, AWS, MinIO)
- **Modular Monorepo** — Turborepo-powered with shared `@ceefex/flared-object-core`, `@ceefex/flared-object-ui`, and `@ceefex/flared-object-client`

## Why flared-object?

Serving media directly from object storage often presents a trade-off between infrastructure cost, security enforcement, and developer experience. `flared-object` acts as an intelligent, lightweight edge gateway running directly on Cloudflare Workers or Pages to deliver high-performance media with fine-grained access control.

| Feature / Architecture | Direct R2 Custom Domain | AWS S3 Presigned URLs | R2 + Cloudflare WAF Rules | Traditional Backend Proxy | **ceefex/flared-object** |
|:---|:---:|:---:|:---:|:---:|:---:|
| **Egress Cost** | $0 (Free) | High (~$0.09/GB) | $0 (Free) | Double Egress (Storage + Server) | **$0 (Zero Egress via CF Edge)** |
| **Plan Requirement** | Cloudflare Free | AWS Account | Cloudflare Pro / Enterprise | Dedicated Server VM / Bandwidth | **100% Free Plan Compatible** |
| **URL Token Signing** | None (All public) | AWS SigV4 (Verbose query) | Limited (Requires CF Advanced/Ent) | Custom implementation | **Clean HMAC-SHA256 (`token` + `expires`)** |
| **Hotlink & Referer Protection** | None | None (Sharable links) | Manual Firewall rules required | Custom implementation | **Built-in Referer Whitelist + Wildcards** |
| **Granular Exclude Paths** | All or nothing | Multiple buckets needed | Complex WAF rules | Custom implementation | **Declarative Glob (`["*/cover-*"]`)** |
| **Error Handling & UX** | Raw Cloudflare error | Raw XML `<AccessDenied>` | Generic CF 1020 / Block page | Custom | **Branded HTML UI + JSON Fallback** |
| **Origin Server Load** | Zero | Minimal (Signing only) | Zero | High (Media streamed through server) | **Minimal (Lightweight HMAC signing)** |
| **Storage Extensibility** | Locked to CF R2 | Locked to AWS S3 | Locked to CF Enterprise | Flexible | **Storage Driver Abstraction (R2, S3, B2)** |

## Quick Start

```bash
pnpm install
pnpm dev:worker    # Start Worker dev server
pnpm dev:pages     # Start Pages dev server
```

## Client SDK (@ceefex/flared-object-client)

Install the lightweight client SDK in your backend or API service to generate signed URLs:

```bash
npm install @ceefex/flared-object-client
# or
pnpm add @ceefex/flared-object-client
```

```typescript
import { createFlaredClient } from "@ceefex/flared-object-client";

const flared = createFlaredClient({
  baseUrl: "https://media.example.com",
  hmacSecret: process.env.FLARED_HMAC_SECRET!,
  defaultTtlSeconds: 3600, // 1 hour token expiration
});

// Generate a signed URL for a protected chapter or private media
const signedUrl = await flared.signUrl("/comics/the-beginning-after-the-end/ch-1/page-1.webp");
```

## Security Modes

Configure via `SECURITY_MODE` environment variable:

| Mode | Security Level | Edge CDN Cache | Browser Cache | Hotlink Protection | Direct Bot Protection | Recommended Use Case |
|:---|:---:|:---:|:---:|:---:|:---:|:---|
| `none` | Public | Full Public (`s-maxage`) | `max-age` | None | Open | Public assets (logos, favicons, fonts) |
| `signed-url` | Medium (HMAC) | Cache per URL | `max-age` | Active until token expires | Accessible with valid token | Temporary downloads, shared private links |
| `referer` | Medium (Domain) | Edge Worker Validated | `private, max-age` | Blocks external domains | Blocks empty referers | Static web apps without user auth |
| `signed-url+referer` | **Maximum (Multi-Factor)** | Edge Worker Validated | `private, max-age` | **Strict (Domain + Token)** | **Legitimate UI + Token required** | **Copyrighted content (Manga, Comics, Video, Paywalled media)** |

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

Subdomains can be matched with a leading wildcard `*.`. Requests with missing or untrusted `Referer` headers will be blocked with `403 Forbidden`.

### Path Exclusions (EXCLUDE_PATHS)

When `SECURITY_MODE` is active (`signed-url`, `referer`, or `signed-url+referer`), you can exempt public assets (such as comic covers, banners, or previews) from authentication by specifying `EXCLUDE_PATHS`.

Set `EXCLUDE_PATHS` as a JSON array of wildcard glob patterns:
```json
["*/cover-*", "*/banner-*", "public/*"]
```

Any request matching an excluded path will automatically bypass both HMAC token validation and referer verification, allowing public embeds while keeping chapter pages and premium media strictly protected.

### Edge Caching & Security Architecture

Understanding how caching interacts with security modes:
- **Public Assets & Excluded Paths**: Cached across Cloudflare's global edge network using `Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800`.
- **Protected Assets (`referer` / `signed-url+referer`)**: Cloudflare Edge Workers evaluate the HMAC signature and `Referer` header at the edge PoP on every incoming request. Browsers cache validated assets locally via `Cache-Control: private, max-age=3600`, ensuring fast reader experience without leaking protected media into shared public CDN caches.
- **Zero Egress**: Because Cloudflare Workers and R2 operate within Cloudflare's internal network, data transfer between R2 and Workers incurs zero egress fees ($0/GB).

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
| `EXCLUDE_PATHS` | Variable | JSON array of wildcard paths to bypass security, for example `["*/cover-*", "*/banner-*"]` |
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
   - `EXCLUDE_PATHS`: JSON array of wildcard paths to bypass security
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
packages/ui/       — Error pages & branding
packages/client/   — TypeScript SDK for backend URL signing (@ceefex/flared-object-client)
packages/cli/      — Developer CLI tool (@ceefex/flared-object-cli)
apps/worker/       — Cloudflare Worker runtime
apps/pages/        — Cloudflare Pages Functions runtime
```
