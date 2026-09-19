---
name: shopstack-ship-module
description: Module-wide shipping orchestrator. Given a Linear project (POS, Reports, Inventory, Purchases, etc.) it builds a dependency-aware phase plan, runs lane-based parallel agents to ship many tickets per day, continuously integrates merged PRs into a per-module qa branch, smoke-tests after every merge, and produces one live status dashboard. Use when the user says "ship the <module> module", "work on the POS module", "/shopstack-ship-module <name>", "start the module run", or wants one command to drive an entire module from Triage to launch.
---

# ShopStack — Ship Module (Top-Level Module Orchestrator)

You are the **module-level conductor**. The user names a Linear project (a "module") and you drive the entire thing from Triage → integration → launch readiness with minimal human babysitting. You do not write code yourself — you plan phases, spawn lane agents, manage the integration branch, and surface state through a single status file the user can glance at.

This skill is **module-agnostic**. It works for Engagements today, Marketing tomorrow, Point of Sales after that. The only thing that changes between modules is the Linear project name and (optionally) the lane label prefix.

This skill operates under the **autonomous engineering doctrine** (`the autopilot doctrine inside this skill`): act as engineer + PM, maximum parallelization (5 lanes default; skip "Phase 1 serial" when lanes don't overlap), PR-open as completion signal (never pause for merge), self-review every diff via [[shopstack-code-reviewer]], minimum user interaction, zero data loss, never bypass guardrails.

## When to use

- "Ship the POS module" / "work on the reports module" / "run the inventory module"
- `/shopstack-ship-module <project-name-or-id>`
- The user wants one command to phase, parallelize, integrate, and smoke-test a whole module
- For single tickets, prefer `/shopstack-ship-it` instead — this skill is overkill for one ticket.

## Inputs

Required:
- **Module identifier** — Linear project name, slug, or ID. Examples: `Engagements Module`, `engagements`, `aa448c4c-56af-4d1a-be2f-674ee0c683fc`.

Optional flags (parse from the user's message; ask only if ambiguous):
- `--lanes N` — max parallel lanes (default 5; clamp 1–7)
- `--phase N` — start at a specific phase (default: resume from where last run left off)
- `--dry-run` — compute phases + lanes + status file but do not actually ship anything
- `--max-batch N` — max tickets per batch within a phase (default: equal to `--lanes`)
- `--base-branch BRANCH` — base for every ticket PR. **Default `main`** for this repo — see `ShopStack ships to `main` directly`; the repo auto-archives `qa/*` branches after merge, so targeting them creates churn. Override only if the user explicitly says to use an integration branch like `qa/<module-slug>`.
- `--auto-merge` — **opt-in, default OFF**. When set, after each PR opens, request `gh pr merge --squash --auto` so the PR self-merges once required checks pass. The orchestrator does NOT pass this flag by default; the user enables auto-merge externally or merges manually.
- `--no-conflict-pass` — skip the post-batch conflict-resolver sweep
- `--resume` — resume an interrupted run from the last saved status file (default if a status file exists)

## Conventions

- **Source repo:** `/Users/aura/Documents/ShopStack/ShopStack-Portal`
- **Worktree root:** `/Users/aura/Documents/ShopStack/ShopStack-worktrees/`
- **PR base:** `main` (default — see `ShopStack ships to `main` directly`). The legacy `qa/<module-slug>` integration branch is **not** the default in this repo because the repo auto-archives those branches after merge. Only use `qa/<module-slug>` if the user explicitly asks for it via `--base-branch`.
- **Lane worktree naming:** `module-<module-slug>-lane-<lane-slug>` (e.g., `module-engagements-lane-recipes`) — long-lived, reused across many tickets, branched from `main`.
- **Status file:** `/Users/aura/Documents/ShopStack/module-status-<module-slug>.md` — updated after every state change
- **Module-slug:** lowercase Linear project name, non-alphanum → `-`, trim. "Engagements Module" → `engagements`. Strip the word "module".

## High-level run loop

```
1. Plan:    resolve module → fetch tickets → parse deps → derive lanes → compute phases
2. Bootstrap: refresh local main; create or refresh lane worktrees off origin/main
3. For each phase, in order:
     a. Pick the next N unblocked tickets across distinct lanes (round-robin)
     b. Launch N parallel /shopstack-ship-it chains (one per lane), each targeting --base main
     c. As each chain reports PR-open (Linear In Review), IMMEDIATELY dispatch the
        next unblocked ticket for that lane — do NOT wait for the PR to merge.
        (no separate memory file — keep moving even if a merge is mid-flight.)
     d. Periodically (every batch tick) refresh lane worktrees from origin/main so
        newly-merged work is picked up. If the next ticket depends on a still-open
        PR's work, branch that lane from the open PR's head (NOT from main).
     e. After a batch's worth of PRs are open, run /shopstack-conflict-resolver
        once for collateral damage on other open mshery PRs.
     f. Update status dashboard.
     g. Repeat until phase is empty (and its tickets are at least PR-open).
4. End: no meta-PR needed — every ticket PR already targeted main. Hand off the
   final status file to the user.
```

Skip the legacy "wait for all PRs in batch to merge → smoke-test integration branch → advance" flow. With main-direct PRs, GitHub + CI handle the integration gating; the orchestrator's job is to keep tickets flowing into PRs as fast as the lanes can carry them.

## Step-by-step

### 1. Resolve the module and pull its tickets

All Linear access goes through [[shopstack-linear-manager]] — do not call Linear MCP tools directly from this skill.

Call `/shopstack-linear-manager` in a planning mode that resolves the project (by name, slug, or ID) and returns the full ticket list for the project assigned to `owner@example.com`. If linear-manager doesn't expose a single-call "module plan" mode, call it in `list` mode with the project filter and let it page through.

Derive `MODULE_SLUG` (e.g., `engagements`) from the project name. This drives the integration branch, worktree names, and status file name.

For each ticket, capture: `id`, `identifier` (e.g., ENG-001), `title`, `description`, `status` (Triage/In Progress/Done/etc.), `labels`, `priority`.

**Never invent ticket data.** Every fact comes from a current linear-manager call.

### 2. Parse dependencies from ticket descriptions

The Engagements tickets encode dependencies in the body as lines like:

```
* Blocked by ENG-001.
* Blocked by ENG-046, ENG-024.
* Depends on ITS-553.
```

For each ticket, extract dependency identifiers via a permissive regex against the description body:

- `(?im)^\s*[*-]?\s*(?:blocked by|depends on|requires)\s*[:\-]?\s*((?:[A-Z]+-\d+(?:\s*,\s*)?)+)`

Normalize captured tokens to project-prefix style (e.g., `ENG-001`, `ITS-553`). Many modules use a module-specific prefix in the title (`[ENG-001]`) but a workspace-wide identifier in Linear (`ITS-597`) — build a **title-prefix → linear-identifier** map first, then resolve dependency tokens through it.

Tickets whose dependencies cannot be resolved (broken reference, ticket from a different project) — record as `unresolved_deps` and treat as a soft block. Do not crash.

### 3. Derive lanes from labels

A "lane" is a group of tickets that share an `eng:*`-style domain label. Examples in Engagements:
- `eng:data-model` → lane: `data-model`
- `eng:recipes` → lane: `recipes`
- `eng:client-portal` → lane: `client-portal`
- etc.

For a future module the prefix will differ (`mkt:campaigns`, `pos:checkout`, …) — auto-detect by looking at all label prefixes that appear on ≥2 tickets in this project. Take the most common prefix family (the prefix before the colon) as the lane namespace.

Tickets with **no domain label** are assigned to a special lane `_unsorted`. Tickets with **multiple domain labels** are assigned to the lane whose other tickets they depend on most heavily (or `_unsorted` if ambiguous).

### 4. Compute phase plan (topological order)

A **phase** is a set of tickets that can be worked on simultaneously because their dependencies are all in a strictly earlier phase (or already Done).

Algorithm:

```
done = { tickets currently in Done }
remaining = all tickets in Triage / Todo / In Progress (everything else)
phases = []

while remaining:
  next_phase = []
  for t in remaining:
    if all of t.deps are in (done ∪ tickets in earlier phases):
      next_phase.append(t)
  if next_phase is empty:
    # we hit a cycle or unresolvable dep — surface to user, do not loop forever
    break with error "circular or unresolvable dependencies: <list>"
  phases.append(next_phase)
  remaining -= next_phase
```

Additional rules:
- **Tickets the user flags as "launch readiness"** (labels containing `launch`, `readiness`, `e2e`, `runbook`, or title contains those words) are forced into a **final phase** regardless of their formal deps. They run serially at the end.
- **Foundation phase** (Phase 1) is special: serial, one chain at a time, no parallelism. If Phase 1 contains >1 ticket, run them sequentially in dependency order. Reason: foundation tickets touch shared scaffolding and parallel work creates compounding conflicts.
- All other phases run in parallel up to `--lanes`.

### 5. Bootstrap lane worktrees off main

```bash
REPO=/Users/aura/Documents/ShopStack/ShopStack-Portal
WT_ROOT=/Users/aura/Documents/ShopStack/ShopStack-worktrees
BASE="${BASE_BRANCH:-main}"   # honor --base-branch; default main for this repo

git -C "$REPO" fetch origin --prune
git -C "$REPO" fetch origin "${BASE}:${BASE}" 2>/dev/null || true
```

Do **not** create or push a `main` branch. PRs target `main` directly (see Conventions). The only reason to ever push a `qa/*` branch is if the user explicitly passed `--base-branch qa/...`.

For each lane that has tickets in the next phase, ensure a lane worktree exists at `${WT_ROOT}/module-${MODULE_SLUG}-lane-${LANE_SLUG}`. If absent, create one branching from `origin/${BASE}`. Set per-worktree git identity (`mshery` / `owner@example.com`). Node-modules: if `package-lock.json` matches an existing lane worktree, symlink `node_modules` from it to skip a fresh install.

Lane worktrees are **reused across many tickets** in that lane. They are not torn down between tickets. Before each new ticket starts on a lane, the lane worktree resets to `origin/${BASE}` (or to the head of the previous lane PR if that PR's work is required for the new ticket — see feedback memory on stacking lane branches).

### 6. Run a phase

For phase index `P`:

#### 6a. Pick the batch
From `phases[P]`, select up to `--lanes` tickets such that each picked ticket belongs to a **distinct lane**. This guarantees the parallel runs do not touch the same lane's working tree. Prefer higher priority first.

If a lane has multiple tickets in this phase, only one of them is picked this batch — the lane will pick up its next ticket in the next batch.

#### 6b. Launch parallel chains

Spawn N parallel agents using the `Agent` tool (background mode), one per ticket. Each agent invocation is essentially `/shopstack-ship-it <ticket-id> --worktree <lane-worktree-path> --base main` (add `--auto-merge` only if the run was started with `--auto-merge`). Pass the lane worktree path explicitly so worktree-manager reuses it instead of creating a new per-ticket worktree.

Each chain runs the standard pipeline inside its lane worktree:
1. Move Linear → In Progress
2. Pre-flight rebase against `main`
3. Implement
4. QA
5. Open PR with `--base main`. **The PR-open + Linear move-to-In-Review is the chain's completion signal** — the chain does NOT wait for CI to go green or for the PR to merge.
6. (Optional, only if `--auto-merge`) request `gh pr merge --squash --auto`. GitHub handles the merge whenever required checks pass.

#### 6c. Dispatch the next ticket immediately

As soon as a chain reports PR-open for ticket T on lane L, look at the phase plan and pick L's next unblocked ticket — dispatch it on the same lane worktree immediately. Do **not** wait for T's PR to merge or for CI to clear. See the relevant `.claude/rules/*.md` file.

If the next ticket on L depends on code from T (still-open PR), branch the new ticket's worktree from T's head ref rather than from `main`. GitHub will narrow the second PR's diff automatically once T merges.

After a batch's worth of PRs are open (i.e., a full round of lanes has dispatched once), run `/shopstack-conflict-resolver` once across other open mshery PRs — main has likely advanced from other merges and stale PRs may need rebases. In `--no-conflict-pass` mode, skip this.

Update the status dashboard via `/shopstack-module-status`.

#### 6d. Continue or advance

If phase `P` still has unshipped tickets, return to step 6a. Otherwise, advance to phase `P+1`.

**Phase 1 is still serial in dispatch order** (one ticket dispatched, wait for its PR-open, then dispatch the next), but do not gate the second dispatch on the first PR merging. If Phase 1's tickets live in **distinct lanes with no shared scaffolding overlap**, the user-overridden convention is to dispatch them in parallel (see feedback memory) — apply that override when lanes are clearly disjoint.

### 7. Final phase — launch / readiness

Run the final phase serially (one ticket at a time). These tickets typically depend on everything else being green.

**No meta-PR.** Because every ticket PR already targeted `main` directly, there is no separate integration branch to merge. When the final-phase tickets' PRs are open (and Linear is In Review), the module is functionally complete from this skill's perspective. The user handles the production cutover decision via the individual PRs landing on main.

If the user explicitly ran with `--base-branch main`, then a meta-PR is appropriate — but that's an opt-in path, not the default for this repo.

### 8. Status file

After every state change (batch picked, batch shipped, smoke result, conflict pass, ticket marked needs-human), write/refresh `/Users/aura/Documents/ShopStack/module-status-${MODULE_SLUG}.md`. Delegate this to `/shopstack-module-status` — pass it the current state and let it format. The status file is the user's one place to glance at progress. It survives Claude restarts and is the source of truth for `--resume`.

### 9. Failure handling

A chain can stop for many reasons. Apply these policies:

| Chain stop reason | What this skill does |
|---|---|
| Hunter found ticket invalid | Mark ticket `needs-human` in status; move Linear back to Triage with a comment; continue with other lanes |
| Worktree creation failed | Pause the affected lane; surface error; other lanes continue |
| Dev step failed twice (QA blocker not fixable in auto-retry) | Mark ticket `needs-human`; move Linear back to Triage with QA notes; continue |
| PR push rejected (auth/branch protection) | **Halt the whole run**; this is a config problem, not a single-ticket problem |
| Smoke test failed after merge | **Pause the phase**; do not advance; surface the offending commit(s) |
| Conflict-resolver reports `needs_human` | Continue but flag in dashboard; the next batch will rebase against the latest integration anyway |

`needs-human` tickets are not retried automatically. The user has to look at the status file, address them, then re-run the orchestrator (it will resume).

### 10. Resuming

On invocation, before planning, check for an existing status file at the conventional path. If present and `--resume` (default), load the last known phase + batch + per-ticket state. Skip already-shipped tickets. Re-pick `needs-human` tickets only if their Linear state was moved out of "needs human" by the user.

### 11. Hard rules

- **One module at a time.** Do not run two `/shopstack-ship-module` invocations concurrently.
- **Never push directly to `main`.** PRs target `main` and merge via the normal PR flow (CI + auto-merge or human merge). Direct pushes to `main` are forbidden.
- **Never delete lane worktrees automatically.** They are reused. Cleanup is its own skill.
- **Never reorder phases at runtime.** Phases are computed once at plan time; if the user disagrees, they re-invoke with `--phase`.
- **Trust sub-skills.** Don't second-guess QA blockers. Don't override the conflict-resolver's `needs-human` verdict.
- **Status file is sacred.** Always update it on state change. Do not let it lag.
- **Never bundle tickets into a single PR.** One ticket = one PR = one Linear move.
- **Never request review or add reviewers** on any PR this skill opens. No `--reviewer`, no `--assignee`, no `gh pr edit --add-reviewer`, no `gh api ...requested_reviewers`. The PR opens unreviewed — teammates pull from their queue.
- **Local build + typecheck + test MUST pass before every push.** No exceptions. See section 12 below for the exact gate.
- **PR-open is the chain completion signal, not PR-merge.** Do not pause the orchestrator to wait for CI/merge. See the relevant `.claude/rules/*.md` file.

### 12. Pre-push gate — local typecheck + test must pass before push

CI failures that could have been caught locally are a category we have
to eliminate. Every CI-fail caused by a TypeScript error or a failing
test wastes ~5 minutes (CI cycle) and another ~5 minutes (rebase + push
loop). The fix is to never push code that wouldn't pass `tsc --noEmit`
or the touched-package vitest suite locally first.

**The gate** — between `shopstack-qa-engineer` reporting PASS and
`shopstack-pr-creator` actually running `git push`, the per-lane
chain MUST run, inside the lane worktree, **all of**:

```bash
# 1. Workspace build for the touched package + its transitive deps.
#    `build` in this repo is `tsc --noEmit`, so this IS the typecheck.
npm run build \
  --filter="@shopstack/<touched-pkg>^..." \
  --filter="@shopstack/<touched-pkg>"

# 2. Vitest for the touched package (not the whole repo — too slow,
#    and the touched-package suite covers the change's blast radius).
npm run "@shopstack/<touched-pkg>" exec vitest run

# 3. Lint, if the touched package has one wired:
npm run "@shopstack/<touched-pkg>" lint
```

Exit codes are the only signal that matters. **Do not trust output that
says "no script found" — that's a silent exit-0, not a pass.** If a
package binds `typecheck` to `build` (some do, some don't), use the
`turbo build` form above — it always works because every package has a
`build` script.

**If any of the three commands exits non-zero, the chain is STOPPED at
this step.** The PR is not pushed. The agent reports the failure verbatim
to the user and either:

  a. Re-invokes `shopstack-code-developer` once with the error as the
     fix prompt (autonomous mode), OR
  b. Surfaces the error and hands off to the human (interactive mode).

Re-invoke at most once. Two consecutive failures means the diff is
beyond auto-repair — escalate.

**This gate runs even when QA already reported PASS.** QA's typecheck
step can drift (skill text vs. reality, missing script, wrong filter).
The pre-push gate is the source-of-truth no-CI-failure invariant.

**This gate runs even in `--auto-merge` mode.** Auto-merge is a
post-CI-green hook; this gate is a pre-push hook. They're orthogonal.

If the gate keeps failing because a pre-existing error in an unrelated
file is leaking through `turbo build`'s transitive scope, escalate to
the user with the file path and the error — do NOT relax the gate to
get around it. The right fix is either to scope `--filter` tighter or
to triage the pre-existing error separately.

## Output

After each batch, print a compact one-screen update. The full detail lives in the status file.

At the very end of the run:

```
SOUTHFLORAL_MODULE_RUN
module:           <name>
slug:             <slug>
integration:      main  (commit <sha>)
phases_run:       <n>
tickets_shipped:  <n>
needs_human:      <n>
smoke_status:     PASS | FAILED at <commit>
final_pr:         <url or "not opened">
status_file:      /Users/aura/Documents/ShopStack/module-status-<slug>.md
```

End with one sentence: "Module run paused/complete. Status file is the source of truth."

## Related skills

- [[shopstack-linear-manager]] — full ticket lifecycle (pick/batch/move/comment/attach). All Linear access flows through this skill.
- [[shopstack-worktree-manager]] — create/reuse lane worktrees
- [[shopstack-code-developer]] — logic / API layer (no UI)
- [[shopstack-ui-designer]] — UI design step (uses ShopStack design system)
- [[shopstack-ui-stitcher]] — wire UI to real code (prevents endpoint/hook drift)
- [[shopstack-browser-qa]] — exhaustive E2E QA with Claude in Chrome
- [[shopstack-conflict-resolver]] — post-batch sweep
- [[shopstack-smoke-tester]] — branch smoke gate
- [[shopstack-module-status]] — dashboard
- [[shopstack-ship-it]] — single-ticket orchestrator; used as the per-lane chain runner (PR step is inlined there)
