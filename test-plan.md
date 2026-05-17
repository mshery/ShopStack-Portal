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
