import { callGemini, getGeminiApiKey } from './_gemini.ts';

export interface TutorHistoryItem {
  sender: 'user' | 'sensei';
  text: string;
}

export async function handleTutorRequest(
  word: any,
  message: string,
  history: TutorHistoryItem[] = []
): Promise<any> {
  const trimmedMessage = message.trim();
  if (!trimmedMessage || trimmedMessage.length > 500) {
    throw new Error('Message must be between 1 and 500 characters.');
  }

  const safeHistory = (history || []).slice(-8); // Keep last 8 turns
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    // Intelligent contextual fallback based on user query and word
    const lower = trimmedMessage.toLowerCase();
    let reply = '';
    let suggestions = [
      `How do I pronounce ${word?.romaji || 'this'}?`,
      `Give me another example sentence`,
      `What is the difference between casual and polite?`,
    ];

    if (lower.includes('restaurant') || lower.includes('formal') || lower.includes('order')) {
      reply = `In a restaurant setting, Japanese speakers rarely use the plain form **${word?.japanese || '食べる'}** (${word?.romaji || 'taberu'}). Instead, use the polite form **${word?.japanese ? word.japanese.slice(0, -1) + 'ます' : '食べます'}** (${word?.romaji ? word.romaji.slice(0, -2) + 'masu' : 'tabemasu'}). When speaking respectfully to customers or elders, the honorific verb **召し上がる** (meshiagaru) is used!`;
      suggestions = ['How do I ask for the bill?', 'How to say delicious in restaurant?', 'Tell me about itadakimasu'];
    } else if (lower.includes('slang') || lower.includes('casual')) {
      reply = `Casual speech in Japanese removes polite endings like *desu* and *masu*. For example, among close friends, people simply say **「これ、食べる？」** (*Kore, taberu?* - "Wanna eat this?"). Young people also frequently use **食う** (*kuu*) for casual or rough speech!`;
      suggestions = ['What about female casual speech?', 'Is kuu rude to say to elders?', 'Show another slang example'];
    } else if (lower.includes('conjugat') || lower.includes('quiz') || lower.includes('tense')) {
      reply = `Great question on verb conjugation! For **${word?.japanese || '食べる'}**:\n\n• **Present Polite:** 食べます (*tabemasu*)\n• **Past Polite:** 食べました (*tabemashita*)\n• **Negative Polite:** 食べません (*tabemasen*)\n• **Te-form (connecting):** 食べて (*tabete*)`;
      suggestions = ['How to conjugate potential form (can eat)?', 'What is volitional form (let\'s eat)?', 'Quiz me on past negative'];
    } else {
      reply = `Hello! As your AI Sensei, I'm happy to help you master **${word?.japanese || 'this word'}** (${word?.hiragana || ''} / ${word?.romaji || ''}).\n\n${word?.nuance || 'Remember to practice the pronunciation and notice the pitch-accent cadence.'}\n\nWhat specific nuance, example, or grammar point would you like to explore?`;
    }

    return {
      success: true,
      data: {
        text: reply,
        suggestions,
        source: 'curated-fallback',
        note: 'Live Gemini API key not configured on server; providing contextual pedagogical response.',
      },
    };
  }

  // Gemini system instruction & prompt
  const systemInstruction = `You are "Sensei AI", a warm, encouraging, culturally insightful Japanese language tutor inside the VocabVoice app.
The user is learning Japanese at beginner JLPT N5-N4 level.
Currently, the user is studying the word:
- Japanese: ${word?.japanese || 'N/A'}
- Reading: ${word?.hiragana || 'N/A'} (${word?.romaji || 'N/A'})
- English: ${word?.english || 'N/A'}
- Part of Speech: ${word?.partOfSpeech || 'N/A'}
- Nuance: ${word?.nuance || 'N/A'}

Rules:
1. Provide concise, clear, and beginner-accessible explanations (2-4 paragraphs max).
2. Include Kanji, Hiragana/Furigana, Hepburn Romaji, and English translation whenever introducing Japanese phrases.
3. Offer cultural context and practical usage tips where relevant.
4. Conclude with 3 short, relevant follow-up questions or suggestions formatted on a final JSON line like:
   SUGGESTIONS: ["Suggestion 1", "Suggestion 2", "Suggestion 3"]`;

  const conversationHistory = safeHistory
    .map((h) => `${h.sender === 'user' ? 'Learner' : 'Sensei'}: ${h.text}`)
    .join('\n');

  const fullPrompt = `${conversationHistory ? `Previous conversation:\n${conversationHistory}\n\n` : ''}Learner asks: "${trimmedMessage}"`;

  try {
    const rawReply = await callGemini(fullPrompt, systemInstruction, false);

    // Extract suggestions if present
    let suggestions: string[] = [];
    let cleanText = rawReply;

    const suggestionsMatch = rawReply.match(/SUGGESTIONS:\s*(\[.*?\])/s);
    if (suggestionsMatch) {
      try {
        suggestions = JSON.parse(suggestionsMatch[1]);
        cleanText = rawReply.replace(/SUGGESTIONS:\s*\[.*?\]/s, '').trim();
      } catch (e) {
        // fallback regex parsing
      }
    }

    if (suggestions.length === 0) {
      suggestions = [
        `How do I use ${word?.romaji || 'this'} politely?`,
        `Give me 2 real-life examples`,
        `What is the pitch accent pattern?`,
      ];
    }

    return {
      success: true,
      data: {
        text: cleanText,
        suggestions: suggestions.slice(0, 3),
        source: 'live-ai',
      },
    };
  } catch (err: any) {
    console.warn('Gemini call failed in tutor endpoint:', err.message);
    throw err;
  }
}

// Handler for Vercel Serverless Functions
export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { word, message, history } = body || {};

    if (!message) {
      return res.status(400).json({ success: false, error: 'Missing "message" in request body.' });
    }

    const result = await handleTutorRequest(word, message, history);
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error processing tutor dialogue.',
    });
  }
}
