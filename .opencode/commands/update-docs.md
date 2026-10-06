---
description: Update documentation for recent changes
agent: doc-updater
subtask: true
---

# Update Docs Command

Update documentation to reflect recent changes: $ARGUMENTS

## Your Task

This static site has no API, no package.json, no version numbers. The documentation that exists:

- `AGENTS.md` — operating principles and the project structure tree; the tree must list every real file
- `README.md` — demo link, license notice (code MIT, content CC BY-NC-SA)
- `LICENSE`, `CC` — license texts, referenced from README
- `docs/safe-fix.md` — mandatory fix protocol
- `docs/superpowers/plans/*` — implementation plans (one per feature)

## Sync Checklist

Run `git diff --name-only` first, then check each touched area against its doc:

- [ ] **Pages pair**: both `index.html` and `en/index.html` carry the same chrome, head metadata and anti-flash script (except language-specific copy). Changes to one page must mirror in the other.
- [ ] **Corpus mirror**: `phrases.md` and `phrases.en.md` must hold the same number of unique phrases. Never write that number into a doc — `tests/en-corpus.test.js` owns it. A corpus change in one locale requires the other — and possibly the greeting cascade.
- [ ] **Greeting cascade**: the greeting phrase lives in 5 places that must stay in sync — `data-greeting` on both `<html>` elements, `GREETING_FALLBACK` in `script.js`, and the greeting regexes in `tests/en-corpus.test.js`.
- [ ] **AGENTS.md structure tree**: reflects actual files after rename/remove/add.
- [ ] **README / LICENSE / CC**: still accurate about licensing and the demo URL.

## Quality Bar

- Accurate and up-to-date; no generic filler (no API/JSDoc/versioning sections — they do not apply here).
- Documentation updated alongside code changes, not as an afterthought.
- After the change: `node --test` still green (docs never break it, but the command is the project's verification gate).