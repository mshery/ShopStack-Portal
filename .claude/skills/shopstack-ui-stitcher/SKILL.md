---
name: shopstack-ui-stitcher
description: Wire a freshly-designed ShopStack UI into the existing implemented code without inventing endpoints, hooks, or function signatures. Reads the actual server routes, data hooks, and exported function signatures FIRST, builds an explicit endpoint/hook contract, then rewires the UI components to call the real names. Solves the recurring "wrong endpoint / wrong function call" drift when stitching designed UI to code. Use after shopstack-ui-designer has produced the UI, or when the user says "stitch the UI", "wire the UI to the code", "connect UI to API", "the UI is wrong", or chained /shopstack-ship-it reaches the stitch step.
---

# ShopStack — UI Stitcher

You wire the **designed UI** into the **already-implemented code**. This step exists because the prior split-workflow (code first, then design UI separately, then ask Claude to "connect them") keeps producing UI that calls **wrong API endpoints, wrong hook names, and wrong function signatures** — even when the same code reference is given each time. Claude drifts.

This skill's job is to **eliminate that drift** by reading the real code first and constructing an explicit contract, then writing UI code that can only call names from that contract.

## Inputs

- A `SOUTHFLORAL_DEV_COMPLETE` handoff from `shopstack-code-developer` (the logic / API / data layer that already shipped) AND
- A `SOUTHFLORAL_UI_DESIGN` handoff from `shopstack-ui-designer` (the new UI), OR
- The user gives you both: worktree path + ticket ID + path(s) of the new UI files

All work happens inside the **worktree** — never the primary checkout.

## The contract-first approach

**Do not edit any UI file until the contract is built.** Drift happens when the LLM is writing UI code with the API in its head, instead of in its hands. The contract makes the API explicit *in writing* before any UI code is touched.

### Step 1 — Identify the relevant code surfaces

From the dev handoff and the new UI files, figure out what the UI needs to talk to:

- **API routes** (Next.js `app/api/.../route.ts`, `pages/api/...`, server actions)
- **Data hooks / queries / mutations** (TanStack Query hooks, SWR, custom `useFoo()` wrappers)
- **Exported helpers / formatters** (utility functions the UI imports)
- **Type definitions** (DTOs, response types, validation schemas — Zod / Prisma / etc.)
- **Permission / role helpers** (e.g. `useCurrentUser`, `requireRole`)

List them. Then **read each file** with the Read tool — don't paraphrase from memory, don't reason about what the API "probably" looks like. Read the source.

### Step 2 — Build the explicit endpoint/hook contract

Produce a contract document — **written to `<worktree>/.shopstack-ui-contract.json`** (gitignored — the file should be in the repo's `.gitignore` already; if not, add it). Persisting the contract to disk means a chain interrupted mid-stitch can resume cleanly, and the user can inspect the contract by hand to debug drift findings.

The contract captures, for every surface the UI will touch:

```
CONTRACT
========

API: POST /api/scheduling/cycles/[id]/publish
  Request body:  { effectiveFrom: string (ISO date) }
  Response 200:  { publishedAt: string, cycleId: string, version: number }
  Response 400:  { error: "validation_failed", details: ZodError[] }
  Response 403:  { error: "not_authorized" }
  File:          ShopStack-Portal/src/src/app/api/scheduling/cycles/[id]/publish/route.ts:18

Hook: usePublishCycle(cycleId: string)
  Signature: () => UseMutationResult<{ publishedAt, version }, ApiError, { effectiveFrom: Date }>
  Calls:     POST /api/scheduling/cycles/{id}/publish
  File:      ShopStack-Portal/src/src/hooks/scheduling/usePublishCycle.ts:9

Type: PublishCycleRequest
  effectiveFrom: Date
  File:         packages/api/src/schemas/scheduling.ts:42

Helper: formatScheduleWindow(start: Date, end: Date): string
  Returns:   "Mon 9:00–17:00"
  File:      packages/utils/src/format.ts:88

Permission: requireRole("manager")
  Used in:   scheduling routes that mutate published state
  File:      packages/auth/src/guards.ts:14
```

For each item, **cite the file:line** where the symbol is defined. If a symbol the UI design references **doesn't exist**, that's a finding — see "Drift findings" below. Do not guess what it might be.

Use the `Explore` agent for multi-file searches when the path isn't obvious. Use `Grep` / Bash `rg` for known symbol lookups. Examples of high-value greps:

```bash
# Find the actual API route handlers for a feature area
rg -n "export async function (GET|POST|PUT|PATCH|DELETE)" \
  "$WORKTREE/apps/<app>/src/app/api/<feature>" \
  "$WORKTREE/apps/<app>/src/app/api/<adjacent>"

# Find the actual hook names + signatures
rg -n "export function use[A-Z]\w+|export const use[A-Z]\w+" \
  "$WORKTREE/apps/<app>/src/hooks"

# Find DTOs/schemas
rg -n "z\.object\(|export type \w+ = " \
  "$WORKTREE/packages/api/src/schemas"
```

### Step 3 — Compare the UI design's assumptions against the contract

Walk every component file in the UI design. For every API call, hook usage, helper invocation, or type reference in the UI, check it against the contract:

- ✅ **Match.** UI uses a name the contract has → keep as-is.
- 🔁 **Renameable mismatch.** UI uses a placeholder name (e.g., `publishCycle()` when the real hook is `usePublishCycle()`) → rewrite the UI to use the real name.
- ⚠️ **Shape mismatch.** UI passes `{ date: Date }` but the real signature wants `{ effectiveFrom: Date }` → rewrite the UI to match the real signature.
- ❌ **Missing surface.** UI references something that doesn't exist in the codebase → **drift finding**. Either (a) add it to the code (if the ticket implies it should exist), or (b) drop the reference from the UI (if it was a designer-hallucination). Do not invent a stub silently.
- ⚖️ **Permission mismatch.** UI shows a button to a role that the server route doesn't allow → reconcile (usually: hide the button for that role).

Track each finding in a **stitch checklist** so nothing slips:

```
STITCH CHECKLIST
================
UI file: ShopStack-Portal/src/src/app/(authed)/scheduling/cycles/[id]/page.tsx

[ ] Line 42: `publishCycle(id)` → rewrite to `usePublishCycle(id).mutate({ effectiveFrom })`
[ ] Line 58: `<DatePicker value={cycle.start}>` — `cycle.start` is `Date | null` in real type; add null guard
[ ] Line 71: `formatWindow(...)` → use `formatScheduleWindow(...)` (real name)
[ ] Line 89: API call to `/api/cycles/publish` — wrong path; real is `/api/scheduling/cycles/[id]/publish`
[ ] DRIFT: Line 102 references `useExportToPDF()` — no such hook in codebase. Drop or add.
```

### Step 4 — Rewrite the UI files

Now you may edit. For each line in the stitch checklist:

- Use `Edit` with exact `old_string` from the design's UI file.
- Replace with the form that uses the real contract name.
- Tick the box in the checklist as you go.
- After the rewrite, the UI file must import only symbols that exist in the contract. If you find you need a symbol that wasn't in the contract, **stop and add it to the contract first** — do not write code that calls something the contract doesn't list.

If you need to add a new file for a UI helper, place it next to the existing helpers (don't invent a new directory).

### Step 5 — Typecheck the touched files

After every meaningful edit, confirm the touched package still typechecks:

```bash
npm run build \
  --filter="@shopstack/<touched-pkg>^..." \
  --filter="@shopstack/<touched-pkg>"
```

Treat a non-existent script's exit-0 as a false-pass — always inspect actual stdout/stderr. The `turbo build` form is the source-of-truth because every package has a `build` script that runs `tsc --noEmit`.

If type errors appear, they're almost always contract drift you missed in Step 3. Go back to Step 3 for those symbols, don't paper over with `as any`.

### Step 6 — Stage and emit handoff

```bash
git -C "$WORKTREE" add -A
git -C "$WORKTREE" status
git -C "$WORKTREE" diff --cached --stat
```

Do **not** commit (that's the PR step's job).

```
SOUTHFLORAL_UI_STITCH_COMPLETE
ticket: ITS-XXX
worktree: <path>
ui_files_rewritten: <count>
contract_items_used: <count>
drift_findings:
  - <one-liner per drift item the designer hallucinated; how it was reconciled>
unresolved_drift:
  - <items that couldn't be reconciled — must be empty for a clean handoff; if non-empty, the next step (browser-qa) will fail>
typecheck: pass | fail (<n> errors)
```

Then say: "UI stitched against real contract. Run `/shopstack-browser-qa` next."

## Hard rules

- **Read before you write.** No UI code edit before the contract is built. No contract item without a `file:line` citation.
- **Never invent a hook, endpoint, or type.** If the UI references something that doesn't exist in the code, treat it as a drift finding, not a hint to create it. Adding code is the developer skill's job, and even then only if the ticket implies it.
- **Never silence types with `any` / `@ts-ignore`.** A type mismatch is a contract mismatch; rewrite the UI to match the real signature.
- **Never push, commit, or open a PR from this skill.** Those are the ship-it / PR step's jobs.
- **One ticket per run.** Stitching across multiple tickets at once mixes their contracts and almost always breaks one.
- If the UI design has fundamental shape mismatches with the code (e.g., the designer assumed a one-to-many relationship that the schema models as many-to-many), **stop and surface to the user** instead of forcing a wrong reconciliation. Adjust either the design OR the schema, but don't fake-bridge them.

## Why this exists

The user has repeatedly hit this drift: design the UI separately from the code, ask Claude to wire them, and end up with wrong API paths, wrong hook names, and wrong DTO shapes — even when the same reference is given each time. The fix is to make the API *literally written down* before the wiring code is written, so the LLM is forced to call the real names instead of plausible-sounding ones.

## Related skills

- [[shopstack-code-developer]] — produces the code surfaces this skill reads
- [[shopstack-ui-designer]] — produces the UI design this skill wires up
- [[shopstack-browser-qa]] — verifies the stitch worked end-to-end (next step)
- [[shopstack-ship-it]] — orchestrator that includes this step in the chain
