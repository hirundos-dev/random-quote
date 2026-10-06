---
description: Run verification loop to validate implementation
agent: code-reviewer
---

# Verify Command

Run verification loop to validate the implementation: $ARGUMENTS

## Your Task

Execute comprehensive verification for this static site (no build step, no package.json, no dependencies):

1. **Test suite**: `node --test` from the repo root — Node's built-in runner. This is the canonical gate: all must pass. The suite asserts its own size; never write the test count into a doc.
2. **Language sync**: `tests/language.test.js` pins both pages' chrome, config attributes, hreflang/canonical and the identical anti-flash head script. `tests/en-corpus.test.js` pins the RU/EN corpus mirror (equal unique counts), no Cyrillic in EN, no raw repeats and no missing list marker in either corpus.
3. **Typography seam**: the root font-size is two fluid scales that meet at the 768px breakpoint — `tests/typography.test.js` samples every width and fails on a jump.
4. **Assets**: every `src`/`href`/`url()` a page or stylesheet references resolves to a file on disk — `tests/language.test.js` already checks the page references; spot-check new ones.
5. **No console.log**: `grep -n "console\." script.js` must return nothing.

## Verification Checklist

### Code Quality
- [ ] `node --test` green
- [ ] No `console.log` in `script.js` or vendored js
- [ ] No hardcoded colors — only `var(--ids__...)` from `css/tokens/colors.css`
- [ ] No hardcoded font sizes — fluid typography from `css/settings.css`

### Assets
- [ ] All linked CSS files exist (`tokens/palette.css`, `tokens/colors.css`, `tokens/scales.css`, `reset.css`, `settings.css`, `page-composition/layout.css`, `serega-gentle.css`, `serega-emotional.css`, `project.css`)
- [ ] Font `url()` paths resolve in `fonts/`
- [ ] `phrases.md` and `phrases.en.md` parse to the same number of unique phrases (the parity test owns that number)

### Accessibility & i18n
- [ ] Both pages declare `lang`, one `h1` (visually hidden), a labelled `#theme-toggle` with `aria-pressed`, and a labelled language link
- [ ] The English page carries no Cyrillic; the corpus-greeting cascade is in sync (both `data-greeting` attributes, `GREETING_FALLBACK` in script.js, and the greeting regexes in `tests/en-corpus.test.js`)

## Verification Report

### Summary
- Status: PASS: PASS / FAIL: FAIL
- Score: X/Y checks passed

### Details
| Check | Status | Notes |
|-------|--------|-------|
| Test suite (`node --test`) | PASS:/FAIL: | [details] |
| Assets | PASS:/FAIL: | [details] |
| Corpus parity | PASS:/FAIL: | [details] |
| Console.log | PASS:/FAIL: | [details] |

### Action Items
[If FAIL, list what needs to be fixed]

---

**NOTE**: Verification loop should be run before every commit and PR.
