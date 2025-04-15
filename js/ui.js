import { hasImproved } from './metrics.js';
import { renderChart } from './chart.js';

const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
const resultBox = document.getElementById('result');
const finalWpm = document.getElementById('final-wpm');
const finalAccuracy = document.getElementById('final-accuracy');

export function updateStatsUI(wpm, accuracy) {
  if (wpmDisplay) wpmDisplay.textContent = wpm;
  if (accuracyDisplay) accuracyDisplay.textContent = `${accuracy}%`;
}

export function showFinalResults(result) {
  const improved = hasImproved(result.wpm, result.accuracy);

  if (!resultBox || !finalWpm || !finalAccuracy) return;

  finalWpm.textContent = result.wpm;
  finalAccuracy.textContent = `${result.accuracy}%`;

  const wpmArrow = document.getElementById('wpm-arrow');
  const accuracyArrow = document.getElementById('accuracy-arrow');

  if (wpmArrow)
    wpmArrow.src = improved.wpm
      ? './assets/arrow-up.svg'
      : './assets/arrow-down.svg';

  if (accuracyArrow)
    accuracyArrow.src = improved.accuracy
      ? './assets/arrow-up.svg'
      : './assets/arrow-down.svg';

}
