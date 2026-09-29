import { seregaEmotional } from './js/serega-emotional.js';
import { seregaGentle } from './js/serega-gentle.js';

const HOLD_MS = 1500;
const PHRASES_URL = 'phrases.md';
const LIST_MARKER = /^\s*[-—]\s?/;

const THEME_KEY = 'ids-theme';
const THEMES = ['dark', 'light'];
const PREFERS_DARK = '(prefers-color-scheme: dark)';
const LOAD_ERROR_FALLBACK = 'Не удалось загрузить список фраз';
const GREETING_FLAG = 'ids-greeting-shown';
const GREETING_FALLBACK = 'Если когда-нибудь тебе станет одиноко, то помни, я всегда с тобой';

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

/* Приветствие. Один раз на устройство: первый визит встречает фразу из
   data-greeting, дальше — пустое состояние до первого клика. Флаг живёт в
   localStorage; без него (приватный режим) приветствие вернётся в следующий
   визит — приемлемо, как и тема без записи. isGreetingPending чистая и
   экспортируется ради тестов. */

export function isGreetingPending(flag) {
  return flag == null;
}

function readGreetingFlag() {
  try {
    return localStorage.getItem(GREETING_FLAG);
  } catch {
    return null;
  }
}

function writeGreetingFlag() {
  try {
    localStorage.setItem(GREETING_FLAG, '1');
  } catch {
    /* Приватный режим: приветствие будет показываться каждый визит. */
  }
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

  /* Иконку (солнце/луну) показывает сам CSS по html.dark, этот атрибут —
     только для читалок: true означает, что активна тёмная тема. */
  const pressed = () => {
    const dark = document.documentElement.classList.contains('dark');
    toggle.setAttribute('aria-pressed', String(dark));
  };

  pressed();

  /* Клик по кружку — явный выбор противоположной темы: он записывается и
     побеждает системную настройку, как раньше побеждал клик по сегменту. */
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

  /* Страниц две, и у каждой свой корпус и своя надпись об ошибке. Сборки нет,
     поэтому конфигурация живёт в разметке: data-phrases и data-load-error на
     <html>. Русская строка ниже — только на случай страницы, которая забыла
     атрибут; обе страницы его несут, и это проверяет tests/language.test.js. */
  const root = document.documentElement;
  const button = document.getElementById('show-quote');
  const quote = document.getElementById('quote');
  let phrases;

  /* Приветствие показывается сразу, не дожидаясь сети: первый визит
     встречает фразу ещё до загрузки корпуса. Фраза — из data-greeting на
     <html>, как корпус и ошибка; кнопка при этом уже стоит. */
  let greetingAnimation = null;

  if (quote && isGreetingPending(readGreetingFlag())) {
    greetingAnimation = seregaEmotional(quote, {
      text: root.dataset.greeting || GREETING_FALLBACK,
    });
    writeGreetingFlag();
  }

  try {
    phrases = await loadPhrases(root.dataset.phrases || PHRASES_URL);

    if (phrases.length === 0) throw new Error('no phrases to show');
  } catch {
    button.remove();
    /* Приветствие уходит вместе с кнопкой: destroy снимает класс и aria-label,
       иначе ошибка читалась бы как цитата с анимационным контейнером. */
    greetingAnimation?.destroy();
    greetingAnimation = null;
    quote.textContent = root.dataset.loadError || LOAD_ERROR_FALLBACK;

    return;
  }

  let animation = null;

  button.addEventListener('click', async () => {
    /* display: none уводит фокус на <body>, и после показа фразы он там и
       остался бы. Запоминаем, был ли фокус на кнопке, и возвращаем его —
       но только если пользователь никуда не ушёл. Проверяем и <body>, и саму
       кнопку: часть браузеров оставляет активным элементом скрытую кнопку,
       а не сбрасывает фокус на body. Чужой фокус не перехватываем. */
    const hadFocus = document.activeElement === button;

    button.classList.remove('ids__shine');
    button.style.display = 'none';

    const phrase = pickPhrase(phrases);

    /* Приветствие уходит с первым кликом: destroy возвращает пустую цитату,
       и seregaGentle заполняет её случайной фразой. */
    greetingAnimation?.destroy();
    greetingAnimation = null;

    animation?.destroy();
    animation = seregaGentle(quote, { phrases: [phrase] });

    await animation.finished;
    await new Promise(resolve => setTimeout(resolve, HOLD_MS));

    button.style.display = '';
    button.classList.add('ids__shine');

    const kept = document.activeElement;

    if (hadFocus && (kept === document.body || kept === button)) button.focus();
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}
