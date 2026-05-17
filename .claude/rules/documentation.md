# Documentation

Documentation is for the person who joins the team next week. It is **not** a substitute for clear code; it is a map of the parts code can't show — decisions, trade-offs, context.

## What we write — and where it lives

| Document | Lives in | Purpose |
|---|---|---|
| Top-level `README.md` | repo root | Onboarding, run/build/test, where to find things |
| `docs/<topic>.md` | `docs/` | Deep-dives on cross-cutting topics (e.g. `SVG_ICONS_GUIDE.md`) |
| `docs/adr/NNNN-<slug>.md` | `docs/adr/` | Architecture Decision Records |
| Per-module `README.md` | `modules/<x>/README.md` | What the module owns, public exports, gotchas |
| `.claude/rules/*.md` | `.claude/rules/` | How code is written here (this folder) |
| JSDoc | source files | Public-API surface (see `comments.md`) |

## Top-level README

The root README answers a developer's first 60 seconds. It must include:

1. **What is this?** One paragraph.
2. **Stack** — versions of Node, React, TypeScript, Vite, primary libs.
3. **Run** — `npm install`, `npm run dev`, env vars needed.
4. **Build** — `npm run build`.
5. **Test** — `npm test`, `npm run test:e2e`.
6. **Layout** — pointer to `architecture.md`.
7. **Rules** — pointer to `.claude/rules/project-rules.md`.
8. **Deploy** — how a change gets to prod.

Keep it under ~150 lines. Long content goes into `docs/`.

## Architecture Decision Records (ADRs)

When we make a non-obvious technical decision (picked Zustand over Redux Toolkit; chose axios over `fetch`; moved off Suspense for data), write an ADR. Format:

```
docs/adr/0001-zustand-for-client-state.md
```

Template:

```markdown
# 0001 — Zustand for client state

Date: 2026-01-15
Status: Accepted

## Context
Why this came up. What we needed.

## Decision
What we chose.

## Consequences
What this enables, what it forecloses, what we'll watch for.

## Alternatives considered
Brief notes on what we rejected and why.
```

ADRs are append-only. To change a decision, write a new ADR that supersedes the old one (`Status: Superseded by 0014`).

## Per-feature README

Each module folder (`modules/<x>/`) gets a short README when it grows past ~10 files (most domain modules will):

- **Public exports** — what other features may import (queries, mutations, types, components)
- **Private internals** — what's intentionally not exported
- **External dependencies** — backend endpoints used, third-party APIs
- **Gotchas** — non-obvious behavior that bit someone

If the feature has fewer than 3 files, code-level naming should be enough.

## Page-level documentation

Pages do not need a README. The screen hook and the page file are the documentation — if they don't read clearly, fix them (see `coding.md` rule 20, the exit rule).

## Diagrams

Mermaid is the default — renders in GitHub and most editors. Put diagrams in markdown:

```markdown
\`\`\`mermaid
flowchart LR
  API --> Normalizer --> Store --> Hook --> Page
\`\`\`
```

If a diagram needs to live separately, store the source (`.mmd`) next to the rendered image; both go in `docs/`.

## Docstrings vs documentation

- JSDoc on public APIs — covered by `comments.md`.
- Module-level prose — only when a file solves a non-obvious problem (a complex normalizer with subtle defaults, a custom hook with surprising semantics). Top-of-file comment, ≤ 10 lines.

## Stale doc detection

Every PR that changes behavior is responsible for updating affected docs in the **same PR**. The review checklist (see `pr-process.md`) includes "docs updated?". If a doc no longer applies, delete it; do not let it rot.

## Don't

- Don't write documentation that restates the code.
- Don't keep a `CHANGELOG.md` by hand — generate from commits (Conventional Commits, see `pr-process.md`) if needed.
- Don't write a "Best Practices" doc that duplicates `.claude/rules/`. Link to the rule instead.
- Don't commit personal notes to the repo. Use Notion / Linear / your own machine.

## See also

- `comments.md` — what belongs as a code comment vs. a doc
- `pr-process.md` — docs in the review checklist
- `architecture.md` — the canonical layout
