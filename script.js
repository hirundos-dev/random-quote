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

  button.addEventListener('click', () => {
    const randomIndex = Math.floor(Math.random() * phrases.length);
    quote.textContent = phrases[randomIndex];
  });
});