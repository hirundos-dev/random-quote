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
├── script.js               # Fetch phrases.md, random phrase on click
├── style.css               # Legacy stylesheet (not linked from index.html)
├── phrases.md              # Phrase list, one `- ` per line (source of data)
├── css/                    # Stylesheets
│   ├── normalize.css       # Reset (v8.0.1)
│   ├── colors.css          # Color tokens (CSS custom properties, --las__*)
│   ├── settings.css        # @font-face, fluid typography, density
│   ├── layout.css          # Wrapper, spacing, responsive layout
│   └── las.css             # Component styles (button, quote display)
├── fonts/                  # Root UI (active), Onest (available)
├── docs/                   # Documentation
│   ├── safe-fix.md         # Mandatory fix protocol
│   └── ...                 # Specs and history
└── .opencode/              # opencode configuration (commands, skills, agents)
```

## Architecture

### Static Site — No Build System
- Raw HTML5, CSS3, and vanilla JS served as-is.
- No package.json, no bundler, no transpiler, no minification pipeline.
- All CSS and JS are hand-written source files.
- Deployed via GitHub Pages from `main` branch.

### Data Flow
- `script.js` fetches `phrases.md` on load and parses lines starting with `- `.
- Clicking the button hides it, picks a random phrase, shows it for ~1.5s, then restores the button.
- The site works without JS: heading renders, button requires JS.

### CSS Architecture
- **Naming:** `las__` namespace prefix for design system classes.
- **Custom Properties:** semantic color tokens (`--las__*-RGB`), density (`--las__density: 1.3`).
- **Native CSS Nesting** throughout (Chrome 120+, Firefox 117+).
- **Fluid Typography:** `calc()` with viewport units, breakpoints 320/768px.
- **Responsive:** `@media (width < 767px)` range syntax (Chrome 104+, Firefox 113+).
- **Single light theme** — no dark mode.

### Pages
- Single page (`index.html`). Russian language (`lang="ru"`).
- Content (phrases) lives in `phrases.md`, not in HTML.

## Coding Conventions

### HTML
- Semantic HTML5 (`<main>`, `<h3>`, `<button>`).
- Russian language (`lang="ru"`).
- Keep the button id `show-quote` and heading id `quote` — `script.js` depends on them.

### CSS
- Follow the existing `las__` naming convention strictly.
- Use CSS custom properties from `colors.css` (`--las__*`) — no hardcoded color values.
- Use fluid typography via `settings.css` variables — no hardcoded `px` font sizes.
- Prefer `rem`/`em` over `px` for sizing.
- Test at 320px and desktop (768px+).
- No CSS preprocessors, no PostCSS, no utility frameworks.
- `style.css` is legacy and not linked from `index.html`; do not extend it.

### JavaScript
- Vanilla ES6+ only — no frameworks, no jQuery, no build step.
- No `console.log` in production code.
- Progressive enhancement — site must work without JS.
- `script.js` is the only JS file; keep it small and dependency-free.

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
- No hardcoded colors — use tokens from `colors.css`.
- No hardcoded font sizes — use fluid typography from `settings.css`.
- No `!important` except for third-party overrides.
- No inline styles on structural elements.
- One change = one purpose.
- Destructive git commands outside task scope (rebase --force, reset --hard, push --force).

## Improvement Proposals
Proposals should state Context & Problem, Proposed Solution, Considered Alternatives, Risks, Implementation Plan.
