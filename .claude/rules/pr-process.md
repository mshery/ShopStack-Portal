# PR Process

Code lands through pull requests. Pull requests are reviewed. Reviews follow these rules. The whole flow is designed for **trunk-based development** with short-lived branches.

## Branching

Branch names follow:

```
<type>/<short-description>
<type>/<ticket-id>-<short-description>
```

`<type>` is one of `feat`, `fix`, `chore`, `docs`, `refactor`, `perf`, `test`, `build`, `ci`.

Examples:

- `feat/SHOP-412-cart-mini-summary`
- `fix/checkout-double-submit`
- `chore/upgrade-vite-7`

`main` is the trunk. Branches live for **hours to days**, not weeks. If a branch is more than 5 days old, rebase or merge nightly.

## Commits — Conventional Commits 1.0

Every commit message:

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

Where `<type>` matches the branch type set above and `<scope>` is a feature folder name (`cart`, `auth`, `checkout`, or blank).

Examples:

```
feat(cart): add mini summary in header
fix(checkout): prevent double submit when network is slow
chore(deps): bump react to 19.2
refactor(orders): collapse OrderRow variants
```

Footers (when needed):

- `Refs: SHOP-412`
- `Closes: SHOP-412`
- `BREAKING CHANGE: removes `OrderService.fetchAll`; use `useOrderList``

Why this format: it makes changelogs trivial, surfaces breaking changes, and the discipline of a one-line subject forces a tighter PR.

## Squash vs merge

We **squash-merge** PRs. The squashed commit subject and body come from the PR title and description — write them well.

Rebases on the branch are fine and encouraged for keeping history tidy locally, but the only commit landing on `main` is the squash.

## PR size

Smaller is better. Aim for **< 400 lines of diff**. If a PR is over 800 lines, it almost certainly should be split.

Acceptable big PRs:

- A pure rename or move where the line count is the count of files touched.
- A generated migration.

If a refactor is unavoidably large, split into:

1. PR 1 — introduce the new abstraction alongside the old.
2. PR 2 — migrate call sites.
3. PR 3 — remove the old abstraction.

## PR description template

```markdown
## What

<one-paragraph summary of the change, written for someone scanning the merge log>

## Why

<the problem, the user impact, the ticket link>

## How

<the approach, anything non-obvious about the design>

## Testing

- [ ] Unit / integration tests added or updated
- [ ] E2E pass locally (if auth/checkout/routing affected)
- [ ] Manual QA notes

## Screenshots / video

<for UI changes>

## Rollout / risk

<feature flag? migration? schema change? what could go wrong?>

Refs: SHOP-XXX
```

The PR description is **not** a place to dump every TODO. Tickets exist for that.

## Review checklist (reviewer)

Run through this before approving:

### Correctness
- [ ] Does the change do what the description says?
- [ ] Are the edge cases (empty, error, loading, race) handled?
- [ ] Does it follow the screen-pattern contract (`status` / `vm` / `actions`)?

### Architecture
- [ ] No reverse imports (component → store, page → API, etc.). See `architecture.md`.
- [ ] Data normalized at the boundary, not in the UI. See `data-flow.md`.
- [ ] No business logic in stores; no async logic in stores. See `zustand-stores.md`.

### Types
- [ ] `strict` clean — no `any`, no `@ts-ignore` without a reason.
- [ ] zod schemas for new API shapes. See `service-patterns.md`.

### Quality
- [ ] Tests are present and test behavior, not implementation. See `testing.md`.
- [ ] No `console.log`, no commented-out code, no stale TODOs.
- [ ] Accessibility: keyboard reachable, labeled, focus visible. See `accessibility.md`.
- [ ] Security: nothing sensitive in `localStorage`, no `dangerouslySetInnerHTML` on user content. See `security.md`.

### Process
- [ ] Conventional Commit on the squash title.
- [ ] `.env.example` updated if new env vars added.
- [ ] Docs updated (if behavior changed).
- [ ] Linear ticket linked.

### Performance (when relevant)
- [ ] Bundle hasn't ballooned (`vite build` size).
- [ ] No obvious render storms (profile if in doubt).

## Review checklist (author)

Before requesting review:

- [ ] Self-review the diff in GitHub's UI (you'll catch things `git diff` doesn't).
- [ ] Pull `main`, rebase, push.
- [ ] CI green — lint, build, test, e2e (where applicable).
- [ ] PR description complete.
- [ ] Screenshots / video for UI.

If CI is red, fix it first. Don't ask for review on a red PR.

## Feedback etiquette

- Prefer questions over commands ("could we name this `parsed` for clarity?" vs. "rename this").
- Distinguish blocking from non-blocking: prefix with `Blocking:`, `Question:`, `Nit:`, `Suggestion:`.
- One round of clarifying questions; if the PR needs three rounds, hop on a call.
- The reviewer **approves**, the author **merges**. Don't merge while there are unresolved comments.

## CODEOWNERS

`.github/CODEOWNERS` enumerates required reviewers per path. Critical paths (auth, checkout, billing) require two approvals. The rest require one.

## Hotfixes

Real hotfixes:

1. Branch from `main`: `fix/hotfix-<thing>`.
2. Minimal diff — fix the bug, nothing else.
3. Add the regression test in the same PR.
4. Squash-merge after one approval.
5. Backport the test to ensure prevention.

"Hotfix" is **not** "I want to skip code review". The bar is the same.

## Reverts

Reverts are PRs, not raw `git revert` pushes. Title: `revert: <subject of reverted commit>`. Reference the original PR and explain why.

## Don't

- Don't `--force-push` to a shared branch.
- Don't merge with `--no-verify`.
- Don't approve your own PR.
- Don't ship behind a feature flag without a ticket to remove the flag.

## See also

- `architecture.md` — what reviewers look for first
- `coding.md` — the exit rule (rule 20)
- `testing.md` — the test bar for merge
- `documentation.md` — what docs must update with the PR
