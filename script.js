import { seregaGentle } from './js/serega-gentle.js';

const HOLD_MS = 1500;

async function loadPhrases() {
  const res = await fetch('phrases.md');
  const text = await res.text();

  const lines = text.split('\n').filter(line => line.trim().startsWith('- '));
  return lines.map(line => line.replace(/^- /, '').trim());
}

document.addEventListener('DOMContentLoaded', async () => {
  const phrases = await loadPhrases();
  const button = document.getElementById('show-quote');
  const quote = document.getElementById('quote');
  let animation = null;

  button.addEventListener('click', async () => {
    button.classList.remove('las__shine');
    button.style.display = 'none';

    const randomIndex = Math.floor(Math.random() * phrases.length);
    const phrase = phrases[randomIndex];

    animation?.destroy();
    animation = seregaGentle(quote, { phrases: [phrase] });

    await animation.finished;
    await new Promise(resolve => setTimeout(resolve, HOLD_MS));

    button.style.display = '';
    button.classList.add('las__shine');
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;

    if (document.activeElement === button) return;
    if (button.style.display === 'none') return;

    button.click();
  });
});
