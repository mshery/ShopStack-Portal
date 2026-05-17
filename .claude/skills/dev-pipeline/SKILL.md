---
name: dev-pipeline
description: End-to-end feature delivery pipeline. Use this skill whenever the user proposes a new feature, change request, enhancement, bug fix, or any "let's build/add/change X" idea — even if they don't explicitly invoke the pipeline. Reads the codebase, files Linear tickets (parent + sub-tickets with structured fields), creates one git worktree per sub-ticket, spawns parallel agents that implement and test in isolation, merges everything into a single feature branch, runs full browser QA (golden path, regressions, mobile viewport, console + network errors), iterates until QA is clean, and only then marks Linear tickets Done.
---

# Dev Pipeline

When the user shares a feature idea, change request, or bug fix, run the seven stages below in order. Do not skip stages. Do not run them out of order. Do not mark any Linear ticket Done until Stage 6 passes end-to-end on the merged branch.

---

## Stage 1 — Read the codebase

Build a real mental model of the area you're about to change before writing anything.

1. Locate the area of the repo the request touches — entry points, related modules, related tests.
2. Read those files end-to-end. Do not rely on grep snippets; actually read.
3. Note the existing conventions the work should follow (naming, file layout, state management, test patterns, error handling).
4. If anything in the request is ambiguous after reading the code, ask **one** focused round of clarifying questions. Do not start building on a vague spec.

Output of this stage (write it out, even briefly):
- **Summary:** one paragraph restating what the feature does.
- **In-scope files / modules:** bullet list.
- **Constraints from existing code:** anything the implementation must respect.

---

## Stage 2 — Create Linear tickets

Use the Linear MCP tools (`mcp__claude_ai_Linear__save_issue`, `list_teams`, `list_projects`, etc.). If the team or project is ambiguous, ask once which team/project to file under, then proceed.

### 2a. Decide on splitting

- **One ticket** if the work is roughly half a day or less and touches one concern.
- **Split into sub-tickets** if it's larger, touches multiple subsystems, or has parts that could genuinely be built in parallel.

**Splitting rule:** only split along seams where the sub-tickets do **not** share file edits. If two sub-tickets would both edit the same file, merge them back into one — parallelism that conflicts on merge defeats the point.

### 2b. Create the parent ticket

Always create a parent that captures the overall feature.

- **Title:** concise statement of the feature.
- **Description:** the user's original ask, plus the Stage 1 summary, plus a list of the sub-tickets (filled in after 2c).

### 2c. Create each sub-ticket (or the single ticket if not splitting)

Every sub-ticket description MUST contain these five sections, in this order:

```markdown
## What to do
<one-paragraph concrete deliverable>

## Files to change
- path/to/file.ts — <what changes here>
- path/to/other.tsx — <what changes here>

## Requirements
- <functional must-have>
- <non-functional must-have, e.g. performance, a11y>

## Acceptance criteria
- [ ] <testable outcome>
- [ ] <testable outcome>

## How to test
1. <command or step>
2. <command or step>
3. Expected: <result>
```

Set each sub-ticket's `parentId` to the parent ticket's ID. Once all sub-tickets exist, edit the parent to list them.

---

## Stage 3 — Create one git worktree per sub-ticket

Worktrees give each parallel agent an isolated checkout so they can't trip over each other.

1. Confirm the default branch first (`git symbolic-ref refs/remotes/origin/HEAD` or check `git branch`). Usually `main`.
2. Make sure the working tree is clean. If not, stop and surface that to the user.
3. For **each** sub-ticket, create a worktree:

   ```bash
   git worktree add ../<repo-name>-<ticket-id> -b <ticket-id>-<short-slug> <default-branch>
   ```

   - Branch name: `<linear-ticket-id>-<kebab-slug>`, e.g. `ENG-1234-add-checkout-button`.
   - Path: sibling to the main repo (`../<repo>-<ticket>`) to keep the working dir tidy.

4. Verify with `git worktree list` before launching agents.

If there's only one ticket (no splitting), skip worktrees and work directly on a feature branch off the default branch.

---

## Stage 4 — Spawn one parallel agent per sub-ticket

Use the `Agent` tool. **Send every Agent call in a single assistant message** so they run in parallel — not one after the other.

Each agent's prompt MUST include all of:

- The full sub-ticket description (What / Files / Requirements / Acceptance / How to test).
- The Linear ticket ID.
- The **absolute worktree path** the agent must work in, with the explicit rule: *"Work only inside this worktree. Do not read or edit files outside it."*
- The instruction set:
  1. Implement the change, matching codebase conventions.
  2. Write tests covering each acceptance criterion.
  3. Run the project's test suite — fix any failures.
  4. Run the type checker and linter if the project has them — fix any failures.
  5. Commit with a message of the form: `<TICKET-ID>: <short summary>`.
  6. Report back: files touched, test results, anything left unresolved, anything that needed a judgment call.

Wait for **all** agents to finish before moving on. If any agent reports an unresolved blocker, surface it to the user before continuing.

---

## Stage 5 — Merge worktrees into one feature branch

1. From the main repo checkout, create the integration branch off the default branch:

   ```bash
   git checkout <default-branch>
   git pull --ff-only
   git checkout -b feature/<parent-ticket-slug>
   ```

2. Merge each sub-ticket branch in turn:

   ```bash
   git merge --no-ff <ticket-id>-<slug>
   ```

3. **Conflicts:** resolve them by understanding both sides. Never delete one side blindly. After resolving, re-run the test suite to confirm the merge itself didn't break anything.

4. On the merged branch, run the full test suite + type checker + linter. Do **not** proceed to Stage 6 if anything is red — fix it first.

---

## Stage 6 — Browser QA

On the merged feature branch, exercise the feature in a real browser. Use whichever browser automation is available in the environment (e.g. Playwright MCP, Chrome DevTools MCP). If none is available, start the dev server, give the user the URL, and walk them through the checklist — but flag clearly that automated browser QA wasn't possible.

Run the full checklist; do not cherry-pick:

- **Golden path** — use the feature exactly as a real user would, start to finish. Loading the page is not enough.
- **Every acceptance criterion** — verify each bullet from each sub-ticket against the live UI.
- **Regressions** — exercise the flows the change could have affected. Touched checkout? Run the full checkout. Touched auth? Sign in, sign out, sign up. Touched a shared component? Hit every page that uses it.
- **Mobile viewport** — test at 375×667 (iPhone SE) and 390×844 (iPhone 14). Confirm layout, tap targets ≥44px, and feature behavior.
- **Console errors** — DevTools console must be clean of errors and of warnings related to the change.
- **Network errors** — Network tab must show no 4xx/5xx for normal use of the feature.

Write a short QA report: what was tested, what passed, what failed (with reproduction steps for any failure).

---

## Stage 7 — Fix-and-retest loop, then mark Done

**If anything in Stage 6 failed:**
- Fix it in the relevant worktree (or directly on the feature branch if the issue spans sub-tickets).
- Re-merge if you changed a sub-ticket branch.
- **Re-run Stage 6 in full.** Do not re-test only the failing case — fixes regress other things, and the only way to catch that is the full pass.
- Repeat until Stage 6 passes cleanly end-to-end.

**Only once Stage 6 passes cleanly:**
- Move each sub-ticket to **Done** via `mcp__claude_ai_Linear__save_issue` (set `stateId` to the team's Done state — look it up with `list_issue_statuses` if you don't already have it).
- Move the parent ticket to **Done**.
- Post a comment on the parent ticket (`save_comment`) summarizing what shipped, the feature branch name, and the QA notes.

---

## Cleanup

After Linear is updated:

```bash
git worktree remove <worktree-path>      # for each sub-ticket worktree
```

Leave the feature branch in place so the user can open a PR or review it. Do **not** delete the feature branch.

---

## Hard rules — do not violate

- **Never** mark a Linear ticket Done before Stage 6 passes end-to-end on the merged branch.
- **Never** let an agent edit files outside its assigned worktree.
- **Never** split sub-tickets along seams that share file edits — merge them instead.
- **Always** re-run the full Stage 6 checklist after any fix, not just the failing case.
- **Always** send Stage 4 agent calls in a single message so they run in parallel.
- **Never** use `git push --force`, `git reset --hard`, or destructive worktree/branch deletion without explicit user approval.

---

## What to surface back to the user

After Stage 7 completes, give the user a short final report:

- Linear parent ticket link + sub-ticket links.
- Feature branch name.
- One-line summary per sub-ticket of what was implemented.
- QA result: passed, with viewport + console + regression notes.
- Anything that's still open or that needs a human decision before merging the feature branch to the default branch.
