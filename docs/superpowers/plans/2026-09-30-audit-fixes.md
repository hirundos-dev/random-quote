# Audit Fixes (П1, П2, П4) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the three audit findings picked by the author: duplicate RU corpus lines with a real test guard, the stale `verify.md`/generic `update-docs.md`, and the README formatting.

**Architecture:** Three independent tasks, one commit each. Task 1 changes data (`phrases.md`) plus test guards (raw-line checks that cannot pass vacuously). Tasks 2–3 are documentation-only changes that cannot break the suite but are still verified by a full `node --test` run.

**Tech Stack:** Plain text data, Node's built-in test runner (`node --test`), Markdown docs. No dependencies, no build step.

**Spec:** Audit report from 2026-09-30 (conversation) — findings П1, П2, П4.

## Global Constraints

- Test first, always: a corpus/parser change requires a failing test before the fix (`docs/safe-fix.md`, AGENTS.md "Tests" section).
- One change = one purpose; one commit per task. Follow the commit messages in the plan.
- Preserve CRLF line endings and the absent trailing newline in `phrases.md` — the diff must touch only the two duplicate lines.
- Remove duplicate lines by content, not line number (line numbers shift).
- No new dependencies, no `console.log`, keep script diff empty (Task 1 changes only corpus + tests).
- `node --test` from repo root is the verification command.

## Review Focus

- The new RU repeat guard reads the raw file (markers stripped by the parser's own rule), so a future duplicate in any position fails the suite — the old guard ran on the parser's deduplicated output and could never fail.
- Duplicate removal must not change the unique count: RU unique stays 325 = EN unique 325 (en-corpus parity test pins it).
- The EN repeat guard must also become a raw-line check — it is currently vacuous for the same reason.
- `verify.md` must reference only existing files/agents after the rewrite; `update-docs.md` must describe only artifacts that exist in this repo.
- No behavior change for the site: duplicates never rendered anyway; the fix is data hygiene + test honesty.

---

### Task 1: Drop duplicate RU corpus lines and make the repeat guards real

**Files:**
- Modify: `phrases.md` (remove the second occurrence of each duplicated phrase, by content)
- Modify: `tests/load-phrases.test.js` (add raw-file RU repeat guard)
- Modify: `tests/en-corpus.test.js` (convert the EN repeat guard to a raw-file check)

**Interfaces:**
- Consumes: `parsePhrases` from `script.js` (unchanged), corpus files read via `readFileSync` in the tests.
- Produces: nothing for later tasks; en-corpus parity test keeps pinning `325 = 325`.

- [ ] **Step 1: Write the failing RU guard in `tests/load-phrases.test.js`**

```js
test('no Russian phrase is repeated in the raw corpus', () => {
  const seen = new Set();

  for (const rawLine of corpus.split('\n')) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;
    const phrase = line.replace(/^\s*[-—]\s?/, '').trim();
    if (phrase === '') continue;

    assert.ok(!seen.has(phrase), `repeated phrase: ${phrase}`);
    seen.add(phrase);
  }
});
```

- [ ] **Step 2: Run `node --test` — expect FAIL listing «Смело расставаться…» and «Аристократа…» duplicates.**

- [ ] **Step 3: Remove the duplicate lines from `phrases.md`** — drop any line whose phrase already appeared earlier in the file; keep the first occurrence, preserve all other bytes (CRLF, final newline absence).

- [ ] **Step 4: Convert the EN repeat guard in `tests/en-corpus.test.js`** from iterating `parsePhrases(enText)` (already deduplicated → vacuous) to a raw scan of `enText`, same extraction rule.

- [ ] **Step 5: Run `node --test` — expect all green, 59 tests (58 prior + 1 new RU guard).** Unique RU/EN counts stay 325/325 (en-corpus parity test).

- [ ] **Step 6: Commit**

```bash
git add phrases.md tests/load-phrases.test.js tests/en-corpus.test.js
git commit -m "fix(corpus): drop duplicate Russian phrases and guard raw repeats"
```

### Task 2: Fix `verify.md` and adapt `update-docs.md`

**Files:**
- Modify: `.opencode/commands/verify.md`
- Modify: `.opencode/commands/update-docs.md`

**Interfaces:**
- Produces: commands usable by `opencode` with only existing agents; no code depends on them.

- [ ] **Step 1: Rewrite `verify.md`** — remove `agent: build` (no such agent in `opencode.json`; use `code-reviewer` which has read+bash), reference real files (`reset.css`, `project.css` instead of `normalize`/`las`), make `node --test` the canonical runner, keep it short and accurate.

- [ ] **Step 2: Rewrite `update-docs.md`** — inventory the docs that actually exist (`AGENTS.md`, `README.md`, `LICENSE`/`CC`, `docs/safe-fix.md`, `docs/superpowers/plans/*`); sync checklist for this repo: page pair, corpus mirror 325/325, greeting cascade (data-greeting × 2 + GREETING_FALLBACK + test regexes) and the AGENTS.md structure tree. Drop API/JSDoc/versioning sections.

- [ ] **Step 3: Run `node --test`** — suite stays green (docs-only change; regression-proof).

- [ ] **Step 4: Commit**

```bash
git add .opencode/commands/verify.md .opencode/commands/update-docs.md
git commit -m "docs(opencode): fix verify command and adapt update-docs"
```

### Task 3: Tidy README

**Files:**
- Modify: `README.md`

**Interfaces:**
- None.

- [ ] **Step 1: Rewrite `README.md`** to the compact version (no leading blank lines, same license links).

- [ ] **Step 2: Run `node --test`** — suite stays green.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: tidy README"
```