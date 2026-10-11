export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export interface MoraPitch {
  mora: string;
  pitch: 'low' | 'high';
}

export interface PitchAccentInfo {
  pattern: string; // e.g. "Atamadaka (頭高型) ＼", "Nakadaka [2]", "Heiban (平板型) ￣"
  notation: string; // e.g. "[ta-BE-ru]"
  moras: MoraPitch[];
}

export interface ExampleSentence {
  japanese: string;
  furigana: string;
  romaji: string;
  english: string;
}

export interface VocabularyItem {
  id: string;
  japanese: string;
  hiragana: string;
  romaji: string;
  english: string;
  partOfSpeech: string;
  jlptLevel: JLPTLevel;
  frequency: string;
  pitchAccent: PitchAccentInfo;
  nuance: string;
  exampleSentence: ExampleSentence;
  source: 'live-ai' | 'curated-fallback';
  savedAt?: string;
  masteryLevel?: number; // 1 to 5
  streak?: number;
  lastReviewed?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'sensei';
  text: string;
  timestamp: string;
  japanesePhrases?: string[];
  suggestions?: string[];
  source?: 'live-ai' | 'curated-fallback';
}

export interface QuizOption {
  id: string;
  text: string;
  subtext?: string;
}

export interface QuizQuestion {
  id: string;
  wordId: string;
  type: 'meaning' | 'reading' | 'conjugation' | 'listening';
  prompt: string;
  japanesePrompt?: {
    sentence: string;
    furigana: string;
    highlighted: string;
    accentNote?: string;
  };
  audioSentence?: string;
  options: QuizOption[];
  correctOptionId: string;
  explanation: string;
  grammarNotes?: string[];
  xp: number;
}

export interface QuizResultRecord {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  timestamp: string;
}

export interface UserProgress {
  wordsStudied: string[]; // word IDs
  savedWordIds: string[];
  quizzesTaken: number;
  quizCorrectCount: number;
  streakDays: number;
  lastActiveDate: string; // YYYY-MM-DD
  dailyGoal: number; // default 10
  pronunciationAttempts: number;
  pronunciationScores: number[];
  sessionStartTime: number;
}
