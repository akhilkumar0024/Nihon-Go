// Server-side Gemini API helper for Nipp-ON
// Note: This file only executes on the server / serverless functions.

const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-1.5-flash'];
const REQUEST_TIMEOUT_MS = 12000;

// Simple in-process burst rate guard (complementing platform limits)
let lastRequestTimestamps: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 60;

export function checkRateLimit(): boolean {
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

export async function callGemini(
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
        continue; // Try next fallback model
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
