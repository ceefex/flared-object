<div align="center">

# flared-object

**Edge CDN and Security Gateway for R2 and S3 storage, deployable on Cloudflare Workers and Pages.**

[![TypeScript](https://img.shields.io/badge/Code-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Cloudflare Workers](https://img.shields.io/badge/Runtime-Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://workers.cloudflare.com)
[![Cloudflare Pages](https://img.shields.io/badge/Runtime-Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflarepages&logoColor=white)](https://pages.cloudflare.com)
[![Cloudflare R2](https://img.shields.io/badge/Storage-Cloudflare_R2-F38020?style=for-the-badge&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/r2)
[![S3 Compatible](https://img.shields.io/badge/Storage-S3_Compatible-569A31?style=for-the-badge&logo=data:image/svg%2Bxml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBmaWxsPSIjZmZmIiBkPSJNMjAuOTEzIDEzLjE0N2wuMTItLjg5NWMuOTQ3LjU3NiAxLjI1OC45MjIgMS4zNTQgMS4wNzEtLjE2LjAzMS0uNTYyLjA0Ni0xLjQ3NC0uMTc2em0tMi4xNzQgNy45ODhhLjU0Ny41NDcgMCAwIDAtLjAwNS4wNzNjMCAuMDg0LS4yMDcuNDA1LTEuMTI0Ljc2OGExMC4yOCAxMC4yOCAwIDAgMS0xLjQzOC40MzJjLTEuNDA1LjMyNS0zLjEyOC41MDQtNC44NTMuNTA0LTQuNjEyIDAtNy40MTItMS4xODQtNy40MTItMS43MDRhLjU0Ny41NDcgMCAwIDAtLjAwNS0uMDczTDEuODEgNS42MDJjLjEzNS4wNzguMjguMTU0LjQzMi4yMjcuMDQyLjAyLjA4Ni4wMzguMTI4LjA1Ny4xMzQuMDYyLjI3Mi4xMjIuNDE3LjE4bC4xNzkuMDY5Yy4xNTQuMDU4LjMxNC4xMTQuNDc4LjE2OC4wNDMuMDEzLjA4NC4wMjkuMTMuMDQzLjIwNy4wNjUuNDIzLjEyNy42NDYuMTg3bC4xNzYuMDQ0Yy4xNzUuMDQ0LjM1My4wODcuNTM0LjEyN2EyMy40MTQgMjMuNDE0IDAgMCAwIC44NDMuMTdsLjEyMS4wMjNjLjI1Mi4wNDUuNTA4LjA4NS43NjguMTIyLjA3MS4wMTEuMTQ0LjAyLjIxNi4wMy4yLjAyNy40LjA1My42MDQuMDc3bC4yNC4wMjdjLjI0NS4wMjYuNDkuMDUuNzQuMDdsLjA4MS4wMDljLjI3NS4wMjIuNTUyLjA0LjgzLjA1NmwuMjMzLjAxMmMuMjEuMDEuNDIyLjAxOC42MzMuMDI1YTMzLjA4OCAzMy4wODggMCAwIDAgMi43OTUtLjAyNmwuMjMyLS4wMTFjLjI3OC0uMDE2LjU1NS0uMDM0LjgzLS4wNTZsLjA4LS4wMDhjLjI1LS4wMi40OTctLjA0NS43NDItLjA3MmwuMjM4LS4wMjZjLjIwNS0uMDI0LjQwOC0uMDUuNjA5LS4wNzcuMDctLjAxLjE0MS0uMDE5LjIxMS0uMDMuMjYxLS4wMzcuNTE5LS4wNzguNzcyLS4xMjJsLjExMS0uMDJjLjIxNS0uMDQuNDI3LS4wODIuNjM0LS4xMjVsLjIxMi0uMDQ3Yy4xODYtLjA0MS4zNjgtLjA4NS41NDYtLjEzbC4xNjYtLjA0MmMuMjI1LS4wNi40NDQtLjEyMi42NTQtLjE4OS4wNC0uMDEyLjA3Ny0uMDI2LjExNS0uMDM4YTEwLjYgMTAuNiAwIDAgMCAuNDkzLS4xNzNjLjA1OC0uMDIxLjExNC0uMDQ0LjE3LS4wNjYuMTUtLjA2LjI5My0uMTIuNDMtLjE4NS4wMzgtLjAxNy4wNzktLjAzNC4xMTYtLjA1Mi4xNTMtLjA3My4zLS4xNS40MzYtLjIyOGwtLjk3NiA3LjI0NWMtMi40ODgtLjc4LTUuODA1LTIuMjkyLTcuMzExLTNhMS4wOSAxLjA5IDAgMCAwLTEuMDg4LTEuMDg1Yy0uNiAwLTEuMDg4LjQ4OS0xLjA4OCAxLjA4OCAwIC42LjQ4OCAxLjA4OSAxLjA4OCAxLjA4OS4xOTYgMCAuMzc4LS4wNTYuNTM3LS4xNDggMS43Mi44MTIgNS4xNDQgMi4zNjcgNy43MTUgMy4xNXptLTcuNDItMjAuMDQ3YzUuNjc3IDAgOS42NzYgMS43NTkgOS43NSAyLjczNmwtLjAxNC4xMTNjLS4wMS4wMzMtLjAzMS4wNjctLjA0OC4xMDEtLjAxNS4wMjgtLjAyNi4wNTctLjA0Ny4wODctLjAyNC4wMzMtLjA1OC4wNjgtLjA5LjEwMi0uMDI4LjAzLS4wNTEuMDYtLjA4NC4wOS0uMDM4LjAzNS0uMDg3LjA3LS4xMzMuMTA1LS4wNC4wMy0uMDc0LjA2LS4xMTkuMDkxLS4wNTMuMDM2LS4xMTYuMDcxLS4xNzcuMTA3LS4wNS4wMy0uMDk1LjA2LS4xNS4wOS0uMDY4LjAzNi0uMTQ3LjA3My0uMjIyLjExLS4wNTkuMDI4LS4xMTQuMDU3LS4xNzcuMDg1LS4wODQuMDM4LS4xNzcuMDc0LS4yNjguMTExLS4wNjguMDI3LS4xMy4wNTQtLjIwMy4wODItLjA5Ny4wMzYtLjIwNS4wNzItLjMxLjEwNy0uMDc1LjAyNi0uMTQ4LjA1My0uMjI4LjA3OS0uMTExLjAzNS0uMjMzLjA2OS0uMzUuMTAzLS4wODUuMDI0LS4xNjUuMDUtLjI1My4wNzMtLjEyNC4wMzQtLjI1OC4wNjUtLjM4OS4wOTgtLjA5My4wMjItLjE4MS4wNDYtLjI3OC4wNjgtLjEzOS4wMzItLjI4Ny4wNjEtLjQzMy4wOTEtLjA5OC4wMi0uMTkxLjA0MS0uMjkzLjA2LS4xNTUuMDMtLjMyLjA1Ny0uNDgyLjA4NC0uMS4wMTgtLjE5OC4wMzYtLjMwMi4wNTItLjE2Ni4wMjYtLjM0Mi4wNDgtLjUxNS4wNzItLjExLjAxNC0uMjEzLjAzLS4zMjUuMDQ0LS4xODEuMDIzLS4zNzIuMDQxLS41Ni4wNi0uMTEuMDEyLS4yMTguMDI1LS4zMzIuMDM2LS4xODguMDE2LS4zODYuMDI5LS41OC4wNDMtLjEyMi4wMDktLjI0LjAyLS4zNjQuMDI4LS4yMDcuMDEyLS40MjIuMDItLjYzNS4wMjgtLjEyLjAwNS0uMjM0LjAxMi0uMzU0LjAxNmEzNS42MDUgMzUuNjA1IDAgMCAxLTIuMDY5IDBjLS4xMi0uMDA0LS4yMzQtLjAxMS0uMzUyLS4wMTYtLjIxNC0uMDA4LS40My0uMDE2LS42MzctLjAyOC0uMTIyLS4wMDgtLjIzOC0uMDItLjM2LS4wMjctLjE5NS0uMDE1LS4zOTQtLjAyOC0uNTg0LS4wNDQtLjExLS4wMS0uMjE1LS4wMjQtLjMyNC0uMDM1LS4xOS0uMDItLjM4NC0uMDM4LS41NjgtLjA2bC0uMzE1LS4wNDRjLS4xNzYtLjAyNC0uMzU1LS4wNDYtLjUyNS0uMDczLS4xLS4wMTUtLjE5Mi0uMDMzLS4yOS0uMDUtLjE2Ny0uMDI4LS4zMzUtLjA1NS0uNDk0LS4wODYtLjA5Ni0uMDE4LS4xODMtLjAzOC0uMjc2LS4wNTYtLjE1MS0uMDMyLS4zMDUtLjA2Mi0uNDUtLjA5NS0uMDktLjAyLS4xNzMtLjA0My0uMjYtLjA2NC0uMTM4LS4wMzQtLjI3Ny0uMDY3LS40MDctLjEwMi0uMDgyLS4wMjItLjE1Ny0uMDQ2LS4yMzUtLjA2OWExMS43NSAxMS43NSAwIDAgMS0uMzY4LS4xMDhjLS4wNzUtLjAyNC0uMTQxLS4wNDktLjIxMy0uMDczLS4xMS0uMDM3LS4yMjMtLjA3NS0uMzI1LS4xMTMtLjA2Ny0uMDI1LS4xMjUtLjA1MS0uMTg4LS4wNzctLjA5Ni0uMDM4LS4xOTUtLjA3Ni0uMjgyLS4xMTUtLjA2LS4wMjctLjExLS4wNTQtLjE2Ni0uMDgtLjA4LS4wMzktLjE2Mi0uMDc3LS4yMzMtLjExNi0uMDUyLS4wMjgtLjA5NC0uMDU1LS4xNDItLjA4NC0uMDYzLS4wMzgtLjEzLS4wNzUtLjE4NS0uMTEzLS4wNDMtLjAyOS0uMDc1LS4wNTgtLjExMy0uMDg2LS4wNDgtLjAzNy0uMDk4LS4wNzMtLjEzOS0uMTEtLjAzMi0uMDI5LS4wNTQtLjA1Ny0uMDgtLjA4Ny0uMDMzLS4wMzUtLjA2OS0uMDctLjA5My0uMTA0LS4wMi0uMDMtLjAzMS0uMDU4LS4wNDYtLjA4Ni0uMDE4LS4wMzUtLjAzOS0uMDY4LS4wNDktLjEwMmwtLjAxNS0uMTEzYy4wNzYtLjk3NyA0LjA3NC0yLjczNiA5Ljc0OC0yLjczNnptMTIuMTgyIDEyLjEyNGMtLjExOC0uNjI4LS44NC0xLjI5MS0yLjMxLTIuMTI4bC45NjMtNy4xNmEuNTMxLjUzMSAwIDAgMCAuMDA1LS4wNzNDMjIuMTYgMS41ODEgMTYuNDQ3IDAgMTEuMzIgMCA2LjE5NCAwIC40ODIgMS41ODEuNDgyIDMuODUxYS41OC41OCAwIDAgMCAuMDA1LjA3MkwyLjgxOSAyMS4yNWMuMDcxIDIuMDAyIDUuMjM2IDIuNzUgOC41IDIuNzUgMS44MDUgMCAzLjYxNS0uMTg4IDUuMDk4LS41MzEuNTk4LS4xMzggMS4xMzMtLjMgMS41OTItLjQ4IDEuMTgtLjQ2NyAxLjc4OS0xLjA1MyAxLjgxMy0xLjczOWwuOTQ1LTcuMDE4Yy41NTcuMTMxIDEuMDE2LjE5NyAxLjM4OS4xOTcuNTQgMCAuOTAyLS4xMzcgMS4xMzQtLjQxM2EuOTU2Ljk1NiAwIDAgMCAuMjEtLjgwNFoiLz48L3N2Zz4=)](https://aws.amazon.com/s3/)
[![npm](https://img.shields.io/badge/npm-@ceefex/flared--object--client-CB3837?style=for-the-badge&logo=npm&logoColor=white)](https://www.npmjs.com/package/@ceefex/flared-object-client)
[![License: MIT](https://img.shields.io/badge/License-MIT-0D1117?style=for-the-badge)](https://opensource.org/licenses/MIT)

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ceefex/flared-object)

---

_High-performance media delivery with zero egress fees, HMAC URL signing, and fine-grained hotlink protection._

</div>

---

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
