import { seregaGentle } from './js/serega-gentle.js';

const HOLD_MS = 1500;
const PHRASES_URL = 'phrases.md';
const LIST_MARKER = /^\s*[-—]\s?/;

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

async function init() {
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

    if (document.activeElement === button) return;
    if (button.style.display === 'none') return;

    button.click();
  });
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', init);
}
