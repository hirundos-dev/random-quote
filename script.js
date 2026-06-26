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

  button.addEventListener('click', async () => {
    // 1. Кнопка исчезает
    button.style.display = 'none';
    
    // 2. Показываем фразу
    const randomIndex = Math.floor(Math.random() * phrases.length);
    quote.textContent = phrases[randomIndex];
    
    // 3. Ждём 3 секунды (можешь изменить количество миллисекунд)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 4. Кнопка появляется снова
    button.style.display = '';
    
    // 5. (Опционально) можно очистить фразу или оставить — по желанию
    // quote.textContent = ''; // раскомментируй, если хочешь очищать фразу
  });
});