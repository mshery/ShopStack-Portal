# Error Handling

> **Fail fast in dev. Fail safe in UI.** Developers see crashes. Users see messages.

Errors have three places they can live: at the boundary (where they're created), in the screen hook (where they're translated), and in the UI (where they're rendered). They flow through those three layers only.

## The error type

A single discriminated union represents every error the app can encounter:

```ts
// lib/errors.ts
export type ApiError =
  | { kind: "network" }
  | { kind: "timeout" }
  | { kind: "validation"; issues: z.ZodIssue[] }
  | { kind: "http"; status: number; code?: string; message: string }
  | { kind: "unauthorized" }
  | { kind: "forbidden" }
  | { kind: "notFound" }
  | { kind: "conflict"; message: string }
  | { kind: "server" }
  | { kind: "unknown" }

export class AppError extends Error {
  constructor(public readonly error: ApiError, message?: string) {
    super(message ?? error.kind)
    this.name = "AppError"
  }
}

export function isAppError(e: unknown): e is AppError {
  return e instanceof AppError
}
```

This lives in `lib/errors.ts` and is imported anywhere errors are inspected.

## Boundary: `toApiError`

The axios response interceptor (`lib/http.ts`) is the single place that *creates* an `AppError`. Every other layer just rethrows or translates.

```ts
export function toApiError(error: unknown): AppError {
  if (axios.isCancel(error))                           return new AppError({ kind: "network" })
  if (axios.isAxiosError(error)) {
    if (error.code === "ECONNABORTED")                 return new AppError({ kind: "timeout" })
    if (!error.response)                               return new AppError({ kind: "network" })
    const s = error.response.status
    const body = error.response.data as { code?: string; message?: string } | undefined
    if (s === 401) return new AppError({ kind: "unauthorized" })
    if (s === 403) return new AppError({ kind: "forbidden" })
    if (s === 404) return new AppError({ kind: "notFound" })
    if (s === 409) return new AppError({ kind: "conflict", message: body?.message ?? "" })
    if (s >= 500)  return new AppError({ kind: "server" })
    return new AppError({ kind: "http", status: s, code: body?.code, message: body?.message ?? "" })
  }
  if (error instanceof z.ZodError) return new AppError({ kind: "validation", issues: error.issues })
  return new AppError({ kind: "unknown" })
}
```

## Translation: `toUserMessage`

Screen hooks (never UI, never the API layer) translate `AppError` → human-readable string.

```ts
export function toUserMessage(e: unknown): string {
  if (!isAppError(e)) return "Something went wrong. Please try again."
  switch (e.error.kind) {
    case "network":      return "You appear to be offline. Check your connection."
    case "timeout":      return "The request took too long. Please try again."
    case "unauthorized": return "Your session expired. Please sign in again."
    case "forbidden":    return "You don't have permission to do that."
    case "notFound":     return "We couldn't find what you were looking for."
    case "conflict":     return e.error.message || "That action conflicts with the current state."
    case "validation":   return "Some fields are invalid."
    case "server":       return "Our server hit a snag. We've been notified."
    case "http":         return e.error.message || `Request failed (${e.error.status}).`
    case "unknown":      return "Something went wrong. Please try again."
  }
}
```

Every string is a candidate for the i18n layer when one is introduced.

## Error boundaries

The app shell wraps the entire tree in a root error boundary. **Sections that may legitimately fail in isolation** (a chart, a recommendation widget) get their own smaller boundary so one breakage doesn't blank the page.

```tsx
// app/providers.tsx
<ErrorBoundary fallback={<AppCrashed />}>
  <QueryClientProvider client={queryClient}>
    <Suspense fallback={<AppSpinner />}>
      <RouterProvider router={router} />
    </Suspense>
  </QueryClientProvider>
</ErrorBoundary>
```

`<AppCrashed />` must:

- Show a generic apology — never an internal stack trace
- Offer a recovery action ("Reload", "Sign in again", "Go home")
- Report to error monitoring (Sentry / Bugsnag / etc.) with the original error and a breadcrumb

We use `react-error-boundary` for the implementation. Do not write your own boundary class unless you need to.

## Screen-level error states

Every async screen has an error branch — see `architecture.md` (the AsyncStatus contract):

```tsx
if (status === "error") return <ErrorState message={vm.error} onRetry={actions.refresh} />
```

`<ErrorState />` is a shared component in `components/`. The screen hook decides the message; the UI just shows it.

## Validation errors

`zod` errors at the API boundary are an internal contract bug — log them and show a generic message. **`zod` errors from `react-hook-form` are user errors** — render them on the field.

```tsx
<input aria-invalid={Boolean(errors.email)} aria-describedby="email-error" />
{errors.email && <p id="email-error" role="alert">{errors.email.message}</p>}
```

## Mutations

Mutations propagate errors back to the screen hook through the `onError` handler **and** through `mutation.error`. Use whichever is more convenient. Show user-facing errors via `react-hot-toast`:

```ts
const m = useCheckoutMutation()

const checkout = useCallback(async () => {
  try { await m.mutateAsync(payload) }
  catch (e) { toast.error(toUserMessage(e)) }
}, [m])
```

## Logging vs. throwing

| Situation | Action |
|---|---|
| Code path that should be impossible | `throw new Error("...")` with rich context — surfaces in dev, captured by Sentry in prod |
| External system misbehaved (API gave back the wrong shape) | `console.error` with context; return the empty/safe value |
| User typed something invalid | Show field error, don't log |
| Network blip | Show toast or retry; don't log |

Don't be afraid to throw inside business logic — error boundaries catch it. Be afraid to throw inside event handlers (React will not catch it; it becomes an `unhandledrejection`).

## Don't swallow errors

```ts
// ❌ WRONG
try { await save() } catch {}

// ❌ WRONG
.catch(() => null)

// ✅ CORRECT
try { await save() } catch (e) { toast.error(toUserMessage(e)) }
```

If you really want to ignore an error, write a comment explaining why and log it at `debug`.

## Don't `console.error` in production paths

Use the logger (`lib/logger.ts`, see `logging.md`). `console.error` is dev-only.

## Never display

- Stack traces
- API error codes
- Internal IDs
- Raw zod issue paths
- The literal value the user typed (XSS surface — see `security.md`)

## See also

- `service-patterns.md` — `toApiError` lives in the axios interceptor
- `logging.md` — what to log vs. what to throw
- `security.md` — what not to display
- `react-patterns.md` — error boundaries setup
