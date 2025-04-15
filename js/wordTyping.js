import { updateStatsUI, showFinalResults } from './ui.js';
import { calculateMetrics } from './metrics.js';
import { saveResult } from './storage.js';

let wordList = [];
let currentIndex = 0;
let correctWords = 0;
let totalTypedWords = 0;
let correctChars = 0;
let inputField;
let wordDisplay;
let timerInterval = null;
let timeLeft = 60;
let duration = 60;
let hasStarted = false;
let listenersBound = false;
const DEFAULT_TIMER_SECONDS = 60;

export async function startWordTest(text, append = false) {
  const newWords = text.trim().split(/\s+/);

  if (append) {
    wordList = wordList.concat(newWords);
  } else {
    wordList = newWords;
    currentIndex = 0;
    correctWords = 0;
    correctChars = 0;
    totalTypedWords = 0;
    timeLeft = 60;
    hasStarted = false;
    clearInterval(timerInterval);
    timerInterval = null;
  }

  inputField = document.getElementById('word-input');
  wordDisplay = document.getElementById('word-display');

  if (!inputField || !wordDisplay) {
    console.error('Missing #word-input or #word-display element');
    return;
  }

  inputField.value = '';
  inputField.disabled = false;
  inputField.focus();

  renderWords();

  if (!listenersBound) {
    wireInputListeners();
    listenersBound = true;
  }
}

function wireInputListeners() {
  if (!inputField) {
    console.warn('inputField is undefined when wiring listeners.');
    return;
  }

  inputField.addEventListener('keydown', async (e) => {
    if (!hasStarted && inputField.value.length > 0) {
      startTimer();
      hasStarted = true;
    }

    if (e.key === ' ') {
      e.preventDefault();
      const typed = inputField.value.trim();
      if (typed.length === 0) return;

      const currentWord = wordList[currentIndex];
      const isCorrect = typed === currentWord;

      totalTypedWords++;
      if (isCorrect) {
        correctWords++;
        correctChars += currentWord.length + 1;
      }

      markWord(currentIndex, isCorrect);
      currentIndex++;
      inputField.value = '';

      // Infinite loop of text
      if (currentIndex >= wordList.length) {
        const { getRandomText } = await import('./fetchText.js');
        const moreText = await getRandomText();
        await startWordTest(moreText, true);
        return;
      }

      renderWords();
    }
  });

  inputField.addEventListener('input', updateCurrentWordVisual);
}

function renderWords() {
  wordDisplay.innerHTML = '';
  const fragment = document.createDocumentFragment();

  for (let i = currentIndex; i < Math.min(wordList.length, currentIndex + 10); i++) {
    const span = document.createElement('span');
    span.className = 'word';
    span.textContent = wordList[i];
    if (i === currentIndex) span.classList.add('current');
    span.setAttribute('data-index', i);
    fragment.appendChild(span);
  }

  wordDisplay.appendChild(fragment);
}

function markWord(index, isCorrect) {
  const span = wordDisplay.querySelector(`[data-index="${index}"]`);
  if (!span) return;
  span.classList.remove('current');
  span.classList.add(isCorrect ? 'correct' : 'incorrect');
}

function updateCurrentWordVisual() {
  const typed = inputField.value;
  const currentWord = wordList[currentIndex] || '';
  const span = wordDisplay.querySelector(`[data-index="${currentIndex}"]`);
  if (!span) return;

  let markup = '';
  let hasError = false;

  for (let i = 0; i < currentWord.length; i++) {
    const expectedChar = currentWord[i];
    const typedChar = typed[i];

    let className = '';
    let style = '';

    if (typedChar == null) {
      className = '';
    } else if (typedChar === expectedChar) {
      className = 'correct';
      if (i === typed.length - 1) {
        style = 'animation: pop 0.2s ease;';
      }
    } else {
      className = 'incorrect';
      hasError = true;
      if (i === typed.length - 1) {
        style = 'animation: pop 0.2s ease;';
      }
    }

    markup += `<span class="${className}" style="${style}">${expectedChar}</span>`;
  }

  if (typed.length > currentWord.length) {
    hasError = true;
    const extra = typed.slice(currentWord.length);
    for (let char of extra) {
      markup += `<span class="incorrect">${char}</span>`;
    }
  }

  span.innerHTML = markup;
  span.classList.remove('correct', 'incorrect');

  if (hasError) {
    span.classList.add('incorrect');
  } else {
    span.classList.add('current');
  }
}

function startTimer(seconds) {
  if (timerInterval !== null) return;

  const userSelected = parseInt(localStorage.getItem('selectedTime')) || DEFAULT_TIMER_SECONDS;
  timeLeft = seconds || userSelected;
  duration = timeLeft;

  updateTimerVisual(timeLeft);
  updateStatsUI(0, 0);

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerVisual(timeLeft);

    const { wpm, accuracy } = calculateMetrics(correctChars, totalTypedWords, duration - timeLeft, correctWords);
    updateStatsUI(wpm, accuracy);

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      finishTest();
    }
  }, 1000);
}

// Timer visuals
const timerText = document.getElementById('timer-value');
const progressCircle = document.querySelector('.progress');
const circleRadius = 45;
const circumference = 2 * Math.PI * circleRadius;

if (progressCircle) {
  progressCircle.style.strokeDasharray = `${circumference}`;
  progressCircle.style.strokeDashoffset = `0`;
}

function updateTimerVisual(secondsLeft) {
  if (timerText) timerText.textContent = secondsLeft;

  const offset = circumference * (1 - secondsLeft / duration);
  if (progressCircle) {
    progressCircle.style.strokeDashoffset = offset;
  }
}

function finishTest() {
  if (!inputField || inputField.disabled) return;

  inputField.disabled = true;

  const durationUsed = parseInt(localStorage.getItem('selectedTime')) || DEFAULT_TIMER_SECONDS;
  const timeSpent = durationUsed - timeLeft;

  const { wpm, accuracy } = calculateMetrics(correctChars, totalTypedWords, duration - timeLeft, correctWords);
  const result = { wpm, accuracy, timestamp: new Date().toISOString() };

  saveResult(result);
  showFinalResults(result);
}

export function resetWordTest() {
  clearInterval(timerInterval);
  timerInterval = null;
  timeLeft = parseInt(localStorage.getItem('selectedTime')) || DEFAULT_TIMER_SECONDS;
  duration = timeLeft;

  inputField = document.getElementById('word-input');
  wordDisplay = document.getElementById('word-display');

  if (!inputField || !wordDisplay) return;

  inputField.value = '';
  inputField.disabled = false;
  wordDisplay.innerHTML = '';
  updateTimerVisual(timeLeft);
  startWordTest(wordList.join(' '));
}
