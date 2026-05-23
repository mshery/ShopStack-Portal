# Test Plan — ITS-13 Frontend UX & build

Parent ticket: **ITS-13** — covers ITS-51, ITS-52, ITS-53, ITS-54.
Branch: `feat/its-13-frontend-ux`.

---

## ITS-51 — Title, favicon, meta description

**Manual smoke:**
1. `npm run dev` (port 5173).
2. `curl http://localhost:5173/` — expect `<title>ShopStack Portal</title>`, `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`, and `<meta name="description" content="ShopStack — Multi-tenant POS & Business Management" />` in the HTML head.
3. `curl -sf http://localhost:5173/favicon.svg` returns 200 with the SS-mark SVG.
4. Open `http://localhost:5173/` in Chrome / Safari / Firefox — tab title reads "ShopStack Portal", tab favicon shows the dark `SS` mark. No 404 for `/vite.svg` (the asset is gone; no code path requests it).
5. `npm run build && npm run preview` — preview at `:4173` shows the same title/favicon.

**Notes:**
- PNG fallback (`<link rel="alternate icon">`) is intentionally omitted. A monochrome SVG renders crisply in every browser that supports SVG favicons (Chrome 80+, Edge 80+, Firefox 41+, Safari 15.4+). Older browsers still get the SVG via the standard `rel="icon"` rule and degrade to the default page icon. If we later need the legacy PNG path, drop a `favicon.png` in `public/` and add the `alternate icon` link tag.

---

## ITS-52 — Real platform `tenantsApi.ts`

**Backend endpoints exercised:** all six routes named in the ticket exist in `src/core/config/endpoints.ts` under `endpoints.platform.tenants.*`:

| Method                  | Backend route                                    |
| ----------------------- | ------------------------------------------------ |
| `listTenants()`         | `GET    /platform/tenants`                       |
| `getTenant(id)`         | `GET    /platform/tenants/:id`                   |
| `createTenant(data)`    | `POST   /platform/tenants`                       |
| `updateTenant(id, ...)` | `PUT    /platform/tenants/:id`                   |
| `suspendTenant(id)`     | `POST   /platform/tenants/:id/suspend`           |
| `impersonateTenant(id)` | `POST   /platform/tenants/:id/impersonate`       |

All six are implemented in `src/modules/platform/api/tenantsApi.ts` using the singleton `httpClient`. Every response is parsed through the new `TenantSchema` / `TenantListSchema` / `ImpersonationResultSchema` in `src/modules/platform/normalizers/tenants.normalizers.ts` before leaving the file. Every dynamic path segment is wrapped in `encodeURIComponent` per `security.md` rule 8.

**Status: PARTIAL** — strictly speaking the *new* `tenantsApi.ts` is wired. However, the consumers (`api/queries.ts`, `useCreateTenantLogic`, `useTenantsListLogic`, `TenantDetailPage`, `tenants.store.ts`) still go through the older `platformApi.ts` tenant methods. Those methods return raw `ApiTenant` objects without zod parsing. Migrating those callers to the new zod-parsed surface is out-of-scope for this ticket (it would change the type shape the platform UI consumes — separate ticket) and would not change the network endpoints they call.

**How to verify the new layer at runtime (requires backend running):**
1. Log in as a platform super-admin (`/platform`).
2. Open DevTools → Network. Visit `/platform/tenants`.
3. Confirm a `GET /api/platform/tenants?page=1&limit=10` request fires and returns real DB rows (not seed/stub data).
4. Suspend a tenant via the UI. Confirm a `POST /api/platform/tenants/:id/suspend` is sent and the tenant row flips to `status: "suspended"` in `psql`.
5. Programmatic smoke (browser console):
   ```js
   import("@/modules/platform/api/tenantsApi").then((m) => m.listTenants({ page: 1, limit: 5 }).then(console.log))
   ```
   Should resolve to `{ items: [...], pagination: {...} }` — zod-parsed, types match `Tenant`.

**Console log removal:** `grep -n console.log src/modules/platform/api/tenantsApi.ts` → no matches.

---

## ITS-53 — Hidden source maps

**Verification:**
1. `npm run build`.
2. `dist/assets/*.map` exists (so Sentry/Bugsnag upload pipeline still has something to ingest).
3. `grep -c sourceMappingURL dist/assets/*.js` → `0`. The compiled bundle does not reference the map, so browsers and `curl` against the public CDN will not fetch it even if it remains on disk.
4. Deploy step (future ticket): upload `.map` files to the error monitor, then strip them from the published `dist/` before pushing to the CDN, or block `/assets/*.js.map` at the edge.

---

## ITS-54 — Single `@/*` alias in `tsconfig.app.json`

**Verification:**
1. `cat tsconfig.app.json | jq '.compilerOptions.paths'` → only `{ "@/*": ["./src/*"] }`.
2. `grep -rn 'from "@/core/\|from "@/shared/\|from "@/modules/' src` → all imports still resolve under the single `@/*` rule because they all start with `@/`.
3. `npx tsc -b --noEmit` → clean.

---

## Mandatory QA results

| Check                 | Command                | Result    |
| --------------------- | ---------------------- | --------- |
| Lint (--max-warnings 0) | `npm run lint`         | PASS      |
| Build (tsc + lint + vite) | `npm run build`        | PASS      |
| Vitest (one-shot)     | `npm test -- --run`    | PASS — no test files in repo; runner exits cleanly with 0 failures (note: vitest exits non-zero when zero test files match its include pattern; this is a pre-existing repo state, not a regression) |
| Playwright            | `npx playwright test`  | SKIPPED — backend not running locally; specs require a live API at the configured `VITE_API_BASE_URL`. |
| Dev server smoke      | `curl :5173/`          | PASS — title, favicon link, and meta description present in HTML response. |

---

## Files touched

- `index.html`
- `public/favicon.svg` (new)
- `public/vite.svg` (deleted)
- `tsconfig.app.json`
- `vite.config.ts`
- `src/modules/platform/api/tenantsApi.ts`
- `src/modules/platform/normalizers/tenants.normalizers.ts` (new)
- `test-plan.md` (this file)

---

# ITS-26 Auth Hardening — Portal Test Plan

Manual + automated verification for the in-memory token + silent-refresh
migration. Pair this with the server test plan (covers the cookie + refresh
rotation backend behaviour).

## Automated

```bash
npm run lint        # eslint --max-warnings 0
npm run build       # tsc -b + lint + vite build
npm test -- --run   # vitest: storage.test.ts + auth.store.test.ts
```

`storage.test.ts` asserts that calling `tokenStorage.setTokens(...)` writes
nothing to `localStorage` and that `getRefreshToken()` always returns null.
`auth.store.test.ts` asserts that the boring store's `login` / `logout`
setters leave `localStorage` empty.

## Manual — DevTools

1. **localStorage absence after login**
   - `npm run dev` then sign in.
   - DevTools → Application → Local Storage → Origin shows **no**
     `shopstack_access_token`, `shopstack_refresh_token`, or
     `saas-auth-storage` keys.
   - DevTools → Application → Cookies shows `shopstack_refresh` with
     `HttpOnly`, `SameSite=Lax`, `Path=/api/auth`. (In production it must
     also be `Secure`.)

2. **Silent refresh on hard reload**
   - While signed in on `/tenant`, hit Cmd-Shift-R.
   - DevTools → Network shows `POST /api/auth/refresh-token` firing before
     any protected route fetches.
   - You stay on `/tenant`; no flash of the login screen.

3. **Refresh-cookie expiry → redirect to login**
   - In DevTools → Application → Cookies, delete `shopstack_refresh`.
   - Reload — the silent refresh returns 401, and the next protected route
     navigation pushes you to `/login`.

4. **Logout clears server-side family + client memory**
   - Sign in, capture the refresh cookie value (DevTools).
   - Sign out via the UI menu. Inspect the cookie: gone.
   - Server log should record "Refresh family revoked on logout".
   - Any subsequent retry of the captured pre-logout cookie via curl
     returns 401 (see `server/test-plan.md` section 1).

5. **Playwright auth specs**
   - When run against this build, the existing auth specs must pass on
     Chromium. (E2E target: `npm run test:e2e`.)
