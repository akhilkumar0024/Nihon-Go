import { VocabularyItem, ChatMessage } from '../types';
import { findCuratedWord } from '../data/curatedVocab';
import { saveCustomWord } from './storage';

export async function checkApiStatus(): Promise<{ geminiConfigured: boolean; model: string }> {
  try {
    const res = await fetch('/api/status');
    if (!res.ok) throw new Error('Status check failed');
    const json = await res.json();
    return {
      geminiConfigured: !!json.geminiConfigured,
      model: json.model || 'gemini-2.5-flash',
    };
  } catch (e) {
    return { geminiConfigured: false, model: 'offline' };
  }
}

export async function fetchVocabulary(query: string): Promise<VocabularyItem> {
  const trimmed = query.trim();
  if (!trimmed) {
    throw new Error('Please enter a word or phrase to look up.');
  }

  try {
    const res = await fetch('/api/vocabulary', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: trimmed }),
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      // Check client-side curated fallback as emergency fallback
      const curated = findCuratedWord(trimmed);
      if (curated) {
        return curated;
      }
      throw new Error(data.error || 'Failed to analyze vocabulary word.');
    }

    const item: VocabularyItem = data.data;
    saveCustomWord(item);
    return item;
  } catch (err: any) {
    // If network or server error, attempt client-side curated fallback
    const curated = findCuratedWord(trimmed);
    if (curated) {
      return curated;
    }
    throw new Error(err.message || 'Unable to retrieve vocabulary analysis. Please try again.');
  }
}

export async function askTutor(
  word: VocabularyItem,
  message: string,
  history: ChatMessage[]
): Promise<{ text: string; suggestions: string[]; source: 'live-ai' | 'curated-fallback'; note?: string }> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error('Please enter a question for Sensei.');
  }

  const payloadHistory = history.slice(-6).map((m) => ({
    sender: m.sender,
    text: m.text,
  }));

  try {
    const res = await fetch('/api/tutor', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        word,
        message: trimmed,
        history: payloadHistory,
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Sensei was unable to respond. Please try again.');
    }

    return {
      text: data.data.text,
      suggestions: data.data.suggestions || [],
      source: data.data.source || 'live-ai',
      note: data.data.note,
    };
  } catch (err: any) {
    throw new Error(err.message || 'Could not connect to Sensei AI.');
  }
}
