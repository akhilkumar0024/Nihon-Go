export interface TTSOptions {
  rate?: number; // 1.0 or 0.75
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class AudioService {
  private synth: SpeechSynthesis | null = null;
  private japaneseVoices: SpeechSynthesisVoice[] = [];
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private voicesLoaded = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    this.japaneseVoices = voices.filter(
      (v) => v.lang.toLowerCase().startsWith('ja') || v.lang.toLowerCase().includes('jp')
    );
    if (this.japaneseVoices.length > 0) {
      // Prefer Google or high quality voices if available
      this.selectedVoice =
        this.japaneseVoices.find(
          (v) => v.name.includes('Google') || v.name.includes('Kyoko') || v.name.includes('Otoya')
        ) || this.japaneseVoices[0];
    }
    this.voicesLoaded = true;
  }

  public isTTSSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public hasJapaneseVoice(): boolean {
    this.loadVoices();
    return this.japaneseVoices.length > 0;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    this.loadVoices();
    return this.japaneseVoices;
  }

  public speakJapanese(text: string, options: TTSOptions = {}): boolean {
    if (!this.synth) {
      options.onError?.('Speech synthesis not supported in this browser');
      return false;
    }

    // Cancel any active utterance
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = options.rate ?? 1.0;
    utterance.pitch = options.pitch ?? 1.0;

    if (!this.selectedVoice) {
      this.loadVoices();
    }
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }

    utterance.onstart = () => options.onStart?.();
    utterance.onend = () => options.onEnd?.();
    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      options.onError?.(e);
    };

    try {
      this.synth.speak(utterance);
      return true;
    } catch (e) {
      options.onError?.(e);
      return false;
    }
  }

  public stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

export const audioService = new AudioService();

// Speech Recognition (STT) Hook / Helper
export interface SpeechRecognitionHandlers {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onEnd: () => void;
}

export class SpeechRecognitionService {
  private recognition: any = null;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
      }
    }
  }

  public isSupported(): boolean {
    return !!this.recognition;
  }

  public startListening(lang: 'en-US' | 'ja-JP', handlers: SpeechRecognitionHandlers): boolean {
    if (!this.recognition) {
      handlers.onError('Speech recognition is not supported in this browser. Please use text input.');
      return false;
    }

    if (this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }

    this.recognition.lang = lang;

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          final += item[0].transcript;
        } else {
          interim += item[0].transcript;
        }
      }
      if (final) {
        handlers.onResult(final.trim(), true);
      } else if (interim) {
        handlers.onResult(interim.trim(), false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      let msg = 'Speech recognition error occurred.';
      if (event.error === 'not-allowed' || event.error === 'permission-denied') {
        msg = 'Microphone permission was denied. Please allow microphone access in your browser settings.';
      } else if (event.error === 'no-speech') {
        msg = 'No speech detected. Please try speaking again.';
      } else if (event.error === 'network') {
        msg = 'Network error during speech recognition.';
      }
      handlers.onError(msg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
      handlers.onEnd();
    };

    try {
      this.recognition.start();
      return true;
    } catch (e: any) {
      this.isListening = false;
      handlers.onError(e.message || 'Failed to start microphone.');
      return false;
    }
  }

  public stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.isListening = false;
    }
  }
}

export const speechRecognitionService = new SpeechRecognitionService();
