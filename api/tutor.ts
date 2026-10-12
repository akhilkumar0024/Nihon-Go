import { callGemini, getGeminiApiKey } from './_gemini';

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
  if (!trimmedMessage || trimmedMessage.length > 300) {
    throw new Error('Message must be between 1 and 300 characters.');
  }

  const safeHistory = (Array.isArray(history) ? history : [])
    .slice(-8)
    .map((h) => ({
      sender: h.sender === 'user' ? ('user' as const) : ('sensei' as const),
      text: String(h.text || '').slice(0, 300),
    }));
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

    const isVerb =
      word?.partOfSpeech?.toLowerCase().includes('verb') ||
      word?.partOfSpeech?.includes('動詞') ||
      word?.english?.toLowerCase().startsWith('to ') ||
      ['taberu', 'nomu', 'iku', 'kuru', 'suru', 'miru', 'hanasu', 'kiku'].includes(word?.romaji?.toLowerCase() || '');

    const englishMeaning = word?.english?.replace(/^to\s+/i, '') || word?.romaji || 'this';

    if (lower.includes('restaurant') || lower.includes('formal') || lower.includes('order')) {
      if (isVerb) {
        const politeVerb = word?.japanese ? (word.japanese.endsWith('る') ? word.japanese.slice(0, -1) + 'ます' : word.japanese + 'ます') : '食べます';
        reply = `In a restaurant setting, Japanese speakers rarely use the plain form **${word?.japanese || '食べる'}** (${word?.romaji || 'taberu'}). Instead, use the polite form **${politeVerb}**. When speaking respectfully to customers or elders, honorific keigo forms like **召し上がる** (meshiagaru) are used!`;
        suggestions = ['How do I ask for the bill?', 'How to say delicious in a restaurant?', 'Tell me about itadakimasu'];
      } else {
        const politeNoun = `お${word?.japanese || '水'}`;
        const politeRomaji = `o${word?.romaji || 'mizu'}`;
        reply = `In a restaurant setting, it is customary to add the polite prefix **お-** (o-) when ordering. Instead of just saying **${word?.japanese || '水'}** (${word?.romaji || 'mizu'}), you should say **${politeNoun}** (${politeRomaji}). For example: **「${politeNoun}を一杯ください」** (*${politeRomaji} o ippai kudasai* — "A glass of ${englishMeaning}, please!").`;
        suggestions = ['How do I ask for the bill?', 'How do I say "excuse me" to the waiter?', 'Can I get hot water (oyu)?'];
      }
    } else if (lower.includes('slang') || lower.includes('casual')) {
      if (isVerb) {
        reply = `Casual speech in Japanese removes polite endings like *desu* and *masu*. For example, among close friends, people simply say **「これ、${word?.japanese || '食べる'}？」** (*Kore, ${word?.romaji || 'taberu'}?* — "Wanna eat this?").`;
        suggestions = ['What about female casual speech?', 'Is it rude to use casual form with coworkers?', 'Show another slang example'];
      } else {
        reply = `Among close friends and family, you don't need polite prefixes. You can casually say **「${word?.japanese || '水'}、ちょうだい」** (*${word?.romaji || 'mizu'}, choudai* — "Give me some ${englishMeaning}").`;
        suggestions = [`How do I ask for ${englishMeaning} casually?`, 'What is Kansai dialect for this?', 'Is choudai feminine or neutral?'];
      }
    } else if (lower.includes('conjugat') || lower.includes('quiz') || lower.includes('tense')) {
      if (isVerb) {
        reply = `Great question on verb conjugation for **${word?.japanese || '食べる'}**:\n\n• **Present Polite:** ${word?.japanese?.slice(0, -1) || '食べ'}ます (*${word?.romaji?.slice(0, -2) || 'tabe'}masu*)\n• **Past Polite:** ${word?.japanese?.slice(0, -1) || '食べ'}ました (*${word?.romaji?.slice(0, -2) || 'tabe'}mashita*)\n• **Negative Polite:** ${word?.japanese?.slice(0, -1) || '食べ'}ません (*${word?.romaji?.slice(0, -2) || 'tabe'}masen*)`;
        suggestions = ['How to conjugate potential form (can do)?', 'What is the te-form?', 'Quiz me on past negative'];
      } else {
        reply = `As a noun, **${word?.japanese || '水'}** (*${word?.romaji || 'mizu'}*) uses the copula **です** (*desu*):\n\n• **Present Polite:** ${word?.japanese || '水'}です (*${word?.romaji || 'mizu'} desu* — It is ${englishMeaning})\n• **Past Polite:** ${word?.japanese || '水'}でした (*${word?.romaji || 'mizu'} deshita* — It was ${englishMeaning})\n• **Negative Polite:** ${word?.japanese || '水'}ではありません (*${word?.romaji || 'mizu'} dewa arimasen* — It is not ${englishMeaning})`;
        suggestions = [`How to say "there is ${englishMeaning}"?`, 'What particle does this take?', `How to ask "is this ${englishMeaning}?"`];
      }
    } else {
      reply = `Hello! As your AI Sensei, I'm happy to help you master **${word?.japanese || 'this word'}** (${word?.hiragana || ''} / ${word?.romaji || ''}).\n\n${word?.nuance || 'Remember to practice pronunciation and notice the pitch-accent cadence.'}\n\nWhat specific nuance, example, or grammar point would you like to explore?`;
    }

    return {
      success: true,
      data: {
        text: reply,
        suggestions,
        source: 'curated-fallback',
        note: 'Serving verified contextual pedagogical response (server running without GEMINI_API_KEY).',
      },
    };
  }

  // Gemini system instruction & prompt
  const systemInstruction = `You are "Sensei AI", a warm, encouraging, culturally insightful Japanese language tutor inside the Nipp-On app.
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
    let body = req.body;
    if (typeof body === 'string') {
      if (body.length > 8192) {
        return res.status(413).json({ success: false, error: 'Payload too large. Max 8KB.' });
      }
      try {
        body = JSON.parse(body || '{}');
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Invalid JSON request body.' });
      }
    }

    const { word, message, history } = body || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Missing "message" in request body.' });
    }

    if (message.trim().length > 300) {
      return res.status(400).json({ success: false, error: 'Message too long. Max 300 characters.' });
    }

    const result = await handleTutorRequest(word, message, history);
    return res.status(200).json(result);
  } catch (err: any) {
    const isRateLimit = err.message === 'RATE_LIMIT_EXCEEDED';
    const statusCode = isRateLimit ? 429 : 500;
    return res.status(statusCode).json({
      success: false,
      error: isRateLimit
        ? 'Prototype request rate limit reached. Please wait a moment.'
        : err.message || 'Internal server error processing tutor dialogue.',
    });
  }
}
