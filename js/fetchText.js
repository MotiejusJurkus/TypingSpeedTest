export async function getRandomText() {
    try {
      //const res = await fetch('https://poetrydb.org/random/3');
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();

      const rawText = data[0].lines.join(' ');

      const cleaned = rawText
        .replace(/[_*[\]{}()<>,.'"!?;]/g, '')
        .replace(/[^\x00-\x7F]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 700);

      return cleaned;
    } catch (err) {
      console.warn('Poetry API failed, using fallback.', err.message);
      return getLocalFallback();
    }
  }

/*Fallback to .json*/
async function getLocalFallback() {
  const res = await fetch('./data/texts.json');
  if (!res.ok) throw new Error('Local JSON missing or corrupt');
  const data = await res.json();
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}
