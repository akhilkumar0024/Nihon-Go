import React from 'react';
import { UserProgress } from '../../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: UserProgress;
  onUpdateDailyGoal: (goal: number) => void;
  onResetProgress: () => void;
  geminiConfigured: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  progress,
  onUpdateDailyGoal,
  onResetProgress,
  geminiConfigured,
}) => {
  if (!isOpen) return null;

  const quizAccuracy =
    progress.quizzesTaken > 0
      ? Math.round((progress.quizCorrectCount / progress.quizzesTaken) * 100)
      : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-space-lg py-4 border-b border-outline-variant bg-surface-bright">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold">
              NL
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                Nipp-On Learner
              </h2>
              <span className="font-label-sm text-label-sm text-outline">
                JLPT N5 Learner Profile
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <div className="p-space-lg space-y-space-md max-h-[75vh] overflow-y-auto custom-scroll">
          {/* Honest Metric Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
              <span className="text-xl font-bold text-primary block">
                {progress.wordsStudied.length}
              </span>
              <span className="text-[11px] text-outline uppercase font-semibold">
                Studied
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
              <span className="text-xl font-bold text-secondary block">
                {progress.streakDays}d
              </span>
              <span className="text-[11px] text-outline uppercase font-semibold">
                Streak
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
              <span className="text-xl font-bold text-primary block">
                {quizAccuracy}%
              </span>
              <span className="text-[11px] text-outline uppercase font-semibold">
                Accuracy
              </span>
            </div>
          </div>

          {/* AI Connection Status */}
          <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  geminiConfigured ? 'bg-emerald-600 animate-pulse' : 'bg-amber-600'
                }`}
              />
              <span className="text-xs font-semibold text-on-surface">
                {geminiConfigured
                  ? 'Gemini 2.5 Flash Live Connected'
                  : 'Curated Fallback Engine Active'}
              </span>
            </div>
            <span className="text-[11px] font-mono text-outline">
              {geminiConfigured ? 'Live AI' : 'Offline Safe'}
            </span>
          </div>

          {/* Daily Goal Configuration */}
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md font-semibold text-on-surface block">
              Daily Word Goal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[5, 10, 15].map((count) => (
                <button
                  key={count}
                  onClick={() => onUpdateDailyGoal(count)}
                  className={`py-2 rounded-xl border text-sm font-semibold transition-all ${
                    progress.dailyGoal === count
                      ? 'bg-primary-container text-on-primary border-primary shadow-xs'
                      : 'bg-surface-bright text-on-surface-variant border-outline-variant hover:bg-surface-container'
                  }`}
                >
                  {count} Words
                </button>
              ))}
            </div>
          </div>

          {/* Reset / Fresh State Option */}
          <div className="pt-2 border-t border-outline-variant">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-on-surface block">
                  Session Data
                </span>
                <span className="text-[11px] text-outline">
                  Reset local progress and restore initial prototype baseline
                </span>
              </div>
              <button
                onClick={() => {
                  if (confirm('Reset prototype session stats to initial baseline?')) {
                    onResetProgress();
                    onClose();
                  }
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg text-error hover:bg-error-container/30 border border-error/30 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="px-space-lg py-3 bg-surface-container border-t border-outline-variant flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
