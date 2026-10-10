import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { QuizQuestion, VocabularyItem, UserProgress } from '../../types';
import { generateQuizQuestions } from '../../services/quiz';
import { audioService } from '../../services/audio';

interface PracticeNotebookScreenProps {
  savedWords: VocabularyItem[];
  progress: UserProgress;
  onRemoveWord: (word: VocabularyItem) => void;
  onSelectWordForStudy: (wordId: string) => void;
  onRecordQuizResult: (isCorrect: boolean) => void;
}

export const PracticeNotebookScreen: React.FC<PracticeNotebookScreenProps> = ({
  savedWords,
  progress,
  onRemoveWord,
  onSelectWordForStudy,
  onRecordQuizResult,
}) => {
  const [activeTab, setActiveTab] = useState<'quiz' | 'notebook'>('quiz');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizCompleted, setQuizCompleted] = useState<boolean>(false);
  const [searchNotebook, setSearchNotebook] = useState<string>('');

  // Live session timer in MM:SS
  const [sessionSeconds, setSessionSeconds] = useState<number>(522); // ~8m 42s initially
  useEffect(() => {
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Initialize quiz questions
  useEffect(() => {
    setQuestions(generateQuizQuestions(5));
  }, [savedWords]);

  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (optionId: string) => {
    if (isSubmitted) return;
    setSelectedOptionId(optionId);
    setIsSubmitted(true);

    const isCorrect = optionId === currentQ.correctOptionId;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
    onRecordQuizResult(isCorrect);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsSubmitted(false);
    } else {
      setQuizCompleted(true);
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {}
    }
  };

  const handleRetryQuiz = () => {
    setQuestions(generateQuizQuestions(5));
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setIsSubmitted(false);
    setQuizScore(0);
    setQuizCompleted(false);
  };

  const handlePlayQuizAudio = () => {
    if (currentQ?.audioSentence) {
      audioService.speakJapanese(currentQ.audioSentence);
    }
  };

  // Filter saved words in notebook tab
  const filteredWords = savedWords.filter(
    (w) =>
      w.japanese.includes(searchNotebook) ||
      w.hiragana.includes(searchNotebook) ||
      w.romaji.toLowerCase().includes(searchNotebook.toLowerCase()) ||
      w.english.toLowerCase().includes(searchNotebook.toLowerCase())
  );

  const progressPercent = questions.length > 0
    ? Math.round(((currentQuestionIndex + (isSubmitted ? 1 : 0)) / questions.length) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-space-lg max-w-[1520px] mx-auto animate-in fade-in duration-200">
      {/* ================= TOP TWO-TAB SWITCHER ================= */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-outline-variant pb-space-sm gap-3">
        <div className="flex items-center gap-space-sm bg-surface-container-low p-1 rounded-xl border border-outline-variant shadow-2xs">
          {/* Active Practice Quiz Tab */}
          <button
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-space-md py-2 rounded-lg font-label-md text-label-md font-semibold transition-all ${
              activeTab === 'quiz'
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                activeTab === 'quiz' ? 'text-secondary fill-icon' : 'text-outline'
              }`}
            >
              quiz
            </span>
            <span>Active Practice Quiz</span>
            <span className="bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm px-2 py-0.5 rounded-full">
              {quizCompleted ? 'Finished' : 'In Progress'}
            </span>
          </button>

          {/* Saved Vocabulary Notebook Tab */}
          <button
            onClick={() => setActiveTab('notebook')}
            className={`flex items-center gap-2 px-space-md py-2 rounded-lg font-label-md text-label-md transition-all ${
              activeTab === 'notebook'
                ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant font-semibold'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">collections_bookmark</span>
            <span>Saved Notebook ({savedWords.length} words)</span>
          </button>
        </div>

        {/* Quick Session Controls & Real Timer */}
        <div className="flex items-center gap-space-md text-body-sm font-body-sm text-on-surface-variant">
          <span className="flex items-center gap-1.5 font-mono">
            <span className="material-symbols-outlined text-[18px] text-outline">timer</span>
            <span>
              Session Time: <strong className="text-on-surface">{formatTimer(sessionSeconds)}</strong>
            </span>
          </span>
          <span className="text-outline-variant">•</span>
          <span className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[18px] text-secondary fill-icon">
              local_fire_department
            </span>
            <span>
              Streak: <strong className="text-secondary font-semibold">{progress.streakDays} days</strong>
            </span>
          </span>
        </div>
      </section>

      {/* ================= DUAL PANE LAYOUT ================= */}
      <div className="grid grid-cols-12 gap-space-lg items-start">
        {/* ================= MAIN AREA (8 COLS) ================= */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-space-lg">
          {activeTab === 'quiz' ? (
            !quizCompleted && currentQ ? (
              <>
                {/* Top Session Progress Bar Card */}
                <div className="bg-surface-container-lowest rounded-2xl p-space-md border border-outline-variant shadow-xs flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-space-sm">
                      <span className="bg-surface-container text-primary font-label-sm text-label-sm px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold border border-outline-variant">
                        Review Mode
                      </span>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-sm sm:text-base">
                        JLPT N5 Daily Review • Question {currentQuestionIndex + 1} of {questions.length}
                      </h2>
                    </div>
                    <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant font-mono">
                      <span>Progress:</span>
                      <span className="font-bold text-primary">{progressPercent}%</span>
                    </div>
                  </div>

                  {/* Japanese Progress Bar */}
                  <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden relative">
                    <div
                      className="bg-primary-container h-full rounded-full transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                    <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-secondary" title="Daily Goal Marker" />
                  </div>
                </div>

                {/* Interactive Question Card */}
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs overflow-hidden flex flex-col">
                  {/* Category Prompt Banner */}
                  <div className="bg-surface-container px-space-lg py-3 border-b border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-primary">hearing</span>
                      <span className="font-label-md text-label-md font-semibold text-primary">
                        Listening & Reading Comprehension
                      </span>
                    </div>
                    <span className="text-xs text-on-surface-variant font-mono">Word ID: #{currentQ.wordId}</span>
                  </div>

                  <div className="p-space-md sm:p-space-lg flex flex-col gap-space-lg">
                    {/* Audio Prompt Trigger Pill */}
                    <div className="flex items-center justify-between p-space-md rounded-xl bg-surface-bright border border-outline-variant">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={handlePlayQuizAudio}
                          className="w-11 h-11 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary transition-transform active:scale-95 shadow-xs shrink-0"
                          title="Play natural speed Japanese audio"
                        >
                          <span className="material-symbols-outlined text-[24px]">volume_up</span>
                        </button>
                        <div className="flex flex-col">
                          <span className="font-body-md text-body-md font-medium text-on-surface">
                            Listen to the audio sentence and choose the correct grammatical option:
                          </span>
                          <span className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2 mt-0.5">
                            <span>Native Tokyo Dialect</span> • <span>Normal speed (1.0x)</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={handlePlayQuizAudio}
                          className="p-1.5 text-on-surface-variant hover:text-primary rounded-md"
                          title="Replay"
                        >
                          <span className="material-symbols-outlined text-[20px]">replay</span>
                        </button>
                      </div>
                    </div>

                    {/* Japanese Prompt Display with Pitch Accent & Furigana */}
                    {currentQ.japanesePrompt && (
                      <div className="bg-surface-bright rounded-2xl p-space-lg border border-outline-variant/80 text-center flex flex-col items-center justify-center gap-2 shadow-inner">
                        <div className="font-furigana text-furigana text-on-surface-variant tracking-wider">
                          {currentQ.japanesePrompt.furigana}
                        </div>
                        <div className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-wide flex items-baseline justify-center gap-1">
                          {currentQ.japanesePrompt.sentence}
                        </div>
                        {currentQ.japanesePrompt.accentNote && (
                          <div className="mt-2 flex items-center gap-2 text-xs font-mono text-outline">
                            <span className="px-2 py-0.5 rounded bg-surface-container border border-outline-variant">
                              {currentQ.japanesePrompt.accentNote}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Question Headline */}
                    <div>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                        {currentQ.prompt}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                        Select the single most precise English translation or reading:
                      </p>
                    </div>

                    {/* 4 Styled Option Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      {currentQ.options.map((opt) => {
                        const isChosen = selectedOptionId === opt.id;
                        const isCorrectOption = opt.id === currentQ.correctOptionId;

                        let cardStyle =
                          'border border-outline-variant bg-surface-container-lowest hover:border-outline hover:bg-surface-container';

                        if (isSubmitted) {
                          if (isCorrectOption) {
                            cardStyle =
                              'border-2 border-primary-container bg-surface-container-low ring-2 ring-primary-container/20';
                          } else if (isChosen && !isCorrectOption) {
                            cardStyle = 'border-2 border-error bg-error-container/20';
                          } else {
                            cardStyle = 'border border-outline-variant opacity-60 bg-surface-bright';
                          }
                        }

                        return (
                          <button
                            key={opt.id}
                            onClick={() => handleSelectOption(opt.id)}
                            disabled={isSubmitted}
                            className={`p-space-md rounded-xl text-left transition-all flex items-start gap-space-md group ${cardStyle}`}
                          >
                            <div
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-label-md text-label-md font-bold shrink-0 ${
                                isSubmitted && isCorrectOption
                                  ? 'bg-primary-container text-on-primary'
                                  : isSubmitted && isChosen && !isCorrectOption
                                  ? 'bg-error text-on-error'
                                  : 'bg-surface-container border border-outline-variant text-on-surface-variant'
                              }`}
                            >
                              {isSubmitted && isCorrectOption ? (
                                <span className="material-symbols-outlined text-[18px]">check</span>
                              ) : isSubmitted && isChosen && !isCorrectOption ? (
                                <span className="material-symbols-outlined text-[18px]">close</span>
                              ) : (
                                opt.id
                              )}
                            </div>
                            <div className="flex flex-col pr-4">
                              <span className="font-body-md text-body-md font-semibold text-on-surface">
                                {opt.text}
                              </span>
                              {opt.subtext && (
                                <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                                  {opt.subtext}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Instant Feedback Drawer */}
                    {isSubmitted && (
                      <div className="rounded-xl border border-primary-container/30 bg-surface-bright p-space-md flex flex-col gap-2 relative overflow-hidden animate-in fade-in duration-150">
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary-container" />
                        <div className="flex items-center gap-2 pl-2">
                          <span
                            className={`flex items-center justify-center w-6 h-6 rounded-full text-on-primary ${
                              selectedOptionId === currentQ.correctOptionId
                                ? 'bg-primary-container'
                                : 'bg-secondary'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {selectedOptionId === currentQ.correctOptionId ? 'done_all' : 'info'}
                            </span>
                          </span>
                          <span className="font-headline-sm text-headline-sm font-bold text-primary">
                            {selectedOptionId === currentQ.correctOptionId
                              ? '正解 (Correct)!'
                              : 'Explanation & Correction'}
                          </span>
                          <span className="font-label-sm text-label-sm bg-surface-container-high px-2 py-0.5 rounded text-on-surface font-semibold ml-2">
                            +{currentQ.xp} XP
                          </span>
                        </div>

                        <p className="font-body-md text-body-md text-on-surface pl-2 leading-relaxed">
                          {currentQ.explanation}
                        </p>

                        {currentQ.grammarNotes && currentQ.grammarNotes.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-1 pl-2">
                            {currentQ.grammarNotes.map((gn, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-0.5 rounded bg-surface-container border border-outline-variant text-on-surface-variant font-medium"
                              >
                                {gn}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Button Tray */}
                    <div className="pt-space-sm flex items-center justify-between border-t border-outline-variant">
                      <span className="text-xs text-outline">Answer to unlock detailed notes</span>
                      {isSubmitted && (
                        <button
                          onClick={handleNextQuestion}
                          className="py-3 px-space-xl rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg font-semibold flex items-center gap-2 shadow-xs transition-all active:translate-y-0.5"
                        >
                          <span>Continue to Next Question</span>
                          <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Quiz Finished View */
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-space-xl text-center space-y-space-md shadow-xs animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center mx-auto text-3xl shadow-xs">
                  <span className="material-symbols-outlined text-4xl">emoji_events</span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-primary font-bold">
                  Review Quiz Complete!
                </h2>
                <p className="text-on-surface-variant max-w-md mx-auto text-sm">
                  You scored <strong className="text-primary font-bold">{quizScore} out of {questions.length}</strong> (
                  {Math.round((quizScore / questions.length) * 100)}% accuracy). Your spaced repetition schedule has been updated.
                </p>

                <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-3">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
                    <span className="text-xl font-bold text-primary block">{quizScore * 15}</span>
                    <span className="text-[11px] text-outline uppercase font-semibold">XP Earned</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
                    <span className="text-xl font-bold text-secondary block">{progress.streakDays}d</span>
                    <span className="text-[11px] text-outline uppercase font-semibold">Streak</span>
                  </div>
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
                    <span className="text-xl font-bold text-primary block">
                      {Math.round((quizScore / questions.length) * 100)}%
                    </span>
                    <span className="text-[11px] text-outline uppercase font-semibold">Accuracy</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleRetryQuiz}
                    className="px-6 py-3 rounded-xl bg-primary-container text-on-primary font-semibold hover:bg-primary transition-all tactile-depress"
                  >
                    Practice Again
                  </button>
                  <button
                    onClick={() => setActiveTab('notebook')}
                    className="px-6 py-3 rounded-xl bg-surface-container text-primary font-semibold hover:bg-surface-container-high border border-outline-variant transition-colors"
                  >
                    View Saved Notebook
                  </button>
                </div>
              </div>
            )
          ) : (
            /* ================= NOTEBOOK TAB ================= */
            <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant p-space-lg shadow-xs flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                    Saved Vocabulary Notebook
                  </h2>
                  <p className="text-xs text-outline">
                    {savedWords.length} words saved in your offline browser storage
                  </p>
                </div>

                <input
                  type="text"
                  value={searchNotebook}
                  onChange={(e) => setSearchNotebook(e.target.value)}
                  placeholder="Filter saved words..."
                  className="px-3.5 py-2 rounded-xl border border-outline-variant bg-surface-bright text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div className="space-y-2.5">
                {filteredWords.length > 0 ? (
                  filteredWords.map((word) => (
                    <div
                      key={word.id}
                      className="p-3.5 rounded-xl bg-surface-bright border border-outline-variant/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container text-primary font-bold font-headline-md flex items-center justify-center shrink-0">
                          {word.japanese.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-on-surface text-base">{word.japanese}</span>
                            <span className="text-xs text-outline font-mono">({word.romaji})</span>
                            <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-primary-fixed text-on-primary-fixed">
                              {word.jlptLevel}
                            </span>
                          </div>
                          <p className="text-xs text-on-surface-variant line-clamp-1 mt-0.5">
                            {word.english} • {word.partOfSpeech}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={() => audioService.speakJapanese(word.japanese)}
                          className="p-2 rounded-lg text-primary hover:bg-surface-container transition-colors"
                          title="Pronounce"
                        >
                          <span className="material-symbols-outlined text-lg">volume_up</span>
                        </button>
                        <button
                          onClick={() => onSelectWordForStudy(word.id)}
                          className="px-3 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary text-xs font-semibold transition-colors"
                        >
                          Study Word
                        </button>
                        <button
                          onClick={() => onRemoveWord(word)}
                          className="p-2 rounded-lg text-error hover:bg-error-container/30 transition-colors"
                          title="Remove from notebook"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-xs text-outline">
                    No words found matching "{searchNotebook}".
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT SIDEBAR: Notebook Quick Reference (4 COLS) ================= */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-space-lg">
          <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs p-space-md flex flex-col gap-space-md">
            <div className="flex items-center justify-between border-b border-outline-variant pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">bookmark</span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold text-sm">
                  Saved Words in this Session
                </h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                {savedWords.length} Active
              </span>
            </div>

            {/* Quick Vocabulary List */}
            <div className="flex flex-col gap-2.5">
              {savedWords.slice(0, 5).map((word, idx) => (
                <div
                  key={word.id}
                  onClick={() => onSelectWordForStudy(word.id)}
                  className="p-3 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-between hover:bg-surface-container transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center font-headline-md text-primary font-bold">
                      {word.japanese.charAt(0)}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-on-surface text-sm group-hover:text-primary transition-colors">
                          {word.japanese}
                        </span>
                        <span className="text-xs text-on-surface-variant font-mono">({word.romaji})</span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant line-clamp-1">{word.english}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed border border-primary-fixed-dim">
                      Lv {word.masteryLevel || 3}
                    </span>
                    <span className="text-[10px] text-outline">Streak {word.streak || idx + 1}</span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('notebook')}
              className="w-full py-2 rounded-lg text-xs font-semibold text-primary hover:bg-surface-container border border-outline-variant transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Manage Full Notebook</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
