# Splash

Minimal TypeScript library for unsplash that we use on our products

## Quick Start

### Installation
```bash
# pnpm
pnpm add SolvexMenu/splash

# npm
npm install SolvexMenu/splash
```

### Usage
```ts
import { SplashClient, BearerTokenAuth } from "splash";

const client = new SplashClient({
  baseUrl: "https://api.unsplash.com/",
  auth: new APIKeyAuth("Authorization", `Client-ID ${process.env.CLIENT_ID}`),
  retry: true, // enable sensible default retries
});

const photos = await client.photos.list();
```

## Architecture

- Core
  - `src/core/errors.ts`: `ApiError`, `HttpError`, `TimeoutError`, `RateLimitError`.
  - `src/core/auth.ts`: `AuthStrategy`, `APIKeyAuth`, `BearerTokenAuth`.
- HTTP
  - `src/http/httpClient.ts`: fetch-based client, timeouts, retries, interceptors.
  - `src/http/types.ts`: request/response, retry, interceptor types.
  - `src/utils/query.ts`: robust query string builder.
- Resources
  - `src/resources/baseResource.ts`: helper base to scope endpoints.
- Client
  - `src/client.ts`: wires HTTP + resources; main entry exported in `index.ts`.

Notes:
- Uses global `fetch` (Node 18+, Bun, modern browsers). Provide a `fetchImpl` in `SplashClient` if needed.
- No external dependencies.

## Dev

Install deps:

```bash
bun install
```

Run a quick test:

```bash
bun run examples/index.ts
```
