import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const PAGES = {
  ru: { file: '../index.html', dir: '..', other: 'en/' },
  en: { file: '../en/index.html', dir: '../en', other: '../' },
};

const html = {};
for (const [locale, page] of Object.entries(PAGES)) {
  html[locale] = readFileSync(new URL(page.file, import.meta.url), 'utf8');
}

const ORIGIN = 'https://hirundos-dev.github.io/random-quote/';

test('the English page exists', () => {
  assert.ok(existsSync(new URL('../en/index.html', import.meta.url)));
});

test('each page declares its own language and no other', () => {
  assert.match(html.ru, /<html lang="ru"/);
  assert.match(html.en, /<html lang="en"/);
});

test('each page has exactly one html lang attribute', () => {
  for (const [locale, page] of Object.entries(html)) {
    assert.equal(page.match(/<html[^>]*\slang=/g)?.length, 1, `${locale} page`);
  }
});

test('the switcher is a plain link, so it works with JavaScript off', () => {
  assert.match(html.ru, /<a[^>]*href="en\/"/);
  assert.match(html.en, /<a[^>]*href="\.\.\/"/);
});

test('the flag circle shows the current locale and links to the other', () => {
  assert.doesNotMatch(html.ru, /aria-current/);
  assert.doesNotMatch(html.en, /aria-current/);
  assert.match(html.ru, /<a[^>]*href="en\/"[^>]*><svg/);
  assert.match(html.en, /<a[^>]*href="\.\.\/"[^>]*><svg/);
});

test('each page points hreflang at both locales and itself as canonical', () => {
  for (const [locale, page] of Object.entries(html)) {
    const other = locale === 'ru' ? 'en' : 'ru';
    const selfUrl = locale === 'ru' ? ORIGIN : ORIGIN + 'en/';
    const otherUrl = locale === 'ru' ? ORIGIN + 'en/' : ORIGIN;

    assert.match(page, new RegExp(`hreflang="${locale}"`), `${locale} misses its own hreflang`);
    assert.match(page, new RegExp(`hreflang="${other}"`), `${locale} misses the other hreflang`);
    assert.match(page, new RegExp(`hreflang="x-default"`), `${locale} misses x-default`);
    assert.match(page, new RegExp(`rel="canonical"\\s+href="${selfUrl}"`), `${locale} canonical`);
    assert.match(page, new RegExp(`hreflang="${other}"\\s+href="${otherUrl}"`), `${locale} alternate href`);
  }
});

test('each page reads its own corpus, and the two are not the same file', () => {
  const corpus = {};
  for (const [locale, page] of Object.entries(html)) {
    corpus[locale] = page.match(/data-phrases="([^"]+)"/)?.[1];
    assert.ok(corpus[locale], `${locale} page has no data-phrases`);
  }

  assert.notEqual(corpus.ru, corpus.en);
});

test('each page carries its own load-failure message', () => {
  const messages = {};
  for (const [locale, page] of Object.entries(html)) {
    messages[locale] = page.match(/data-load-error="([^"]+)"/)?.[1];
    assert.ok(messages[locale], `${locale} page has no data-load-error`);
  }

  assert.notEqual(messages.ru, messages.en);
  assert.doesNotMatch(messages.en, /[Ѐ-ӿ]/, 'the English page shows a Russian error');
});

test('the English page is not a copy with the language left in', () => {
  assert.doesNotMatch(html.en, /[Ѐ-ӿ]/);
});

test('every asset each page references resolves to a file on disk', () => {
  for (const [locale, page] of Object.entries(html)) {
    const dir = PAGES[locale].dir;
    const refs = [
      ...page.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g),
      ...page.matchAll(/<script[^>]*src="([^"]+)"/g),
      ...page.matchAll(/<link[^>]*rel="icon"[^>]*href="([^"]+)"/g),
    ].map((m) => m[1]);

    assert.ok(refs.length >= 10, `${locale} page references only ${refs.length} assets`);

    for (const ref of refs) {
      const resolved = new URL(ref, new URL(`${dir}/`, import.meta.url));
      assert.ok(existsSync(resolved), `${locale} page points at a missing file: ${ref}`);
    }
  }
});

test('the language switcher sits with the theme toggle, not inside the content', () => {
  for (const [locale, page] of Object.entries(html)) {
    const header = page.match(/<header class="ids__chrome">([\s\S]*?)<\/header>/)?.[1] ?? '';

    assert.match(header, /ids__lang/, `${locale} switcher is not in the chrome`);
    assert.match(header, /id="theme-toggle"/, `${locale} lost the theme toggle`);
  }
});

test('both pages carry the same anti-flash theme script, or one of them flashes', () => {
  const codes = {};
  for (const [locale, page] of Object.entries(html)) {
    const script = page.match(/<script>\s*([\s\S]*?)\s*<\/script>/)?.[1] ?? '';
    assert.ok(script, `${locale} page has no inline theme script`);

    // Комментарий в шапке скрипта — на языке страницы, поэтому сравниваем
    // только исполняемую часть: множится правило resolveTheme, а не слова.
    codes[locale] = script.replace(/^\/\*[\s\S]*?\*\//, '').trim();
  }

  assert.equal(codes.ru, codes.en, 'the anti-flash rule drifted between the pages');
});

test('both pages ship the same theme-color literal and default', () => {
  for (const [locale, page] of Object.entries(html)) {
    assert.match(page, /<meta name="theme-color" content="#ffffff"/, `${locale} theme-color default`);
    assert.match(page, /'#121214'/, `${locale} dark arm of the head script`);
  }
});

test('each page greets a fresh device with its own phrase', () => {
  const greetings = {};

  for (const [locale, page] of Object.entries(html)) {
    greetings[locale] = page.match(/data-greeting="([^"]*)"/)?.[1];
    assert.ok(greetings[locale], `${locale} page has no data-greeting`);
  }

  assert.notEqual(greetings.ru, greetings.en);
  assert.doesNotMatch(greetings.en, /[Ѐ-ӿ]/, 'the English greeting is in Russian');
  assert.doesNotMatch(greetings.ru, /[A-Za-z]/, 'the Russian greeting is in English');
});

test('the theme control is a single toggle button with a pressed state', () => {
  for (const [locale, page] of Object.entries(html)) {
    assert.match(page, /<button[^>]*id="theme-toggle"/, `${locale} lost the theme toggle`);
    assert.match(page, /<button[^>]*id="theme-toggle"[^>]*aria-pressed=/, `${locale} toggle carries no pressed state`);
    assert.doesNotMatch(page, /data-theme=/, `${locale} still has segmented buttons`);
  }
});

test('the theme toggle and the flag circle are icon controls with labels', () => {
  for (const [locale, page] of Object.entries(html)) {
    assert.match(page, /id="theme-toggle"[^>]*aria-label=/, `${locale} theme toggle lost its label`);
    assert.match(page, /<clipPath[^>]*><circle/, `${locale} flag is not drawn as a circle`);
    assert.match(page, /<svg/, `${locale} page has no inline svg icons`);
  }

  assert.doesNotMatch(html.ru, />Светлая</);
  assert.doesNotMatch(html.ru, />Тёмная</);
  assert.doesNotMatch(html.en, />Светлая</);
  assert.doesNotMatch(html.en, />Тёмная</);
  assert.doesNotMatch(html.en, />RU</);
  assert.doesNotMatch(html.en, />EN</);

  assert.match(html.ru, /aria-label="Переключить тему"/);
  assert.match(html.en, /aria-label="Toggle theme"/);
  assert.match(html.ru, /aria-label="English"/);
  assert.match(html.en, /aria-label="Russian"/);
});

test('the main action offers advice in the page language', () => {
  assert.match(html.ru, />Получить совет</);
  assert.match(html.en, />Get advice</);
  assert.doesNotMatch(html.en, /Получить совет/);
});

test('each page dedicates the project in its own language', () => {
  assert.match(html.ru, />Посвящается Марку и Леониду</);
  assert.match(html.en, />Dedicated to Mark and Leonid</);
  assert.doesNotMatch(html.en, /Посвящается/);
});
