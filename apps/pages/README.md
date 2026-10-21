# @ceefex/flared-object-pages

Cloudflare Pages deployment target with Pages Functions for the [flared-object](https://github.com/ceefex/flared-object) edge storage & security gateway.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## Overview

`@ceefex/flared-object-pages` deploys flared-object to **Cloudflare Pages** utilizing Pages Functions. This architecture enables serving static frontend assets (`public/`) alongside high-performance edge storage gateway endpoints (`functions/[[path]].ts`).

---

## Architecture & Directory Structure

```
apps/pages/
├── functions/
│   ├── [[path]].ts       # Catch-all Pages Function handler
│   ├── index.ts          # Root path handler
│   └── types.d.ts        # Pages environment types
├── public/               # Static assets directory
├── package.json
└── tsconfig.json
```

Requests are routed through Cloudflare Pages Functions:
1. Static files residing in `public/` are served directly by Cloudflare Pages CDN.
2. Unmatched routes fall through to `functions/[[path]].ts`, invoking `@ceefex/flared-object-core` with the `MEDIA_BUCKET` R2 binding.

---

## Configuration

Configure bindings, environment variables, and secrets in the **Cloudflare Pages Dashboard** under **Project Settings > Functions**:

### 1. R2 Bucket Binding
- **Variable name**: `MEDIA_BUCKET`
- **R2 Bucket**: Select your production or preview R2 bucket.

### 2. Environment Variables & Secrets

| Name | Type | Description |
|------|------|-------------|
| `SECURITY_MODE` | Variable | `none` \| `signed-url` \| `referer` \| `signed-url+referer` (Default: `none`) |
| `ALLOWED_REFERERS` | Variable | JSON string array of allowed hosts, e.g. `'["example.com", "*.example.com"]'` |
| `HMAC_SECRET` | **Secret** | 256-bit hexadecimal string matching client signing key |

Configure secrets separately for **Production** and **Preview** environments.

---

## Development

```bash
# Start local Pages development server with simulated R2 bucket
pnpm dev

# Run type check
pnpm typecheck
```

The dev server runs using `wrangler pages dev` simulating Cloudflare's Edge environment locally:
```bash
wrangler pages dev public --compatibility-date=2026-10-09 --r2=MEDIA_BUCKET
```

---

## Build & Deployment

### Cloudflare Pages Builds (Git Integration)

When deploying via Cloudflare Pages GitHub/GitLab integration:
- **Build command**: `pnpm build:pages`
- **Build output directory**: `apps/pages/public`
- **Root directory**: `/`

### Manual CLI Deployment

```bash
# Build Pages Functions bundle
pnpm build

# Deploy public directory to production
pnpm deploy

# Deploy to preview branch
pnpm deploy:preview
```

---

## License

MIT © [Ceefex](https://github.com/ceefex)
