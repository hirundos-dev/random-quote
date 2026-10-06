import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

import { parsePhrases } from '../script.js';

const EN = '../phrases.en.md';
const RU = '../phrases.md';
const CYRILLIC = /[Ѐ-ӿ]/;

test('the English corpus exists', () => {
  assert.ok(existsSync(new URL(EN, import.meta.url)), 'phrases.en.md is missing');
});

const enText = existsSync(new URL(EN, import.meta.url))
  ? readFileSync(new URL(EN, import.meta.url), 'utf8')
  : '';
const phrases = parsePhrases(enText);
const ruCount = parsePhrases(
  readFileSync(new URL(RU, import.meta.url), 'utf8'),
).length;

test('the English corpus matches the Russian corpus in full', () => {
  assert.equal(
    phrases.length,
    ruCount,
    `EN has ${phrases.length} phrases, RU has ${ruCount}`,
  );
});

test('no English phrase carries a Cyrillic character', () => {
  for (const [i, p] of phrases.entries()) {
    assert.doesNotMatch(p, CYRILLIC, `phrase ${i + 1}`);
  }
});

test('no English phrase is empty', () => {
  for (const [i, p] of phrases.entries()) {
    assert.ok(p.trim().length > 0, `phrase ${i + 1}`);
  }
});

test('no English phrase is repeated', () => {
  /* Идём по сырым строкам, а не по parsePhrases: парсер сам
     дедуплицирует, поэтому повтор в файле сквозь него не виден. */
  const seen = new Set();
  const marker = /^\s*[-—]\s?/;

  for (const rawLine of enText.split('\n')) {
    const line = rawLine.trim();

    if (line === '' || line.startsWith('#')) continue;

    const phrase = line.replace(marker, '').trim();

    if (phrase === '') continue;

    assert.ok(!seen.has(phrase), `repeated phrase: ${phrase}`);
    seen.add(phrase);
  }
});

test('every content line of the English corpus carries a list marker', () => {
  /* Парсер терпим к строке без маркера и прочитает её как фразу — на живом
     сайте это случайная цитата из заметки. Поэтому соглашение держит сам
     файл: каждая содержательная строка обязана начинаться с `- `/`— `. */
  const withoutMarker = [];

  for (const [index, rawLine] of enText.split('\n').entries()) {
    const line = rawLine.trim();

    if (line === '' || line.startsWith('#')) continue;
    if (!/^[-—]\s?/.test(line)) withoutMarker.push(index + 1);
  }

  assert.deepEqual(withoutMarker, [], 'English corpus lines without a list marker');
});

test('both corpora open with the dedication-greeting', () => {
  const ruFirst = parsePhrases(
    readFileSync(new URL(RU, import.meta.url), 'utf8'),
  )[0];

  assert.match(phrases[0], /^If you ever suddenly feel lonely/);
  assert.match(ruFirst, /^Если вдруг тебе когда-нибудь станет одиноко/);
});
