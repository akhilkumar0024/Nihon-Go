import { UserProgress, VocabularyItem } from '../types';
import { CURATED_VOCABULARY } from '../data/curatedVocab';

const STORAGE_KEY_PROGRESS = 'nippon_user_progress_v1';
const LEGACY_STORAGE_KEY_PROGRESS = 'vocabvoice_user_progress_v1';
const STORAGE_KEY_SAVED_WORDS = 'nippon_saved_words_v1';
const LEGACY_STORAGE_KEY_SAVED_WORDS = 'vocabvoice_saved_words_v1';
const STORAGE_KEY_CUSTOM_WORDS = 'nippon_custom_words_v1';
const LEGACY_STORAGE_KEY_CUSTOM_WORDS = 'vocabvoice_custom_words_v1';

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DEFAULT_PROGRESS: UserProgress = {
  wordsStudied: [],
  savedWordIds: [],
  quizzesTaken: 0,
  quizCorrectCount: 0,
  streakDays: 0,
  lastActiveDate: getTodayDateString(),
  dailyGoal: 5,
  pronunciationAttempts: 0,
  pronunciationScores: [],
  sessionStartTime: Date.now(),
};

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS) || localStorage.getItem(LEGACY_STORAGE_KEY_PROGRESS);
    if (!raw) {
      saveProgress(DEFAULT_PROGRESS);
      return DEFAULT_PROGRESS;
    }
    const data: UserProgress = JSON.parse(raw);
    // Sanitize in case fields are missing or malformed
    const sanitized: UserProgress = {
      wordsStudied: Array.isArray(data.wordsStudied) ? data.wordsStudied : [],
      savedWordIds: Array.isArray(data.savedWordIds) ? data.savedWordIds : [],
      quizzesTaken: typeof data.quizzesTaken === 'number' ? data.quizzesTaken : 0,
      quizCorrectCount: typeof data.quizCorrectCount === 'number' ? data.quizCorrectCount : 0,
      streakDays: typeof data.streakDays === 'number' ? data.streakDays : 0,
      lastActiveDate: typeof data.lastActiveDate === 'string' ? data.lastActiveDate : getTodayDateString(),
      dailyGoal: typeof data.dailyGoal === 'number' && data.dailyGoal > 0 ? data.dailyGoal : 5,
      pronunciationAttempts: typeof data.pronunciationAttempts === 'number' ? data.pronunciationAttempts : 0,
      pronunciationScores: Array.isArray(data.pronunciationScores) ? data.pronunciationScores : [],
      sessionStartTime: typeof data.sessionStartTime === 'number' ? data.sessionStartTime : Date.now(),
    };

    // Calculate honest streak
    const today = getTodayDateString();
    if (sanitized.lastActiveDate !== today) {
      const last = new Date(sanitized.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diffDays > 1) {
        sanitized.streakDays = 0; // reset streak if missed more than 1 day
      }
      sanitized.lastActiveDate = today;
      saveProgress(sanitized);
    }
    return sanitized;
  } catch (e) {
    console.error('Failed to load progress from localStorage', e);
    return DEFAULT_PROGRESS;
  }
}

export function saveProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROGRESS, JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress to localStorage', e);
  }
}

export function recordWordStudied(wordId: string): void {
  const progress = loadProgress();
  if (!progress.wordsStudied.includes(wordId)) {
    progress.wordsStudied.push(wordId);
  }
  if (progress.streakDays === 0) {
    progress.streakDays = 1;
  }
  saveProgress(progress);
}

export function toggleSaveWord(word: VocabularyItem): boolean {
  const progress = loadProgress();
  const allSaved = getSavedWords();
  const exists = allSaved.some((w) => w.id === word.id);

  if (exists) {
    // Remove
    const nextSaved = allSaved.filter((w) => w.id !== word.id);
    localStorage.setItem(STORAGE_KEY_SAVED_WORDS, JSON.stringify(nextSaved));
    progress.savedWordIds = progress.savedWordIds.filter((id) => id !== word.id);
    saveProgress(progress);
    return false;
  } else {
    // Add
    const toSave: VocabularyItem = {
      ...word,
      savedAt: new Date().toISOString(),
      masteryLevel: word.masteryLevel || 1,
      streak: word.streak || 1,
    };
    const nextSaved = [toSave, ...allSaved];
    localStorage.setItem(STORAGE_KEY_SAVED_WORDS, JSON.stringify(nextSaved));
    if (!progress.savedWordIds.includes(word.id)) {
      progress.savedWordIds.push(word.id);
    }
    recordWordStudied(word.id);
    saveProgress(progress);
    return true;
  }
}

export function isWordSaved(wordId: string): boolean {
  const saved = getSavedWords();
  return saved.some((w) => w.id === wordId);
}

export function getSavedWords(): VocabularyItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_WORDS) || localStorage.getItem(LEGACY_STORAGE_KEY_SAVED_WORDS);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to read saved words', e);
    return [];
  }
}

export function loadStarterCuratedWords(): VocabularyItem[] {
  const initial = CURATED_VOCABULARY.slice(0, 4).map((w, idx) => ({
    ...w,
    savedAt: new Date(Date.now() - idx * 3600000).toISOString(),
    masteryLevel: [3, 2, 4, 1][idx] || 2,
    streak: [3, 1, 5, 1][idx] || 1,
  }));
  localStorage.setItem(STORAGE_KEY_SAVED_WORDS, JSON.stringify(initial));
  const progress = loadProgress();
  initial.forEach((w) => {
    if (!progress.savedWordIds.includes(w.id)) {
      progress.savedWordIds.push(w.id);
    }
    if (!progress.wordsStudied.includes(w.id)) {
      progress.wordsStudied.push(w.id);
    }
  });
  if (progress.streakDays === 0) {
    progress.streakDays = 1;
  }
  saveProgress(progress);
  return initial;
}

export function resetProgressToEmpty(): UserProgress {
  localStorage.removeItem(STORAGE_KEY_PROGRESS);
  localStorage.removeItem(LEGACY_STORAGE_KEY_PROGRESS);
  localStorage.removeItem(STORAGE_KEY_SAVED_WORDS);
  localStorage.removeItem(LEGACY_STORAGE_KEY_SAVED_WORDS);
  saveProgress(DEFAULT_PROGRESS);
  return DEFAULT_PROGRESS;
}

export function recordPronunciationScore(score: number): void {
  const progress = loadProgress();
  progress.pronunciationAttempts += 1;
  progress.pronunciationScores.push(score);
  saveProgress(progress);
}

export function recordQuizResult(isCorrect: boolean): void {
  const progress = loadProgress();
  progress.quizzesTaken += 1;
  if (isCorrect) {
    progress.quizCorrectCount += 1;
  }
  saveProgress(progress);
}

export function saveCustomWord(word: VocabularyItem): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_WORDS) || localStorage.getItem(LEGACY_STORAGE_KEY_CUSTOM_WORDS);
    const existing: VocabularyItem[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((w) => w.id !== word.id);
    localStorage.setItem(STORAGE_KEY_CUSTOM_WORDS, JSON.stringify([word, ...filtered]));
  } catch (e) {
    console.error('Failed to cache custom word', e);
  }
}

export function getCustomWord(wordId: string): VocabularyItem | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_WORDS) || localStorage.getItem(LEGACY_STORAGE_KEY_CUSTOM_WORDS);
    if (!raw) return null;
    const existing: VocabularyItem[] = JSON.parse(raw);
    return existing.find((w) => w.id === wordId) || null;
  } catch (e) {
    return null;
  }
}
