# Project Rules — ShopStack Portal

This directory is the source of truth for how code is written, reviewed, tested, and shipped in ShopStack Portal. Every rule here is **mandatory** unless a file explicitly marks an exception. When two rules appear to conflict, the more specific one wins (e.g. `react-patterns.md` over `coding.md`).

## Stack

- React 19, TypeScript 5.9 (strict), Vite 7
- Zustand 5 for client state, TanStack Query 5 for server state
- Radix UI primitives, Tailwind CSS 4, class-variance-authority, lucide-react
- react-hook-form + zod for forms and validation
- axios for HTTP, react-router-dom 7 for routing
- Vitest 4 + Testing Library for unit/integration, Playwright for e2e
- ESLint 9 + typescript-eslint, `--max-warnings 0`

## How to use these rules

1. Before you write code, scan `architecture.md` and the rule files that match what you are about to touch (e.g. editing a store? read `zustand-stores.md` + `data-flow.md`).
2. When in doubt, prefer the rule that produces code that is **easier to delete**.
3. If a rule blocks legitimate work, open a PR that changes the rule first. Never silently violate one.

## Rule index

### Foundation

- [architecture.md](./architecture.md) — Layered architecture, folder layout, the one-direction data flow
- [coding.md](./coding.md) — Core coding laws (the prime directive + 20 rules)
- [typescript.md](./typescript.md) — TS strict-mode rules, types vs interfaces, narrowing
- [naming.md](./naming.md) — Files, vars, types, components, hooks, query keys

### React + state

- [react-patterns.md](./react-patterns.md) — Component patterns, hooks rules, refs, Suspense
- [zustand-stores.md](./zustand-stores.md) — Store shape, selectors, slices, middleware, persistence
- [data-flow.md](./data-flow.md) — API → normalizer → store → hook → page → component
- [service-patterns.md](./service-patterns.md) — axios + TanStack Query v5 conventions, anti-patterns
- [validation.md](./validation.md) — Zod v4 patterns, schemas, react-hook-form integration

### Quality

- [error-handling.md](./error-handling.md) — Boundaries, fail-fast in dev, fail-safe in UI
- [security.md](./security.md) — OWASP Top 10 for SPAs, secrets, XSS, CSRF, URL/state validation
- [accessibility.md](./accessibility.md) — WCAG 2.2 AA, Radix patterns, keyboard
- [performance.md](./performance.md) — Core Web Vitals, splitting, memoization
- [design-principles.md](./design-principles.md) — Visual hierarchy, tokens, motion, anti-AI-slop
- [testing.md](./testing.md) — Vitest + Testing Library, what to test, what not to
- [e2e-playwright.md](./e2e-playwright.md) — Playwright conventions, fixtures, cross-browser

### Craft

- [comments.md](./comments.md) — When (and when not) to comment
- [documentation.md](./documentation.md) — READMEs, ADRs, per-feature docs
- [logging.md](./logging.md) — Levels, what never to log, structured output
- [config.md](./config.md) — Env vars, runtime vs build-time, secret hygiene
- [vite-config.md](./vite-config.md) — Plugins, aliases, build targets, SVGR

### Process

- [pr-process.md](./pr-process.md) — Conventional Commits, PR template, review checklist

## Mandatory commands after any change

```bash
npm install
npm run lint     # eslint --max-warnings 0
npm run build    # tsc -b + vite build (lint runs inside build)
npm test         # vitest
```

Run e2e (`npm run test:e2e`) before merging anything that touches auth, checkout, or routing.

## Known debt — fix or migrate, don't extend

These are real conflicts between the rules and current code. Track separately; do not add new code that compounds them.

1. **Tokens in `localStorage`** — `src/core/security/storage.ts` stores both access and refresh tokens in `localStorage`. This directly violates `security.md` rule 3 (XSS-readable). Fix by moving to an in-memory Zustand store + silent refresh on reload. Until fixed: do not add new flows that depend on the persisted tokens; do not log the values.
2. **Screen-hook naming split (`Logic` vs `Screen`)** — Some modules have `useXLogic.ts` while others have `useXScreen.ts`, and a few modules have **both** for the same domain (e.g. `useCustomersLogic.ts` + `useCustomersScreen.ts`). Canonical going forward: `use<Name>Screen.ts`. When a module is touched, consolidate to a single Screen hook and delete the Logic file.
3. **tsconfig path-alias drift** — `tsconfig.app.json` declares `@/core/*`, `@/shared/*`, `@/modules/*`, but `vite.config.ts` only resolves `@/`. Trim `tsconfig.app.json` to the single `@/*` alias to match runtime resolution (see `vite-config.md`).
4. **`MODULE_TEMPLATE.md` mentions Redux Toolkit slices** — the doc in `docs/MODULE_TEMPLATE.md` was written for a Redux project. Reality is Zustand. Update the template before referencing it.
5. **README references `src/core`-flat layout** — minor; the actual layout matches `architecture.md` now. Bring `README.md` into sync next time it's touched.

## Sources

These rules are synthesized from: Airbnb JavaScript Style Guide, Google TypeScript Style Guide, the React team docs (Rules of Hooks, Thinking in React, Suspense, useMemo guidance), Kent C. Dodds' Testing Library Guiding Principles + Epic React patterns, OWASP Top 10 + ASVS, WCAG 2.2 + WAI-ARIA Authoring Practices, web.dev Core Web Vitals, Conventional Commits 1.0, TanStack Query best practices, Zustand author's recommendations, and the team's own ViewModel/null-safety patterns already in `.agent/rules/coding-style.md`.
