---
name: shopstack-smoke-tester
description: Fast smoke test for a ShopStack branch — runs typecheck, build, and a boot-the-app health check on `main` (or a `main` integration branch when one is in use). Catches regressions in ~60 seconds before they spread. Use after shopstack-ship-module integrates a batch, or when the user says "smoke test main", "is main green", "smoke test main", "verify the integration branch", or "run a fast check on the module".
---

# ShopStack — Smoke Tester

You run a **fast, automated sanity check** on a ShopStack branch after PRs merge into it. Goal: detect breakage in ~60 seconds so the orchestrator can either continue or pause for human attention.

In this repo, `main` is the default integration target (per `ShopStack ships to `main` directly`). The legacy `main` flow is still supported as an opt-in for runs that explicitly use an integration branch.

This is **not** a replacement for the per-ticket QA (which still happens before each PR). This is the integration-level gate that catches "two PRs that were each green individually but break together."

## When to use

- After a batch of PRs merges into `main` and you want a fast green/red signal.
- After `/shopstack-ship-module` flushes a batch (only when `--base-branch qa/...` was used; default main-direct runs rely on per-PR CI instead).
- When the user asks for a fast verification of any branch.

## Inputs

Required:
- **Branch name** (e.g., `main`, `main`) OR a module slug (e.g., `engagements`) which the skill resolves to `main` for backward compatibility.

Optional:
- `--worktree PATH` — run the smoke test in this worktree instead of cloning a fresh checkout (faster).
- `--app NAME` — limit the boot check to a specific app (e.g., `hub`, `web`). Default: skip the boot check.
- `--no-build` — skip `npm run build`. Default: include build.
- `--timeout SECONDS` — hard upper bound on the entire smoke run. Default: 300.

## Steps

### 1. Resolve worktree

If `--worktree` is provided, use it.
Otherwise, create a temporary "smoke" worktree for the integration branch (or reuse the orchestrator's smoke worktree if it already exists):

```bash
REPO=/Users/aura/Documents/ShopStack/ShopStack-Portal
SMOKE_WT=/Users/aura/Documents/ShopStack/ShopStack-worktrees/smoke-${MODULE_SLUG}

git -C "$REPO" fetch origin --prune
if [ ! -d "$SMOKE_WT" ]; then
  git -C "$REPO" worktree add "$SMOKE_WT" "${INTEGRATION_BRANCH}"
else
  git -C "$SMOKE_WT" fetch origin
  git -C "$SMOKE_WT" reset --hard "origin/${INTEGRATION_BRANCH}"
fi
```

Set per-worktree git identity (defensive — smoke runs never commit, but keeps things consistent):

```bash
git -C "$SMOKE_WT" config user.name  "mshery"
git -C "$SMOKE_WT" config user.email "owner@example.com"
```

### 2. Install deps (only if lockfile changed)

```bash
# Cheap check: did package-lock.json change since last smoke run?
HASH_NOW=$(git -C "$SMOKE_WT" rev-parse HEAD:package-lock.json 2>/dev/null || echo none)
HASH_LAST=$(cat "$SMOKE_WT/.smoke-lockhash" 2>/dev/null || echo none)
if [ "$HASH_NOW" != "$HASH_LAST" ]; then
  (cd "$SMOKE_WT" && npm install --frozen-lockfile)
  echo "$HASH_NOW" > "$SMOKE_WT/.smoke-lockhash"
fi
```

Skipping `npm install` when the lockfile hasn't changed cuts smoke time from minutes to seconds in the typical case.

### 3. Typecheck (must pass)

**Do not use bare `npx tsc --noEmit`** — many packages bind typecheck to
their `build` script (no separate `typecheck` entry), and `npm` exits
0 when the requested script doesn't exist, which silently false-passes.
Use the `turbo build` form below; it works because every package has a
`build` script which runs `tsc --noEmit`.

```bash
(cd "$SMOKE_WT" && npm run build) 2>&1 | tee /tmp/smoke-typecheck.log
```

For module runs that touched a specific package, prefer the filtered
form so transitive-only impacts still propagate:

```bash
(cd "$SMOKE_WT" && npm run build \
  --filter="@shopstack/<changed-pkg>^..." \
  --filter="@shopstack/<changed-pkg>") 2>&1 | tee /tmp/smoke-typecheck.log
```

If typecheck fails:
- Capture the **first 20 lines of errors** and the **affected file paths**.
- Cross-reference with `git -C "$SMOKE_WT" log --since='1 day ago' --pretty='%h %s'` to identify which recently-merged commit(s) likely caused it.
- Mark smoke FAIL and stop. Do not proceed to build/boot.
- A "no script" exit-0 is **not** a pass — inspect the log; if the
  command did nothing, treat as FAIL_INFRA and surface to the
  orchestrator.

### 4. Build (must pass, unless --no-build)

```bash
(cd "$SMOKE_WT" && npm run build) 2>&1 | tee /tmp/smoke-build.log
```

This catches errors typecheck misses (route mismatches, missing exports, broken imports in client-only files). If build fails, treat same as typecheck fail.

### 5. Health check (optional, only if --app specified)

If the orchestrator passed `--app hub` or `--app web`, start the dev server in the background and hit a known health endpoint:

```bash
# Start dev server in background
(cd "$SMOKE_WT" && npm run "@shopstack/${APP}" dev) >/tmp/smoke-dev.log 2>&1 &
DEV_PID=$!

# Wait up to 60s for the server to respond
for i in {1..60}; do
  if curl -fsS http://localhost:3000/api/health 2>/dev/null >/dev/null; then
    echo "Health check passed"
    break
  fi
  sleep 1
done

# Always tear down
kill "$DEV_PID" 2>/dev/null
wait "$DEV_PID" 2>/dev/null
```

If the server never responds within the timeout, mark health FAIL.

**Note:** the health endpoint may not exist yet for a new module. If `curl` returns 404 specifically (server is up, endpoint missing), treat as PASS — the server booted, which is what we care about. Only treat connection refusal or 500s as failures.

### 6. Optional — scoped test run

If `--with-tests` is set, run only tests in packages that changed since the last green smoke:

```bash
CHANGED=$(git -C "$SMOKE_WT" diff --name-only "${LAST_GREEN_SHA}".."${INTEGRATION_BRANCH}" | grep '^packages/' | cut -d/ -f1-2 | sort -u)
for pkg in $CHANGED; do
  (cd "$SMOKE_WT" && npm run "./$pkg" test) || break
done
```

This is opt-in because tests can be slow; the orchestrator usually doesn't pass `--with-tests` unless explicitly told.

### 7. Output

```
SOUTHFLORAL_SMOKE_REPORT
module:           <slug>
branch:           main
commit:           <short-sha>
overall:          PASS | FAIL
duration:         <seconds>
checks:
  typecheck:      pass | fail
  build:          pass | fail | skipped
  health:         pass | fail | skipped (no --app)
  tests:          pass | fail | skipped (no --with-tests)
failure_summary:  <first error line, if any>
suspect_commits:  <last 1-3 commits merged before failure>
log_paths:
  - /tmp/smoke-typecheck.log
  - /tmp/smoke-build.log
  - /tmp/smoke-dev.log
```

End with one of:
- "Smoke PASS for `main` at `<sha>`. Safe to advance."
- "Smoke FAIL for `main` at `<sha>` — `<first error>`. Suspect: `<commit>`. Orchestrator should pause."

## Hard rules

- **Never** commit, push, or modify the integration branch from this skill. It is read-only.
- **Never** leave a dev server running. Always tear down with `kill` + `wait` in a trap.
- **Never** retry on failure. One pass, one verdict. Retries are the orchestrator's choice.
- Cap the entire run at `--timeout` seconds. Kill any subprocess that exceeds it.
- If install/build/typecheck fails for reasons unrelated to recent commits (e.g., flaky network), mark as `FAIL_INFRA` and let the orchestrator decide whether to retry.

## Related skills

- [[shopstack-ship-module]] — invokes this after every batch merge
- [[shopstack-module-status]] — receives the report and writes it to the dashboard
- [[shopstack-qa-engineer]] — per-ticket QA before PR open; complements this integration-level check
