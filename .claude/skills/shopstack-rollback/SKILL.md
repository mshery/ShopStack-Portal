---
name: shopstack-rollback
description: Cleanly roll back a merged ShopStack PR — opens a revert PR with the right title, runs the full ship-it gate on the revert (browser-qa + code-reviewer + pre-push checks) so the revert doesn't introduce its own bugs, re-opens the original Linear ticket with a `revert` comment explaining why, and surfaces any follow-up tickets that depended on the reverted change. Use when the user says "rollback ITS-XXX", "revert PR #N", "undo that merge", "this one is breaking main", "main-watcher flagged X — revert", or chained from main-watcher's auto-revert path.
---

# ShopStack — Rollback

You roll back a ShopStack PR that already merged into `main`. The rollback is itself a real PR — it goes through the normal gate (browser-qa + code-reviewer) because a revert can re-introduce its own bugs (especially when the original PR also did refactors that other PRs now depend on).

## When to use

- User says "rollback ITS-XXX" / "revert PR #N" / "undo that merge"
- `shopstack-main-watcher` flagged a regression and the suspect is a single clear PR
- A user finds a production bug whose root cause is a specific merged PR
- The autopilot escalated with "regression detected in shipped PR" and the user accepted the rollback

## Inputs

Required (one of):
- A PR number (`#1234`) or full URL
- A ticket identifier (`ITS-XXX`) — the skill resolves this to the merged PR via `gh search prs`
- A commit SHA on `main` (less common; resolves to the PR that merged it)

Optional:
- `--reason TEXT` — short reason for the revert (goes in the PR body + Linear comment). If absent, the skill asks for one (this is a legitimate non-skip pause — reverts always have a reason and it should be recorded).
- `--no-qa` — skip browser-qa on the revert. **Discouraged** — only use for hotfix-revert when main is on fire. The code-reviewer step still runs.
- `--reopen-ticket` — re-open the original Linear ticket back to `Triage` so the team can re-triage it. Default: yes (because if you're reverting, the work isn't done).

## Steps

### Step 1 — Resolve the target

```bash
# Given a PR number, ticket ID, or commit SHA, capture all three:
PR_NUMBER=...
COMMIT_SHA=$(gh pr view "$PR_NUMBER" --json mergeCommit -q .mergeCommit.oid)
TICKET=$(gh pr view "$PR_NUMBER" --json title -q .title | grep -oE 'ITS-[0-9]+' | head -1)
```

Verify the PR is **merged** (not closed-without-merge — closed PRs don't need reverting). Verify the merge commit exists on `origin/main`.

### Step 2 — Open the revert worktree

```bash
REPO=/Users/aura/Documents/ShopStack/ShopStack-Portal
WT=/Users/aura/Documents/ShopStack/ShopStack-worktrees/revert-its-${TICKET#ITS-}-${PR_NUMBER}
BRANCH="revert/its-${TICKET#ITS-}-pr-${PR_NUMBER}"

git -C "$REPO" fetch origin --prune
git -C "$REPO" worktree add -b "$BRANCH" "$WT" origin/main

# Per-worktree git identity
git -C "$WT" config user.name  "mshery"
git -C "$WT" config user.email "owner@example.com"
```

### Step 3 — Generate the revert commit

Two patterns — pick the right one:

**Pattern A — squash-merged PR (typical case):**

```bash
git -C "$WT" revert --no-edit "$COMMIT_SHA"
```

A squash-merge produced one commit on `main`; `git revert` on that commit produces one inverse commit.

**Pattern B — merge-commit PR (rare for this repo, but possible):**

```bash
git -C "$WT" revert --no-edit -m 1 "$COMMIT_SHA"
```

The `-m 1` flag tells git which parent to keep (the `main` side).

Verify the revert applied cleanly:

```bash
git -C "$WT" status
git -C "$WT" log -1
```

If the revert produced conflicts (because something that merged AFTER the target PR depends on it), **stop**. Surface the conflicting files. The user has to decide whether to:
- Keep the revert and manually patch the dependents (this skill drops the chain there)
- Cancel the revert and pursue a forward-fix instead

### Step 4 — Re-write the commit message

The default `git revert --no-edit` message is `Revert "<original subject>"`. Replace it with the repo's convention:

```bash
git -C "$WT" commit --amend -m "$(cat <<'EOF'
revert: ITS-XXX (#NNNN)

Reverts the PR because <reason from --reason flag or human input>.

Reverted commit: <short-sha>
Original PR: https://github.com/mshery/ShopStack-Portal/pull/NNNN
Original ticket: https://linear.app/<workspace>/issue/ITS-XXX

Follow-up: <link to re-opened Linear ticket or "TBD pending triage">
EOF
)"
```

(The `--amend` here is the **only** legitimate amend in this skill set — we're amending the just-created revert commit to fix its subject; this is not modifying historical work.)

### Step 5 — Run the ship-it gate on the revert

A revert that reintroduces a bug is worse than no revert. Run:

1. **Pre-push gate** (typecheck + lint + touched-package vitest) inside the revert worktree
2. **Browser-QA** (`/shopstack-browser-qa`) unless `--no-qa` was passed — verify the revert doesn't break the features the original PR was supposed to add (which we're now removing)
3. **Code-reviewer** (`/shopstack-code-reviewer`) — particularly the scope-discipline pass (files in our diff that overlap with other open PRs are now in trouble) and DB-safety pass (a revert can also DROP a column the original PR added — that's a DB-loss event)

If any gate FAILS:

- `db_safety` blocker → the original PR added a column; reverting it drops the column → **stop and escalate** (this is now a DB-destructive operation, not a safe revert). The user has to decide whether to keep the column (forward-fix) or accept the drop.
- `scope_discipline` blocker → another developer's open PR touches files this revert also touches → surface, let the user coordinate
- Browser-QA fail → the revert introduced a regression; halt

### Step 6 — Push and open the revert PR

```bash
git -C "$WT" push -u origin "$BRANCH"

gh pr create \
  --title "revert: ITS-XXX (#NNNN) — <one-line reason>" \
  --body "$(cat <<'EOF'
## What this PR does

Reverts [PR #NNNN](https://github.com/mshery/ShopStack-Portal/pull/NNNN) (ITS-XXX).

## Why

<full reason — paste from --reason input + any context from main-watcher or QA findings>

## What it removes

<list of features / changes the revert removes — read from the original PR body or commit message>

## Follow-up

- [Linear ITS-XXX](https://linear.app/...) re-opened to `Triage`
- <Any dependent tickets that need re-triage>

## Verification

- [x] Browser-QA passed on the revert branch
- [x] Code-reviewer passed (no DB-destructive or scope-overlap blockers)
- [ ] Tested on Vercel preview after merge
EOF
)" \
  --base main \
  --head "$BRANCH"
```

No reviewers, no assignees — same rules as every other PR.

### Step 7 — Re-open the Linear ticket

Via [[shopstack-linear-manager]] in `move` mode (target `Triage`) then `comment` mode:

```
This PR was reverted because <reason>. The work needs re-triage:
- Revert PR: <revert PR url>
- Original PR: <original PR url>
- Original ticket conditions: <restate from the original AC>

Next steps:
- Identify why the original PR broke production
- Decide: forward-fix the same approach, or pursue a different approach
- Re-estimate scope after triage
```

If `--reopen-ticket` is `false`, skip this step (rare — only if the original work is genuinely abandoned).

### Step 8 — Surface dependents

Scan for tickets that may depend on the reverted change:

```bash
# Linear tickets that mention the reverted ticket ID in their description (via linear-manager list mode)
/shopstack-linear-manager list --search "ITS-XXX"
```

For each match, append a one-liner to the revert PR body's "Follow-up" section:

```
- ITS-YYY mentions ITS-XXX in its description — may need re-evaluation
- ITS-ZZZ is currently In Review and uses the reverted hook — coordinate with the author
```

This doesn't auto-mutate those tickets (scope discipline) — it just surfaces them.

## Output

```
SOUTHFLORAL_ROLLBACK_REPORT
target:
  pr:     #1234
  ticket: ITS-XXX
  commit: abc1234
revert_pr:    #1250 — <url>
revert_branch: revert/its-XXX-pr-1234
gate_results:
  pre_push:        pass
  browser_qa:      pass | pass_with_notes | fail | skipped (--no-qa)
  code_reviewer:   pass | pass_with_notes | fail
linear:
  reopened_to:     Triage
  comment_url:     <url>
dependents_flagged:
  - ITS-YYY — mentions reverted ticket
  - ITS-ZZZ — in flight, uses reverted hook
status: SHIPPED | STOPPED_AT_<step>
```

Then say: "Revert PR #N opened at <url>. Linear ITS-XXX re-opened to Triage. <N> dependents flagged in the PR body."

## Hard rules

- **Never** revert without a reason. If `--reason` is missing, ask once and capture it. The reason goes in commit message, PR body, AND Linear comment.
- **Never** `--no-qa` silently. The flag exists for emergencies; explicitly note in the PR body that QA was bypassed.
- **Never** revert via `gh pr revert` alone — the command exists but doesn't run our gate. Always do the full worktree → revert commit → gate → PR flow.
- **Never** revert a PR you did not open without explicit user confirmation. Reverting someone else's merged PR is a coordination event, not an autonomous action.
- **Never** skip the DB-safety scan on the revert. Reverting a column-add IS a column-drop — same destructive operation, opposite direction. If the original PR added a column, the revert will drop it; that's a doctrine section 11 hard-stop.
- **Always** re-open the Linear ticket to `Triage` unless `--reopen-ticket false` was explicitly passed. The work isn't done if it had to be reverted.
- **Always** surface dependents in the revert PR body. The team needs to see what else might break.
- **Never** force-push the revert branch. If conflicts arise during the gate, fix and create a NEW commit.

## Related skills

- [[shopstack-main-watcher]] — invokes this skill when `--auto-revert` is on and a single suspect is clear
- [[shopstack-browser-qa]] — runs on the revert branch (verifies the revert didn't introduce a new regression)
- [[shopstack-code-reviewer]] — runs on the revert (especially the DB-safety + scope-discipline passes)
- [[shopstack-linear-manager]] — moves the ticket back to Triage + posts the explanation comment
- [[shopstack-conflict-resolver]] — invoked if the revert conflicts with later merges
