import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const script = readFileSync(new URL('../script.js', import.meta.url), 'utf8');
const projectCss = readFileSync(new URL('../css/project.css', import.meta.url), 'utf8');

test('the page has exactly one h1', () => {
  assert.equal(html.match(/<h1[\s>]/g)?.length, 1);
});

test('the h1 is hidden from sight but not from assistive tech', () => {
  assert.match(html, /<h1[^>]*ids__visually-hidden/);
  assert.match(projectCss, /\.ids__visually-hidden/);
});

test('the quote is a blockquote, not a heading', () => {
  assert.match(html, /<blockquote[^>]*id="quote"/);
  assert.doesNotMatch(html, /<h3/);
});

test('the quote has no user-agent margin, which would break the layout', () => {
  const blockquoteRule = projectCss.match(/blockquote\s*\{[^}]*\}/);

  assert.ok(blockquoteRule, 'project.css has no blockquote rule at all');
  assert.match(blockquoteRule[0], /margin:\s*0/);
});

test('no document-level Enter handler hijacks keys meant for a control', () => {
  assert.doesNotMatch(script, /addEventListener\(\s*['"]keydown['"]/);
});

test('the quote is announced as a quotation, not a bare paragraph', () => {
  assert.match(html, /<blockquote[^>]*id="quote"/);
});

test('the page declares a favicon instead of 404ing on every load', () => {
  assert.match(html, /<link[^>]*rel="icon"/);
});

test('the head carries the metadata a shared link needs', () => {
  assert.match(html, /<meta\s+name="description"/);
  assert.match(html, /<link[^>]*rel="canonical"/);
});

test('the head carries Open Graph properties', () => {
  for (const property of ['og:type', 'og:title', 'og:description', 'og:url', 'og:locale']) {
    assert.match(html, new RegExp(`property="${property}"`), `${property} is missing`);
  }
});

test('the module script is not page content', () => {
  const main = html.indexOf('<main');
  const mainEnd = html.indexOf('</main>');
  const scriptTag = html.indexOf('<script type="module"');

  assert.ok(scriptTag > mainEnd, 'the module script sits inside <main> and counts as content');
});
