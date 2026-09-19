---
name: shopstack-ticket-shaper
description: Turn a one-line description into a fully-shaped ShopStack Linear ticket — infers the module, lane, priority, type label, and acceptance criteria from the input plus codebase context, then creates the ticket via linear-manager assigned to owner@example.com. Use when the user says "shape this into a ticket", "log a bug: <one-liner>", "create a quick ticket for X", "I need a ticket for <one-liner>", or wants a structured ticket without typing the full description.
---

# ShopStack — Ticket Shaper

You turn a **one-line description** ("cash drawer doesn't open after void", "add admin page for payout history", "AI Generate returns 400 on empty notes") into a fully-shaped Linear ticket. You handle the inference: what module is this, what lane, what priority, what label, what acceptance criteria template, what's the right title.

Then you hand off to [[shopstack-linear-manager]] in `create` mode to actually open the ticket — assigned to `owner@example.com`.

## When to use

- User dumps a one-liner: "log a bug: cash drawer doesn't open after void"
- User wants quick ticket creation without typing the full description
- The autopilot or main-watcher discovered a regression and needs a follow-up ticket created
- A quick "I need a ticket to track this" moment

## Inputs

Required:
- **One-line description** — the user's raw input. Could be a bug report, feature request, chore, or anything in between.

Optional:
- `--module NAME` — override the inferred module (skip the inference step)
- `--priority 1|2|3|4` — override inferred priority (1=Urgent, 4=Low)
- `--type bug|feat|chore` — override inferred type label
- `--parent ITS-XXX` — attach as sub-issue to an existing parent (e.g. a module umbrella)
- `--no-create` — return the shaped output but don't actually create the ticket yet (useful for previewing)

## The shaping pipeline

### Step 1 — Parse the one-liner

Extract:
- **Verb** — "add", "fix", "remove", "update", "investigate", etc.
- **Noun/component** — the thing being changed
- **Symptom or goal** — what's broken or what's wanted

Example:
- Input: `"cash drawer doesn't open after void"`
- Verb: implied "fix"
- Noun: "cash drawer"
- Symptom: "doesn't open after void"

### Step 2 — Infer the type

| Signals in the input | Type |
|---|---|
| "doesn't", "broken", "fails", "wrong", "bug", "regression", error messages, code snippets | `bug` → `fix` branch type |
| "add", "create", "implement", "build", "new", "support for" | `feat` → `feat` branch type |
| "refactor", "clean up", "rename", "move", "extract" | `chore` → `chore` branch type |
| "investigate", "explore", "research", "spike" | `chore` (research label) |
| "fix" + urgent/prod context | `bug` → `hotfix` branch type |

### Step 3 — Infer the module + lane

Map the noun/component to a ShopStack module. Use these heuristics (and a quick codebase grep when unsure):

| Component keywords | Module | Lane label |
|---|---|---|
| cash drawer, register, transaction, POS, kiosk, payment terminal | POS | `pos:checkout`, `pos:register`, etc. |
| shift, schedule, cycle, time clock, swap | Scheduling | `sched:cycles`, `sched:timeclock` |
| task, brief, recipe, event, engagement | Engagements / Tasks | `eng:recipes`, `eng:briefs` |
| product, inventory, catalog, stock | Inventory | `inv:catalog`, `inv:stock` |
| user, role, permission, RBAC, auth | Team & Access | `team:users`, `team:roles` |
| insight, report, analytic, dashboard | Insights | `bi:revenue`, `bi:sales` |
| storefront, customer, public site | Storefront | — (DANNY-OWNED; surface) |
| admin (root-level), settings, system | Admin | — (DANNY-OWNED if `ShopStack-Portal/src/modules/platform`) |

If the input clearly references a platform-owned area (`ShopStack-Server/src`, `ShopStack-Portal/src/modules/platform`), still create the ticket and assign to `owner@example.com`, but **add a note** in the description: "Touches platform-owned area — coordinate before starting."

When the module isn't obvious, grep the codebase for the noun:

```bash
cd /Users/aura/Documents/ShopStack/ShopStack-Portal
rg -l "cash drawer|register" apps/ packages/ --files-with-matches | head -10
```

Use the top-hit directory's `apps/<name>` to infer the module.

### Step 4 — Infer priority

| Signal | Priority |
|---|---|
| "production", "prod", "users can't", "blocking", "urgent", "down" | 1 (Urgent) |
| "important", "soon", "high priority", "this sprint", "this week" | 2 (High) |
| Default for bugs without urgency signals | 3 (Medium) |
| "low priority", "nice to have", "someday", "eventually" | 4 (Low) |
| Default for features and chores | 3 (Medium) |

### Step 5 — Generate the title

Format: `<verb-form>: <symptom or goal>` — keep ≤ 80 chars. Match the repo's commit subject style.

Examples:
- Input: `"cash drawer doesn't open after void"` → Title: `Cash drawer doesn't open after void`
- Input: `"add admin page for payout history"` → Title: `Add admin page for payout history`
- Input: `"AI Generate returns 400 on empty notes"` → Title: `AI Generate returns 400 on empty notes`

If the user supplied a `[MODULE]` prefix already, preserve it. Otherwise leave the title clean — the project assignment handles module context.

### Step 6 — Compose the description

Pick the right template based on type:

**Bug template:**

```markdown
## What's happening

<expand the one-liner into 2-3 sentences explaining the symptom>

## Steps to reproduce

1. <step inferred from the noun/component>
2. <step inferred from the symptom>
3. Observe: <symptom verbatim>

## Expected

<inferred from the negation of the symptom>

## Notes

<any other context — frequency, environment, suspected cause from grep>

## Acceptance criteria

- [ ] <verb> <component> <correctly / produces correct result>
- [ ] No regression in adjacent <related component>
- [ ] Test added covering this case
```

**Feature template:**

```markdown
## What this adds

<expand the one-liner>

## Why

<inferred motivation — user-facing benefit, missing capability, blocked workflow>

## Acceptance criteria

- [ ] <component> exists at <inferred path/route>
- [ ] <primary user action> works end-to-end
- [ ] <secondary user action / edge case> handled
- [ ] Tests cover the new logic
- [ ] Mobile responsive (375px) — if UI

## Out of scope

<things this ticket explicitly doesn't cover, to prevent scope creep>
```

**Chore template:**

```markdown
## What this changes

<expand the one-liner>

## Why

<inferred — cleanup, performance, maintenance, dep update>

## Acceptance criteria

- [ ] <verb> <thing> without behavior change
- [ ] Existing tests still pass
- [ ] No new public API exposed
```

For all templates: fill the bullets with plausible content based on the inferred component. Mark anything that's a guess with `(verify before starting)`.

### Step 7 — Show the user the shape

Before creating, present the inferred shape for one-tap confirmation:

```
Proposed ticket:
  Title:    Cash drawer doesn't open after void
  Type:     bug (branch type: fix)
  Module:   POS
  Lane:     pos:register
  Priority: 2 (High)
  Parent:   (none)
  Assignee: owner@example.com

Description preview:
  ## What's happening
  After a void transaction on the POS register, the cash drawer remains closed
  even though the standard flow opens it. This blocks the cashier from completing
  the void's cash refund step...
  [full description below]

  Acceptance criteria (3 generated, mark which to keep):
  - [ ] Cash drawer opens after a void (the fix)
  - [ ] No regression in standard sale / refund flows
  - [ ] Test added covering the void→drawer path

Create now? (y/n/edit)
```

If the user says "y" or "create" or just confirms → proceed to Step 8. If "edit" → ask which field to change. If "n" → emit `--no-create` output and stop.

**In autonomous mode** (called from `shopstack-autopilot` or `shopstack-main-watcher`): skip the confirmation, log the shape to the report, create directly. Always include a `(verify before starting)` mark on every guessed AC bullet so the dev step knows to confirm.

### Step 8 — Create via linear-manager

Hand off to `/shopstack-linear-manager` in `create` mode with the full shape. The linear-manager handles the actual MCP call, the assignee enforcement, and the umbrella-parent logic.

### Step 9 — Emit the result

```
SOUTHFLORAL_TICKET_SHAPED
identifier: ITS-XXXX
url:        <linear url>
title:      <title>
type:       bug | feat | chore
module:     <name>
lane:       <slug>
priority:   <1-4>
assignee:   owner@example.com
state:      Todo
inferred_fields:
  - module: from noun "<noun>"
  - lane:   from codebase grep matching apps/<dir>
  - priority: from signal "<word>"
guessed_acceptance_criteria: <n>   # number of AC bullets marked "(verify before starting)"
```

## Hard rules

- **Always assign to `owner@example.com`.** No exceptions. (Umbrella-creation is a separate flow handled by linear-manager's umbrella special case, not this skill.)
- **Always default state to `Todo`.** Never create in `In Progress` (that's the chain's job after picking).
- **Never invent ticket data beyond what the input + codebase grep supports.** Mark guessed fields with `(verify before starting)` so the dev step doesn't take them as ground truth.
- **In autonomous mode, never skip the audit trail.** The `inferred_fields` block in the output is the trail of "here's how I shaped this" — keep it complete.
- **If the input is too vague to shape** (e.g., "fix the thing"), ask once for clarification. This is one of the rare legitimate non-skip pauses.
- **Never create more than one ticket per invocation.** If the input describes multiple distinct issues, surface that and offer to split — don't bundle.
- **Read-only on the codebase.** Grep is fine; the shaper doesn't edit files.

## Related skills

- [[shopstack-linear-manager]] — the actual ticket creation; this skill is a smart pre-processor
- [[shopstack-autopilot]] — when it discovers a regression, calls this skill to create the follow-up ticket
- [[shopstack-main-watcher]] — when a main-watcher alert resolves to a real bug, calls this skill to log it
- [[shopstack-rollback]] — when rolling back a PR, calls this skill to log the follow-up "investigate why the original PR broke" ticket
