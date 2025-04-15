import { getRandomText } from './fetchText.js';
import { startWordTest, resetWordTest } from './wordTyping.js';
import { renderChart, refreshChartTheme } from './chart.js';

// DOM references
const restartBtn = document.getElementById('restart');
const resetBtn = document.getElementById('reset');
const detailsBtn = document.getElementById('details-btn');
const closeChartBtn = document.getElementById('close-chart');
const chartOverlay = document.getElementById('chart-overlay');
const inputField = document.getElementById('word-input');
const timerDisplay = document.getElementById('timer-value');
const themeToggle = document.getElementById('theme-toggle');
const timerWrapper = document.getElementById('timer-selector');
const optionsMenu = document.getElementById('timer-options');
const timerSelector = document.getElementById('timer-selector');
const timerButtons = document.querySelectorAll('.timer-btn');
const clearHistoryBtn = document.getElementById('clear-history');
const DEFAULT_TIMER_SECONDS = 60;

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async () => {
  initSecurity();
  setInitialTimerValue();
  await loadTest();
  renderChart();
  showPreviousResult();
  bindEvents();
});

// ========== FUNCTIONS ==========

function initSecurity() {
  if (!inputField) return;

  ['paste', 'copy', 'cut', 'select'].forEach(evt =>
    inputField.addEventListener(evt, e => e.preventDefault())
  );

  inputField.addEventListener('keydown', e => {
    if (e.ctrlKey && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
    }
  });
}

function setInitialTimerValue() {
  const savedDuration = parseInt(localStorage.getItem('selectedTime')) || DEFAULT_TIMER_SECONDS;
  if (timerDisplay) timerDisplay.textContent = savedDuration;
}

async function loadTest() {
  const text = await getRandomText();
  startWordTest(text);
}

function restartTest() {
  const selectedTime = parseInt(localStorage.getItem('selectedTime')) || DEFAULT_TIMER_SECONDS;

  const wpmDisplay = document.getElementById('wpm');
  const accuracyDisplay = document.getElementById('accuracy');
  const timeDisplay = document.getElementById('time');
  const progressCircle = document.querySelector('.progress');

  if (window.timerInterval) {
    clearInterval(window.timerInterval);
    window.timerInterval = null;
  }

  if (wpmDisplay) wpmDisplay.textContent = '0';
  if (accuracyDisplay) accuracyDisplay.textContent = '0%';
  if (timeDisplay) timeDisplay.textContent = selectedTime;
  if (inputField) inputField.value = '';
  if (timerDisplay) timerDisplay.textContent = selectedTime;

  if (progressCircle) {
    progressCircle.style.transition = 'stroke-dashoffset 0.6s ease';
    progressCircle.style.strokeDashoffset = '0';
    setTimeout(() => {
      progressCircle.style.transition = 'stroke-dashoffset 1s linear, stroke 0.4s ease';
    }, 600);
  }

  window.timeLeft = selectedTime;
  window.duration = selectedTime;

  loadTest();
}

function resetTest() {
  resetWordTest();

  const timeDisplay = document.getElementById('time');
  const wpmDisplay = document.getElementById('wpm');
  const accuracyDisplay = document.getElementById('accuracy');

  const selectedTime = parseInt(localStorage.getItem('selectedTime')) || DEFAULT_TIMER_SECONDS;

  if (timeDisplay) timeDisplay.textContent = selectedTime;
  if (wpmDisplay) wpmDisplay.textContent = '0';
  if (accuracyDisplay) accuracyDisplay.textContent = '0%';
  if (inputField) inputField.value = '';
  if (timerDisplay) timerDisplay.textContent = selectedTime;

  const progressCircle = document.querySelector('.progress');
  if (progressCircle) {
    progressCircle.style.transition = 'stroke-dashoffset 0.6s ease';
    progressCircle.style.strokeDashoffset = '0';
    setTimeout(() => {
      progressCircle.style.transition = 'stroke-dashoffset 1s linear, stroke 0.4s ease';
    }, 600);
  }

  window.timeLeft = selectedTime;
  window.duration = selectedTime;
}

function restartWithNewTime(seconds) {
  resetWordTest();
  if (timerDisplay) timerDisplay.textContent = seconds;

  const progressCircle = document.querySelector('.progress');
  if (progressCircle) {
    progressCircle.style.transition = 'none';
    progressCircle.style.strokeDashoffset = 0;
    requestAnimationFrame(() => {
      progressCircle.style.transition = 'stroke-dashoffset 1s linear, stroke 0.4s ease';
    });
  }

  window.timeLeft = seconds;
  window.duration = seconds;
}

function showPreviousResult() {
  const sessions = JSON.parse(localStorage.getItem('typing_test_history')) || [];
  const last = sessions[sessions.length - 1];
  const secondLast = sessions[sessions.length - 2];

  if (!last) return;

  const finalWpm = document.getElementById('final-wpm');
  const finalAccuracy = document.getElementById('final-accuracy');
  const wpmArrow = document.getElementById('wpm-arrow');
  const accuracyArrow = document.getElementById('accuracy-arrow');

  finalWpm.textContent = last.wpm;
  finalAccuracy.textContent = `${last.accuracy}%`;

  if (!secondLast) {
    wpmArrow.style.display = 'none';
    accuracyArrow.style.display = 'none';
    return;
  }

  const wpmDiff = last.wpm - secondLast.wpm;
  const accDiff = last.accuracy - secondLast.accuracy;

  updateArrow(wpmArrow, wpmDiff);
  updateArrow(accuracyArrow, accDiff);
}

function updateArrow(arrowElement, diff) {
  arrowElement.classList.remove('up', 'down');

  if (diff > 0) {
    arrowElement.src = './assets/arrow-up.svg';
    arrowElement.classList.add('up');
  } else if (diff < 0) {
    arrowElement.src = './assets/arrow-down.svg';
    arrowElement.classList.add('down');
  } else {
    arrowElement.src = './assets/dash.svg';
  }

  arrowElement.style.display = 'inline';
}

function bindEvents() {
  restartBtn?.addEventListener('click', restartTest);
  resetBtn?.addEventListener('click', resetTest);

  document.addEventListener('keydown', e => {
    if (e.key === 'Enter') restartTest();
    if (e.key === 'Escape') resetTest();
  });

  detailsBtn?.addEventListener('click', () => {
    chartOverlay?.classList.add('show');
    renderChart();
  });

  closeChartBtn?.addEventListener('click', () => {
    chartOverlay?.classList.remove('show');
  });

  chartOverlay?.addEventListener('click', e => {
    if (e.target === chartOverlay) chartOverlay.classList.remove('show');
  });

  themeToggle?.addEventListener('change', () => {
    const isDark = themeToggle.checked;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    refreshChartTheme();
  });

  if (timerWrapper && optionsMenu) {
    timerWrapper.addEventListener('click', () => {
      optionsMenu.classList.toggle('show');
    });

    timerButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const selectedTime = parseInt(button.dataset.time, 10);
        localStorage.setItem('selectedTime', selectedTime);
        timerDisplay.textContent = selectedTime;
        optionsMenu.classList.remove('show');
        restartWithNewTime(selectedTime);
      });
    });
  }

  clearHistoryBtn?.addEventListener('click', () => {
    if (!confirm('Are you sure you want to delete your typing history?')) return;

    localStorage.removeItem('typing_test_history');

    document.getElementById('final-wpm').textContent = '0';
    document.getElementById('final-accuracy').textContent = '0%';
    document.getElementById('wpm-arrow').style.display = 'none';
    document.getElementById('accuracy-arrow').style.display = 'none';

    renderChart();
    showPreviousResult();
  });
}

