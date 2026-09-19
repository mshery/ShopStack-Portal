---
name: shopstack-conflict-resolver
description: Find mshery's open PRs on the ShopStack GitHub repo, identify merge conflicts, and resolve them inside each PR's worktree without breaking that PR's intent or other open PRs. Use when the user says "check my PRs", "resolve conflicts", "rebase my open PRs", "fix mergeable status", or chained workflows trigger a conflict pass.
---

# ShopStack — Conflict Resolver

You are the **conflict-resolution step** for ShopStack. GitHub's auto-merge can stall when `main` advances and a PR falls behind. Your job is to find mshery's open PRs, detect conflicts, and resolve them carefully — preserving each PR's intent and not leaking changes between PRs.

## Inputs

- Optional: a specific PR number or URL. If omitted, scan all of mshery's open PRs.
- The ShopStack primary repo: `/Users/aura/Documents/ShopStack/ShopStack-Portal`
- Worktree root: `/Users/aura/Documents/ShopStack/ShopStack-worktrees/`

## Steps

### 1. Find candidate PRs

```bash
gh pr list \
  --repo mshery/ShopStack-Portal \
  --author mshery \
  --state open \
  --json number,title,headRefName,baseRefName,mergeStateStatus,mergeable,isDraft,updatedAt,url \
  --limit 50
```

A PR needs attention when `mergeable == "CONFLICTING"` or `mergeStateStatus` is `DIRTY`. Sort by `updatedAt` descending and process the most-recently-updated first — that's usually what the user actually cares about.

Skip draft PRs unless the user explicitly asked for them.

### 2. For each conflicting PR

#### 2a. Locate (or create) its worktree

Branches follow `<type>/its-XXX-<slug>` where type is `feat` | `fix` | `hotfix` | `chore` (legacy: `mshery/its-XXX-*`). Pull the actual `headRefName` from `gh pr view` — don't guess the prefix. Then look for a matching worktree:

```bash
git -C /Users/aura/Documents/ShopStack/ShopStack-Portal worktree list
```

- If a worktree on this branch exists, use it.
- If not, create one via [[shopstack-worktree-manager]] conventions:
  ```bash
  git -C "$REPO" worktree add /Users/aura/Documents/ShopStack/ShopStack-worktrees/its-<num>-resolve "<branch>"
  ```
- Set the per-worktree identity to mshery / owner@example.com.

#### 2b. Refresh and attempt the rebase / merge

Prefer **rebase** onto `origin/main` for clean linear history (matches existing repo style):

```bash
git -C "$WT" fetch origin --prune
git -C "$WT" rebase origin/main
```

If rebase is too noisy (e.g., many commits with overlapping touches), fall back to merging `origin/main` into the branch:

```bash
git -C "$WT" merge --no-ff origin/main
```

#### 2c. Resolve each conflicted file with context, not guesswork

This is the part that matters. For every file with conflict markers:

1. **Read all three sides**: the conflict markers (`<<<<<<< HEAD` ... `=======` ... `>>>>>>> incoming`), plus the **common ancestor** version:
   ```bash
   git -C "$WT" show :1:<path>   # base
   git -C "$WT" show :2:<path>   # ours / HEAD
   git -C "$WT" show :3:<path>   # theirs / incoming
   ```
2. **Understand the intent of each side**:
   - "Ours" is what this PR is trying to add — preserve its goal.
   - "Theirs" is what `main` has accepted from other merged PRs — never silently drop it.
3. **Choose the resolution by combining intents**, not by picking a side wholesale. Typical patterns:
   - Both sides added entries to a list/object → keep both, in a sensible order.
   - One side renamed a function the other side calls → keep the rename, update the caller.
   - Schema migrations on both sides → keep both migration files; if they alter the same column, reconcile so the column ends in the intended final state and bump the migration number for ours so it sequences after theirs.
   - **Prisma `prisma/migrations directory` same-idx collision** (recurring): prefer `npm run prisma:migrate:dev` (rename migration directory) (helper landed in PR #733 — it reads main's journal via `git show` so no live DB is needed, renames pending `NNNN_*.sql` + matching `NNNN_snapshot.json`, and rewrites the journal so entries append cleanly). If the helper isn't on this branch, manually rename the `.sql` to the next free idx after main's max and rewrite the conflicted journal block keeping main's entry verbatim then appending ours with a `when` strictly greater than main's max. Then run `npx prisma validate` to verify. See `the prisma rules in .claude/rules/prisma.md`.
   - One side deleted a file the other modified → check `git log -- <file>` on main to see why it was deleted; usually keep the delete and port any still-needed logic elsewhere.
4. **Check cross-PR collisions**: before finalizing, run:
   ```bash
   gh pr list --author mshery --state open --search "<key-symbol-or-file>"
   ```
   If another open mshery PR touches the same file, peek at its diff (`gh pr diff <num>`) and make sure your resolution doesn't preempt or duplicate its work. Lean toward the **minimum** change that lets this PR keep its scope.
5. **Type-check after each non-trivial file** — to catch refactors that broke this PR's calls. Do **not** use bare `npx tsc --noEmit` (many packages don't have that script and `npm` silently exit-0s on missing scripts). Use the workspace-aware form that always fires `tsc --noEmit`:
   ```bash
   npm run build \
     --filter="@shopstack/<touched-pkg>^..." \
     --filter="@shopstack/<touched-pkg>"
   ```
   A "no script found" exit-0 is **not** a pass — inspect stdout/stderr to confirm the compiler actually ran.

#### 2d. Finish the rebase / merge

```bash
git -C "$WT" add <resolved files>
git -C "$WT" rebase --continue          # or: git commit  (for merge)
```

If you hit a conflict you genuinely can't resolve confidently (intents truly disagree, or you'd need product clarification), **abort** and report it:

```bash
git -C "$WT" rebase --abort   # or: git merge --abort
```

Then post a comment on the PR via `gh pr comment <num> --body "..."` explaining what conflicted, why you couldn't safely auto-resolve, and what decision is needed.

#### 2e. Validate

Run the full QA gate from [[shopstack-qa-engineer]] — typecheck, lint, scoped tests, plus a regression sweep on the files you touched during resolution.

If QA fails, do not push. Either continue iterating in the worktree or hand back to the developer skill.

#### 2f. Push

For a rebase, you must force-push **with lease** (never plain `--force`):

```bash
git -C "$WT" push --force-with-lease origin "<branch>"
```

For a merge, a normal `git push` is fine.

Confirm GitHub now reports `mergeable: MERGEABLE`:

```bash
gh pr view <num> --json mergeable,mergeStateStatus
```

### 3. Report

After processing all candidates, summarize:

```
SOUTHFLORAL_CONFLICT_REPORT
scanned: <n> open PRs
conflicting_found: <n>
resolved:
  - PR #123 (ITS-XXX) — rebased onto main, 3 files reconciled
  - PR #124 (ITS-YYY) — merged main, 1 file reconciled
needs_human:
  - PR #125 (ITS-ZZZ) — schema migration collision with PR #119; commented on PR
unchanged: <n>
```

## Hard rules

- **Never** force-push without `--force-with-lease`.
- **Never** force-push to `main`. Warn loudly if asked.
- **Never** resolve a conflict by deleting the incoming side wholesale just to silence the markers — read the intent first.
- **Never** touch files outside the conflict set "while you're in there". That's how this skill leaks changes between PRs.
- **Never** change another PR's branch from this skill. One PR at a time.
- Always re-verify `user.name = mshery` and `user.email = owner@example.com` on the worktree before any commit / push.
- If a PR has been waiting on a human review comment, leave it alone unless the user told you to rebase regardless.
- If a Linear ticket was moved past `In Review`, don't move it back — leave the status as-is.
