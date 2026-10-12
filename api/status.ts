declare const process: any;

export async function handleStatusRequest() {
  const key = process.env.GEMINI_API_KEY?.trim();
  const hasKey = !!key && key !== 'your_gemini_api_key_here';
  return {
    success: true,
    geminiConfigured: hasKey,
    model: 'gemini-3.5-flash-lite',
    uptime: typeof process !== 'undefined' && process.uptime ? process.uptime() : 0,
    timestamp: new Date().toISOString(),
  };
}

export default async function handler(req: any, res: any) {
  try {
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
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message || 'Status check failed' });
  }
}
