---
description: Run verification loop to validate implementation
agent: build
---

# Verify Command

Run verification loop to validate the implementation: $ARGUMENTS

## Your Task

Execute comprehensive verification for this static site (no build step, no package.json):

1. **JS Syntax**: `node --check script.js`
2. **Asset References**: every `src`/`href` in `index.html` and CSS `url()` points to an existing file
3. **Phrases**: `phrases.md` parses (lines starting with `- `), fetch works
4. **CSS**: no duplicate selectors, all `--las__*` tokens resolve in `css/colors.css`

## Verification Checklist

### Code Quality
- [ ] No JS syntax errors
- [ ] No `console.log` statements
- [ ] No dead CSS selectors in `css/las.css` (elements exist in `index.html`)
- [ ] No hardcoded colors — use `var(--las__...)` from `css/colors.css`

### Assets
- [ ] All linked CSS files exist (`colors`, `normalize`, `settings`, `layout`, `las`)
- [ ] Font `url()` paths resolve in `fonts/`
- [ ] `phrases.md` contains at least one phrase

### Accessibility
- [ ] Page has `lang="ru"` and `<title>`
- [ ] Button is focusable and has visible text

## Verification Report

### Summary
- Status: PASS: PASS / FAIL: FAIL
- Score: X/Y checks passed

### Details
| Check | Status | Notes |
|-------|--------|-------|
| JS syntax | PASS:/FAIL: | [details] |
| Assets | PASS:/FAIL: | [details] |
| Phrases | PASS:/FAIL: | [details] |
| CSS | PASS:/FAIL: | [details] |

### Action Items
[If FAIL, list what needs to be fixed]

---

**NOTE**: Verification loop should be run before every commit and PR.
