# Random Quote — Static HTML/CSS/JS Website

Personal pet project of product designer Andrei Lynnik. A single-page site that shows a random phrase from a markdown list on button click.

**Stack:** HTML5, CSS3 (vanilla, custom properties, native nesting), Vanilla JS (ES6+, async fetch), no dependencies.

**Deploy:** GitHub Pages (`hirundos-dev.github.io/random-quote/`). No build step — raw static files.

## Operating Principles

### Communication
- Start with the result; keep evidence and caveats; remove preamble and repetitions.
- Do not agree automatically: justify errors or weak solutions and offer alternatives.
- Complex changes: explain through product effect, trade-offs, and risks first, then briefly through implementation and verification.

### Autonomy
- Answers, explanations, reviews, diagnostics, and plans do not permit changes; requests to change, implement, or fix permit local reversible actions and relevant checks within the task scope.
- Ask before external, destructive, irreversible, or paid actions, publishing, deployment, secret disclosure, or significant scope expansion.

### Code & Tools
- Determine project tools from configuration and documentation; do not silently substitute a missing runner (this project has no package.json).
- Preserve unrelated user changes; do not apply destructive git commands or kill processes unrelated to the task.

### Tests
- Run `node --test` from the repo root. Node's built-in runner — no package.json, no dependencies, no install step.
- Tests live in `tests/`. They import `script.js` directly, so anything `script.js` does at module scope must stay safe without a DOM.
- Add a test before changing parser, loader or corpus behaviour. Corpus-level tests read `phrases.md` and guard the data itself (mixed scripts, dropped phrases).

## Fix Protocol
Every code change must follow `docs/safe-fix.md` — root cause analysis, minimal change, self-check, blast zone verification.

### safe-fix — ABSOLUTELY MANDATORY
**Violation = revert.** Before every code change, answer, diagnosis, or plan involving the codebase:
1. Phase 1 — Root Cause (read affected files; for bugs — find cause via code, config, or logs; separate confirmed facts from assumptions)
2. Phase 2 — Minimal fix
3. Phase 3 — Self-check (verify result proportional to risk; explicitly state completed checks, unchecked items, and remaining risks)

**No Phase 1–3, no line of code. No Phase 1–3, no answer claiming work is done.**

## Project Structure

```
random-quote/
├── index.html              # Single page: quote heading + "Показать фразу" button
├── script.js               # ES module: fetch phrases.md, animate phrase on click
├── phrases.md              # Phrase list, one `- ` per line (source of data)
├── tests/                  # Tests (node --test)
│   └── load-phrases.test.js
├── js/                     # Scripts
│   └── serega-gentle.js    # Vendored animation module (serega-gentle skill asset)
├── css/                    # Stylesheets, layered like IDS
│   ├── tokens/
│   │   ├── palette.css     # Raw color values (--ids__color-*)
│   │   ├── colors.css      # Semantic color tokens (--ids__text, --ids__accent)
│   │   └── scales.css      # Spacers, gaps, radii, durations
│   ├── reset.css           # Reset (from IDS)
│   ├── settings.css        # @font-face, fluid typography, density
│   ├── page-composition/
│   │   └── layout.css      # Wrapper, text-width, spacers, sequences
│   ├── project.css         # This project's own visual: quote type, button, shine
│   └── serega-gentle.css   # Animation styles (serega-gentle skill asset)
├── fonts/                  # Onest variable, four unicode-range subsets + OFL
├── docs/                   # Documentation
│   ├── safe-fix.md         # Mandatory fix protocol
│   └── ...                 # Specs and history
└── .opencode/              # opencode configuration (commands, skills, agents)
```

## Architecture

### Static Site — No Build System
- Raw HTML5, CSS3, and vanilla JS served as-is.
- No package.json, no bundler, no transpiler, no minification pipeline.
- All CSS and JS are hand-written source files, except vendored skill assets (js/serega-gentle.js, css/serega-gentle.css) copied verbatim from the serega-gentle skill.
- Deployed via GitHub Pages from `main` branch.

### Data Flow
- `script.js` fetches `phrases.md` on load and parses it: a list marker (`-` or `—`, with or without a following space) starts a phrase, headings and blank lines are skipped, each phrase is kept once. A non-ok response or an empty list replaces the button with a visible message rather than failing silently.
- Clicking the button hides it, picks a random phrase, reveals it with the serega-gentle per-character animation, shows it for ~1.5s, then restores the button.
- The site works without JS: heading renders, button requires JS.

### CSS Architecture
The stylesheet stack is a rename of [IDS](https://github.com/intuition-tech/ids) (MIT) — its layer order, `ids__` namespace and token set are kept, while the values, the button and the shine are this project's own. Vendored skill assets are the only other copied files.
- **Naming:** `ids__` namespace prefix for design system classes.
- **Custom Properties:** semantic color tokens (`--ids__text`, `--ids__accent`, `--ids__border`) over a raw palette (`--ids__color-gray-950`), plus density (`--ids__density: 1.3`) and named scales.
- **Opacity:** `color-mix(in srgb, var(--ids__token) N%, transparent)`. IDS tokens are whole colors, not `-RGB` triplets — do not reintroduce `rgba(var(--x-RGB), a)`.
- **Local additions to IDS files carry a comment saying so**, so a future re-sync stays reviewable.
- **Native CSS Nesting** throughout (Chrome 120+, Firefox 117+).
- **Fluid Typography:** `calc()` with viewport units, breakpoints 320/768px.
- **Responsive:** `@media (width < 768px)` range syntax (Chrome 104+, Firefox 113+).
- **Single light theme** — no dark mode. `tokens/colors.css` keeps an unused `.dark` block, so enabling one is a token flip rather than a new system.
- **Fonts:** Onest, a real `wght` 100–900 variable, self-hosted in four `unicode-range` subsets (a Russian page fetches only latin + cyrillic). `font-weight: 450` is therefore a real weight, not synthesis. `fonts/OFL.txt` ships with it.
- **Vendored CSS is overridden, never edited** — `project.css` neutralises the per-glyph `will-change` that `serega-gentle.css` puts on ~500 glyphs of a long phrase.

### Pages
- Single page (`index.html`). Russian language (`lang="ru"`).
- Content (phrases) lives in `phrases.md`, not in HTML.

## Coding Conventions

### HTML
- Semantic HTML5 (`<main>`, `<h3>`, `<button>`).
- Russian language (`lang="ru"`).
- Keep the button id `show-quote` and heading id `quote` — `script.js` depends on them.

### CSS
- Follow the `ids__` naming convention strictly.
- Use semantic color tokens from `css/tokens/colors.css` — no hardcoded color values.
- Use fluid typography via `settings.css` variables — no hardcoded `px` font sizes.
- Prefer `rem`/`em` over `px` for sizing.
- Test at 320px and desktop (768px+).
- No CSS preprocessors, no PostCSS, no utility frameworks.
- This project's own component styles go in `css/project.css`. Do not extend vendored files — override them there.

### JavaScript
- Vanilla ES6+ only — no frameworks, no jQuery, no build step.
- No `console.log` in production code.
- Progressive enhancement — site must work without JS.
- `script.js` is the only hand-written JS file; keep it small and dependency-free. Vendored skill assets (js/serega-gentle.js) are not edited.

### Content
- Phrases live in `phrases.md`, one per line starting with `- `.
- Use non-breaking spaces (`\u00A0`) around short words per Russian typographic rules, matching existing entries.

## Browser Targets
- Modern browsers with CSS nesting support (Chrome 120+, Firefox 117+, Safari 17.2+).
- `:has()` selector, range media queries, CSS custom properties required.
- No IE11, no legacy edge.

## Banned Practices
- No new dependencies without discussion.
- No CSS preprocessors (Sass, Less, PostCSS).
- No JavaScript frameworks or build tools.
- No hardcoded colors — use semantic tokens from `css/tokens/colors.css`.
- No hardcoded font sizes — use fluid typography from `settings.css`.
- No `!important` except for third-party overrides.
- No inline styles on structural elements.
- One change = one purpose.
- Destructive git commands outside task scope (rebase --force, reset --hard, push --force).

## Improvement Proposals
Proposals should state Context & Problem, Proposed Solution, Considered Alternatives, Risks, Implementation Plan.
