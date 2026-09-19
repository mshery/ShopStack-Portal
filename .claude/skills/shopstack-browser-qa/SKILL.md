---
name: shopstack-browser-qa
description: Exhaustive end-to-end QA for a ShopStack ticket — runs static checks (typecheck, lint, vitest), then drives the real app in a browser via the Claude in Chrome MCP to verify every acceptance criterion, every visible edge case, and adjacent-feature non-regressions. Uses a hard completeness checklist so it cannot skip features. Use after `dev-pipeline` has implemented and wired a ticket, or when the user says "QA this", "browser test ITS-XXX", "run the full QA", "end to end test", or chains the dev pipeline into a QA step.
---

# ShopStack — Browser QA

You are the **final quality gate** before a PR opens. Static checks alone are not enough — you must drive the actual UI in a real browser and verify each acceptance criterion **with your own eyes** (snapshots, screenshots, console logs, network responses). The user's #1 pain with prior QA was *incompleteness* — features got missed. This skill exists to eliminate that.

## Rule of completeness (non-negotiable)

**Every acceptance criterion in the Linear ticket gets its own row in the QA matrix.** No criterion may be left as "not tested" without a written reason. Untested ≠ pass.

If the ticket has 8 acceptance criteria, the QA matrix has 8 rows. If a criterion is multi-step ("user can A, then B, then see C"), each sub-step gets its own row. Padding the matrix with vague "verified end-to-end" rows is forbidden — be specific.

## Project shape

ShopStack is **two repos**, not a monorepo:

- `ShopStack-Server` — Express 4 + Prisma + Postgres. Default dev port **3000**. Boot: `npm run dev` (uses nodemon + ts-node).
- `ShopStack-Portal` — React 19 + Vite. Default dev port **5173**. Boot: `npm run dev`.

A ticket may touch either or both. Inspect `git diff --cached` (or the branch diff vs `main`) to know which app(s) need QA. The Portal calls the Server at `VITE_API_BASE_URL` (typically `http://localhost:3000/api`), so a backend-only change still needs a Portal browser pass if it changes a response shape the UI consumes.

## Inputs

- Worktree path + ticket ID `ITS-XXX`, **or**
- The user gives you both directly.

All commands run inside the **worktree**, never in the primary checkout.

## The QA flow

### Phase 0 — Load the ticket

Call the Linear MCP `get_issue` (tool name varies by MCP install — typically `mcp__linear__get_issue`) on `ITS-XXX`. Extract:

- **Title**
- **Full description** (markdown body)
- **Acceptance criteria** — usually a checklist; sometimes prose. If prose, parse out distinct testable claims before continuing.
- **Linked tickets / parent / blockers** — peek at parent if criteria are inherited.

Also call `list_comments` for any clarifications.

> **If the Linear MCP isn't connected to the `ItsSherriTech` workspace**: stop and tell the user. Do not invent acceptance criteria. As a fallback, ask the user to paste the ticket body, and proceed with that as the source of truth.

**Construct the QA matrix.** One row per criterion, one row per "and also" / "but" / "when X" branch in the description. Save this matrix in your working notes — you fill it in as you test.

### Phase 1 — Static gate (HARD; pre-browser)

If static checks fail, the browser is pointless. Run inside the worktree of **each repo the diff touches**:

```bash
# Server (if Server files changed)
cd ShopStack-Server
npm install                          # if package.json changed
npm run prisma:generate              # if prisma/schema.prisma changed
npx tsc --noEmit                     # type check (zero new errors)
npm run format:check                 # prettier
npx prisma validate                  # schema valid
# Tests: there is no Jest/Vitest set up server-side yet — see project-rules.md
# known-debt #2. Run smoke-curls in Phase 3 instead.

# Portal (if Portal files changed)
cd ShopStack-Portal
npm install                          # if package.json changed
npm run lint                         # eslint --max-warnings 0
npm run build                        # tsc -b + vite build (lint runs inside)
npm test -- --run                    # vitest one-shot
```

**Do not trust `npm test` in watch mode** — always `--run` so it exits with a real code. **Do not skip `npm run prisma:generate`** if the schema changed; the typed `prisma.*` accessors only appear after a generate, and `tsc --noEmit` silently treats them as missing (we hit this exact trap during the merged-batch QA).

If any of these fail on **new** errors (errors caused by this ticket's diff), STOP. Emit a FAIL report with the verbatim error and the `file:line`. Do not start the browser.

Pre-existing errors in untouched files: record them in the report as "pre-existing", do not block.

### Phase 2 — Diff sanity

```bash
git -C "$WORKTREE" diff --cached --stat
git -C "$WORKTREE" diff --cached
```

Scan for:

- Files outside the ticket's stated scope
- Committed `.env*`, `.DS_Store`, build artifacts, accidental lockfile churn
- `console.log`, `debugger`, `TODO from this PR`, commented-out blocks
- Hard-coded secrets, dummy URLs, localhost references that should be env vars (`process.env.*` outside `src/config/env.ts` in Server, or `import.meta.env.*` outside `core/config/env.ts` in Portal)
- New `as any` casts (`grep -n 'as any' <touched-files>` — `.claude/rules/typescript.md` forbids new ones)
- **Prisma schema changes** without a matching `prisma/migrations/<NNNNNN>_*/migration.sql` snapshot. Schema changes must use `npm run prisma:migrate:dev` (which generates a migration), never `prisma db push`.
- New tenant-scoped Prisma queries that do **not** filter by `tenantId` in their `where` clause (BOLA risk — `.claude/rules/security.md` rule 1, `.claude/rules/prisma.md` multi-tenant section)

Flag any finding as a blocker (or warning, if marginal).

### Phase 3 — Boot the app

Use the **Claude in Chrome MCP** (tools named `mcp__Claude_in_Chrome__*`). If those tools are not loaded, fetch their schemas first:

```
ToolSearch query: "Claude_in_Chrome"   max_results: 30
```

Then:

1. **If the diff touches the Server, boot the Server** in a background terminal:
   ```bash
   (cd "$WORKTREE/ShopStack-Server" && npm run dev) >/tmp/qa-server.log 2>&1 &
   ```
   Poll the Server health URL until it responds:
   ```bash
   until curl -fsS http://localhost:3000/api/health >/dev/null 2>&1; do sleep 1; done
   ```

2. **If the diff touches the Portal, boot the Portal** in a background terminal:
   ```bash
   (cd "$WORKTREE/ShopStack-Portal" && npm run dev) >/tmp/qa-portal.log 2>&1 &
   ```
   Poll the Portal URL until it responds:
   ```bash
   until curl -fsS http://localhost:5173/ >/dev/null 2>&1; do sleep 1; done
   ```

3. **Confirm CORS + auth contract** with a curl smoke before clicking anything in the browser. Skipping this once already cost a session — `CORS_ORIGIN=*` quietly broke browser logins because `cors()` literal-matches array entries:
   ```bash
   curl -sI -X OPTIONS http://localhost:3000/api/auth/login \
     -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: POST" \
     | grep -i "access-control-allow-origin"
   ```
   If no `Access-Control-Allow-Origin: http://localhost:5173` echoes back, fix `ShopStack-Server/.env` `CORS_ORIGIN` to `http://localhost:5173,http://localhost:4173` (matches `.env.example`) before continuing. Touch a Server source file to make nodemon reload.

4. **In Chrome MCP**, navigate to the relevant route. Use the Claude in Chrome `navigate` tool, not computer-use clicks (computer-use is read-tier for the browser; clicks may be blocked).

5. **Confirm via `read_page` / `get_page_text`** that the page rendered without an error boundary or "Tenant not found" state. The auth restoration regression (silent refresh wiping tenant on boot) is the most common merged-batch regression — always boot once, hard-refresh once, and snapshot both.

If the app crashes on boot or the touched route 500s: STOP, emit a FAIL with the dev-server log, and tear down.

### Phase 4 — Walk every acceptance criterion in the browser

For each row in the QA matrix, do all of:

1. **Set up the precondition** in the UI (log in as the right role, navigate to the right screen, seed test data via direct `psql` writes or via API calls if no UI exists).
2. **Perform the action** described in the criterion via Claude in Chrome (`form_input`, `find` + `left_click`, `javascript_tool` for cases where Chrome autofill fights the form — see "Known gotchas" below).
3. **Observe the result.** Use `browser_snapshot` for the visible DOM tree, `read_console_messages` for any JS errors, `read_network_requests` for the API call's request/response. Save the relevant excerpt to the QA notes.
4. **Verify negatives too** — if the criterion says "shows error when X", do X and confirm the error appears (don't only test the happy path).
5. **Cross-check the DB when the criterion has a money or stock side-effect.** A POS sale's `subtotal` / `grandTotal` / `currentStock` must be verified in Postgres (`psql -c "SELECT ..."`), not just the API response — the schema strips client-supplied totals (`.claude/rules/validation.md`) so the response is authoritative, but DB invariants like `products_current_stock_nonneg_check` and `refunds.payment_id` need a direct check too.

The QA matrix row gets one of:

- `PASS` — observed evidence matches the criterion
- `FAIL` — observed evidence contradicts the criterion (include excerpt + screenshot path)
- `PARTIAL` — passed the happy path, but a negative or edge case fails (treated as FAIL)
- `BLOCKED` — could not test because of a prerequisite (e.g., no seed data, requires production secrets) — must include a reason

`SKIPPED` is **not** an allowed outcome. If you can't test it, you must say BLOCKED with a reason.

#### Standard ShopStack test accounts

(All passwords `Admin@123` except super admin; per the merged-batch QA report.)

| Role | Email | Notes |
|---|---|---|
| Platform super-admin | `admin@shopstack.com` / `Sherri@5996` | Tenants list, platform routes |
| Demo Electronics owner | `owner@demo-electronics.com` | Most tenant flows |
| Demo Electronics cashier | `cashier1@demo-electronics.com` | POS-only flows |
| Coffee Corner owner | `owner@coffee-corner.com` | Cross-tenant BOLA tests |

If a flow needs a brand-new tenant (e.g., to test the first-time onboarding), use the Register form instead of a seeded account.

### Phase 5 — Adjacent-feature regression sweep

This is the part LLM QA usually skips. Don't skip it.

1. **Call-site sweep.** For each exported symbol the diff modifies, grep the repo for its call sites. Open at least 3 call sites and reason about whether the signature/behavior change breaks them.
2. **Sibling-route sweep.** If the touched app's UI changed, list the 3 routes most likely to share state/components with the touched route. Visit each via Chrome MCP and `browser_snapshot` to confirm they still render.
3. **Console sweep.** Use `read_console_messages` while visiting those sibling routes. New warnings/errors that didn't exist before this diff are a finding.
4. **Network sweep.** For API-route changes, check at least 2 consumers (Portal hooks, mobile app calls if relevant, internal cron jobs). Confirm response shape didn't drift.
5. **Tenant-isolation sweep.** If the change touches a tenant-scoped service, run at least one cross-tenant attempt: Demo owner token against a Coffee resource id → must 404 (never 200 / 403 with a leak). The merged-batch QA caught BOLA gaps via this exact path.

Record each sweep result in the matrix as a separate row (e.g. `regression: /tenant/products renders cleanly`).

### Phase 6 — Manual cues for the human

You can't always test everything (no real Stripe webhook, no real Cloudinary signature, no production data). For each thing that requires a real human in the browser to verify, write one bullet under `manual_steps_for_pr`. These become the PR's "How to test" steps.

### Phase 7 — Tear down

Always:

```bash
# Kill Server + Portal explicitly — leaving them running breaks the next QA run
for port in 3000 5173 4173; do
  PID=$(lsof -ti tcp:$port 2>/dev/null)
  [ -n "$PID" ] && kill "$PID" 2>/dev/null
done
```

Confirm ports 3000 + 5173 are free before emitting the report.

### Phase 8 — Emit the report

```
SHOPSTACK_QA_REPORT
ticket: ITS-XXX
worktree: <path>
apps_touched: server | portal | both
overall: PASS | PASS_WITH_NOTES | FAIL
static_checks:
  typecheck: pass | fail (<n> new errors, <n> pre-existing)
  lint:      pass | fail (<n> errors, <n> warnings)
  build:     pass | fail
  tests:     pass | fail (<n>/<total>) | n/a (no test framework)
  prisma:    pass | fail (schema valid? migration present?)
diff_sanity: pass | warnings | blockers
boot:        pass | fail (reason)

acceptance_matrix:
  - criterion: "User can A"                  result: PASS    evidence: screenshot:/tmp/qa-XXX-1.png + network:POST /api/foo→200
  - criterion: "Error shown when B"          result: PASS    evidence: console:"Validation failed" visible at #error-banner
  - criterion: "C persists across refresh"   result: FAIL    evidence: hard-refresh wipes auth store; /auth/me returns user but tenant is null
  - criterion: "D shows for owner only"      result: BLOCKED reason: no owner seed user for the new tenant

regression_sweep:
  call_sites_audited: <n>
  sibling_routes_visited: [<list>]
  new_console_errors: <n>
  cross_tenant_attempts: <n>

manual_steps_for_pr:
  - <one-liner the PR description should include>

blockers:
  - <one-liner — file:line — why this blocks>
warnings:
  - <one-liner — file:line — why this is a smell>
recommendations:
  - <one-liner — non-blocking improvement>
```

Then say one of:

- **PASS** — "QA clean across all N criteria. Proceeding to PR open."
- **PASS_WITH_NOTES** — "QA passes; manual steps and notes captured for the PR body."
- **FAIL** — "QA blocked: <top blocker>. Either fix in this worktree or re-run `dev-pipeline` with the failure as input."

## Known gotchas (learned from prior QA passes)

These are real traps that have eaten time. Internalize them.

- **Chrome autofill vs `useState` login.** The Portal's `LoginPage.tsx` is a plain `useState` controlled form (not react-hook-form). Chrome's saved-credential autofill for `localhost:5173` aggressively reverts typed values, so `form_input` + click can submit autofilled creds (which usually fail or hit a stale account). When that happens, **bypass the form**: call `fetch('http://localhost:3000/api/auth/login', { method: 'POST', credentials: 'include', body: JSON.stringify(...) })` from `javascript_tool`, then `navigate('/')` — the app's silent-refresh-on-boot will pick up the now-set `shopstack_refresh` cookie and route to `/tenant`. Treat this as a QA workaround, not a product bug.
- **Stale `node_modules` after pulling main.** New dependencies in the merged PR aren't on disk until you run `npm install`. Missing `cookie-parser` after the auth-rotation PR (ITS-26) is the canonical example. Always `npm install` before `npm run dev` in Phase 3 if the diff touches `package.json`.
- **Prisma client out of date.** If the diff added a model (e.g. `RefreshToken`), `tsc --noEmit` will report `Property 'refreshToken' does not exist on type 'PrismaClient'` until you run `npm run prisma:generate`. Run it after `npm install`, before the boot.
- **`.env CORS_ORIGIN=*`.** Old local `.env` files predate the env validator and still have `CORS_ORIGIN=*`. The new `cors()` config literal-matches arrays, so `["*"]` matches nothing and the browser receives no `Access-Control-Allow-Origin` header. Fix locally to `http://localhost:5173,http://localhost:4173` (matches `.env.example`); the file is gitignored, so this is local-only setup, not a product bug.
- **Image URLs hard-coded to a port.** Some seeded `products.image_url` rows point at `localhost:3001`. If you boot the Server on the default 3000, run `UPDATE products SET image_url = REPLACE(image_url, 'localhost:3001', 'localhost:3000') WHERE image_url LIKE '%localhost:3001%'` before visiting any product detail page in the browser.
- **Serializable transaction races leak as `400 "Database error"` if a service doesn't catch `P2034`.** This is the merged-batch fix you should look for on any new code path that decrements stock or money inside `prisma.$transaction(..., { isolationLevel: 'Serializable' })`: it must retry once and translate `P2034` to `ConflictError` (the inventory adjustment path still has this gap as of the May 2026 QA — flag it if your ticket touches it).
- **Login rate-limit is 5/min per IP.** Burning the limiter during QA poisons the next 60 seconds of tests. To dodge it (when you're driving from `127.0.0.1` and the limiter has already fired), set `X-Forwarded-For: 10.0.0.<N>` per attempt — Express has `app.set('trust proxy', 1)` so the limiter sees the spoofed IP.

## Hard rules

- **Never** mark a criterion `SKIPPED` — only `BLOCKED` with a reason.
- **Never** declare PASS without at least one piece of recorded evidence per criterion (screenshot path, console excerpt, network excerpt, or `psql` row).
- **Never** commit, push, or "fix" findings from within this skill. Your job is to report. `dev-pipeline` / the human decides what to change.
- **Never** leave the dev server running after the run.
- **Always** confirm ports 3000 + 5173 are free at the start (kill stragglers) and at the end (tear down).
- **Always** use Claude in Chrome MCP for browser interaction, never computer-use clicks (the browser is tier-"read" for computer-use and clicks are blocked).
- If Claude in Chrome MCP is not connected/installed, surface that to the user and stop — do not silently degrade to "static checks only" and call it QA. The browser walk is the point of this skill.
- Pre-existing errors in untouched files are separated from new errors. Only new errors block.
- If the ticket has zero acceptance criteria (rare — usually means the ticket is malformed), say so explicitly in the report and have the user clarify before pushing.

## Why this exists

The previous QA practice (`npm run build` + a couple of curls) ran static checks well but skipped the actual browser walk-through, and the LLM-style "verified end-to-end" rows masked features that were never touched. This skill replaces it with a hard-checklist, evidence-required workflow so QA can't lie to itself about completeness. The merged ITS-6..ITS-42 batch (May 2026) was QA'd this way and surfaced one real bug — PR #5 — that the static gate could not have caught.

## Related skills

- [[dev-pipeline]] — end-to-end feature delivery (the orchestrator). This QA skill is the final stage before its PR step.
- [[linear-ticket]] — creates the tickets whose acceptance criteria this skill verifies.
