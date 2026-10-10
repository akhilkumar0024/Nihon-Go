import React from 'react';

export type ScreenType = 'dashboard' | 'vocab' | 'tutor' | 'practice';

interface SideNavBarProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  wordsLearnedCount: number;
  dailyGoal: number;
  onOpenAudioSettings: () => void;
  onOpenProfile: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentScreen,
  onNavigate,
  wordsLearnedCount,
  dailyGoal,
  onOpenAudioSettings,
  onOpenProfile,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navItems: Array<{ id: ScreenType; label: string; icon: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: 'space_dashboard' },
    { id: 'vocab', label: 'Daily Learn', icon: 'auto_stories' },
    { id: 'tutor', label: 'AI Sensei', icon: 'psychology' },
    { id: 'practice', label: 'Notebook & Practice', icon: 'menu_book' },
  ];

  const handleNav = (screen: ScreenType) => {
    onNavigate(screen);
    onCloseMobile?.();
  };

  const progressPct = Math.min(100, Math.round((wordsLearnedCount / (dailyGoal || 10)) * 100));

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen w-64 flex flex-col justify-between bg-surface-bright border-r border-outline-variant z-40 transition-transform duration-200 lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col justify-between p-space-md">
          {/* Header Brand Block */}
          <div>
            <div className="flex items-center justify-between mb-space-lg px-space-xs">
              <div
                className="flex items-center gap-space-sm cursor-pointer select-none"
                onClick={() => handleNav('dashboard')}
              >
                <div
                  className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center p-1 border border-outline-variant shadow-xs flex-shrink-0 overflow-hidden"
                  title="Nipp-ON Logo"
                >
                  <img
                    src="/logo.svg"
                    alt="Nipp-ON Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-headline-md text-headline-md text-primary tracking-tight font-semibold leading-tight">
                    Nipp-ON
                  </span>
                  <span className="font-label-sm text-label-sm text-outline truncate">
                    JLPT N5 • VocabVoice
                  </span>
                </div>
              </div>

              {/* Mobile Close Button */}
              <button
                className="lg:hidden p-1.5 text-outline hover:text-primary rounded-lg"
                onClick={onCloseMobile}
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            {/* Primary Navigation Links */}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg font-label-md text-label-md transition-all active:scale-[0.99] text-left ${
                      isActive
                        ? 'bg-surface-container text-primary font-semibold shadow-xs ring-1 ring-outline-variant/40'
                        : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined text-xl ${
                        isActive ? 'text-primary fill-icon' : 'text-outline'
                      }`}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                  </button>
                );
              })}
            </nav>

            {/* Quick Session Progress Widget */}
            <div className="mt-space-md p-space-md rounded-xl bg-surface-container-low border border-outline-variant/60 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-primary font-bold">SESSION GOAL</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant font-mono">
                  {wordsLearnedCount} / {dailyGoal} words
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-outline-variant/40 overflow-hidden relative">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <button
                onClick={() => handleNav('practice')}
                className="mt-1 w-full flex items-center justify-center gap-space-xs py-2 px-space-md rounded-lg bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-all active:scale-[0.98] shadow-xs"
              >
                <span className="material-symbols-outlined text-lg">record_voice_over</span>
                <span>Practice Session</span>
              </button>
            </div>
          </div>

          {/* Footer Navigation Items */}
          <div className="pt-space-md border-t border-outline-variant space-y-1">
            <button
              onClick={onOpenAudioSettings}
              className="w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high hover:text-on-surface transition-colors active:scale-[0.99] text-left"
            >
              <span className="material-symbols-outlined text-outline text-xl">mic</span>
              <span>Audio Settings</span>
            </button>
            <button
              onClick={onOpenProfile}
              className="w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-high hover:text-on-surface transition-colors active:scale-[0.99] text-left"
            >
              <span className="material-symbols-outlined text-outline text-xl">account_circle</span>
              <span>Profile & Goals</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
