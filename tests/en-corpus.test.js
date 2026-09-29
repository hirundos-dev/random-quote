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

test('two batches are in the English corpus', () => {
  assert.ok(phrases.length >= 60, `only ${phrases.length} phrases so far`);
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
  const seen = new Set();

  for (const [i, p] of phrases.entries()) {
    assert.ok(!seen.has(p), `phrase ${i + 1} is a duplicate`);
    seen.add(p);
  }
});

test('the English corpus never outruns the Russian one', () => {
  assert.ok(
    phrases.length <= ruCount,
    `EN has ${phrases.length} phrases, RU has ${ruCount}`,
  );
});