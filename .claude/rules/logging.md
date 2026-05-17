# Logging

Logs are for **operators and developers**, not users. The browser console is a developer tool. The error monitor (Sentry / Bugsnag / etc.) is an operator tool. Users get toasts and inline messages, never logs.

## The logger

There is exactly one logger, in `lib/logger.ts`. Don't call `console.*` directly from feature code.

```ts
// lib/logger.ts
type Level = "debug" | "info" | "warn" | "error"

const enabled: Record<Level, boolean> = {
  debug: import.meta.env.DEV,
  info:  import.meta.env.DEV,
  warn:  true,
  error: true,
}

export const logger = {
  debug: (msg: string, ctx?: object) => enabled.debug && console.debug(format(msg, ctx)),
  info:  (msg: string, ctx?: object) => enabled.info  && console.info(format(msg, ctx)),
  warn:  (msg: string, ctx?: object) => { if (enabled.warn) console.warn(format(msg, ctx)) },
  error: (msg: string, ctx?: object) => {
    if (enabled.error) console.error(format(msg, ctx))
    reportToMonitor(msg, ctx)
  },
}

function format(msg: string, ctx?: object) {
  return ctx ? `${msg} ${JSON.stringify(ctx)}` : msg
}
```

Treat `lib/logger.ts` as the spec — adjust to match the chosen error monitor (`Sentry.captureException`, `Bugsnag.notify`, etc.).

## Levels — what each one means

| Level | When | Reaches |
|---|---|---|
| `debug` | Tracing flow during development | Browser console (dev only) |
| `info` | Notable but routine events | Browser console (dev only) |
| `warn` | Something unusual; user-recoverable; we want to know | Browser console (always) + monitor |
| `error` | Bug, broken contract, lost data | Browser console (always) + monitor |

If you're unsure between `info` and `warn` — pick `info` unless the situation is **unexpected**.

## What goes in `ctx`

A small, flat object of breadcrumbs:

```ts
logger.warn("payment retry exceeded", {
  orderId: order.id,
  attempt: 3,
  reason: "card_declined",
})
```

Do **not** spread an entire API response. Pick the 3–6 fields that actually help diagnose.

## What never goes in logs

- ❌ Auth tokens, refresh tokens, session IDs (even partial)
- ❌ Passwords, even hashed
- ❌ Full credit-card or bank-account numbers (PCI scope)
- ❌ Government IDs, full names + DOB pairs, full addresses (PII)
- ❌ The full response body of an API call (often contains all of the above)
- ❌ The full event from a form submission (contains user input)

If a value is sensitive, log a stable opaque identifier instead (a hashed id, an order number, an email's domain only). When in doubt, **don't log it**.

## `console.log` is for debugging only

`console.log` may not appear in committed code. ESLint warns on `no-console` with `allow: ["debug", "info", "warn", "error"]` so the `logger` paths still work.

If you reach for `console.log` while debugging, delete it before pushing. Pre-commit hooks should catch leftovers.

## Errors

`logger.error` is for unexpected failures the team needs to know about. Always include enough context to investigate without reproducing.

```ts
// ✅
try { await sync() }
catch (e) {
  logger.error("inventory sync failed", { skuCount: skus.length, cause: String(e) })
  throw e // rethrow if the caller needs it
}

// ❌
catch (e) { logger.error("error", { e }) }   // e is unstructured; "error" tells you nothing
```

`logger.error` also reports to the error monitor. Don't call `logger.error` and `Sentry.captureException` — call the logger and let it route.

## Source maps

Production source maps are uploaded to the error monitor (private), **not** served publicly. Stack traces from minified bundles are useless without them.

## Logging in tests

Tests don't `console.log`. They `expect` things. If a test logs while running clean, treat it as a warning. Vitest's `onUnhandledRequest: "error"` (MSW) and `console.error`-fails-the-test setup catches most of these.

## Performance

Logs are cheap until they're not. Don't log on a hot path (every keystroke, every frame). Don't `JSON.stringify` a deep object on every render.

If a path is hot enough to need conditional logging, gate it behind a debug-flag:

```ts
const VERBOSE = import.meta.env.VITE_DEBUG_CART === "true"
if (VERBOSE) logger.debug("cart recompute", { itemCount })
```

## Don't

- Don't log to remote services from the browser unless the monitor is configured to receive it (CORS, schema).
- Don't log on every successful request — the network tab already shows that.
- Don't log to `console.error` for expected user errors (`logger.warn` at most).
- Don't write a "log everything" middleware that hooks every action; logs are signal, not noise.

## See also

- `error-handling.md` — `toUserMessage` is user-facing, logger is operator-facing
- `security.md` — what must never appear in logs
- `service-patterns.md` — axios interceptor is a fine place to log network failures
