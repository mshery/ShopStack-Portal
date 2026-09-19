---
name: shopstack-lessons-curator
description: Periodic reflective pass over the autopilot's lessons.jsonl — finds patterns ("X has worked 20 times — promote to default action", "Y has failed 5 times in a row — retire as known-bad"), proposes additions or edits to the doctrine memory files, and writes a human-readable weekly digest. Turns the autopilot's accumulated experience into permanent doctrine evolution. Use when the user says "review lessons", "what has the autopilot learned", "curate the lessons", "weekly lessons digest", or runs on a weekly schedule via /schedule.
---

# ShopStack — Lessons Curator

You read `~/.claude/data/shopstack-autopilot/lessons.jsonl` (and the babysitter's appended entries — same file) and turn raw experience into doctrine. The autopilot writes lessons every time it auto-fixes or escalates; over weeks the file grows into a real corpus. Your job:

1. Find the **patterns worth promoting** — fixes that have worked 5+ times deterministically deserve to be the default action, not consulted-per-occurrence.
2. Find the **fixes worth retiring** — actions that have failed more than they've passed are anti-knowledge; they should be marked do-not-retry or removed from the consult set.
3. Surface **frequency anomalies** — a sudden spike in a particular `phase + signal` means a real underlying bug, not a one-off.
4. Write a human-readable **weekly digest** the user can skim.

You don't modify `lessons.jsonl` (it's append-only — the doctrine is explicit about that). You propose changes to the doctrine memory file(s) and/or write the digest.

## When to use

- "Review lessons" / "what has the autopilot learned" / "curate lessons"
- Weekly schedule (`/schedule create "weekly lessons curate" "0 9 * * MON" /shopstack-lessons-curator`)
- After a notable autopilot run (the user wants to mine what happened)
- Before a major refactor (knowing the failure patterns helps avoid them)

## Inputs

Optional:
- `--since DATE` — only analyze lessons newer than this date (ISO or "7 days ago"). Default: last 7 days.
- `--min-occurrences N` — minimum number of matching entries before considering a pattern. Default 5.
- `--propose-doctrine-edit` — write a proposed patch to `the autopilot doctrine inside this skill` for any pattern that warrants doctrine-level codification. Default: just write the digest, don't propose edits.
- `--write-digest PATH` — where to save the human-readable digest. Default: `~/.claude/data/shopstack-lessons-curator/digest-YYYY-MM-DD.md`.
- `--mode patterns|metrics|both` — `patterns` (default) does the verdict-style analysis below. `metrics` skips the patterns and produces aggregate stats only (tickets shipped, average cycle time, failure rate per phase, escalations per week — see "Metrics mode" below). `both` does both, with patterns first then metrics appended.

## Metrics mode

When `--mode metrics` (or `both`), append an aggregate-stats section to the digest. Pulls from `lessons.jsonl` + `~/.claude/data/shopstack-autopilot/state.json` (for in-flight context) + `gh pr list --author mshery --state merged --search "merged:>=${SINCE}"` (for shipped data):

```markdown
## Metrics — last <N> days

### Throughput
- PRs merged:       <n>   (avg <m>/day)
- PRs opened:       <n>
- Avg cycle time:   <hours from dispatch to merge>   (p50 / p90)
- Tickets shipped overnight (autopilot runs): <n>

### Reliability
- Autopilot escalations: <n>   (=<rate>/day)
- CI failure rate:        <pct>   (auto-fixed: <pct>, escalated: <pct>)
- Rollbacks executed:     <n>
- Main-watcher alerts:    <n>   (resolved: <n>, false-positive: <n>)

### Self-learning effectiveness
- Lessons with `outcome: passed` and `reusable: true`: <n>
- Lessons applied successfully (consult-and-fix without retry): <n>
- Time saved by known-fix application:  ≈<hours>
  (estimated from "phase X used to take Y, now takes Z")

### By phase (top 5 most common failures)
| Phase           | Count | Pass rate | Avg time-to-fix |
|---|---|---|---|
| schema_collision| 23    | 100%      | 0.5 min  |
| typecheck_fail  | 14    | 79%       | 2 min    |
| ci_failure      | 11    | 45%       | 6 min    |
| ...             |       |           |          |

### Trend (vs prior 7 days)
- Throughput:    +12%   📈
- Escalations:   -25%   📉
- Cycle time:    -8%    📉   (faster)
```

The metrics give the user (the PM half of "engineer + PM") a feel for whether the system is actually getting better over time. Run weekly to see trends.

## Pipeline

### Step 1 — Load the corpus

```bash
LESSONS=~/.claude/data/shopstack-autopilot/lessons.jsonl
SINCE_DATE="${SINCE:-$(date -v-7d +%Y-%m-%d)}"   # macOS; Linux: date -d '7 days ago'

# Filter entries newer than --since
jq -c "select(.at >= \"${SINCE_DATE}\")" "$LESSONS" > /tmp/lessons-recent.jsonl
TOTAL=$(wc -l < /tmp/lessons-recent.jsonl)
```

If the file doesn't exist or is empty, emit a friendly "no lessons yet" digest and stop.

### Step 2 — Group by (phase, signal)

For each unique `{context.phase, context.signal}` pair, collect:
- Total occurrences
- Pass count
- Fail count
- Escalation count
- The set of distinct `action` values used
- First-seen and last-seen timestamps

```bash
# Pseudocode — actual implementation uses jq + sort + uniq -c
jq -r '"\(.context.phase)\t\(.context.signal)\t\(.outcome)\t\(.action)"' /tmp/lessons-recent.jsonl \
  | sort | uniq -c | sort -rn > /tmp/lessons-groups.txt
```

### Step 3 — Apply pattern rules

For each group with `total >= --min-occurrences`:

| Rule | Verdict | Recommendation |
|---|---|---|
| pass_count >= 5 AND pass_rate >= 0.9 AND one dominant `action` | **promote** | This is now a known-good default. Doctrine should codify it OR add to the "decide yourself" list. |
| fail_count >= 3 AND fail_rate >= 0.7 | **retire** | Anti-knowledge — autopilot should stop trying this. Add a `do_not_retry` flag to future lessons matching this signal. |
| escalation_count >= 3 AND no pass entries | **structural problem** | The pattern is fundamentally beyond automation. Surface to the user — there's a real underlying bug or process gap. |
| Total occurrences spiked (>3x the rolling 4-week avg) AND in the last 7 days | **anomaly** | Something changed recently. Investigate. |
| Mixed pass/fail with same `action` (pass_count and fail_count both >= 3) | **context-sensitive** | The fix works sometimes; the consult-on-occurrence flow is correct. No change. |

### Step 4 — Cross-reference with skill files

For each `promote` verdict, check whether the doctrine memory already mentions the fix:

```bash
grep -l "<key term from action>" \
  ~/.claude/projects/-Users-aura-Documents-ShopStack/memory/*.md
```

- If yes → no doctrine change needed; the lesson agrees with existing doctrine. Note it in the digest as "validates existing rule".
- If no → propose a doctrine edit (only if `--propose-doctrine-edit` is set).

For each `retire` verdict, check whether the doctrine OR any skill file recommends the now-failed action:

- If yes → propose an edit removing that recommendation. Surface as a doctrine-level warning.
- If no → just note in the digest.

### Step 5 — Write the digest

Save to `--write-digest` path (default `~/.claude/data/shopstack-lessons-curator/digest-YYYY-MM-DD.md`):

```markdown
# Lessons Digest — YYYY-MM-DD

**Window:** Last 7 days (since YYYY-MM-DD)
**Corpus:** N total lessons, M distinct (phase, signal) groups

---

## Promote — known-good fixes worth codifying

### 1. `prisma/migrations directory` collision → `db:renumber`
- **Occurrences:** 23 in last 7 days, 100% pass rate
- **Action:** `npm run prisma:migrate:dev` (rename migration directory)
- **Doctrine status:** ✅ already in `the prisma rules in .claude/rules/prisma.md`
- **Recommendation:** none — doctrine and corpus agree

### 2. `instanceof Date` → `typeof === 'string'`
- **Occurrences:** 12 in last 7 days, 11/12 pass rate
- **Doctrine status:** mentioned only in doctrine section 1 ("routine choices") as an example
- **Recommendation:** consider promoting from "example" to a named rule in section 1 since it's recurring this often

---

## Retire — fixes that don't work

### 1. `Cannot find module 'X'` → "add missing import"
- **Occurrences:** 8 in last 7 days, 2/8 pass rate (75% failure)
- **Pattern:** When the missing module is from a peer package whose `package.json` was renamed, the auto-import fix doesn't work — the import target is wrong.
- **Recommendation:** Add a check: if the missing module path doesn't resolve via `find` in the worktree, escalate instead of guessing the import path.

---

## Structural problems — beyond automation

### 1. `vitest: inventory.adjustments.test.ts > preserve cycle order`
- **Occurrences:** 5 escalations, 0 passes
- **Pattern:** This test has flaked 5 times in 7 days, each time escalated. May be a flaky test, may be a real recurring regression in cycle-ordering logic.
- **Recommendation:** Triage this test specifically — either stabilize or rewrite. Create a dedicated SOU ticket.

---

## Anomalies — frequency spikes

### 1. `mcp_disconnect` (Linear MCP)
- **This week:** 14 occurrences
- **Prior 4-week avg:** 2 per week
- **Recommendation:** Check Linear MCP connection stability — something changed.

---

## Summary stats

| Pattern type | Count |
|---|---|
| Promote | 2 |
| Retire | 1 |
| Structural | 1 |
| Anomaly | 1 |
| No change (context-sensitive) | 14 |
| Total groups analyzed | 19 |
| Total lessons in window | 87 |

## Next curator run

Recommended: `/shopstack-lessons-curator` weekly. Schedule via `/schedule create "weekly lessons curate" "0 9 * * MON" /shopstack-lessons-curator --propose-doctrine-edit`.
```

### Step 6 — Propose doctrine edits (only if `--propose-doctrine-edit`)

For each `promote` or `retire` verdict, produce a unified-diff-style patch proposal — but **don't apply it**. Save to `~/.claude/data/shopstack-lessons-curator/proposed-patches-YYYY-MM-DD.md`:

```markdown
# Proposed doctrine patches — YYYY-MM-DD

## Patch 1 — Promote `instanceof Date` → `typeof === 'string'` to named rule

**File:** `the autopilot doctrine inside this skill`
**Section:** 1. Autonomy (self-decisions)

**Add line under "Take the decision yourself":**

```diff
+ - When typecheck fails after rebase with "Property 'getTime' does not exist on type 'string'" (prisma date columns deserialize as ISO strings), replace `instanceof Date` checks with `typeof x === 'string'`. Recurring pattern; treat as a known fix.
```

**Justification:** 12 occurrences in the last 7 days, 11/12 pass rate. Currently only mentioned as an unstructured example.

**To apply:** review the patch, then run `/<your-edit-command>` to add to the doctrine memory.
```

The curator never edits the doctrine itself — the human reviews the patches and applies the ones they agree with. Doctrine is too important to auto-mutate.

### Step 7 — Output

```
SOUTHFLORAL_LESSONS_DIGEST
window:           last <N> days (since <date>)
total_lessons:    <n>
groups_analyzed:  <n>
promote:          <n>
retire:           <n>
structural:       <n>
anomaly:          <n>
digest_path:      <path to the .md>
proposed_patches: <path or "none (--propose-doctrine-edit not set)">
```

Then say: "Lessons digest written to <path>. <N> patterns recommended for doctrine review."

## Hard rules

- **Never modify `lessons.jsonl`.** Append-only. The doctrine says so for a reason — even bad lessons are signal.
- **Never auto-apply doctrine patches.** Always propose and let the human review.
- **Never include user-specific or PII data in the digest.** The lessons themselves don't contain PII (signals are first-line errors), but spot-check before writing.
- **Be skeptical of small sample sizes.** `--min-occurrences` defaults to 5 for a reason — 2 occurrences isn't a pattern.
- **Read the actual lessons, don't paraphrase by stat alone.** A 5/5 pass rate might still be context-dependent if the contexts differ. Surface the contexts in the digest.

## Related skills

- [[shopstack-autopilot]] — writes the lessons this skill consumes
- [[shopstack-pr-babysitter]] — also writes to the same lessons file
- [[anthropic-skills:consolidate-memory]] — the global equivalent; this skill is the shopstack-specific version
