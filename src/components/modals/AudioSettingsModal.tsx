import React, { useState, useEffect } from 'react';
import { audioService } from '../../services/audio';

interface AudioSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioSettingsModal: React.FC<AudioSettingsModalProps> = ({ isOpen, onClose }) => {
  const [speed, setSpeed] = useState<number>(1.0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const isSupported = audioService.isTTSSupported();
  const hasVoice = audioService.hasJapaneseVoice();

  useEffect(() => {
    if (isOpen) {
      setVoices(audioService.getAvailableVoices());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestSpeech = (sampleText: string) => {
    setIsPlaying(true);
    audioService.speakJapanese(sampleText, {
      rate: speed,
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-2xl border border-outline-variant shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-space-lg py-4 border-b border-outline-variant bg-surface-bright">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">mic</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-primary font-bold">
                Audio & Speech Settings
              </h2>
              <p className="font-label-sm text-label-sm text-outline">
                Speech Synthesis (TTS) & Web Speech Recognition (STT)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-space-lg space-y-space-md max-h-[75vh] overflow-y-auto custom-scroll">
          {/* Status Diagnostic Card */}
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                Browser Speech Engine Status
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  hasVoice
                    ? 'bg-primary-fixed text-on-primary-fixed'
                    : isSupported
                    ? 'bg-secondary-fixed text-on-secondary-fixed'
                    : 'bg-error-container text-on-error-container'
                }`}
              >
                {hasVoice ? 'Japanese Voice Ready' : isSupported ? 'Generic Voice Only' : 'Unsupported'}
              </span>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              VocabVoice uses the browser's native <strong>Web Speech API</strong> for zero-latency, private, client-side pronunciation playback and speech recognition.
            </p>

            {voices.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-semibold text-outline uppercase tracking-wider block mb-1">
                  Detected Japanese Voices ({voices.length}):
                </span>
                <div className="space-y-1">
                  {voices.map((v, i) => (
                    <div
                      key={i}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-surface-bright border border-outline-variant/60 flex items-center justify-between"
                    >
                      <span className="font-medium text-primary">{v.name}</span>
                      <span className="text-[11px] font-mono text-outline">{v.lang}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Speed Toggle */}
          <div className="space-y-1.5">
            <label className="font-label-md text-label-md font-semibold text-on-surface block">
              Default Playback Speed
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSpeed(1.0)}
                className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  speed === 1.0
                    ? 'bg-primary-container text-on-primary border-primary shadow-xs'
                    : 'bg-surface-bright text-on-surface-variant border-outline-variant hover:bg-surface-container'
                }`}
              >
                1.0x (Natural Speed)
              </button>
              <button
                onClick={() => setSpeed(0.75)}
                className={`py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  speed === 0.75
                    ? 'bg-primary-container text-on-primary border-primary shadow-xs'
                    : 'bg-surface-bright text-on-surface-variant border-outline-variant hover:bg-surface-container'
                }`}
              >
                0.75x (Study / Slow)
              </button>
            </div>
          </div>

          {/* Test Audio Samples */}
          <div className="space-y-2 pt-1">
            <label className="font-label-md text-label-md font-semibold text-on-surface block">
              Test Audio Samples
            </label>
            <div className="space-y-2">
              <button
                onClick={() => handleTestSpeech('食べる。まいにち ごはんを たべます。')}
                disabled={isPlaying}
                className="w-full p-3 rounded-xl bg-surface-bright hover:bg-surface-container border border-outline-variant flex items-center justify-between transition-colors group"
              >
                <div className="text-left">
                  <span className="font-headline-sm text-sm text-primary font-semibold block">
                    食べる (taberu)
                  </span>
                  <span className="text-xs text-outline">Everyday verb sentence</span>
                </div>
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                  play_circle
                </span>
              </button>

              <button
                onClick={() => handleTestSpeech('昨日、美味しいラーメンを食べました。')}
                disabled={isPlaying}
                className="w-full p-3 rounded-xl bg-surface-bright hover:bg-surface-container border border-outline-variant flex items-center justify-between transition-colors group"
              >
                <div className="text-left">
                  <span className="font-headline-sm text-sm text-primary font-semibold block">
                    美味しいラーメンを食べました
                  </span>
                  <span className="text-xs text-outline">Past polite sentence</span>
                </div>
                <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                  play_circle
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-space-lg py-3 bg-surface-container border-t border-outline-variant flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-primary transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
