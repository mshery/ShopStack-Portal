---
name: linear-ticket
description: Create properly detailed Linear tickets from any feature idea, change request, enhancement, or bug. Use this skill whenever the user describes something to build, fix, refactor, or change in the product — even when they don't say "Linear" or "ticket" out loud. Triggers on phrases like "we should add…", "can you make…", "I want a feature that…", "there's a bug where…", "let's refactor…". Understands the goal and affected code first, decides whether to file one ticket or a parent + independent sub-tickets, then writes tickets with goal, scope, technical approach, exact file paths, requirements, acceptance criteria, and step-by-step test instructions — detailed enough that any developer or AI agent can pick the ticket up and execute without coming back to ask questions.
---

# Linear Ticket Maker

When the user describes a feature, change, or bug, produce Linear tickets detailed enough that the next person who reads them — human or AI — can implement the work without coming back to ask questions.

Work through the four stages below in order. Do not file a ticket before completing Stage 1.

---

## Stage 1 — Understand the idea

Before opening Linear, think the request through. Answer these in your head, and surface anything genuinely unclear back to the user:

1. **What is the goal?** Strip the request down to its core user-visible outcome. The goal is the *result*, not the implementation the user happened to suggest.
2. **Who benefits?** End user? Internal staff? A specific role or persona? The audience shapes the acceptance criteria.
3. **What parts of the codebase are affected?** Find the real entry points. Read enough of the relevant files to know what would actually change — modules, components, services, schemas, tests. You do not need to fully implement; you need enough to write an accurate "Technical approach" and "Files to change" later. Made-up file paths in a ticket are worse than no file paths.

If after this any of the following are still unclear, ask **one** focused round of clarifying questions before creating tickets:
- The actual goal (vs. a proposed solution).
- A constraint mentioned vaguely but not specified ("make it fast" — how fast?).
- Which subsystem the user wants it in when there's a real choice.

Do **not** ask questions you can answer by reading the code.

---

## Stage 2 — Decide: one ticket or parent + sub-tickets

Default rule:

- **One ticket** if the work is roughly half a day or less, touches one concern, and has no meaningful seam where it could be split.
- **Parent + sub-tickets** if the feature has multiple **independent** parts that could be worked on separately. Independence is the test: a part is independent if someone could start it without waiting on another part to finish.

**Splitting rule:** sub-tickets must not share file edits in non-trivial ways. If two would both meaningfully edit the same file, fold them into one — splits that conflict on merge create more friction than they save.

State your decision and the reasoning in one sentence before creating anything, so the user can redirect if they disagree.

---

## Stage 3 — Create the parent ticket

Use the Linear MCP tools (`mcp__claude_ai_Linear__save_issue`, `list_teams`, `list_projects`, `list_issue_statuses`, etc.). If the team or project is ambiguous, ask once which to file under, then reuse that answer for any sub-tickets.

**Title:** clear, action-oriented, imperative.
- Good: `Add bulk export to the orders page`
- Bad: `Bulk export` / `Orders page changes`

**Description:** use this template exactly, in this order:

```markdown
## Overview
<2–4 sentences: what this feature does and *why* it exists. Lead with the user-visible outcome and the goal from Stage 1. Mention who benefits.>

## Scope
**In scope:**
- <thing this ticket covers>
- <thing this ticket covers>

**Out of scope:**
- <thing someone might reasonably assume is included but isn't, and why>
- <future work this deliberately leaves open>

## Technical approach
<Which files, components, services, and schemas will change, at a high level. Use real paths from the codebase. If there are sub-tickets, list them here as a bulleted plan and explain how they fit together.>

## Acceptance criteria
- [ ] <end-to-end, user-visible outcome>
- [ ] <end-to-end, user-visible outcome>
- [ ] <end-to-end, user-visible outcome>
```

If you're creating sub-tickets, after Stage 4 come back and edit the parent's **Technical approach** to list the sub-ticket IDs.

---

## Stage 4 — Create each sub-ticket

Run this stage only if Stage 2 decided to split. Skip it otherwise.

For each sub-ticket, call `save_issue` with `parentId` set to the parent ticket's ID. Reuse the team/project decided in Stage 3.

**Title:** the specific action this sub-ticket performs.
- Good: `Add /api/orders/export endpoint`
- Bad: `Backend changes` / `Part 1`

**Description:** use this template exactly, in this order:

```markdown
## What to do
<One short paragraph describing the concrete deliverable. Reads like an instruction, not a discussion.>

## Files to change
- `path/to/file.ts` — <what to change here, specifically>
- `path/to/other.tsx` — <what to change here, specifically>
- `path/to/test.spec.ts` — <new tests to add>

## Requirements
- <functional requirement>
- <non-functional requirement: performance, a11y, error handling, edge case>
- <any constraint the implementer must respect from the surrounding code>

## Acceptance criteria
- [ ] <specific testable outcome>
- [ ] <specific testable outcome>
- [ ] <specific testable outcome>

## How to test
1. <set-up step — seed data, env var, login as which user>
2. <action step — what to click, run, or call>
3. <expected observable result>
4. <edge-case action>
5. <expected result for that edge case>
```

---

## Quality bar — what "detailed enough" actually means

The real test of a good ticket: a competent developer or AI agent should be able to read it, open the listed files, implement the change, and verify it — **without coming back to ask anything**. If they'd have to ask *"where does this live?"*, *"what's the expected behavior when X?"*, or *"how do I run this?"*, the ticket is incomplete.

Specifically:

- **Acceptance criteria describe what's observable, not how it's built.** "User sees a success toast" → good. "Calls `useToast()`" → bad — that's an implementation detail.
- **File paths are real.** Copy-pasteable from the actual repo. If you haven't verified a path exists, don't put it in the ticket.
- **"How to test" is concrete.** Includes the actual commands, URLs, fixture users, sample inputs the tester will use. Not "verify it works" — *how*.
- **Requirements name the boring stuff explicitly:** loading state, error state, empty state, permission checks, 4xx/5xx behavior, mobile layout, edge cases. Most under-specified tickets are missing one of these.
- **No "TBD" / "we'll figure this out later"** in any field. If something is genuinely undecided, surface it to the user before filing — don't ship the uncertainty into the ticket.

The reason these rules exist: every ambiguity in a ticket turns into either a Slack interruption later, or a wrong implementation that has to be redone. Both are more expensive than five extra minutes of detail now.

---

## After the tickets exist

Give the user a short final summary:

- **Parent ticket:** link and title.
- **Sub-tickets** (if any): link, title, one-line summary each.
- **Anything you deliberately marked out of scope or deferred** — call it out so they can correct you if they expected it included.

That's it. This skill creates tickets; it does not implement them. If the user wants the work actually built, that's a separate step (the `dev-pipeline` skill, if it's installed, picks up from here).
