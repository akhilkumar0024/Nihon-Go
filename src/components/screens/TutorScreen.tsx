import React, { useState, useRef, useEffect } from 'react';
import { VocabularyItem, ChatMessage } from '../../types';
import { audioService, speechRecognitionService } from '../../services/audio';
import { askTutor } from '../../services/api';

interface TutorScreenProps {
  currentWord: VocabularyItem;
  onSelectWord: (wordId: string) => void;
}

/**
 * Parse inline markdown tokens: **bold**, *italic*, `code`
 */
function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={`b-${match.index}`} className="font-bold text-primary">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith('*') && token.endsWith('*')) {
      parts.push(
        <em key={`i-${match.index}`} className="italic text-on-surface-variant font-medium">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code
          key={`c-${match.index}`}
          className="px-1 py-0.5 rounded bg-surface-container font-mono text-xs text-secondary"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

/**
 * Formats chat message content by rendering markdown bold/italics and paragraphs/lists
 */
function renderFormattedChatMessage(rawText: string): React.ReactNode {
  // If there are no newlines and no markdown, return as is
  if (!rawText.includes('\n') && !rawText.includes('*') && !rawText.includes('`')) {
    return rawText;
  }

  const paragraphs = rawText.split(/\n\n+/);

  return (
    <div className="space-y-2">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split('\n');
        return (
          <div key={pIdx} className="space-y-1">
            {lines.map((line, lIdx) => {
              const trimmed = line.trim();
              const isBullet = trimmed.startsWith('•') || trimmed.startsWith('-');
              const cleanLine = isBullet ? trimmed.replace(/^[•-]\s*/, '') : line;
              const content = parseInlineMarkdown(cleanLine);

              if (isBullet) {
                return (
                  <div key={lIdx} className="flex items-start gap-2 pl-2">
                    <span className="text-secondary font-bold select-none">•</span>
                    <span className="flex-1">{content}</span>
                  </div>
                );
              }

              return <p key={lIdx}>{content}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export const TutorScreen: React.FC<TutorScreenProps> = ({ currentWord }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'sensei',
      text: `Konnichiwa! I'm your AI Sensei. We're currently studying **${currentWord.japanese}** (${currentWord.hiragana} / *${currentWord.romaji}*), meaning "${currentWord.english}".\n\nFeel free to ask me anything about restaurant etiquette, honorific forms (*keigo*), casual slang, or everyday conjugations!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: [
        'How to use in formal restaurant?',
        `Explain ${currentWord.japanese} vs polite forms`,
        'Give 3 casual slang examples',
        'Quiz me on conjugations',
      ],
    },
  ]);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await askTutor(currentWord, trimmed, messages);

      const senseiMsg: ChatMessage = {
        id: `sensei-${Date.now()}`,
        sender: 'sensei',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: response.suggestions,
        source: response.source,
      };

      setMessages((prev) => [...prev, senseiMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'sensei',
        text: `Sumimasen! I ran into an issue connecting to the AI tutor service (${err.message}). You can try again or check the curated examples.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputMessage);
  };

  const handlePromptClick = (prompt: string) => {
    handleSendMessage(prompt);
  };

  const handlePlayJapaneseInChat = (text: string) => {
    // Extract only Japanese text (Kanji, Hiragana, Katakana, and Japanese particles/quotes)
    // so the TTS only speaks the actual Japanese vocabulary taught, avoiding English mispronunciation
    // and ensuring asterisks or markdown syntax are never read aloud.
    const japaneseMatches = text.match(/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF][\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAFー\w]*/g);

    if (japaneseMatches && japaneseMatches.length > 0) {
      const cleanJapaneseList = Array.from(new Set(japaneseMatches))
        .map((p) => p.replace(/[*_#`~[\]()]/g, '').trim())
        .filter((p) => p.length > 0);

      const phraseToSpeak = cleanJapaneseList.join('、 ');
      audioService.speakJapanese(phraseToSpeak);
    } else {
      // Fallback: strip any markdown symbols so TTS never speaks "asterisk"
      const sanitized = text.replace(/[*_#`~[\]()]/g, '');
      audioService.speakJapanese(sanitized);
    }
  };

  // Mic speech input for tutor
  const handleToggleMic = () => {
    if (!speechRecognitionService.isSupported()) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isMicActive) {
      speechRecognitionService.stopListening();
      setIsMicActive(false);
    } else {
      setIsMicActive(true);
      speechRecognitionService.startListening('en-US', {
        onResult: (transcript, isFinal) => {
          setInputMessage(transcript);
          if (isFinal) {
            setIsMicActive(false);
            handleSendMessage(transcript);
          }
        },
        onError: (err) => {
          setIsMicActive(false);
          alert(err);
        },
        onEnd: () => {
          setIsMicActive(false);
        },
      });
    }
  };

  const quickPrompts = [
    { id: 1, text: `How to use in formal restaurant?` },
    { id: 2, text: `Explain ${currentWord.japanese} vs honorifics` },
    { id: 3, text: `Give 3 casual slang examples` },
    { id: 4, text: `Quiz me on conjugations` },
  ];

  return (
    <div className="w-full min-h-[600px] md:h-[calc(100vh-7.5rem)] flex flex-col md:flex-row gap-space-md max-w-[1520px] mx-auto animate-in fade-in duration-200">
      {/* ================= LEFT CONTEXT PANE (35% width) ================= */}
      <section
        aria-label="Word Context & Quick Prompts"
        className="w-full md:w-[35%] flex flex-col h-full bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs overflow-hidden flex-shrink-0"
      >
        {/* Pane Header */}
        <div className="px-space-md py-3.5 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/50">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">
              dictionary
            </span>
            <h2 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
              Current Word Context
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-bold border border-primary/20">
            {currentWord.jlptLevel || 'N5'}
          </span>
        </div>

        {/* Context Content Body */}
        <div className="flex-1 overflow-y-auto custom-scroll p-space-md flex flex-col gap-space-md">
          {/* Kanji Anchor Card */}
          <div className="bg-surface-bright rounded-xl p-space-md border border-outline-variant relative overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-furigana text-furigana text-secondary font-semibold uppercase tracking-widest pl-1">
                  {currentWord.hiragana}
                </span>
                <div className="flex items-baseline gap-2">
                  <h1 className="font-kanji-hero text-3xl sm:text-4xl text-primary leading-none font-normal">
                    {currentWord.japanese}
                  </h1>
                  <span className="font-headline-sm text-headline-sm text-on-surface-variant font-normal">
                    ({currentWord.romaji})
                  </span>
                </div>
                <p className="font-body-md text-body-md text-on-surface mt-2 font-medium">
                  {currentWord.english}
                </p>
              </div>

              {/* Mini Audio Play Button */}
              <button
                onClick={() => audioService.speakJapanese(currentWord.hiragana || currentWord.japanese)}
                className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center hover:bg-primary shadow-xs active:scale-95 transition-all"
                title="Listen to pronunciation"
              >
                <span className="material-symbols-outlined text-xl">volume_up</span>
              </button>
            </div>

            {/* Grammatical Metadata */}
            <div className="mt-3 pt-3 border-t border-outline-variant/60 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-container font-label-sm text-label-sm text-on-surface-variant border border-outline-variant/60">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                {currentWord.partOfSpeech}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-container font-label-sm text-label-sm text-on-surface-variant border border-outline-variant/60">
                <span className="font-mono text-secondary font-bold">
                  {currentWord.pitchAccent?.notation || currentWord.romaji}
                </span>
              </span>
            </div>
          </div>

          {/* Quick Prompts Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                Interactive Quick Prompts
              </span>
              <span className="text-xs text-outline font-label-sm">Tap to inquire</span>
            </div>

            <div className="flex flex-col gap-2">
              {quickPrompts.map((qp) => (
                <button
                  key={qp.id}
                  onClick={() => handlePromptClick(qp.text)}
                  disabled={isLoading}
                  className="group w-full text-left p-3 rounded-xl bg-surface hover:bg-surface-container border border-outline-variant hover:border-primary/40 transition-all active:scale-[0.99] flex items-center justify-between shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-md bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed text-xs font-bold">
                      {qp.id}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface font-medium group-hover:text-primary transition-colors">
                      {qp.text}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-outline group-hover:text-primary text-[18px] transition-transform group-hover:translate-x-0.5">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Sensei Pedagogical Tip Card */}
          <div className="mt-auto p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/70 flex items-start gap-3">
            <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">
              lightbulb
            </span>
            <div className="flex flex-col">
              <span className="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wide">
                Sensei's Tip
              </span>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
                {currentWord.nuance || 'Practice vocalizing with pitch accent drops.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= RIGHT CONVERSATION PANE (65% width) ================= */}
      <section
        aria-label="AI Sensei Interactive Conversation Stream"
        className="w-full md:w-[65%] flex flex-col h-full bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xs overflow-hidden"
      >
        {/* Conversation Header */}
        <div className="px-space-md sm:px-space-lg py-3 border-b border-outline-variant/60 flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-serif text-lg font-bold shadow-xs">
                先
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-primary ring-2 ring-surface-container-lowest" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                  Sensei AI
                </h2>
                <span className="text-on-surface-variant font-label-md text-label-md hidden sm:inline">
                  • Japanese Language Mentor
                </span>
              </div>
              <span className="text-xs text-outline font-label-sm">
                Discussing 「{currentWord.japanese}」
              </span>
            </div>
          </div>

          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold border border-outline-variant/60">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Context Retained
          </span>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto custom-scroll p-space-md sm:p-space-lg space-y-space-md">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-serif text-sm font-bold shrink-0 mt-1 shadow-2xs">
                    先
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl border text-sm leading-relaxed ${
                      isUser
                        ? 'bg-surface-container text-on-surface border-outline-variant/80 rounded-tr-xs'
                        : 'bg-surface-bright text-on-surface border-outline-variant/60 shadow-2xs rounded-tl-xs'
                    }`}
                  >
                    {renderFormattedChatMessage(msg.text)}

                    {/* Inline audio pronunciation button for Sensei responses */}
                    {!isUser && (
                      <div className="mt-2.5 pt-2 border-t border-outline-variant/40 flex items-center justify-between">
                        <button
                          onClick={() => handlePlayJapaneseInChat(msg.text)}
                          className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary-container font-semibold transition-colors"
                          title="Speak Japanese text in this explanation"
                        >
                          <span className="material-symbols-outlined text-base">volume_up</span>
                          <span>Listen Pronunciation</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                          {msg.source && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                msg.source === 'live-ai'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {msg.source === 'live-ai' ? 'Live AI' : 'Curated'}
                            </span>
                          )}
                          <span className="text-[10px] text-outline font-mono">{msg.timestamp}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && !isUser && (
                    <div className="flex flex-wrap gap-1.5 pt-1 pl-1">
                      {msg.suggestions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handlePromptClick(sug)}
                          disabled={isLoading}
                          className="px-2.5 py-1 rounded-full text-xs bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-primary transition-colors border border-outline-variant/60 shadow-2xs text-left"
                        >
                          {sug} ➔
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xs shrink-0 mt-1 shadow-2xs">
                    AS
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 items-center mr-auto">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-serif text-sm font-bold shadow-2xs">
                先
              </div>
              <div className="p-3 rounded-2xl bg-surface-bright border border-outline-variant/60 flex items-center gap-2 text-xs text-outline shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                <span>Sensei is thinking...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Bottom Input Dock */}
        <div className="p-space-md border-t border-outline-variant bg-surface-container-lowest">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask Sensei about 「${currentWord.japanese}」 grammar, nuances, or usage...`}
                disabled={isLoading}
                className="w-full pl-4 pr-10 py-3 rounded-xl border border-outline-variant bg-surface-bright text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />

              {/* Mic Speech Button */}
              <button
                type="button"
                onClick={handleToggleMic}
                className={`absolute right-2.5 top-2.5 p-1 rounded-lg transition-colors ${
                  isMicActive
                    ? 'text-secondary bg-secondary-fixed animate-pulse'
                    : 'text-outline hover:text-primary hover:bg-surface-container'
                }`}
                title="Speak your question"
              >
                <span className="material-symbols-outlined text-xl">mic</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="py-3 px-5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-all disabled:opacity-50 active:scale-95 shadow-xs"
            >
              Send
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
