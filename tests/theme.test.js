import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { resolveTheme } from '../script.js';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('script.js stays importable without a DOM and exports the theme resolver', () => {
  assert.equal(typeof resolveTheme, 'function');
});

test('an explicit stored choice wins over the operating system', () => {
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('light', true), 'light');
});

test('with no stored choice the page follows the operating system', () => {
  assert.equal(resolveTheme(null, true), 'dark');
  assert.equal(resolveTheme(null, false), 'light');
  assert.equal(resolveTheme(undefined, true), 'dark');
});

test('an unrecognised stored value falls back to the operating system', () => {
  assert.equal(resolveTheme('синий', true), 'dark');
  assert.equal(resolveTheme('', true), 'dark');
});

test('the resolver only ever answers dark or light', () => {
  const answers = ['dark', 'light', null, undefined, 'nonsense', ''].flatMap((stored) =>
    [true, false].map((prefersDark) => resolveTheme(stored, prefersDark)),
  );

  for (const answer of answers) {
    assert.ok(answer === 'dark' || answer === 'light', `got ${JSON.stringify(answer)}`);
  }
});

test('the anti-flash script sets the theme before the body is parsed', () => {
  // Ищем настоящий тег, а не любое упоминание: строка «<body>» может попасть
  // в комментарий раньше по файлу.
  const bodyTag = html.search(/<body[\s>]/);
  const script = html.indexOf('documentElement.classList');

  assert.notEqual(bodyTag, -1, 'index.html has no body tag');
  assert.notEqual(script, -1, 'index.html has no inline script that applies the theme class');
  assert.ok(script < bodyTag, 'the theme class must be applied in <head>, or the page flashes light');
});

test('the page declares a theme-color for the browser chrome', () => {
  assert.match(html, /<meta\s+name="theme-color"/);
});
