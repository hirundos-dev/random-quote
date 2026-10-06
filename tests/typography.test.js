import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

/* Флюидная типографика задана двумя линейными шкалами с общим швом на
   --mobile-desktop-breakpoint. Ровно в точке шва мобильная формула отдаёт
   свой максимум, а десктопная — свой минимум, поэтому непрерывность кегля
   держится одним равенством: --mobile-font-size-max == --desktop-font-size-min.
   Эти тесты стерегут именно инвариант, а не конкретные числа. */

const css = readFileSync(new URL('../css/settings.css', import.meta.url), 'utf8');

function setting(name) {
  const match = css.match(new RegExp(`--${name}:\\s*([\\d.]+)`));

  assert.ok(match, `settings.css declares no --${name}`);

  return Number(match[1]);
}

test('the two fluid scales meet at the same root font-size', () => {
  const mobileMax = setting('mobile-font-size-max');
  const desktopMin = setting('desktop-font-size-min');

  assert.equal(
    mobileMax,
    desktopMin,
    `the ${setting('mobile-desktop-breakpoint')}px seam would jump from ${mobileMax}px to ${desktopMin}px`,
  );
});

test('the media queries use the same breakpoints as the formulas', () => {
  const queries = new Set(
    [...css.matchAll(/@media screen and \(min-width: (\d+)px\)/g)].map((m) => Number(m[1])),
  );

  assert.deepEqual(
    [...queries].sort((a, b) => a - b),
    [
      setting('mobile-viewport-min'),
      setting('mobile-desktop-breakpoint'),
      setting('desktop-viewport-max'),
    ],
  );
});

test('the root font-size never jumps between neighbouring viewport widths', () => {
  const mobileMin = setting('mobile-font-size-min');
  const mobileMax = setting('mobile-font-size-max');
  const desktopMin = setting('desktop-font-size-min');
  const desktopMax = setting('desktop-font-size-max');
  const from = setting('mobile-viewport-min');
  const seam = setting('mobile-desktop-breakpoint');
  const to = setting('desktop-viewport-max');

  const root = (width) => {
    if (width < from) return mobileMin;
    if (width < seam) return mobileMin + (mobileMax - mobileMin) * ((width - from) / (seam - from));
    if (width < to) return desktopMin + (desktopMax - desktopMin) * ((width - seam) / (to - seam));

    return desktopMax;
  };

  /* Соседние ширины не должны отличаться заметно: разрыв в 20px на одном
     пикселе ширины — это тот самый обрыв, который не видно в коде формул. */
  for (let width = from; width <= 1920; width += 1) {
    const jump = Math.abs(root(width + 1) - root(width));

    assert.ok(jump < 0.5, `${width}px → ${width + 1}px jumps by ${jump.toFixed(2)}px`);
  }
});
