# @ceefex/flared-object-ui

UI design system, SSR error page templates, and Edge runtime components for the [flared-object](https://github.com/ceefex/flared-object) edge storage gateway.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)

---

## Overview

`@ceefex/flared-object-ui` delivers modern, accessible error pages and UI primitives for flared-object. It is specially compiled for **Edge runtimes** (Cloudflare Workers & Pages Functions) using Vite SSR, rendering React components to lightweight, zero-client-JS HTML via `react-dom/server.edge`.

---

## Features

- **Edge-Ready SSR Bundle**: Pre-bundled via Vite SSR to `dist/media-error-page.js` with externalized React Edge server bindings for near-zero startup overhead.
- **Tailwind CSS v4 & Modern Styling**: Powered by `@tailwindcss/vite`, CSS variables, and fluid typography.
- **Accessible & Responsive**: Responsive layout with modern dark/light styling, Phosphor icons, and clean error explanations.
- **Zero Client Hydration Overhead**: Renders pure, semantic static HTML at the edge with inlined styles for instantaneous delivery.

---

## Exports

| Export Subpath | Description |
|----------------|-------------|
| `./media-error-page` | Edge SSR function `renderMediaErrorPage(props)` returning HTML string |
| `./globals.css` | Base stylesheet including Tailwind directives and color tokens |
| `./components/*` | Reusable React UI components |
| `./lib/*` | UI utility helpers (e.g. `cn` class merger) |
| `./hooks/*` | Custom React hooks |

---

## Usage in Edge Runtimes

```typescript
import { renderMediaErrorPage } from "@ceefex/flared-object-ui/media-error-page";

const html = renderMediaErrorPage({
  status: 403,
  statusText: "Forbidden",
  title: "Access Denied",
  description: "You do not have permission to access this resource or the link has expired.",
});

return new Response(html, {
  status: 403,
  headers: { "Content-Type": "text/html; charset=utf-8" },
});
```

---

## Development & Build

```bash
# Build SSR bundle with Vite
pnpm build

# Run type check
pnpm typecheck

# Postinstall (runs automatically during monorepo postinstall)
pnpm postinstall
```

### Vite SSR Configuration

The package builds via `vite.config.ts`:
- **SSR Entry**: `src/media-error-page.tsx`
- **Output Target**: `dist/media-error-page.js` (ESM)
- **External Dependencies**: `react`, `react-dom/server.edge`

---

## License

MIT © [Ceefex](https://github.com/ceefex)
