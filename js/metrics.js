const STORAGE_KEY = 'typing_test_history';
const DEFAULT_TIMER_SECONDS = 60;

export function calculateMetrics(correctChars, totalTypedWords, secondsElapsed, correctWords) {
  const minutes = secondsElapsed / 60;

  const wpm = minutes > 0
    ? Math.round((correctChars / 5) / minutes)
    : 0;

  const accuracy = totalTypedWords > 0
    ? Math.min(Math.round((correctWords / totalTypedWords) * 100), 100)
    : 100;

  return { wpm, accuracy };
}

export function hasImproved(currentWpm, currentAccuracy) {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    if (history.length < 2) return { wpm: true, accuracy: true };
    const last = history[history.length - 2];
    return {
      wpm: currentWpm >= last.wpm,
      accuracy: currentAccuracy >= last.accuracy
    };
  } catch {
    return { wpm: false, accuracy: false };
  }
}
