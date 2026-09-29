import { seregaGentle } from './js/serega-gentle.js';

const HOLD_MS = 1500;
const PHRASES_URL = 'phrases.md';
const LIST_MARKER = /^\s*[-—]\s?/;

const THEME_KEY = 'ids-theme';
const THEMES = ['dark', 'light'];
const PREFERS_DARK = '(prefers-color-scheme: dark)';

export function parsePhrases(text) {
  const phrases = [];

  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();

    if (line === '' || line.startsWith('#')) continue;

    const phrase = line.replace(LIST_MARKER, '').trim();

    if (phrase !== '' && !phrases.includes(phrase)) phrases.push(phrase);
  }

  return phrases;
}

export async function loadPhrases(url = PHRASES_URL) {
  const res = await fetch(url);

  if (!res.ok) throw new Error(`${url} responded ${res.status}`);

  return parsePhrases(await res.text());
}

export function pickPhrase(phrases) {
  if (phrases.length === 0) throw new Error('no phrases to show');

  return phrases[Math.floor(Math.random() * phrases.length)];
}

/* Тема. Правило одно: явный выбор пользователя побеждает системную настройку,
   пока choice не задан — страница следует за системой. resolveTheme чистая и
   экспортируется ради тестов; applyTheme и ниже трогают DOM и вызываются
   только из браузера. Тот же выбор повторяет инлайн-скрипт в <head> index.html
   — раньше первой отрисовки, иначе тёмная тема моргает белой. */

export function resolveTheme(stored, prefersDark) {
  if (THEMES.includes(stored)) return stored;

  return prefersDark ? 'dark' : 'light';
}

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function writeStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* Приватный режим: тема живёт до конца сессии, и это нормально. */
  }
}

function syncThemeColor() {
  const meta = document.querySelector('meta[name="theme-color"]');
  /* Цвет берётся из вычисленного фона, а не из литерала: так хром браузера
     следует за палитрой сам. Литералы в инлайн-скрипте нужны только до
     загрузки CSS, а отсюда они перезаписываются. */
  if (meta) meta.content = getComputedStyle(document.body).backgroundColor;
}

function applyTheme(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  syncThemeColor();
}

function initTheme() {
  /* Класс уже выставлен инлайн-скриптом в <head>, но цвет хрома там —
     литерал. Здесь, когда CSS уже применён, он пересчитывается из фона. */
  syncThemeColor();

  const toggle = document.getElementById('theme-toggle');

  if (!toggle) return;

  const system = matchMedia(PREFERS_DARK);
  const pressed = () =>
    toggle.setAttribute('aria-pressed', String(document.documentElement.classList.contains('dark')));

  pressed();

  toggle.addEventListener('click', () => {
    const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';

    applyTheme(next);
    writeStoredTheme(next);
    pressed();
  });

  /* Смена системной настройки на лету. resolveTheme и сам разбирается: если
     выбор пользователя записан, он возвращает его и игнорирует систему. */
  system.addEventListener('change', () => {
    applyTheme(resolveTheme(readStoredTheme(), system.matches));
    pressed();
  });
}

async function init() {
  initTheme();

  const button = document.getElementById('show-quote');
  const quote = document.getElementById('quote');
  let phrases;

  try {
    phrases = await loadPhrases();

    if (phrases.length === 0) throw new Error('no phrases to show');
  } catch {
    button.remove();
    quote.textContent = 'Не удалось загрузить список фраз';

    return;
  }

  let animation = null;

  button.addEventListener('click', async () => {
    button.classList.remove('ids__shine');
    button.style.display = 'none';

    const phrase = pickPhrase(phrases);

    animation?.destroy();
    animation = seregaGentle(quote, { phrases: [phrase] });

    await animation.finished;
    await new Promise(resolve => setTimeout(resolve, HOLD_MS));

    button.style.display = '';
    button.classList.add('ids__shine');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;

    /* Фокус на интерактивном элементе — Enter нажимает именно его. Без этой
       проверки Enter на переключателе темы показывал бы ещё и фразу. */
    if (document.activeElement?.matches('button, a[href], input, select, textarea')) return;
    if (button.style.display === 'none') return;

    button.click();
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}
