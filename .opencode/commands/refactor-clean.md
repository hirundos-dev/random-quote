---
description: Remove dead code and consolidate duplicates
agent: refactor-cleaner
subtask: true
---

# Refactor Clean Command

Analyze and clean up the codebase: $ARGUMENTS

## Your Task

1. **Detect dead code** by manual analysis (no build tools in this static site)
2. **Identify duplicates** and consolidation opportunities
3. **Safely remove** unused code with documentation
4. **Verify** no functionality broken

## Detection Phase

### Manual Checks

- Unused CSS rules (selectors that match nothing in `index.html`)
- Unused CSS files not linked from `index.html`
- Unused functions / variables in `script.js`
- Commented-out code
- Unreachable code
- Duplicate CSS rules across `css/layout.css` and `css/las.css`
- Unused design tokens in `css/colors.css`

## Removal Phase

### Before Removing

1. **Search for usage** - grep for the selector/function in all files
2. **Check dynamic usage** - `script.js` may reference classes/IDs via `getElementById`
3. **Document removal** - git commit message
4. **Never remove tokens from `css/colors.css` without checking all CSS files**

### Safe Removal Order

1. Remove unused CSS rules (selectors with no matching elements)
2. Remove unused functions in `script.js`
3. Remove duplicate CSS declarations (keep the one that wins)
4. Remove unused files

## Consolidation Phase

### Identify Duplicates

- Similar CSS rules with minor differences
- Repeated layout patterns in `css/layout.css`

### Consolidation Strategies

1. **Extract shared class** - for repeated rule blocks
2. **Use existing tokens** - replace hardcoded values with `var(--las__...)`

## Verification

After cleanup:

1. `node --check script.js` - JS still parses
2. Open `index.html` locally - button shows a random phrase
3. No missing asset references
4. Visual check at 320px and desktop widths

## Report Format

```
Dead Code Analysis
==================

Removed:
- css/las.css: .quote-container (no matching element in index.html)
- script.js: unusedFunction() (no callers)

Consolidated:
- duplicate border-radius declarations → var(--las__radius)

Remaining (manual review needed):
- css/normalize.css: potentially unused, third-party reset, keep
```

---

**CAUTION**: Always verify before removing. When in doubt, ask or leave a `TODO: verify usage` comment.
