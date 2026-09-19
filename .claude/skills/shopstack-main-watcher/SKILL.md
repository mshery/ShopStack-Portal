---
name: shopstack-main-watcher
description: Cross-module integration watcher for `main` — runs the smoke-tester against the latest origin/main on a recurring interval, and when it fails, identifies the suspect commit(s) (the last N merged PRs) and alerts the user via mobile push or external MCP. Catches "two PRs that were each green individually but break together on main" within minutes instead of next-morning. Use when the user says "watch main", "is main healthy", "monitor main", "keep main green", or sets up a recurring poll via /loop or /schedule.
---

# ShopStack — Main Watcher

You are the **integration-health monitor**. Every per-ticket PR runs browser-qa in isolation; the smoke-tester catches per-branch breakage. Neither catches the case where two PRs that are each green individually break together once both land on `main`. That's your job.

## When to use

- "Watch main" / "is main healthy" / "monitor main" — one-shot check
- "Keep main green" — combine with `/loop 30m` or `/schedule "*/30 * * * *"` for continuous monitoring
- After a busy merge day (3+ PRs merged in the last hour)
- Before stamping a release / cutting a deploy

## What it does

1. **Sync a dedicated smoke worktree.** Re-use `/Users/aura/Documents/ShopStack/ShopStack-worktrees/smoke-main` if it exists; otherwise create it from `origin/main`. Always fetch + reset before running.
2. **Run [[shopstack-smoke-tester]]** against `main` (the branch, not a main). The smoke-tester handles typecheck, build, and optional app boot.
3. **If smoke fails**, identify suspects:
   ```bash
   # Last 5 merges to main (likely culprits)
   git -C "$SMOKE_WT" log --merges --first-parent origin/main -5 \
     --format='%h %ai %s' \
     | head -5
   ```
4. **Alert** via the configured channel (see Alerts section). Include: the smoke failure's first error line, the 3 most-recent merge commits, and a one-liner recommendation.
5. **Open a tracking ticket** (only on the first failure of a given signal — dedupe via the alert log so a flaky failure doesn't flood Linear).

## Alerts

Two channels, picked at startup:

**A) Claude Code mobile app (default, zero setup):**
- Failure adds an `alerts[]` entry with `level: "block"` to the watcher's state file (see below). Mobile push fires.

**B) External (Pushover / Slack / Telegram) — opt-in:**
If MCP credentials are configured:
```
[MAIN-WATCHER] FAIL | main@<sha> | <first error line>
Suspects: PR #N (ITS-XXX), PR #M (ITS-YYY)
Recommended: revert PR #N to unblock the team, then triage ITS-XXX
```

## State

`~/.claude/data/shopstack-main-watcher/state.json`:

```jsonc
{
  "last_green_sha": "abc1234",
  "last_check_at": "ISO datetime",
  "last_alert_sha": "def5678",          // dedupe — don't re-alert the same broken sha
  "alerts": [
    { "at": "...", "level": "block", "sha": "...", "first_error": "..." }
  ],
  "consecutive_passes": 12,
  "consecutive_fails": 0
}
```

Atomic writes. The `last_alert_sha` field is the dedupe key — if main is broken and you re-run the watcher 6 times before someone fixes it, you alert once, not 6 times.

## On failure — suspect identification

```bash
LAST_GREEN="$(jq -r '.last_green_sha // "HEAD~10"' < state.json)"
SUSPECT_COMMITS=$(git -C "$SMOKE_WT" log --first-parent "$LAST_GREEN..HEAD" \
  --merges --format='%h %s' | head -5)
```

If `last_green_sha` exists, the bisect range is bounded — usually 1-5 commits. Otherwise, look at the last 5 merges as the search space.

For each suspect commit, pull the PR number out of the merge subject (`Merge pull request #N from ...` or the squash-merge subject which often ends with `(#N)`).

## Optional — auto-revert (NOT default)

Behind an opt-in `--auto-revert` flag, if there's a single clear suspect AND the user pre-authorized it for this watcher (per-session, not per-skill):

```bash
gh pr revert <suspect-pr-number> --title "revert: ITS-XXX (#N) — main-watcher CI failure"
```

This calls `shopstack-rollback` under the hood. Default OFF — auto-reverting someone else's merge is a serious action and should require explicit human approval each session.

## Output

```
SOUTHFLORAL_MAIN_WATCHER_REPORT
checked_at: <ISO>
main_sha:   <short-sha>
result:     PASS | FAIL | FAIL_INFRA
duration:   <s>

(if FAIL)
first_error:    <one line>
suspects:
  - PR #1234 (ITS-XXX) — <merge subject> — merged <time ago>
  - PR #1235 (ITS-YYY) — ...
recommendation: <one-liner — usually "consider reverting PR #N">
alert_sent:     true | dedupe (already alerted for this sha)
```

In passing case: a single line "main green at <sha> (Nth consecutive pass)" — short enough that running it every 30 min in `/loop` doesn't spam.

## Hard rules

- **Read-only on main.** Never push, never merge, never rebase main from this skill.
- **Never modify other people's PRs.** If the suspect PR belongs to another developer, surface to the user — they decide whether to ping the author.
- **Never auto-revert without `--auto-revert` AND a clear single suspect.** If suspects are multiple or ambiguous, always surface.
- **Dedupe alerts** via `last_alert_sha` so a 6-hour failure doesn't generate 12 notifications.
- **Idempotent failure mode** — `FAIL_INFRA` (network, smoke-tester crashed) is distinct from `FAIL` (real breakage). Don't conflate.
- The watcher does not run the autopilot or claim tickets. Surface only.

## Running it on a schedule

```
/loop 30m /shopstack-main-watcher
```

Or cron-style:

```
/schedule create "watch main health" "*/30 * * * *" /shopstack-main-watcher
```

Recommend every 30 min during work hours; every 2 hours overnight (most merges happen during the day). Pair with the autopilot's morning report so any failure overnight is in the next-day summary.

## Related skills

- [[shopstack-smoke-tester]] — the actual smoke run; this skill wraps it with alerting + suspect-id
- [[shopstack-rollback]] — invoked when `--auto-revert` is on and a single suspect is clear
- [[shopstack-pr-babysitter]] — sibling skill that watches open PRs (this one watches main itself)
- [[shopstack-autopilot]] — runs more aggressive watching as part of its loop; this skill is the standalone version
