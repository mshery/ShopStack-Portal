# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Project rules and standards are organized by topic in `.claude/rules/`. This file adds essential commands and architecture context.

## Essential Commands

```bash
# Install / update deps
npm install

# Dev / build / preview
npm run dev                  # Vite dev server on :5173
npm run build                # tsc -b + npm run lint + vite build (lint is non-bypassable)
npm run preview              # serve production build on :4173

# Lint (must pass with zero warnings — runs inside `build`)
npm run lint                 # eslint --max-warnings 0

# Unit / integration tests (Vitest)
npm test                     # watch mode
npm run test:ui              # browser UI
npm run test:coverage        # one-shot + v8 coverage
npm test -- path/to/file.test.ts          # single file
npm test -- -t "test name"                # filter by name

# E2E tests (Playwright)
npm run test:e2e             # headless
npm run test:e2e:ui          # inspector
npx playwright test e2e/<spec>.spec.ts --debug   # single spec, debug mode
```

After any change, run `npm run lint && npm run build && npm test`. Run `npm run test:e2e` before merging anything that touches auth, checkout, or routing.

## Architecture Overview

**ShopStack Portal** is a multi-tenant Point-of-Sale and Business Management SaaS frontend (React 19, TypeScript strict, Vite 7). Three access levels: **Platform** (super-admin manages tenants), **Tenant Owner** (full features), **Cashier** (POS only). Roles + permissions live in [src/core/security/rbac.config.ts](src/core/security/rbac.config.ts).

### Layer Map

```
src/
├── app/                    # App.tsx, providers, contexts (Theme, Sidebar)
├── core/                   # cross-cutting infra
│   ├── api/                # single axios httpClient + single TanStack QueryClient
│   ├── config/             # env, endpoints
│   ├── routing/            # router + guards (Auth, TenantStatus) + layouts
│   └── security/           # rbac.config, permissions, token storage
├── shared/                 # domain-agnostic primitives (UI, hooks, utils, types, icons)
├── modules/{domain}/       # 13 feature modules — every module has this shape:
│   ├── api/                # raw axios calls (return unknown)
│   ├── normalizers/        # zod parsing (optional)
│   ├── queries/            # TanStack Query + key factories (optional)
│   ├── store/              # Zustand stores
│   ├── hooks/              # screen hooks: use<Name>Screen.ts
│   ├── pages/              # route components: <Name>Page.tsx
│   ├── components/         # module-private dumb components
│   ├── types/              # zod schemas + inferred types
│   └── index.ts            # PUBLIC API — the only legal cross-module entry
├── data/                   # seed.json + initializeStores() runs synchronously at boot
├── styles/                 # globals.css with Tailwind v4 @theme tokens
└── test/                   # Vitest setup, MSW server, render helpers
```

The 13 modules: `auth`, `platform`, `tenant`, `products`, `catalog`, `customers`, `vendors`, `purchases`, `inventory`, `expenses`, `pos`, `billing`, `reports`.

### Key Architectural Patterns

- **Layered + domain-modular**: data flows in one direction — `API → Normalizer (zod) → Store / TanStack Query → Screen Hook → Page → Component`. Reverse arrows are bugs.
- **Module public-API rule**: cross-module imports go through `@/modules/<domain>` (the `index.ts`). Never reach into `@/modules/<domain>/store/...` from another module.
- **Screen-hook pattern (mandatory)**: every page is three files — `<Name>Page.tsx` (layout, branches on `status`), `use<Name>Screen.ts` (the brain, returns `{ status, vm, actions }`), `components/` (dumb). `AsyncStatus = "loading" | "error" | "empty" | "success"` — every async screen handles all four.
- **State split**: TanStack Query owns **server state**; Zustand owns **client state**. Never duplicate one into the other. Zustand stores are "boring" — state + setters only, no async, no derivation.
- **Boundary parsing**: all untrusted input (API responses, forms, env vars, search params, `location.state`) is parsed with zod schemas. After parse, downstream code never asks "is this null?" for required fields.
- **Multi-tenant scoping**: tenant-scoped queries require `activeTenantId` from `useAuthStore`, included in query keys for per-tenant cache invalidation. `core/routing/guards/` (`AuthGuard`, `TenantStatusGuard`, `RootRedirect`) enforce access at the route level.
- **Single instances**: one axios `httpClient` at [src/core/api/httpClient.ts](src/core/api/httpClient.ts), one `QueryClient` at [src/core/api/queryClient.ts](src/core/api/queryClient.ts). No per-module clients.
- **Single path alias**: `@/` → `src/`. The Vite + TS configs both resolve only `@/` — don't add subpath aliases.
- **Tailwind v4 + Radix**: design tokens live in `src/styles/globals.css` under `@theme`. Reference tokens by name (`bg-primary`, `text-foreground`), never raw Tailwind colors. Components wrap Radix primitives with `class-variance-authority` (cva) variants; combine classes with the `cn()` helper.
- **TypeScript strict**: `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, `any` banned (use `unknown` + zod or type guards). No `@ts-ignore` budget.

## Rules

Keep this list in sync whenever `.claude/rules/` files are added, renamed, or removed.

@.claude/rules/project-rules.md
@.claude/rules/architecture.md
@.claude/rules/coding.md
@.claude/rules/typescript.md
@.claude/rules/naming.md
@.claude/rules/comments.md
@.claude/rules/react-patterns.md
@.claude/rules/zustand-stores.md
@.claude/rules/data-flow.md
@.claude/rules/service-patterns.md
@.claude/rules/validation.md
@.claude/rules/error-handling.md
@.claude/rules/security.md
@.claude/rules/accessibility.md
@.claude/rules/performance.md
@.claude/rules/design-principles.md
@.claude/rules/testing.md
@.claude/rules/e2e-playwright.md
@.claude/rules/logging.md
@.claude/rules/config.md
@.claude/rules/vite-config.md
@.claude/rules/documentation.md
@.claude/rules/pr-process.md

## Skills

Keep this list in sync whenever `.claude/skills/` folders are added, renamed, or removed.

> ShopStack is **two repos** (`ShopStack-Server` + `ShopStack-Portal`), not a monorepo. Most skills below were adapted from a single-monorepo source; many "the primary repo" mentions default to `ShopStack-Portal`. When the ticket clearly touches the API surface, point the skill at `ShopStack-Server` instead.

### Orchestrators (drive multi-step delivery)

- `.claude/skills/dev-pipeline/` — End-to-end feature delivery pipeline. Reads codebase → files tickets → worktrees → parallel agents → merge → browser QA → mark Done.
- `.claude/skills/shopstack-ship-it/` — Pick the next ticket via `shopstack-linear-manager`, create a worktree, implement logic, design UI, stitch, run browser QA, open the PR, move Linear to In Review.
- `.claude/skills/shopstack-ship-module/` — Module-wide shipping orchestrator. Given a Linear project (POS / Reports / Inventory / Purchases), builds a dependency-aware phase plan and runs lane-based parallel agents.
- `.claude/skills/shopstack-autopilot/` — Autonomous AI engineer that runs the full ticket pipeline end-to-end with self-problem-solving and self-learning via a `lessons.jsonl` file. Use for overnight / hands-off runs.

### Ticket lifecycle (Linear)

- `.claude/skills/linear-ticket/` — Files structured Linear tickets (parent + sub-tickets) from any feature idea.
- `.claude/skills/shopstack-ticket-shaper/` — Turns a one-line description into a fully-shaped Linear ticket (module, lane, priority, label, acceptance criteria).
- `.claude/skills/shopstack-linear-manager/` — Full ticket lifecycle in Linear (create, edit, transition state, comment, attach PRs, pick the next ticket).
- `.claude/skills/shopstack-ticket-status/` — Composite status report for one ticket: Linear state + open PR + CI/mergeable + worktree state + dependencies.
- `.claude/skills/shopstack-eod-report/` — Casual end-of-day status update: mshery's PRs merged today (DONE), still open (InReview), and any blockers.
- `.claude/skills/shopstack-module-status/` — Live module-status dashboard file for a `shopstack-ship-module` run; single source of truth that survives interruption.

### Implementation

- `.claude/skills/shopstack-code-developer/` — Implement the logic / API / data layer for a ticket inside its worktree. No UI in this step.
- `.claude/skills/shopstack-ui-designer/` — Design and produce the UI for a ticket using ShopStack's Radix + Tailwind v4 design tokens (see `.claude/rules/design-principles.md`).
- `.claude/skills/shopstack-ui-stitcher/` — Wire the freshly-designed UI to the real API hooks / types / endpoints — never invents endpoints or hook signatures.

### Review & QA

- `.claude/skills/shopstack-code-reviewer/` — Critical self-review of the staged diff before the PR opens (DB safety, scope discipline, design tokens, repo conventions).
- `.claude/skills/shopstack-teammate-pr-reviewer/` — Same doctrine applied to a teammate's PR. Output is a single structured GitHub comment.
- `.claude/skills/shopstack-browser-qa/` — Exhaustive browser-driven QA via Chrome MCP. Static gate + acceptance-criteria matrix + adjacent-feature regression sweep.
- `.claude/skills/shopstack-smoke-tester/` — ~60-second smoke test: typecheck + build + app boot health check. Catches main-branch regressions early.

### Git ops

- `.claude/skills/shopstack-worktree-manager/` — Create or reuse an isolated git worktree + branch for a ticket so parallel agents don't collide.
- `.claude/skills/shopstack-cleanup/` — List and delete local branches + worktrees whose PRs are already merged on GitHub.
- `.claude/skills/shopstack-conflict-resolver/` — Find mshery's open PRs that have conflicts and resolve them inside each PR's worktree without breaking intent.
- `.claude/skills/shopstack-rollback/` — Cleanly roll back a merged PR with a revert PR that itself passes the full ship-it gate.

### CI / PR watchers

- `.claude/skills/shopstack-pr-babysitter/` — Mid-day watcher for open PRs: polls CI + mergeable state, auto-fixes mechanical failures (rebase against main, Prisma migration timestamp collisions), force-pushes-with-lease.
- `.claude/skills/shopstack-main-watcher/` — Recurring smoke test against the latest `origin/main`; on failure, identifies the suspect commit(s) from the last N merged PRs and alerts.

### Incident & autopilot infrastructure

- `.claude/skills/shopstack-incident-response/` — One-command orchestrator for prod incidents: assess severity → identify culprit via main-watcher → decide rollback vs forward-fix → execute → communicate.
- `.claude/skills/shopstack-lessons-curator/` — Periodic reflective pass over the autopilot's `lessons.jsonl`: promotes proven fixes to defaults, retires known-bad patterns.
- `.claude/skills/shopstack-docs-writer/` — Drafts or updates docs when a ticket introduces a new module, API, schema migration, RBAC rule, or significant feature.
