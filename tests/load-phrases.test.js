import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { parsePhrases, loadPhrases, pickPhrase } from '../script.js';

const corpus = readFileSync(new URL('../phrases.md', import.meta.url), 'utf8');
const NBSP = '\u00A0';
const plain = (s) => s.replaceAll(NBSP, ' ');

test('script.js is importable without a DOM and exports a parser', () => {
  assert.equal(typeof parsePhrases, 'function');
});

test('reads a plain dash-marker list', () => {
  assert.deepEqual(parsePhrases('- один\n- два'), ['один', 'два']);
});

test('reads em-dash markers', () => {
  assert.deepEqual(parsePhrases('— один\n— два'), ['один', 'два']);
});

test('reads a marker with no following space', () => {
  assert.deepEqual(parsePhrases('-один'), ['один']);
});

test('treats a marker-less line as its own phrase', () => {
  assert.deepEqual(parsePhrases('- один\nдва'), ['один', 'два']);
});

test('skips blank lines and markdown headings', () => {
  assert.deepEqual(parsePhrases('# Фразы\n\n- один\n\n'), ['один']);
});

test('keeps each phrase once', () => {
  assert.deepEqual(parsePhrases('- один\n- два\n- один'), ['один', 'два']);
});

test('preserves non-breaking spaces', () => {
  assert.deepEqual(parsePhrases(`- скажи${NBSP}себе`), [`скажи${NBSP}себе`]);
});

test('returns an empty list when there is nothing to read', () => {
  assert.deepEqual(parsePhrases(''), []);
  assert.deepEqual(parsePhrases('# Фразы\n\n'), []);
});

test('rejects a response that is not ok', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () => ({ ok: false, status: 404, text: async () => '' });

  try {
    await assert.rejects(loadPhrases(), /404/);
  } finally {
    globalThis.fetch = original;
  }
});

test('pickPhrase refuses an empty list instead of returning undefined', () => {
  assert.throws(() => pickPhrase([]), /no phrases/i);
});

test('phrases that the old parser dropped are read back', () => {
  const parsed = parsePhrases(corpus).map(plain);

  assert.ok(
    parsed.includes('Творить добро нужно ради собственной радости.'),
    'line 491 lost its marker and must come back as a phrase',
  );
  assert.ok(
    parsed.some((p) => p.startsWith('Секрет успеха почти любого начинания')),
    'em-dash marker on line 37 was dropped',
  );
  assert.ok(
    parsed.some((p) => p.startsWith('Скажи себе «Я ВСЕГДА ДОБИВАЮСЬ СВОЕГО»')),
    'spaceless marker on line 249 was dropped',
  );
  assert.ok(
    parsed.some((p) => p.startsWith('Скажи себе «Я СМЕЮСЬ НАД НЕВЕЗЕНИЕМ»')),
    'spaceless marker on line 253 was dropped',
  );
});

test('no phrase mixes Cyrillic and Latin inside one word', () => {
  const offenders = [];

  for (const phrase of parsePhrases(corpus)) {
    for (const word of phrase.match(/[\p{Script=Cyrillic}\p{Script=Latin}]+/gu) ?? []) {
      if (/[\u0400-\u04FF]/.test(word) && /[A-Za-z]/.test(word)) offenders.push(word);
    }
  }

  assert.deepEqual(offenders, []);
});

test('the legitimate Latin in line 465 survives the homoglyph check', () => {
  const parsed = parsePhrases(corpus).map(plain);

  assert.ok(
    parsed.some((p) => p.includes('ABC') && p.includes('цель B')),
    'Latin goal letters are content, not homoglyphs',
  );
});

test('no Russian phrase is repeated in the raw corpus', () => {
  const seen = new Set();

  /* Читаем сырые строки, а не parsePhrases: парсер сам дедуплицирует,
     поэтому повтор в файле сквозь него не виден. Правило выделения
     фразы — то же, что в script.js: маркер `- `/`— `, пустые строки
     и заголовки пропускаются. */
  const marker = /^\s*[-—]\s?/;

  for (const rawLine of corpus.split('\n')) {
    const line = rawLine.trim();

    if (line === '' || line.startsWith('#')) continue;

    const phrase = line.replace(marker, '').trim();

    if (phrase === '') continue;

    assert.ok(!seen.has(phrase), `repeated phrase: ${phrase}`);
    seen.add(phrase);
  }
});
