# E2E (Playwright)

E2E is the **tip** of the testing trophy. Treat it like dynamite: pick a small number of critical paths, make them rock-solid, run them before merge. If your e2e suite has 200 tests, you've already lost.

## Tools

- **Playwright 1.57**, configured in `playwright.config.ts`
- Default project: **Chromium**. Firefox / WebKit / mobile run in the CI matrix for critical paths.
- `npm run test:e2e` — headless
- `npm run test:e2e:ui` — debug with the inspector
- `@axe-core/playwright` — accessibility checks on every critical page (see `accessibility.md`)

## Which paths get e2e tests

Only the paths that **must** work for the product to function:

1. Auth (sign in, sign out, session expiry)
2. POS checkout (the existing `pos-checkout.spec.ts` — the money path)
3. Tenant onboarding / switching (multi-tenant integrity)
4. Anything else where a regression is a P0

Everything else lives in Vitest + Testing Library integration tests. Don't write an e2e for a form field.

## Locator priority

Same priority as Testing Library. **Always** prefer accessibility-first locators.

```ts
page.getByRole("button", { name: /place order/i })   // ✅
page.getByLabel("Email")                              // ✅
page.getByPlaceholder("Search products…")             // ✅
page.getByText(/order confirmed/i)                    // ✅
page.getByTestId("checkout-submit")                   // ⚠ last resort
page.locator(".btn-primary")                          // ❌ never
page.locator("//button[1]")                           // ❌ never
```

If your test needs a CSS or XPath selector, the page is inaccessible — fix the page.

## Auto-waiting (don't `waitForTimeout`)

Playwright **auto-waits** for actionability. Use it.

```ts
// ✅
await page.getByRole("button", { name: "Save" }).click()
await expect(page.getByText("Saved")).toBeVisible()

// ❌
await page.waitForTimeout(2000)
```

`waitForTimeout` is banned in committed tests. It's only for local debugging.

## Web-first assertions

Use `expect(locator).toX()` — they auto-retry until the assertion passes or times out.

```ts
await expect(page.getByRole("alert")).toContainText(/saved/i)
await expect(page).toHaveURL(/\/orders\/\w+/)
await expect(locator).toBeVisible()
await expect(locator).toBeEnabled()
await expect(locator).toHaveAttribute("aria-invalid", "true")
```

Don't `expect(await locator.textContent()).toBe(...)` — that takes a snapshot once and flakes when the UI hasn't settled.

## Configuration

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: process.env.CI
    ? [["html"], ["junit", { outputFile: "test-results/junit.xml" }]]
    : [["html"]],

  use: {
    baseURL: process.env.BASE_URL || "http://localhost:4173",  // preview, not dev
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },

  projects: [
    { name: "setup", testMatch: /global\.setup\.ts/ },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], storageState: "e2e/.auth/user.json" },
      dependencies: ["setup"],
    },
    // CI matrix — comment in for cross-browser runs
    // { name: "firefox", use: { ...devices["Desktop Firefox"], storageState: "e2e/.auth/user.json" }, dependencies: ["setup"] },
    // { name: "webkit",  use: { ...devices["Desktop Safari"],  storageState: "e2e/.auth/user.json" }, dependencies: ["setup"] },
    // { name: "mobile-chrome", use: { ...devices["Pixel 5"],   storageState: "e2e/.auth/user.json" }, dependencies: ["setup"] },
  ],

  webServer: {
    command: "npm run preview",       // not dev — see "CI" below
    url: "http://localhost:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

## Auth fixture (the storage-state pattern)

Set up authenticated state **once** in `global.setup.ts` and reuse across tests. Dramatically faster than logging in per test.

```ts
// e2e/global.setup.ts
import { test as setup, expect } from "@playwright/test"

const AUTH_FILE = "e2e/.auth/user.json"

setup("authenticate", async ({ page }) => {
  await page.goto("/login")
  await page.getByLabel("Email").fill(process.env.E2E_USER_EMAIL!)
  await page.getByLabel("Password").fill(process.env.E2E_USER_PASSWORD!)
  await page.getByRole("button", { name: /sign in/i }).click()
  await expect(page).toHaveURL(/\/tenant/)
  await page.context().storageState({ path: AUTH_FILE })
})
```

- `e2e/.auth/` is `.gitignore`d.
- Credentials come from env (set in `.env.local` for dev, CI secrets in CI).
- Add a second setup project for any other role (cashier, super-admin) and assign it to a separate `storageState` file + `projects` entry.

## Custom fixtures (with Page Object)

Encapsulate page interactions in a small POM and expose them as a fixture:

```ts
// e2e/pages/CheckoutPage.ts
import type { Page, Locator } from "@playwright/test"
import { expect } from "@playwright/test"

export class CheckoutPage {
  readonly page: Page
  readonly placeOrderButton: Locator
  readonly orderConfirmedText: Locator

  constructor(page: Page) {
    this.page = page
    this.placeOrderButton = page.getByRole("button", { name: /place order/i })
    this.orderConfirmedText = page.getByText(/order confirmed/i)
  }

  goto = () => this.page.goto("/tenant/pos/sell")
  placeOrder = () => this.placeOrderButton.click()
  expectConfirmed = () => expect(this.orderConfirmedText).toBeVisible()
}
```

```ts
// e2e/fixtures/checkout.fixture.ts
import { test as base } from "@playwright/test"
import { CheckoutPage } from "../pages/CheckoutPage"

type Fixtures = {
  checkoutPage: CheckoutPage
}

export const test = base.extend<Fixtures>({
  checkoutPage: async ({ page }, use) => {
    const checkout = new CheckoutPage(page)
    await checkout.goto()
    await use(checkout)
  },
})

export { expect } from "@playwright/test"
```

```ts
// e2e/pos-checkout.spec.ts
import { test, expect } from "./fixtures/checkout.fixture"

test("user can complete checkout", async ({ checkoutPage }) => {
  await checkoutPage.placeOrder()
  await checkoutPage.expectConfirmed()
})
```

POM rules:

- One class per page.
- Methods are actions or assertions. Raw `Locator`s don't escape.
- Resist deep engineering — it's glue, not framework.

## API testing alongside E2E

Playwright's `request` context can hit the backend directly. Use it for **setup/cleanup** and **API regression** that doesn't need a browser:

```ts
import { test, expect } from "@playwright/test"

test.describe("API: tenants", () => {
  test("admin can list tenants", async ({ request }) => {
    const response = await request.get("/api/platform/tenants", {
      headers: { Authorization: `Bearer ${process.env.E2E_ADMIN_TOKEN}` },
    })
    expect(response.ok()).toBeTruthy()
    const body = await response.json()
    expect(body.items).toBeInstanceOf(Array)
  })
})

// Setup data for a UI test
test.beforeEach(async ({ request }) => {
  await request.post("/api/test/seed", {
    data: { tenantId: "test-tenant", products: [...] },
  })
})

test.afterEach(async ({ request }) => {
  await request.delete("/api/test/cleanup/test-tenant")
})
```

The test seed endpoints must be **off in production** (CI/preview only, gated behind an env flag on the backend).

## Network mocking — sparingly

Playwright can `page.route(...)` to mock responses. Useful for:

- Forcing an error state that's hard to reproduce
- Testing offline behavior
- Slow-response UX checks

```ts
test("checkout shows a server-error message when payment service is down", async ({ page }) => {
  await page.route("**/api/cart/checkout", (route) =>
    route.fulfill({ status: 500, body: JSON.stringify({ message: "Server error" }) })
  )
  await page.goto("/tenant/pos/sell")
  await page.getByRole("button", { name: /place order/i }).click()
  await expect(page.getByRole("alert")).toContainText(/server hit a snag/i)
})
```

Don't mock the entire backend. E2E's value is testing the **integration**. If you find yourself mocking five routes, you wrote a Vitest test in a Playwright costume.

## Test data isolation

Each test owns its data. Two strategies:

1. **Test API** — call a server endpoint to seed/cleanup (allowed only on staging/preview).
2. **Random suffixes** — generate unique names per test so concurrent runs don't collide.

Don't depend on a shared "test user" with hand-curated data — it breaks.

## Accessibility e2e

Add `@axe-core/playwright` to the critical paths:

```ts
import AxeBuilder from "@axe-core/playwright"

test("checkout page has no a11y violations", async ({ page }) => {
  await page.goto("/tenant/pos/sell")
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze()
  expect(results.violations).toEqual([])
})
```

Run on every critical path. Per `accessibility.md`, fix the page, not the test.

## Keyboard and mobile flows

For critical interactions, exercise keyboard navigation:

```ts
test("user can complete checkout with the keyboard alone", async ({ page }) => {
  await page.goto("/tenant/pos/sell")
  await page.keyboard.press("Tab")
  await expect(page.getByLabel("Product search")).toBeFocused()
  // ...
})
```

For mobile flows, use a separate project with `devices['Pixel 5']` (see config above) rather than `setViewportSize` inside the test — projects keep the configuration in one place.

## Screenshots, video, trace

```ts
use: {
  trace: "retain-on-failure",
  screenshot: "only-on-failure",
  video: "retain-on-failure",
}
```

Don't commit screenshots. Don't write `toMatchSnapshot()` for full pages — visual regression tests are flaky, platform-specific, and add review burden out of proportion to their value. If you need to check a specific visual state, assert on the DOM (a class, an aria attribute, computed style via `evaluate`), not pixels.

## Parallelism + flake hygiene

- Tests run in parallel by default. They must be **fully independent**.
- Flaky tests are bugs. If a test fails 1 in 50 runs, fix it or delete it. Don't `test.retry`.
- `test.skip(reason)` requires a Linear ticket in the reason string.

## CI

Run against the **preview** build (`npm run preview`) — not `vite dev`. Dev mode behaves differently (HMR, source maps, no minification, slower hydration). The Playwright `webServer` config already enforces this.

Upload `playwright-report/` and `test-results/` as CI artifacts on failure. Traces are gold for debugging — open with `npx playwright show-trace`.

## Debugging

```bash
npx playwright test --headed                       # see the browser
npx playwright test --ui                           # interactive runner
npx playwright test path/to/test.spec.ts --debug   # step through
npx playwright codegen http://localhost:5173       # generate a test by clicking
npx playwright show-trace test-results/.../trace.zip
```

Inside a test, `await page.pause()` opens the inspector — remove before committing.

## Don't

- Don't write a Playwright test for what a Vitest integration test can cover.
- Don't share state between tests via files or globals.
- Don't hardcode timeouts. Use auto-waiting assertions.
- Don't query by CSS class or DOM index.
- Don't `console.log` in committed tests.
- Don't snapshot-test full pages.
- Don't commit `.auth/` or real credentials.

## See also

- `testing.md` — when to choose Vitest vs Playwright
- `accessibility.md` — axe rules carry over
- `security.md` — never commit real credentials or `.auth/` JSON
- `pr-process.md` — when e2e is required to merge (auth, checkout, routing)
