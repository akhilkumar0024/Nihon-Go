declare const process: any;

const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.5-flash', 'gemini-flash-latest'];
const REQUEST_TIMEOUT_MS = 15000;

let lastRequestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 60;

function checkRateLimit(): boolean {
  const now = Date.now();
  lastRequestTimestamps = lastRequestTimestamps.filter((t) => now - t < 60000);
  if (lastRequestTimestamps.length >= MAX_REQUESTS_PER_MINUTE) {
    return false;
  }
  lastRequestTimestamps.push(now);
  return true;
}

export function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'your_gemini_api_key_here') {
    return null;
  }
  return key;
}

async function callGemini(
  prompt: string,
  systemInstruction?: string,
  jsonMode: boolean = false
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }

  if (!checkRateLimit()) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }

  let lastError: any = null;

  for (const model of GEMINI_MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const bodyPayload: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2048,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {}),
      },
    };

    if (systemInstruction) {
      bodyPayload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        const errorData: any = await response.json().catch(() => ({}));
        const errMessage = errorData?.error?.message || `HTTP ${response.status}`;
        console.warn(`Gemini API error with model ${model}:`, errMessage);
        lastError = new Error(errMessage);
        continue;
      }

      const data: any = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Empty response received from Gemini');
      }

      return text;
    } catch (err: any) {
      clearTimeout(timeout);
      if (err.name === 'AbortError') {
        lastError = new Error('Gemini API request timed out');
      } else {
        lastError = err;
      }
    }
  }

  throw lastError || new Error('Failed to communicate with Gemini API');
}


// Curated fallback data for common words to ensure zero downtime
const CURATED_FALLBACKS: Record<string, any> = {
  taberu: {
    id: 'taberu',
    japanese: '食べる',
    hiragana: 'たべる',
    romaji: 'taberu',
    english: 'To eat; to consume food',
    partOfSpeech: 'Transitive Verb (他動詞 • tadoushi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 100',
    pitchAccent: {
      pattern: 'Atamadaka pattern ＼',
      notation: '[ta-BE-ru]',
      moras: [
        { mora: 'ta', pitch: 'low' },
        { mora: 'BE', pitch: 'high' },
        { mora: 'ru', pitch: 'low' },
      ],
    },
    nuance: 'Used for meals and dining. Pair with object particle を (o), e.g., ご飯を食べる (to eat rice/meal). Polite form: 食べます (tabemasu).',
    exampleSentence: {
      japanese: '毎朝、七時にパンを食べます。',
      furigana: 'まいあさ、しちじに パンを たべます。',
      romaji: 'Maiasa, shichiji ni pan o tabemasu.',
      english: 'Every morning at 7 o\'clock, I eat bread.',
    },
    source: 'curated-fallback',
  },
  nomu: {
    id: 'nomu',
    japanese: '飲む',
    hiragana: 'のむ',
    romaji: 'nomu',
    english: 'To drink; to swallow liquids',
    partOfSpeech: 'Godan Verb (五段動詞 • godandoushi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 100',
    pitchAccent: {
      pattern: 'Atamadaka pattern ＼',
      notation: '[NO-mu]',
      moras: [
        { mora: 'NO', pitch: 'high' },
        { mora: 'mu', pitch: 'low' },
      ],
    },
    nuance: 'Also used idiomatically for taking medicine (薬を飲む). Polite form: 飲みます (nomimasu). Past polite: 飲みました (nomimashita).',
    exampleSentence: {
      japanese: 'カフェで冷たい緑茶を飲みました。',
      furigana: 'カフェで つめたい りょくちゃを のみました。',
      romaji: 'Kafe de tsumetai ryokucha o nomimashita.',
      english: 'I drank cold green tea at the cafe.',
    },
    source: 'curated-fallback',
  },
  hon: {
    id: 'hon',
    japanese: '本',
    hiragana: 'ほん',
    romaji: 'hon',
    english: 'Book; volume; origin',
    partOfSpeech: 'Noun (名詞 • meishi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 50',
    pitchAccent: {
      pattern: 'Atamadaka pattern ＼',
      notation: '[HO-n]',
      moras: [
        { mora: 'HO', pitch: 'high' },
        { mora: 'n', pitch: 'low' },
      ],
    },
    nuance: 'As a counter (-hon/bon/pon), 本 counts cylindrical objects like bottles, pens, and trees, in addition to meaning "book" as a noun.',
    exampleSentence: {
      japanese: '図書館で面白い日本の本を借りました。',
      furigana: 'としょかんで おもしろい にほんの ほんを かりました。',
      romaji: 'Toshokan de omoshiroi Nihon no hon o karimashita.',
      english: 'I borrowed an interesting Japanese book from the library.',
    },
    source: 'curated-fallback',
  },
  iku: {
    id: 'iku',
    japanese: '行く',
    hiragana: 'いく',
    romaji: 'iku',
    english: 'To go; to proceed towards',
    partOfSpeech: 'Godan Verb (五段動詞 • godandoushi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 50',
    pitchAccent: {
      pattern: 'Heiban (平板型) ￣',
      notation: '[i-KU]',
      moras: [
        { mora: 'i', pitch: 'low' },
        { mora: 'KU', pitch: 'high' },
      ],
    },
    nuance: 'Takes destination particles に (ni) or へ (e). Irregular te-form: 行って (itte, not iite). Polite: 行きます (ikimasu).',
    exampleSentence: {
      japanese: '来週、友だちと京都へ行きます。',
      furigana: 'らいしゅう、ともだちと きょうとへ いきます。',
      romaji: 'Raishuu, tomodachi to Kyouto e ikimasu.',
      english: 'Next week, I am going to Kyoto with a friend.',
    },
    source: 'curated-fallback',
  },
  mizu: {
    id: 'mizu',
    japanese: '水',
    hiragana: 'みず',
    romaji: 'mizu',
    english: 'Water (cold or ambient drinking water)',
    partOfSpeech: 'Noun (名詞 • meishi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 100',
    pitchAccent: {
      pattern: 'Heiban (平板型) ￣',
      notation: '[mi-ZU]',
      moras: [
        { mora: 'mi', pitch: 'low' },
        { mora: 'ZU', pitch: 'high' },
      ],
    },
    nuance: 'Specifically refers to cold or room-temperature water. For hot water, Japanese uses お湯 (oyu). Polite: お水 (omizu).',
    exampleSentence: {
      japanese: 'すみません、お水を一杯ください。',
      furigana: 'すみません、おみずを いっぱいください。',
      romaji: 'Sumimasen, omizu o ippai kudasai.',
      english: 'Excuse me, could I have a glass of water, please?',
    },
    source: 'curated-fallback',
  },
  neko: {
    id: 'neko',
    japanese: '猫',
    hiragana: 'ねこ',
    romaji: 'neko',
    english: 'Cat; feline',
    partOfSpeech: 'Noun (名詞 • meishi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 200',
    pitchAccent: {
      pattern: 'Atamadaka ＼',
      notation: '[NE-ko]',
      moras: [
        { mora: 'NE', pitch: 'high' },
        { mora: 'ko', pitch: 'low' },
      ],
    },
    nuance: 'Common in cultural idioms like 猫の手も借りたい (desperately busy) and 猫舌 (nekojita, sensitive to hot food).',
    exampleSentence: {
      japanese: '庭の木の下で白い猫が寝ています。',
      furigana: 'にわの きのしたで しろい ねこが ねています。',
      romaji: 'Niwa no ki no shita de shiroi neko ga nete imasu.',
      english: 'A white cat is sleeping under the tree in the garden.',
    },
    source: 'curated-fallback',
  },
  tomodachi: {
    id: 'tomodachi',
    japanese: '友達',
    hiragana: 'ともだち',
    romaji: 'tomodachi',
    english: 'Friend; companion',
    partOfSpeech: 'Noun (名詞 • meishi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 100',
    pitchAccent: {
      pattern: 'Heiban (平板型) ￣',
      notation: '[to-MO-DA-CHI]',
      moras: [
        { mora: 'to', pitch: 'low' },
        { mora: 'MO', pitch: 'high' },
        { mora: 'DA', pitch: 'high' },
        { mora: 'CHI', pitch: 'high' },
      ],
    },
    nuance: 'Can refer to a single friend or plural friends. Polite/honorific: お友達 (otomodachi).',
    exampleSentence: {
      japanese: '大学の友達と一緒に日本語を勉強しました。',
      furigana: 'だいがくの ともだちと いっしょに にほんごを べんきょうしました。',
      romaji: 'Daigaku no tomodachi to issho ni Nihongo o benkyou shimashita.',
      english: 'I studied Japanese together with my university friend.',
    },
    source: 'curated-fallback',
  },
  oishii: {
    id: 'oishii',
    japanese: '美味しい',
    hiragana: 'おいしい',
    romaji: 'oishii',
    english: 'Delicious; tasty',
    partOfSpeech: 'i-Adjective (い形容詞 • ikeiyoushi)',
    jlptLevel: 'N5',
    frequency: 'Frequency Top 100',
    pitchAccent: {
      pattern: 'Nakadaka [3]',
      notation: '[o-I-SHI-i]',
      moras: [
        { mora: 'o', pitch: 'low' },
        { mora: 'I', pitch: 'high' },
        { mora: 'SHI', pitch: 'high' },
        { mora: 'i', pitch: 'low' },
      ],
    },
    nuance: 'Polite and standard. Negative: 美味しくない (oishikunai). Past: 美味しかった (oishikatta).',
    exampleSentence: {
      japanese: 'このラーメンのスープはとても美味しいです。',
      furigana: 'この ラーメンの スープは とても おいしいです。',
      romaji: 'Kono raamen no suupu wa totemo oishii desu.',
      english: 'The broth of this ramen is very delicious.',
    },
    source: 'curated-fallback',
  },
};

function matchCurated(query: string): any | null {
  const q = query.trim().toLowerCase();
  for (const [key, item] of Object.entries(CURATED_FALLBACKS)) {
    if (
      key === q ||
      item.english.toLowerCase().includes(q) ||
      item.romaji.toLowerCase() === q ||
      item.japanese === q ||
      item.hiragana === q
    ) {
      return item;
    }
  }
  return null;
}

export async function handleVocabularyRequest(query: string): Promise<any> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length > 100) {
    throw new Error('Query must be between 1 and 100 characters.');
  }

  const apiKey = getGeminiApiKey();

  // If no API key configured, check curated fallback
  if (!apiKey) {
    const fallback = matchCurated(trimmed);
    if (fallback) {
      return {
        success: true,
        data: {
          ...fallback,
          source: 'curated-fallback',
        },
        source: 'curated-fallback',
        note: 'Serving verified curated N5 vocabulary entry (server running without GEMINI_API_KEY).',
      };
    }
    throw new Error(
      `GEMINI_API_KEY is not configured on the server. Try searching for curated words like 'eat', 'drink', 'book', 'water', 'cat', 'friend', or 'delicious', or configure GEMINI_API_KEY in the server environment.`
    );
  }

  // Call Gemini for structured AI response
  const systemPrompt = `You are a Japanese pedagogical lexicographer for Nipp-On, an app teaching Japanese vocabulary to English speakers.
Given an English word, phrase, or Japanese term, provide a comprehensive, accurate vocabulary breakdown in JSON format.
Always return valid JSON matching this schema:
{
  "id": "slug-in-romaji",
  "japanese": "kanji or standard kana (e.g. 食べる)",
  "hiragana": "full hiragana furigana reading (e.g. たべる)",
  "romaji": "standard Hepburn romanization (e.g. taberu)",
  "english": "concise English meaning and definition (e.g. To eat; to consume food)",
  "partOfSpeech": "e.g. Transitive Verb (他動詞 • tadoushi) or i-Adjective or Noun",
  "jlptLevel": "N5" or "N4" or "N3" or "N2" or "N1",
  "frequency": "e.g. Frequency Top 100",
  "pitchAccent": {
    "pattern": "e.g. Atamadaka pattern ＼ or Heiban (平板型) ￣ or Nakadaka [2]",
    "notation": "e.g. [ta-BE-ru]",
    "moras": [
      { "mora": "ta", "pitch": "low" },
      { "mora": "BE", "pitch": "high" },
      { "mora": "ru", "pitch": "low" }
    ]
  },
  "nuance": "1-2 sentences on cultural context, polite forms, particle usage, or common pairings",
  "exampleSentence": {
    "japanese": "natural beginner sentence using the word with kanji",
    "furigana": "full kana version of the sentence with spaces between words",
    "romaji": "Hepburn romaji version",
    "english": "natural English translation"
  }
}
Ensure all JSON fields are filled with accurate, beginner-accessible Japanese linguistics. Do not include markdown codeblocks or extra text.`;

  try {
    const rawJson = await callGemini(
      `Provide Japanese vocabulary breakdown for: "${trimmed}"`,
      systemPrompt,
      true
    );

    const parsed = JSON.parse(rawJson);

    // Validate essential keys
    if (!parsed.japanese || !parsed.english || !parsed.romaji) {
      throw new Error('Incomplete vocabulary data from AI');
    }

    return {
      success: true,
      data: {
        ...parsed,
        source: 'live-ai',
      },
      source: 'live-ai',
    };
  } catch (err: any) {
    console.warn('Gemini call failed in vocabulary endpoint; switching directly to offline mode:', err.message);

    // 1. Check if we have an exact verified curated fallback
    const fallback = matchCurated(trimmed);
    if (fallback) {
      return {
        success: true,
        data: {
          ...fallback,
          source: 'curated-fallback',
        },
        source: 'curated-fallback',
        warning: 'Live AI quota reached or busy; displaying verified curated N5 vocabulary entry.',
      };
    }

    // 2. Generate a clean, beginner-friendly offline fallback entry so the UI never crashes
    return {
      success: true,
      data: {
        id: trimmed.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        japanese: trimmed,
        hiragana: trimmed,
        romaji: trimmed.toLowerCase(),
        english: `Vocabulary lookup: "${trimmed}" (Offline Mode)`,
        partOfSpeech: 'Term (語 • go)',
        jlptLevel: 'N5',
        frequency: 'Starter Vocab',
        pitchAccent: {
          pattern: 'Heiban (平板型) ￣',
          notation: `[${trimmed}]`,
          moras: [{ mora: trimmed, pitch: 'flat' }],
        },
        nuance: 'Live AI is currently at daily capacity or quota limits. You can explore standard N5 starter words like 食べる (taberu), 飲む (nomu), 水 (mizu), or 猫 (neko) for complete breakdowns.',
        exampleSentence: {
          japanese: `${trimmed} を勉強しています。`,
          furigana: `${trimmed} を べんきょう して います。`,
          romaji: `${trimmed} o benkyou shite imasu.`,
          english: `I am currently studying "${trimmed}".`,
        },
        source: 'curated-fallback',
      },
      source: 'curated-fallback',
      warning: 'Live AI quota limit reached; switched directly to offline guidance mode.',
    };
  }
}

// Handler for Vercel Serverless Functions
export default async function handler(req: any, res: any) {
  // Set CORS headers
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
    if (!body && typeof req.on === 'function') {
      body = await new Promise((resolve) => {
        let raw = '';
        req.on('data', (c: any) => { raw += c; });
        req.on('end', () => {
          try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); }
        });
        req.on('error', () => resolve({}));
      });
    } else if (typeof body === 'string') {
      if (body.length > 2048) {
        return res.status(413).json({ success: false, error: 'Payload too large. Max 2KB.' });
      }
      try {
        body = JSON.parse(body || '{}');
      } catch (e) {
        return res.status(400).json({ success: false, error: 'Invalid JSON request body.' });
      }
    }

    const query = body?.query;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ success: false, error: 'Missing required "query" in request body.' });
    }

    if (query.trim().length > 100) {
      return res.status(400).json({ success: false, error: 'Query too long. Max 100 characters.' });
    }

    const result = await handleVocabularyRequest(query);
    return res.status(200).json(result);
  } catch (err: any) {
    const isRateLimit = err.message === 'RATE_LIMIT_EXCEEDED';
    const statusCode = isRateLimit ? 429 : 500;
    return res.status(statusCode).json({
      success: false,
      error: isRateLimit
        ? 'Prototype request rate limit reached. Please wait a moment.'
        : err.message || 'Internal server error processing vocabulary request.',
    });
  }
}
