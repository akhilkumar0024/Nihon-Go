import React from 'react';
import { UserProgress, VocabularyItem } from '../../types';
import { audioService } from '../../services/audio';

interface DashboardScreenProps {
  progress: UserProgress;
  savedWords: VocabularyItem[];
  onStartSession: (wordId?: string) => void;
  onStartQuiz: () => void;
  onOpenAudioSettings: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  progress,
  savedWords,
  onStartSession,
  onStartQuiz,
  onOpenAudioSettings,
}) => {
  const wordsLearnedToday = progress.wordsStudied.length;
  const targetPct = Math.min(100, Math.round((wordsLearnedToday / (progress.dailyGoal || 10)) * 100));

  // Actual pitch accuracy score (null if no attempts yet)
  const avgPitchScore =
    progress.pronunciationScores.length > 0
      ? Math.round(
          progress.pronunciationScores.reduce((a, b) => a + b, 0) /
            progress.pronunciationScores.length
        )
      : null;

  const handleQuickPlay = (e: React.MouseEvent, word: VocabularyItem) => {
    e.stopPropagation();
    audioService.speakJapanese(word.hiragana || word.japanese);
  };

  return (
    <div className="space-y-space-lg max-w-[1280px] mx-auto animate-in fade-in duration-200">
      {/* ================= HERO SECTION: Warm Editorial Tactile Card ================= */}
      <section className="relative bg-surface-container-lowest rounded-2xl border border-outline-variant p-space-lg xl:p-space-xl overflow-hidden shadow-xs">
        {/* Calligraphic Japanese Atmospheric Accent in Background */}
        <div className="absolute -right-6 -bottom-10 pointer-events-none select-none opacity-[0.04] text-[180px] font-headline-lg font-bold text-primary leading-none">
          音声
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg relative z-10">
          {/* Text Greeting & Japanese Tip */}
          <div className="space-y-space-sm max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="font-furigana text-furigana uppercase tracking-wider text-secondary font-bold">
                Speech Coach • Daily Ritual
              </span>
              {progress.streakDays > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-xs text-secondary fill-icon">
                    local_fire_department
                  </span>
                  {progress.streakDays}-Day Streak Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                  Start Your Streak Today
                </span>
              )}
            </div>

            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              {progress.wordsStudied.length > 0 ? 'Okaeri!' : 'Konnichiwa!'}{' '}
              <span className="font-normal text-on-surface-variant font-headline-sm block sm:inline">
                Ready for today's speech session?
              </span>
            </h1>

            {/* Tip of the Day Washi Paper Callout */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-start gap-3">
              <span className="w-6 h-6 rounded-md bg-secondary-fixed flex items-center justify-center text-secondary text-xs font-bold flex-shrink-0 mt-0.5">
                意
              </span>
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-headline-sm text-headline-sm text-primary font-medium text-sm">
                    一期一会 (Ichigo Ichie)
                  </span>
                  <span className="text-xs text-outline">—</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Cherish every learning moment
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-outline">
                  Focus on elongated vowel mora sounds today. Notice the subtle pitch rise and drop on compound sentences.
                </p>
              </div>
            </div>
          </div>

          {/* Hero Action Button & Stat Micro-Block */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center items-stretch sm:items-center lg:items-end flex-shrink-0">
            <button
              onClick={() => onStartSession()}
              className="flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:bg-primary transition-all active:translate-y-0.5 border-b-2 border-primary tactile-depress"
            >
              <span className="material-symbols-outlined text-xl">volume_up</span>
              <span>Start Daily Session ({progress.dailyGoal} Words)</span>
            </button>
            <span className="font-label-sm text-label-sm text-outline text-center lg:text-right">
              Today's Focus: 2 New Verbs + SRS Pronunciation Practice
            </span>
          </div>
        </div>
      </section>

      {/* ================= BENTO GRID: Dashboard Core Modules ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* CARD 1: Daily Target & Pitch Accuracy (4 Cols) */}
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl border border-outline-variant p-space-lg flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">speed</span>
                <h2 className="font-headline-sm text-headline-sm text-primary">Readiness & Goals</h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-on-surface-variant font-mono">
                Realtime
              </span>
            </div>

            {/* Circular Progress & Accent Accuracy Row */}
            <div className="flex items-center justify-around py-space-sm border-b border-outline-variant/60">
              {/* Circular Progress Gauge */}
              <div className="flex flex-col items-center">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-primary-container"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${targetPct}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="font-headline-md text-headline-md text-primary font-bold leading-none">
                      {targetPct}%
                    </span>
                    <span className="font-label-sm text-label-sm text-outline text-[10px]">
                      TARGET
                    </span>
                  </div>
                </div>
                <span className="mt-2 font-label-md text-label-md text-on-surface-variant">
                  Daily Goal ({wordsLearnedToday}/{progress.dailyGoal})
                </span>
              </div>

              {/* Pitch Accent Score Gauge */}
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-surface-container-low border border-outline-variant/60 flex flex-col items-center justify-center p-2 text-center">
                  <span className="font-headline-md text-headline-md text-secondary font-bold leading-none">
                    {avgPitchScore !== null ? `${avgPitchScore}%` : '—'}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline text-[10px] mt-0.5">
                    {avgPitchScore !== null ? 'AVERAGE' : 'READY'}
                  </span>
                </div>
                <span className="mt-2 font-label-md text-label-md text-on-surface-variant">
                  Pitch Accuracy
                </span>
              </div>
            </div>
          </div>

          {/* Audio Input Diagnostic Test Pill */}
          <div className="mt-space-md pt-space-xs">
            <button
              onClick={onOpenAudioSettings}
              className="w-full p-3 rounded-xl bg-surface-container flex items-center justify-between hover:bg-surface-container-high transition-colors text-left"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse" />
                <div>
                  <span className="text-xs font-semibold text-primary block">
                    Speech Engine Connected
                  </span>
                  <span className="text-[11px] text-outline">
                    Web Speech API • Audio Settings
                  </span>
                </div>
              </div>
              <span className="material-symbols-outlined text-outline text-lg">tune</span>
            </button>
          </div>
        </div>

        {/* CARD 2: Recently Studied Vocabulary (5 Cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl border border-outline-variant p-space-lg flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-space-md">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">history_edu</span>
                <h2 className="font-headline-sm text-headline-sm text-primary">Recently Studied</h2>
              </div>
              <span className="font-label-sm text-label-sm text-outline">
                {savedWords.length} in Notebook
              </span>
            </div>

            {savedWords.length > 0 ? (
              <div className="space-y-2.5">
                {savedWords.slice(0, 4).map((word) => (
                  <div
                    key={word.id}
                    onClick={() => onStartSession(word.id)}
                    className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between hover:bg-surface-container transition-all cursor-pointer group active:scale-[0.99]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center font-headline-md text-primary font-bold group-hover:scale-105 transition-transform">
                        {word.japanese.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-on-surface text-base group-hover:text-primary transition-colors">
                            {word.japanese}
                          </span>
                          <span className="text-xs text-outline font-mono">({word.romaji})</span>
                        </div>
                        <span className="text-xs text-on-surface-variant line-clamp-1">
                          {word.english}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim">
                        {word.jlptLevel}
                      </span>
                      <button
                        onClick={(e) => handleQuickPlay(e, word)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-surface-bright transition-colors"
                        title="Pronounce"
                      >
                        <span className="material-symbols-outlined text-lg">volume_up</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-surface-container-low border border-dashed border-outline-variant/80 text-center space-y-2">
                <span className="material-symbols-outlined text-3xl text-outline">
                  menu_book
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                  Your Notebook is empty
                </p>
                <p className="text-xs text-outline max-w-xs mx-auto">
                  Search or study words in <strong>Daily Learn</strong> to bookmark them for spaced repetition review.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => onStartSession()}
                    className="px-3.5 py-1.5 rounded-lg bg-primary-container text-on-primary text-xs font-semibold hover:bg-primary transition-colors"
                  >
                    Explore Starter N5 Words
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-space-md pt-2 border-t border-outline-variant/60 flex justify-between items-center">
            <span className="text-xs text-outline">Click any word to review details</span>
            <button
              onClick={() => onStartSession()}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>Explore New Words</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </div>

        {/* CARD 3: Spaced Repetition (SRS) Review Callout (3 Cols) */}
        <div className="lg:col-span-3 bg-surface-container-lowest rounded-2xl border border-outline-variant p-space-lg flex flex-col justify-between shadow-xs">
          <div className="space-y-space-sm">
            <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-secondary">
                quiz
              </span>
            </div>

            <h3 className="font-headline-sm text-headline-sm text-primary font-bold">
              Review & Quiz Mode
            </h3>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Lock vocabulary into long-term memory with short interactive quizzes, listening tests, and real-time grammar feedback.
            </p>

            <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/60 text-xs">
              <span className="font-semibold text-primary block">Ready to test:</span>
              <span className="text-outline">
                {savedWords.length >= 3 ? `${savedWords.length} words in your review queue` : 'N5 Core Review Deck'}
              </span>
            </div>
          </div>

          <button
            onClick={onStartQuiz}
            className="w-full mt-space-md py-3 px-4 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.98] transition-all tactile-terracotta"
          >
            <span className="material-symbols-outlined text-lg">play_arrow</span>
            <span>Launch Practice Quiz</span>
          </button>
        </div>
      </div>
    </div>
  );
};
