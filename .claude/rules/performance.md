# Performance

Performance is a UX feature. We measure what users feel (Core Web Vitals), not what makes us feel clever (micro-benchmarks).

## Targets (Core Web Vitals, p75)

| Metric | Target | What it means |
|---|---|---|
| **LCP** (Largest Contentful Paint) | ≤ 2.5 s | The biggest above-the-fold element renders fast |
| **INP** (Interaction to Next Paint) | ≤ 200 ms | Inputs feel snappy |
| **CLS** (Cumulative Layout Shift) | ≤ 0.1 | The layout doesn't jump |

Plus our own:

| Metric | Target | Tool |
|---|---|---|
| Initial JS (gzipped) | ≤ 200 KB | `vite build --report` / `rollup-plugin-visualizer` |
| Per-route chunk (gzipped) | ≤ 100 KB | Same |
| TTI on a mid-tier laptop, fast 3G throttle | ≤ 5 s | Lighthouse |

If a PR busts a budget, the PR explains why and links a Linear ticket to bring it back.

## Route-level code splitting

Routes are lazy-loaded. The router is the natural split point.

```tsx
// app/router.tsx
const CheckoutPage = lazy(() => import("@/pages/checkout/CheckoutPage"))
const OrdersPage   = lazy(() => import("@/pages/orders/OrdersPage"))
```

The root `<Suspense>` boundary catches them. Prefetch on hover/focus for predictable navigations (use `react-router-dom`'s preload or `import()` on link mouseenter).

## Big libraries — lazy

Charts, rich editors, drag-and-drop, and other heavy libs (`recharts`, `motion`, `cmdk` for the command palette) load on demand:

```tsx
const RevenueChart = lazy(() => import("./RevenueChart"))
```

Never `import` a chart library at the top of a list-view file.

## Memoization

See `coding.md` rule 12 and `react-patterns.md` for the full rules. Summary:

- Memoize `vm` (it's passed to children).
- Memoize `actions` (they're dependencies and props).
- Don't memoize trivial scalars.
- Don't `useMemo` to "fix" re-renders before measuring — most re-renders are free.

When in doubt, profile with the React Devtools Profiler before reaching for `memo`.

## `React.memo` — selectively

`React.memo` only helps if the parent passes stable props. Otherwise it adds overhead. Apply to:

- Rows in large tables (`@tanstack/react-table` virtualization first; `React.memo` second)
- Heavy children of frequently-updating parents

Don't blanket-`memo` every component.

## Virtualization

Lists over ~50 visible items: virtualize. `@tanstack/react-virtual` (peer of react-table) is the default. Don't render 10,000 `<tr>`s.

## Images

- Prefer modern formats (AVIF, WebP) with fallbacks.
- Always set `width` and `height` to prevent CLS.
- Above-the-fold hero images: `loading="eager"` and `fetchpriority="high"`.
- Below-the-fold: `loading="lazy"`.
- Use a CDN that resizes server-side; don't ship a 4000px image to render at 200px.

## Fonts

- Self-host fonts in `public/` or ship via the CDN.
- Use `font-display: swap` (or `optional` for non-critical) to avoid FOIT.
- Preload the primary font with `<link rel="preload">`.
- Subset to the characters you actually use.

## Forms and inputs

- Debounce search-as-you-type with `lodash.debounce` or a small custom hook (300 ms is a common sweet spot).
- Throttle scroll handlers (`requestAnimationFrame` is the cheapest throttle).
- Heavy in-input validation? Run on `blur`, not on every keystroke.

## Queries

- Set `staleTime` explicitly per query (see `service-patterns.md`). Stale-but-cached data renders instantly.
- Use `placeholderData: keepPreviousData` for paginated/searchable views — the old page renders while the next loads.
- Prefetch the next page on hover or visibility for predictable navigations.

## Avoid the waterfall

If page X needs data A and B, fire **both** queries on mount, don't await A then fetch B. TanStack Query in parallel by default; only `enabled: Boolean(a.data)` when truly dependent.

## Cumulative Layout Shift

- Reserve space for images (width/height) and async-loaded content (skeletons with the same dimensions).
- Avoid inserting elements above existing content after load (ads, cookie banners).
- Web fonts: keep fallback metrics close to the web font (Tailwind's `font-display: swap` with `size-adjust` if needed).

## INP

INP captures the longest interaction. Watch out for:

- Big synchronous state updates on `onChange`. Use `useDeferredValue` or `useTransition`.
- Long-running effects after a click. Push work off the main thread.
- Re-renders of giant trees on every keystroke. Profile, then memoize.

## Bundle hygiene

- `import { foo } from "lodash"` ❌ — pulls all of lodash. Use named submodules (`import debounce from "lodash/debounce"`) or `lodash-es` with tree-shaking, or write the 5-liner yourself.
- `date-fns` (already in our deps): pure ESM, tree-shakes. Use named imports (`import { format } from "date-fns"`).
- Check `vite build` output for chunks you don't recognize.

## When not to optimize

Premature optimization wastes time and adds complexity. Profile **first**:

1. Lighthouse on the deployed preview.
2. React Devtools Profiler on the changed screen.
3. `vite build` bundle analyzer (`npx vite-bundle-visualizer`).

Then optimize the biggest, ugliest number. Don't tune what doesn't show up.

## See also

- `react-patterns.md` — memoization rules
- `service-patterns.md` — query tuning
- `vite-config.md` — build configuration
- `accessibility.md` — `prefers-reduced-motion`
