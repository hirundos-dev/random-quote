# Safe Fix Protocol — No Regressions

You are fixing a bug. Your primary objective: eliminate the problem without breaking anything else. Follow this protocol on every fix — no exceptions.

## Phase 1 — Understand before touching the code

Before writing a single line:

    Identify the blast zone. Which files, functions, modules, data flows touch the broken area? List them explicitly.

    Find all callers. Identify every place that calls the broken function, component, or API.

    State the root cause in one sentence. If you can't, you haven't understood the bug yet; keep reading.

    Record expected vs. actual behavior. They must clearly differ.

Do not start editing code until steps 1–4 are complete.

## Phase 2 — Minimal pinpoint fix

    Make the smallest possible change that addresses the root cause. Do not refactor, rename, or improve unrelated code in the same diff.

    One fix — one response. If you find multiple bugs, fix them separately.

    Preserve all existing interfaces. Function signatures, return types, props, API contracts — change only if the bug lives there, and explicitly note it.

    Do not alter behavior beyond the stated problem, even if you see something done incorrectly. Log it as a separate task.

## Phase 3 — Self-check before responding

After writing the fix, go through each point:

    The root cause is eliminated, not just a symptom

    All callers of the modified code work with the new version

    Types and interfaces are compatible (no implicit any introduced, generics not broken)

    No side effects (no new global state, extra network requests, changed defaults)

    Edge cases considered: null/undefined, empty arrays, zero values, concurrent calls

    Error handling is not worse than before (not silently swallowed)

    Existing tests still pass (run them mentally)

    If no tests exist — describe what a test for this fix should verify

If any point fails — correct it before answering.

## Phase 4 — Explaining the fix

Every response with a fix must include:

🔍 Root Cause — one sentence: what exactly broke and why.

🔧 Fix — what was changed and why this solves the problem.

📡 Blast Zone Check — which parts of the code were verified and confirmed unaffected.

⚠️ Risks — what could go wrong in edge cases or adjacent areas. If none, write "None identified."

✅ How to Verify — 1–3 concrete steps to confirm the fix works.

## Phase 5 — If you are unsure

If the fix is non-obvious or touches critical logic — propose, do not apply. Show the diff and explain trade-offs before making changes. Explicitly state uncertainty: "I'm not 100% sure this won't affect X — please check." Prefer reversible changes — a fallback or guard clause is safer than a rewrite.

## Anti-patterns — never do the following

    Fix a symptom without finding the root cause

    Copy a fix from one place, hoping it works in another

    Delete code that "looks unused" as part of a bug fix

    Change multiple unrelated things in a single response

    Silently suppress errors via try/catch or || null without explaining why

    Assume a fix works without mentally walking through at least one execution path

## Quick self-check before every response

If I apply only this change — will the bug disappear? Will something that worked before now break? Am I confident — or guessing?

If the answer is "guessing" — say so explicitly in the response.