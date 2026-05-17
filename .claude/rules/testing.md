# Testing

We follow the **Testing Trophy** (Kent C. Dodds): a small base of static checks (TS + ESLint), a larger base of unit tests, the **bulk in integration**, and a thin cap of e2e. The bulk-in-integration shape matters: integration tests catch real bugs and rarely break on refactors.

## Tools

- **Vitest 4** — unit + integration runner
- **@testing-library/react** — render + queries
- **@testing-library/user-event** — realistic interactions (always prefer over `fireEvent`)
- **@testing-library/jest-dom** — better matchers
- **jsdom** — DOM environment
- **MSW** (recommended) — HTTP mocking at the network layer

Run:

```bash
npm test                # watch
npm run test:coverage   # CI
```

## The guiding principle

> **The more your tests resemble the way your software is used, the more confidence they give you.** — Kent C. Dodds

This is the single rule that overrides every other rule on this page. If a rule below conflicts with "test like a user", the user wins.

## Query priority (mandatory)

Use Testing Library queries **in this order of preference**:

1. `getByRole(...)` — by default
2. `getByLabelText(...)` — for form fields
3. `getByPlaceholderText(...)` — fallback for inputs
4. `getByText(...)` — for non-interactive content
5. `getByDisplayValue(...)` — for filled inputs
6. `getByAltText(...)` — for images
7. `getByTitle(...)` — last resort
8. `getByTestId(...)` — only when nothing above works

**Never** query by class name or DOM structure. If `getByRole` doesn't find your component, the component is inaccessible — fix the component, not the test.

## What to test (and what not to)

| Test it | Don't test it |
|---|---|
| User-visible behavior (button click → state change) | Implementation details (which state lib, which hook called) |
| Public API of a hook (`useCheckoutScreen` outputs) | Private helpers a hook calls |
| Form validation paths | The zod schema itself (zod tests itself) |
| Error states (broken API → message) | Loading spinners (low-value, brittle) |
| Conditional rendering of features | Style classes |

## Integration test (the workhorse)

This is the shape ~70 % of our tests should take.

```tsx
// pages/checkout/CheckoutPage.test.tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { CheckoutPage } from "./CheckoutPage"
import { renderWithProviders } from "@/test/render"

test("user can complete checkout", async () => {
  const user = userEvent.setup()
  renderWithProviders(<CheckoutPage />, { initialCart: [item("a", 2), item("b", 1)] })

  expect(await screen.findByRole("heading", { name: /checkout/i })).toBeInTheDocument()

  await user.click(screen.getByRole("button", { name: /place order/i }))

  expect(await screen.findByText(/order confirmed/i)).toBeInTheDocument()
})
```

`renderWithProviders` (in `src/test/render.tsx`) wraps with the real `QueryClientProvider`, router, and Toaster. **Don't mock providers** — use the real thing.

## Mocking HTTP

Use **MSW** to intercept at the network layer. Don't mock axios, don't mock the `*.api.ts` module, don't mock TanStack Query. The test exercises the full stack except the network.

```ts
// src/test/server.ts
import { setupServer } from "msw/node"
import { http, HttpResponse } from "msw"

export const handlers = [
  http.get("/api/products", () => HttpResponse.json({ items: [], nextCursor: null })),
]
export const server = setupServer(...handlers)
```

In `src/test/setup.ts`:

```ts
beforeAll(() => server.listen({ onUnhandledRequest: "error" }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

`onUnhandledRequest: "error"` is non-negotiable — surprise network calls fail loudly.

## Unit tests — narrowly

Unit tests are for pure logic: formatters, normalizers, type guards, reducer/setter behavior. They're fast and stable.

```ts
import { parseOrder } from "./orders.normalizers"

test("parseOrder fills missing items with []", () => {
  const out = parseOrder({ id: "o1", customerId: "u1", totalCents: 0, status: "pending" })
  expect(out.items).toEqual([])
})
```

Stores are plain functions; test them as units (see `zustand-stores.md`).

## Hook tests — only when you can't reach the hook through a page

Sometimes a hook is shared across screens and worth testing in isolation. Use `renderHook`:

```ts
import { renderHook, waitFor } from "@testing-library/react"
import { useCheckoutScreen } from "./useCheckoutScreen"

test("status is empty when cart is empty", async () => {
  const { result } = renderHook(() => useCheckoutScreen(), { wrapper: TestProviders })
  await waitFor(() => expect(result.current.status).toBe("empty"))
})
```

If you can test the same behavior through the page, prefer the page test.

## Async — `findBy*`, `waitFor`, never `setTimeout`

```ts
// ✅
expect(await screen.findByRole("alert")).toBeInTheDocument()

// ❌
await new Promise(r => setTimeout(r, 100))
expect(screen.getByRole("alert")).toBeInTheDocument()
```

`findBy*` retries until the element appears or 1 s passes. `waitFor` polls an assertion. Neither blocks on an arbitrary timer.

## `userEvent` over `fireEvent`

`userEvent` simulates real interactions (focus, blur, keyboard sequences, accessibility tree updates). `fireEvent.click` skips all of that.

```ts
const user = userEvent.setup()
await user.click(button)         // ✅
await user.type(input, "hello")  // ✅
fireEvent.click(button)          // ❌ except for edge cases
```

## Accessibility tests

Render the changed page through `axe`:

```ts
import { axe, toHaveNoViolations } from "vitest-axe"
expect.extend({ toHaveNoViolations })

test("page has no a11y violations", async () => {
  const { container } = renderWithProviders(<CheckoutPage />)
  expect(await axe(container)).toHaveNoViolations()
})
```

## Coverage

We don't chase a coverage number. We chase **confidence**. That said: if a screen has zero tests, it's not done.

- Aim for every page hook to have at least one happy-path test and one error-path test.
- Every shared component in `components/` has at least one render test.
- Stores have unit tests for every setter.

## What to put in `src/test/`

- `setup.ts` — Vitest setup, MSW init, `@testing-library/jest-dom`
- `render.tsx` — the `renderWithProviders` helper
- `server.ts` — MSW server + handlers
- `factories.ts` — small data factories for tests (`makeUser({})`, `makeOrder({})`)

Factories accept a partial override and fill defaults. Don't import production schemas as defaults — keep test data explicit.

## Vitest config

Already set in `vitest.config.ts`. Key settings to keep:

- `environment: "jsdom"`
- `globals: false` (we import `test`, `expect`, etc. — explicit > implicit)
- `setupFiles: ["./src/test/setup.ts"]`
- `coverage.provider: "v8"`

## Don't

- Don't snapshot test components. They rot. Test behavior.
- Don't `console.log` in tests left after debugging — strip them.
- Don't mock React or React Router. Mock the network.
- Don't share state between tests. `beforeEach` resets.

## See also

- `e2e-playwright.md` — the e2e tip of the trophy
- `react-patterns.md` — testable component shapes
- `service-patterns.md` — what MSW intercepts
- `accessibility.md` — axe usage
