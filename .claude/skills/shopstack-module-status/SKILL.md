---
name: shopstack-module-status
description: Maintain the live module status dashboard file for a ShopStack module run. Reads the current run state and writes a one-screen markdown status file that the user (and the orchestrator's --resume path) can rely on as the single source of truth. Use when the user says "show module status", "what's the POS module at", "dashboard for the reports module", "refresh status", or when shopstack-ship-module needs to update the dashboard after a state change.
---

# ShopStack — Module Status Dashboard

You write and refresh the **single status file** that summarizes a module run. The file lives at a predictable path and is the only place the user needs to look to understand where their module is at.

The status file is also the **resume state** for the orchestrator — if a Claude session restarts mid-run, `/shopstack-ship-module --resume` reads this file to know what was already shipped, what's in flight, and which phase to pick up.

## When to use

- The orchestrator (`shopstack-ship-module`) calls this after every state change (batch picked, batch shipped, smoke result, ticket flagged needs-human, phase advance).
- The user asks "what's the status of the X module" or "show me the dashboard."
- You're starting/resuming a run and need to read the current state.

## Path convention

```
/Users/aura/Documents/ShopStack/module-status-<module-slug>.md
```

Examples:
- `module-status-engagements.md`
- `module-status-marketing.md`
- `module-status-pos.md`

## Modes

### Read mode

Caller passes a module slug. You return the parsed state (phases, lanes, ticket map, last batch, last smoke result). Used by the orchestrator on `--resume` and by humans asking "what's it at".

If the file doesn't exist, return a clearly-marked empty state (`status: not_started`).

### Write mode

Caller passes the full current state (or a partial diff). You rewrite the file. The file is the single source of truth — do not write to a second copy or scatter state across multiple files.

## File format

The status file is **markdown that's also machine-readable**. Use stable sections with stable headings so the orchestrator can parse them on resume.

```markdown
# Module Run: <Module Name>

**Slug:** `<slug>`
**Started:** <ISO datetime>
**Last update:** <ISO datetime>
**Integration branch:** `main` (commit `<short-sha>`)
**Status:** running | paused | needs_human | complete | not_started

---

## Progress

| Bucket | Count |
|---|---|
| Total tickets | N |
| Shipped (merged to qa) | N |
| In flight (PRs open) | N |
| Triage (not started) | N |
| Needs human | N |
| Done in Linear (pre-existing) | N |

Phase: **<current phase>** of **<total phases>**

---

## Lanes

| Lane | Total | Done | In flight | Pending | Current | Note |
|---|---|---|---|---|---|---|
| data-model | 8 | 7 | 0 | 1 | ENG-102 | ⏳ in QA |
| recipes | 5 | 5 | 0 | 0 | — | ✅ complete |
| client-portal | 9 | 6 | 1 | 2 | ENG-045 | ⏳ in flight |
| ai-services | 7 | 0 | 1 | 6 | ENG-030 | ⏳ in flight |
| recurring-billing | 7 | 0 | 0 | 7 | — | ⏸ waiting on phase |
| b2b-intake | 5 | 5 | 0 | 0 | — | ✅ complete |
| production-ops | 8 | 0 | 0 | 8 | — | ⏸ blocked on data-model |
| proposal-pdf | 8 | 4 | 1 | 3 | ENG-024 | ⏳ in flight |
| notifications | 4 | 0 | 0 | 4 | — | pending |
| reporting | 5 | 0 | 0 | 5 | — | pending |
| _unsorted | 3 | 0 | 0 | 3 | — | launch-readiness phase |

---

## Active batch

Phase 2, batch 7 — started <time>

- **ENG-045** (Lane: client-portal) — chain status: developing
- **ENG-030** (Lane: ai-services) — chain status: QA pass, opening PR
- **ENG-024** (Lane: proposal-pdf) — chain status: pre-flight rebase

---

## Last smoke test

**At:** <ISO datetime>
**Branch:** `main` (commit `<sha>`)
**Result:** ✅ PASS | ❌ FAIL
**Duration:** 47s
**Checks:** typecheck ✅, build ✅, health ✅
**Suspect commits (if fail):** <commits>

---

## Needs human

(Tickets the orchestrator could not auto-recover. Each linked to its Linear issue and to any comment with the reason.)

- **ENG-051** — Holiday surge billing — QA failed twice; Stripe webhook signature mismatch in test fixtures. [linear](https://linear.app/...) — moved back to Triage on <time>
- **ENG-104** — Launch readiness review — requires human go/no-go.

---

## Recently shipped (last 10)

| Ticket | Title | PR | Merged at |
|---|---|---|---|
| ENG-007 | Activity log writer | #971 | 10:42 |
| ENG-006 | Event vs schedule sub-entity | #970 | 10:21 |
| ENG-005 | Brief versioning | #969 | 09:55 |
| … | | | |

---

## Phase plan

(Computed once at run start. Frozen unless user re-invokes with new phasing.)

### Phase 1 — Foundation (serial)
ENG-001, ENG-002, ENG-003, ENG-004, ENG-005, ENG-006, ENG-007

### Phase 2 — Fan-out (parallel, 5 lanes)
ENG-010..014, ENG-020..026, ENG-030..036, ENG-040..049, ENG-050..055, ENG-060..064, ENG-070..077, ENG-080..083, ENG-090..094

### Phase 3 — Launch (serial)
ENG-100, ENG-102, ENG-103, ENG-104

---

## Resume hints

(For `/shopstack-ship-module --resume`. Machine-readable; do not edit by hand.)

```yaml
resume:
  phase_index: 2
  last_batch_id: 7
  shipped_tickets: [ENG-001, ENG-002, ..., ENG-024]
  in_flight: [ENG-045, ENG-030, ENG-024]
  needs_human: [ENG-051, ENG-104]
  integration_sha: abc1234
  lane_worktrees:
    data-model: /Users/aura/.../ShopStack-worktrees/module-engagements-lane-data-model
    recipes: /Users/aura/.../ShopStack-worktrees/module-engagements-lane-recipes
    ...
  last_smoke:
    sha: abc1234
    result: PASS
    at: 2026-05-16T14:42:00Z
```
```

## Steps

### When called in read mode

1. Construct path from module slug.
2. If file doesn't exist, return `{ status: "not_started" }` and stop.
3. Parse the YAML block under `## Resume hints` for the machine-readable state. Use that as the canonical state.
4. Parse the human-readable tables only as a fallback for fields missing from the YAML.
5. Return a structured `MODULE_STATUS` block:

```
MODULE_STATUS
module:        <name>
slug:          <slug>
status:        running | paused | needs_human | complete | not_started
phase_index:   <n>
shipped:       <count>
in_flight:     <count>
needs_human:   <count>
last_smoke:    PASS | FAIL | none
integration_sha: <sha or none>
file:          /Users/aura/Documents/ShopStack/module-status-<slug>.md
```

### When called in write mode

1. Caller passes the full current state (preferred) or a partial event (e.g., "ticket X shipped").
2. If full state: rewrite the file in its entirety using the template above.
3. If partial event: read the existing file first (read-modify-write), apply the diff, rewrite.
4. Always update `Last update` to the current ISO datetime.
5. Always refresh the YAML resume block.
6. **Atomic write:** write to `<path>.tmp` then `mv` over the real path. Never leave a half-written status file.

### Event types the orchestrator might send

| Event | Effect on file |
|---|---|
| `run_started` | Create file from scratch, populate phase plan |
| `phase_advanced` | Update `Phase:` line, recompute Lane table |
| `batch_started` | Set `Active batch` block |
| `batch_completed` | Move tickets from in-flight to shipped, refresh Lane table |
| `smoke_result` | Update `Last smoke test` block |
| `ticket_needs_human` | Append to `Needs human` section, decrement in-flight |
| `run_paused` | Set `Status:` to paused, add reason note |
| `run_complete` | Set `Status:` to complete, freeze in-flight to 0 |

## Hard rules

- **One file per module.** Never write to multiple paths.
- **Atomic writes only.** Use temp file + rename, never partial writes.
- **Never delete the status file.** Even when a run is complete. It's the historical record.
- **Never embed credentials, secrets, or env values** in the status file. Use Linear URLs or PR URLs only.
- **Never overwrite the YAML resume block with stale data.** If you got a partial event but can't reconcile against the current state, surface the conflict and stop — do not corrupt the resume state.
- The file path is **conventional and stable**. Do not let callers override it for the same module slug.

## Related skills

- [[shopstack-ship-module]] — primary consumer; reads on resume, writes on every state change
- [[shopstack-smoke-tester]] — produces the smoke report this skill records
- [[shopstack-eod-report]] — may consult this file for "what shipped today" instead of hitting GitHub
