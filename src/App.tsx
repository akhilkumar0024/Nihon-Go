import React, { useState, useEffect } from 'react';
import { ScreenType, SideNavBar } from './components/layout/SideNavBar';
import { TopNavBar } from './components/layout/TopNavBar';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { VocabularyScreen } from './components/screens/VocabularyScreen';
import { TutorScreen } from './components/screens/TutorScreen';
import { PracticeNotebookScreen } from './components/screens/PracticeNotebookScreen';
import { AudioSettingsModal } from './components/modals/AudioSettingsModal';
import { ProfileModal } from './components/modals/ProfileModal';
import { FeedbackModal } from './components/modals/FeedbackModal';
import { VocabularyItem, UserProgress } from './types';
import { CURATED_VOCABULARY, findCuratedWord } from './data/curatedVocab';
import {
  loadProgress,
  saveProgress,
  getSavedWords,
  toggleSaveWord,
  recordWordStudied,
  recordPronunciationScore,
  recordQuizResult,
  getCustomWord,
} from './services/storage';
import { fetchVocabulary, checkApiStatus } from './services/api';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('dashboard');
  const [progress, setProgress] = useState<UserProgress>(loadProgress());
  const [savedWords, setSavedWords] = useState<VocabularyItem[]>(getSavedWords());
  const [currentWord, setCurrentWord] = useState<VocabularyItem>(CURATED_VOCABULARY[0]);
  const [isLoadingWord, setIsLoadingWord] = useState<boolean>(false);
  const [wordError, setWordError] = useState<string | null>(null);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(false);

  // Modals & Drawers
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Check API status on mount
  useEffect(() => {
    checkApiStatus().then((status) => {
      setGeminiConfigured(status.geminiConfigured);
    });
  }, []);

  const handleSearchWord = async (query: string) => {
    setIsLoadingWord(true);
    setWordError(null);
    try {
      const item = await fetchVocabulary(query);
      setCurrentWord(item);
      recordWordStudied(item.id);
      setProgress(loadProgress());
      showToast(`Analyzed 「${item.japanese}」 (${item.romaji})`);
    } catch (err: any) {
      setWordError(err.message || 'Failed to search vocabulary');
    } finally {
      setIsLoadingWord(false);
    }
  };

  const handleToggleSave = (word: VocabularyItem) => {
    const isNowSaved = toggleSaveWord(word);
    setSavedWords(getSavedWords());
    setProgress(loadProgress());
    showToast(isNowSaved ? `Added 「${word.japanese}」 to notebook!` : `Removed 「${word.japanese}」 from notebook`);
  };

  const handleSelectWordById = (wordId: string) => {
    const found =
      savedWords.find((w) => w.id === wordId) ||
      getCustomWord(wordId) ||
      findCuratedWord(wordId);
    if (found) {
      setCurrentWord(found);
      recordWordStudied(found.id);
      setProgress(loadProgress());
      setCurrentScreen('vocab');
    }
  };

  const handleOpenTutorForWord = (word: VocabularyItem) => {
    setCurrentWord(word);
    setCurrentScreen('tutor');
  };

  const handleRecordPronunciation = (score: number) => {
    recordPronunciationScore(score);
    setProgress(loadProgress());
  };

  const handleRecordQuiz = (isCorrect: boolean) => {
    recordQuizResult(isCorrect);
    setProgress(loadProgress());
  };

  const handleUpdateDailyGoal = (goal: number) => {
    const updated = { ...progress, dailyGoal: goal };
    saveProgress(updated);
    setProgress(updated);
    showToast(`Daily goal updated to ${goal} words`);
  };

  const handleResetProgress = () => {
    localStorage.clear();
    const fresh = loadProgress();
    setProgress(fresh);
    setSavedWords(getSavedWords());
    setCurrentWord(CURATED_VOCABULARY[0]);
    showToast('Prototype progress reset to baseline!');
  };

  return (
    <div className="min-h-screen flex bg-background text-on-surface antialiased selection:bg-primary-fixed selection:text-primary">
      {/* Side Navigation Bar */}
      <SideNavBar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        wordsLearnedCount={progress.wordsStudied.length}
        dailyGoal={progress.dailyGoal}
        onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Top App Bar Header */}
      <TopNavBar
        wordsStudiedCount={progress.wordsStudied.length}
        dailyGoal={progress.dailyGoal}
        streakDays={progress.streakDays}
        onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
        onOpenFeedback={() => setIsFeedbackOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
      />

      {/* Main Screen Canvas */}
      <main className="w-full lg:ml-64 mt-16 min-h-[calc(100vh-4rem)] flex-1 p-space-md sm:p-space-lg xl:p-space-xl overflow-y-auto">
        {currentScreen === 'dashboard' && (
          <DashboardScreen
            progress={progress}
            savedWords={savedWords}
            onStartSession={(wordId) => {
              if (wordId) {
                handleSelectWordById(wordId);
              } else {
                setCurrentScreen('vocab');
              }
            }}
            onStartQuiz={() => setCurrentScreen('practice')}
            onOpenAudioSettings={() => setIsAudioSettingsOpen(true)}
          />
        )}

        {currentScreen === 'vocab' && (
          <VocabularyScreen
            currentWord={currentWord}
            isSaved={savedWords.some((w) => w.id === currentWord.id)}
            onToggleSave={handleToggleSave}
            onSearchWord={handleSearchWord}
            isLoading={isLoadingWord}
            error={wordError}
            onOpenTutorForWord={handleOpenTutorForWord}
            onRecordPronunciationScore={handleRecordPronunciation}
          />
        )}

        {currentScreen === 'tutor' && (
          <TutorScreen
            currentWord={currentWord}
            onSelectWord={handleSelectWordById}
          />
        )}

        {currentScreen === 'practice' && (
          <PracticeNotebookScreen
            savedWords={savedWords}
            progress={progress}
            onRemoveWord={handleToggleSave}
            onSelectWordForStudy={handleSelectWordById}
            onRecordQuizResult={handleRecordQuiz}
          />
        )}
      </main>

      {/* Modals */}
      <AudioSettingsModal
        isOpen={isAudioSettingsOpen}
        onClose={() => setIsAudioSettingsOpen(false)}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        progress={progress}
        onUpdateDailyGoal={handleUpdateDailyGoal}
        onResetProgress={handleResetProgress}
        geminiConfigured={geminiConfigured}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        onSubmit={(feedback) => showToast('Feedback recorded! Thank you.')}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md shadow-lg border border-primary-container animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center gap-2">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default App;
