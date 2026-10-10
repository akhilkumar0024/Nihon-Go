import { UserProgress, VocabularyItem } from '../types';
import { CURATED_VOCABULARY } from '../data/curatedVocab';

const STORAGE_KEY_PROGRESS = 'vocabvoice_user_progress_v1';
const STORAGE_KEY_SAVED_WORDS = 'vocabvoice_saved_words_v1';
const STORAGE_KEY_CUSTOM_WORDS = 'vocabvoice_custom_words_v1';

export function getTodayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const DEFAULT_PROGRESS: UserProgress = {
  wordsStudied: ['taberu', 'nomu', 'hon', 'iku'], // default initial baseline for demo
  savedWordIds: ['taberu', 'nomu', 'hon', 'iku'],
  quizzesTaken: 4,
  quizCorrectCount: 3,
  streakDays: 1,
  lastActiveDate: getTodayDateString(),
  dailyGoal: 10,
  pronunciationAttempts: 5,
  pronunciationScores: [88, 92, 95, 85, 90],
  sessionStartTime: Date.now(),
};

export function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROGRESS);
    if (!raw) {
      saveProgress(DEFAULT_PROGRESS);
      return DEFAULT_PROGRESS;
    }
    const data: UserProgress = JSON.parse(raw);
    // Check streak
    const today = getTodayDateString();
    if (data.lastActiveDate !== today) {
      const last = new Date(data.lastActiveDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr.getTime() - last.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        data.streakDays += 1;
      } else if (diffDays > 1) {
        data.streakDays = 1; // reset streak if missed more than 1 day
      }
      data.lastActiveDate = today;
      saveProgress(data);
    }
    return data;
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
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_WORDS);
    if (!raw) {
      // Initialize with default 4 words from curated list matching Stitch screens
      const initial = CURATED_VOCABULARY.slice(0, 4).map((w, idx) => ({
        ...w,
        savedAt: new Date(Date.now() - idx * 3600000).toISOString(),
        masteryLevel: [4, 3, 5, 2][idx] || 3,
        streak: [8, 5, 12, 1][idx] || 3,
      }));
      localStorage.setItem(STORAGE_KEY_SAVED_WORDS, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read saved words', e);
    return CURATED_VOCABULARY.slice(0, 4);
  }
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
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_WORDS);
    const existing: VocabularyItem[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter((w) => w.id !== word.id);
    localStorage.setItem(STORAGE_KEY_CUSTOM_WORDS, JSON.stringify([word, ...filtered]));
  } catch (e) {
    console.error('Failed to cache custom word', e);
  }
}

export function getCustomWord(wordId: string): VocabularyItem | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_WORDS);
    if (!raw) return null;
    const existing: VocabularyItem[] = JSON.parse(raw);
    return existing.find((w) => w.id === wordId) || null;
  } catch (e) {
    return null;
  }
}
