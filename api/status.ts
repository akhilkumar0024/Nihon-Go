import { getGeminiApiKey } from './_gemini.ts';

export async function handleStatusRequest() {
  const hasKey = !!getGeminiApiKey();
  return {
    success: true,
    geminiConfigured: hasKey,
    model: 'gemini-2.5-flash',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const result = await handleStatusRequest();
  return res.status(200).json(result);
}
