# Security

Frontends are not a security boundary — the backend is — but a careless frontend hands attackers an open door. These rules are the SPA-specific subset of the OWASP Top 10 (2021) + OWASP ASVS L1, tailored for React + Vite. Treat them as table stakes.

## 1. Never `dangerouslySetInnerHTML` user content

React escapes by default. `dangerouslySetInnerHTML` opts out and is the most common XSS source in React apps.

```tsx
// ❌ NEVER
<div dangerouslySetInnerHTML={{ __html: comment.body }} />
```

If you must render rich text from the server:

- Server returns **already-sanitized** HTML (preferred), **or**
- Sanitize client-side with `DOMPurify` and a strict allowlist (anchors, lists, basic formatting only). Never trust an opt-out tag list.
- For Markdown, render through `react-markdown` with `rehype-sanitize` plugged in:
  ```tsx
  import ReactMarkdown from "react-markdown"
  import rehypeSanitize from "rehype-sanitize"
  <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{userContent}</ReactMarkdown>
  ```

The `dangerouslySetInnerHTML` API is only allowed for first-party static content (e.g. inlining a JSON-LD blob you built yourself). Every use must be reviewed.

## 2. Never `eval`, `new Function`, or `setTimeout("string")`

These execute arbitrary code. ESLint blocks them; don't disable the rule.

## 3. Tokens never live in `localStorage`

`localStorage` is readable by **any** script on the page, including injected third-party tags. XSS reads it instantly.

**Default:** the backend issues an `httpOnly; Secure; SameSite=Lax` cookie. The frontend doesn't see the token at all; axios sends the cookie automatically with `withCredentials: true`.

If a bearer-token flow is unavoidable, the token lives in **memory only** (a Zustand store **without** the `persist` middleware) and is re-acquired on reload via a silent refresh. Never `localStorage`, never `sessionStorage`.

> **Project state.** Today's `core/security/storage.ts` keeps both access and refresh tokens in `localStorage` — this is a known violation tracked in `project-rules.md`. Don't add new flows that depend on the persisted-token semantics; new auth-related changes should pull tokens from `useAuthStore.getState()`, which is the migration target.

## 4. CSRF

If we use cookie auth, the backend must enforce CSRF tokens **or** use `SameSite=Strict|Lax` with a double-submit token for state-changing requests. Frontend role: read the CSRF token from a non-`httpOnly` cookie or a `<meta>` tag and forward it on every non-GET request via the axios interceptor.

```ts
httpClient.interceptors.request.use((cfg) => {
  if (cfg.method && cfg.method.toUpperCase() !== "GET") {
    cfg.headers["X-CSRF-Token"] = readCsrfToken()
  }
  return cfg
})
```

## 5. Content Security Policy

The backend (or hosting layer, e.g. Vercel headers in `vercel.json`) must serve a CSP. Recommended starting point:

```
default-src 'self';
script-src  'self';
style-src   'self' 'unsafe-inline';
img-src     'self' data: https:;
font-src    'self' data:;
connect-src 'self' https://api.shopstack.example;
frame-ancestors 'none';
base-uri    'self';
form-action 'self';
object-src  'none';
```

Adopt `nonce`-based scripts instead of `'unsafe-inline'` for scripts. `style-src 'unsafe-inline'` is tolerated because Radix/Tailwind generate inline styles; revisit if a runtime gives us nonces.

Update `vercel.json` headers when adding a new domain — don't loosen CSP to get past a CORS error.

## 6. CORS is not security

`Access-Control-Allow-Origin` controls *browsers*, not attackers. Don't rely on it. Auth + CSRF must work in any browser environment.

## 7. Secrets and environment variables

- `VITE_*` env vars are **public** — they are baked into the client bundle and visible to anyone with DevTools.
- Anything sensitive (API keys for third-party services that bill per call, signing secrets, DB connections) **must** live on the backend.
- See `config.md` for the full env-var taxonomy.

## 8. URL encoding for path parameters (CRITICAL)

Every dynamic path segment that comes from user input or domain ids must be wrapped in `encodeURIComponent`. Forgetting it lets a `/` or `?` in the value escape the path and hit unintended routes.

```ts
// ❌ wrong — id="../admin" breaks out of the orders path
const { data } = await httpClient.get(`/orders/${id}`)

// ✅ correct
const { data } = await httpClient.get(`/orders/${encodeURIComponent(id)}`)

// ✅ multi-segment
const { data } = await httpClient.get(
  `/tenants/${encodeURIComponent(tenantId)}/orders/${encodeURIComponent(orderId)}`
)
```

Query strings: pass via the `params` object — axios handles encoding. Never concatenate.

```ts
// ✅
await httpClient.get("/orders", { params: { q, cursor } })

// ❌
await httpClient.get(`/orders?q=${q}&cursor=${cursor}`)
```

## 9. URL validation (open redirects, javascript: scheme)

Never blindly redirect to a URL from a query parameter:

```tsx
// ❌ open redirect → phishing vector
const next = new URLSearchParams(location.search).get("next")
window.location.href = next!

// ✅ allowlist
const ALLOWED_REDIRECTS = ["/", "/tenant", "/tenant/pos/sell"]
const next = ALLOWED_REDIRECTS.includes(rawNext ?? "") ? rawNext : "/"
```

For URLs that *should* be open (e.g. user-supplied external links rendered as anchors), validate the protocol:

```ts
// shared/utils/safe-url.ts
export function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}

export function safeHostname(value: unknown): string | null {
  if (typeof value !== "string") return null
  if (!isSafeHttpUrl(value)) return null
  try {
    const url = new URL(value)
    return url.port ? `${url.hostname}:${url.port}` : url.hostname
  } catch {
    return null
  }
}
```

A `URL` whose `protocol` is not `http(s):` may be `javascript:`, `data:`, `vbscript:`, or `file:` — every one of those is an XSS or info-leak vector when rendered as `<a href>` or passed to `window.open`.

For external links, always: `rel="noopener noreferrer"` and (usually) `target="_blank"`.

## 10. Validate router `location.state` and search params

React Router's `location.state` is **arbitrary client-supplied data** (forged by hand-editing history, or a phishing URL builds a fake state via `history.pushState`). Treat it like any other untrusted input: validate before use, prefer zod schemas.

```ts
const NavigationStateSchema = z.object({
  returnTo: z.string()
    .refine((s) => s.startsWith("/") && !s.startsWith("//"), "Must be a relative path"),
  productId: z.string().regex(/^[a-z0-9_-]+$/i, "Invalid id"),
}).strict()

const result = NavigationStateSchema.safeParse(location.state)
const safeState = result.success ? result.data : { returnTo: "/", productId: "" }
```

For search params, the same rule: parse, narrow, default. `useSearchParams()` returns strings — never assume more.

## 11. Input length and shape limits

Every text input that hits the network or appears in the URL has a maximum length validated client-side (for UX) **and** backend-side (for security). The frontend hint is a sanitizer + a `maxLength` on the input + a zod `.max(N)` on the schema. Don't ship unbounded `<input>`s.

```ts
const SearchSchema = z.string().trim().max(200)
const SkuSchema = z.string().regex(/^[A-Z0-9_-]+$/, "Invalid SKU").max(50)
```

## 12. Reserved names

Identifiers that the system uses internally (`admin`, `root`, `system`, `default`, `all`, `null`, `undefined`, `none`) must not be acceptable as user-chosen names for stores, tenants, usernames, etc. Reject at the form level **and** the backend.

```ts
const RESERVED = new Set(["admin", "root", "system", "default", "all", "null", "undefined", "none"])

const TenantSlugSchema = z.string()
  .trim()
  .toLowerCase()
  .min(2)
  .max(40)
  .regex(/^[a-z0-9-]+$/, "Letters, numbers, and hyphens only")
  .refine((s) => !RESERVED.has(s), "This name is reserved")
```

## 13. File uploads

- Validate MIME and extension client-side **for UX**. The server **must** re-validate.
- Cap file size in the input (`accept`, plus a JS pre-check) and surface a helpful error.
- Don't render uploaded HTML/SVG inline — SVG is a script vector.

## 14. Logging and error messages

Never display:

- API stack traces
- Internal IDs that aren't already in the URL
- The raw user input that triggered the error (XSS bait)
- Tokens, even partially redacted

See `logging.md` for what `console` may carry and what it must not.

## 15. Dependency hygiene

- `npm audit --omit=dev` is part of CI; high/critical vulnerabilities block merge.
- Don't add a dependency you can replace with ~20 lines of code (every dep is a supply-chain risk).
- Pin the major version in `package.json`; resolve transitively via `package-lock.json`. Commit the lockfile.

## 16. Build artifacts

- Source maps are uploaded to the error monitor (private) and **not** served publicly in prod.
- The `dist/` folder is `.gitignore`d. Verify before pushing.
- `console.log` in shipped code leaks information — strip in build (configured in `vite.config.ts`).

## 17. Forms

- All forms validate with **zod** schemas (see `validation.md`).
- All POST/PUT/DELETE endpoints require CSRF (item 4).
- Rate-limit sensitive actions (login, password reset) on the backend; surface clear UX when limited.
- Don't disable paste on password fields — it blocks password managers.

## 18. iframe and third-party

- Don't embed third-party iframes that aren't explicitly trusted; if you do, use the `sandbox` attribute.
- `frame-ancestors 'none'` (item 5) prevents *us* being framed (clickjacking).

## 19. Sensitive UI

For destructive or sensitive actions:

- Require confirmation (a typed-in word or a checkbox + button).
- Don't optimistically update state.
- Disable on submission to prevent double-fires.
- Don't return a delete handler from the `vm` without a guard.

## 20. Multi-tenant data isolation

Every tenant-scoped query and mutation includes `activeTenantId` in the request and in the query key (see `service-patterns.md`). Verify on the backend too — frontend isolation is UX, not security.

The auth store's `activeTenantId` is the only source of truth. Never read it from the URL alone — a forged URL with a tenant id you don't own will reach the API; the API rejects it, but the user sees a confusing error. Gate at the route guard.

## Pre-merge checklist

- [ ] No `dangerouslySetInnerHTML` with non-static content
- [ ] No tokens in `localStorage` for new code (existing migration tracked)
- [ ] Every external `<a>` has `rel="noopener noreferrer"`
- [ ] Every dynamic path segment goes through `encodeURIComponent`
- [ ] User input that becomes part of a URL is validated against an allowlist
- [ ] `location.state` and search params are zod-parsed before use
- [ ] No `VITE_*` env var holds a real secret
- [ ] No `console.log` of tokens, PII, or full API responses
- [ ] CSP unchanged or change reviewed by a second pair of eyes

## See also

- `config.md` — env-var rules
- `error-handling.md` — what users may and may not see
- `logging.md` — what may be logged
- `service-patterns.md` — interceptor patterns for auth + CSRF
- `validation.md` — zod schemas for input validation
- `project-rules.md` — known-debt list (token storage)
