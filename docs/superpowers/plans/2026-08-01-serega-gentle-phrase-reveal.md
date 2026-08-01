# Serega Gentle Phrase Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Animate the random phrase appearance with the Serega Gentle one-shot character reveal when the user clicks "Показать фразу".

**Architecture:** Copy the skill's dependency-free WAAPI assets (`serega-gentle.js` module + `serega-gentle.css`) into the project. `script.js` becomes an ES module that imports `seregaGentle`, creates a new one-shot instance per click, awaits its completion, then holds the phrase for 1.5s before restoring the button.

**Tech Stack:** Vanilla ES6+ (ES modules), Web Animations API, CSS. No build step, no dependencies.

## Global Constraints

- No new dependencies; no build step (project has no package.json).
- Preserve `index.html` button id `show-quote` and heading id `quote` — `script.js` depends on them.
- Copy `assets/waapi/serega-gentle.js` and `assets/waapi/serega-gentle.css` verbatim — do not modify skill assets.
- Motion contract is fixed: enter opacity `0→1`, translateY `15px→0`, 500ms, 15ms stagger, `cubic-bezier(0.2, 0.8, 0.2, 1)`. One-shot reveal — no exit, no loop.
- No `console.log` in production code. No inline styles on structural elements.
- Respect `prefers-reduced-motion` (handled by the skill: static text).
- No test framework exists — verification via `node --check` (ESM syntax) and manual browser check.

---

### Task 1: Copy skill WAAPI assets into project

**Files:**
- Create: `js/serega-gentle.js` (verbatim copy of `.opencode/skills/serega/serega-gentle/assets/waapi/serega-gentle.js`)
- Create: `css/serega-gentle.css` (verbatim copy of `.opencode/skills/serega/serega-gentle/assets/waapi/serega-gentle.css`)

**Interfaces:**
- Produces: ES module exporting `seregaGentle(element, options) => controls` (with `finished: Promise`, `play()`, `destroy()`); CSS classes `.serega-gentle`, `.serega-gentle__word`, `.serega-gentle__unit`.

- [ ] **Step 1: Create `js/` directory**

```bash
New-Item -ItemType Directory -Path "js" -Force
```

- [ ] **Step 2: Copy `serega-gentle.js`**

Copy `.opencode/skills/serega/serega-gentle/assets/waapi/serega-gentle.js` → `js/serega-gentle.js`. Content unchanged (exported `seregaGentle` + default export, ~337 lines).

- [ ] **Step 3: Copy `serega-gentle.css`**

Copy `.opencode/skills/serega/serega-gentle/assets/waapi/serega-gentle.css` → `css/serega-gentle.css`. Content unchanged (24 lines).

- [ ] **Step 4: Verify ESM syntax parses**

Run:
```powershell
Get-Content js/serega-gentle.js -Raw | node --check --input-type=module -
```
Expected: exit 0, no output (syntax valid).

- [ ] **Step 5: Commit**

```bash
git add js/serega-gentle.js css/serega-gentle.css
git commit -m "feat: add serega-gentle animation assets"
```

---

### Task 2: Wire animation into the page

**Files:**
- Modify: `index.html` (add CSS link; `script.js` → `type="module"`)
- Modify: `script.js` (import `seregaGentle`, animate on click)

**Interfaces:**
- Consumes: `seregaGentle(element, { phrases: [string] })` from `./js/serega-gentle.js`; returns `controls` with `finished` promise.
- Produces: new click flow — hide button → animate phrase reveal → `await finished` → hold 1.5s → show button.

- [ ] **Step 1: Update `index.html`**

After the `las.css` link (line 11), add:
```html
    <link rel="stylesheet" href="css/serega-gentle.css" />
```
Change the script tag (line 21) from:
```html
  <script src="script.js"></script>
```
to:
```html
  <script type="module" src="script.js"></script>
```

- [ ] **Step 2: Rewrite `script.js`**

Replace the entire file with:

```javascript
import { seregaGentle } from './js/serega-gentle.js';

const HOLD_MS = 1500;

async function loadPhrases() {
  const res = await fetch('phrases.md');
  const text = await res.text();

  const lines = text.split('\n').filter(line => line.trim().startsWith('- '));
  return lines.map(line => line.replace(/^- /, '').trim());
}

document.addEventListener('DOMContentLoaded', async () => {
  const phrases = await loadPhrases();
  const button = document.getElementById('show-quote');
  const quote = document.getElementById('quote');
  let animation = null;

  button.addEventListener('click', async () => {
    button.style.display = 'none';

    const randomIndex = Math.floor(Math.random() * phrases.length);
    const phrase = phrases[randomIndex];

    animation?.destroy();
    animation = seregaGentle(quote, { phrases: [phrase] });

    await animation.finished;
    await new Promise(resolve => setTimeout(resolve, HOLD_MS));

    button.style.display = '';
  });
});
```

- [ ] **Step 3: Verify ESM syntax parses**

Run:
```powershell
Get-Content script.js -Raw | node --check --input-type=module -
```
Expected: exit 0, no output.

- [ ] **Step 4: Manual browser check**

Open `index.html` in a browser (Chrome 120+):
1. Click "Показать фразу" → button hides, phrase rises in per-character reveal (no blur).
2. Phrase stays ~1.5s after reveal completes, then button returns.
3. Repeated clicks work; a new phrase animates each time.
4. Russian text, punctuation, and non-breaking spaces render intact; lines wrap only between words.
5. With OS "reduce motion" enabled → static text, no animation, button still returns.

- [ ] **Step 5: Commit**

```bash
git add index.html script.js
git commit -m "feat: reveal random phrase with serega-gentle animation"
```

---

## Self-Review

**Spec coverage:** One-shot gentle reveal per click (Task 2), copy assets verbatim (Task 1), fixed motion contract (defaults in asset, no overrides), reduced-motion respected (skill default `respectReducedMotion: true`), 1.5s hold after animation (HOLD_MS). No gaps.

**Placeholder scan:** All steps contain concrete code/commands. No TBD/TODO.

**Type consistency:** `seregaGentle(quote, { phrases: [phrase] })` matches the asset's signature `seregaGentle(element, { phrases, loop, ... })`. `controls.finished` exists (`playbackTask`). `animation?.destroy()` exists. `loop` defaults to `false` for single phrase (one-shot). Consistent.

**Edge cases:** First click — `animation` is `null`, `?.destroy()` is a no-op. Empty `phrases` array (fetch failure) would throw on `phrases[randomIndex]` — pre-existing behavior, unchanged. Rapid re-clicks impossible while button hidden; destroy guards the previous instance.
