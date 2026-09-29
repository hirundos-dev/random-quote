import test from 'node:test';
import assert from 'node:assert/strict';

import { isGreetingPending } from '../script.js';

test('script.js is importable without a DOM and exports the greeting guard', () => {
  assert.equal(typeof isGreetingPending, 'function');
});

test('a fresh device has no flag, so the greeting is pending', () => {
  assert.equal(isGreetingPending(null), true);
  assert.equal(isGreetingPending(undefined), true);
});

test('once the flag is set the greeting no longer shows', () => {
  assert.equal(isGreetingPending('1'), false);
  assert.equal(isGreetingPending(''), false);
});