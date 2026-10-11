import React from 'react';
import { audioService } from '../../services/audio';

interface TopNavBarProps {
  wordsStudiedCount: number;
  dailyGoal: number;
  streakDays: number;
  onOpenAudioSettings: () => void;
  onOpenFeedback: () => void;
  onOpenProfile: () => void;
  onToggleMobileMenu: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  wordsStudiedCount,
  dailyGoal,
  streakDays,
  onOpenAudioSettings,
  onOpenFeedback,
  onOpenProfile,
  onToggleMobileMenu,
}) => {
  const milestonePct = Math.min(100, Math.round((wordsStudiedCount / 25) * 100)); // N5 core vocab target (25 words prototype milestone)

  const handleTestAudio = () => {
    audioService.speakJapanese('こんにちは！日本語の学習を始めましょう。');
  };

  return (
    <header className="fixed top-0 right-0 h-16 w-full lg:w-[calc(100%-16rem)] flex items-center bg-surface-bright/95 backdrop-blur-md border-b border-outline-variant z-30 px-space-md lg:px-space-lg">
      <div className="flex justify-between items-center w-full max-w-full">
        {/* Left Side: Mobile Menu Button + Milestone Progress */}
        <div className="flex items-center gap-space-md">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>

          {/* Context Milestone Indicator */}
          <div className="hidden sm:flex items-center gap-space-sm">
            <span className="font-label-md text-label-md text-primary font-semibold">
              JLPT N5 Milestone
            </span>
            <div className="w-24 sm:w-32 bg-surface-container rounded-full h-2 overflow-hidden relative">
              <div
                className="bg-primary-container h-full rounded-full transition-all duration-500"
                style={{ width: `${milestonePct}%` }}
              />
            </div>
            <span className="font-label-sm text-label-sm text-outline font-mono">
              {milestonePct}%
            </span>
          </div>

          <div className="hidden sm:block h-4 w-px bg-outline-variant" />

          {/* Real Streak Indicator */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-fixed text-on-secondary-fixed">
            <span
              className="material-symbols-outlined text-sm text-secondary fill-icon"
              data-icon="local_fire_department"
            >
              local_fire_department
            </span>
            <span className="font-label-sm text-label-sm font-semibold">
              {streakDays > 0 ? `${streakDays}-Day Streak` : '0-Day Streak'}
            </span>
          </div>
        </div>

        {/* Right Side: Trailing Controls & Learner Avatar */}
        <div className="flex items-center gap-2 sm:gap-space-md">
          {/* Daily Goal Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-primary font-label-md text-label-md">
            <span className="material-symbols-outlined text-base text-primary fill-icon">
              check_circle
            </span>
            <span className="font-semibold text-xs sm:text-sm">
              Daily Goal: {wordsStudiedCount}/{dailyGoal}
            </span>
          </div>

          {/* Pronunciation Mode Pill (clickable to test audio) */}
          <button
            onClick={handleTestAudio}
            title="Click to test browser Japanese speech synthesis"
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md active:scale-95"
          >
            <span className="material-symbols-outlined text-base">record_voice_over</span>
            <span className="text-xs sm:text-sm">Pronunciation Mode</span>
          </button>

          {/* Volume Audio Test & Feedback Icons */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleTestAudio}
              className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors active:scale-95"
              title="Test Japanese audio voice"
            >
              <span className="material-symbols-outlined text-xl">volume_up</span>
            </button>
            <button
              onClick={onOpenFeedback}
              className="w-9 h-9 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container rounded-full transition-colors active:scale-95"
              title="Give product feedback"
            >
              <span className="material-symbols-outlined text-xl">feedback</span>
            </button>
          </div>

          <div className="h-5 w-px bg-outline-variant hidden sm:block" />

          {/* Learner Avatar Profile Badge */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 pl-1 cursor-pointer group"
            title="Learner Profile & Settings"
          >
            <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm font-bold shadow-xs group-hover:ring-2 ring-primary transition-all">
              NL
            </div>
            <span className="font-label-md text-label-md text-on-surface font-semibold hidden xl:inline group-hover:text-primary transition-colors">
              Learner
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
