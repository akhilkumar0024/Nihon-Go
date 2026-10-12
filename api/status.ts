import { getGeminiApiKey } from './_gemini';
declare const process: any;

export async function handleStatusRequest() {
  const hasKey = !!getGeminiApiKey();
  return {
    success: true,
    geminiConfigured: hasKey,
    model: 'gemini-3.5-flash-lite',
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

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed. Use GET.' });
  }

  const result = await handleStatusRequest();
  return res.status(200).json(result);
}
