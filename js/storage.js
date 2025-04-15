const STORAGE_KEY = 'typing_test_history';

export function getHistory() {
  try {
    const history = localStorage.getItem(STORAGE_KEY);
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error('Failed to load history from localStorage:', error);
    return [];
  }
}

export function saveResult(result) {
  try {
    const history = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    history.push(result);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to save result to localStorage:', error);
    alert('Unable to save your typing result. Storage may be full or restricted.');
  }
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY);
}