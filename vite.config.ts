import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { handleVocabularyRequest } from './api/vocabulary.ts';
import { handleTutorRequest } from './api/tutor.ts';
import { handleStatusRequest } from './api/status.ts';

function vercelApiMiddlewarePlugin(env: Record<string, string>): Plugin {
  return {
    name: 'vercel-api-middleware',
    configureServer(server) {
      if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
        process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
        const pathname = url.pathname;

        res.setHeader('Content-Type', 'application/json');

        if (pathname === '/api/status' && req.method === 'GET') {
          try {
            const status = await handleStatusRequest();
            res.statusCode = 200;
            return res.end(JSON.stringify(status));
          } catch (e: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ success: false, error: e.message }));
          }
        }

        if (pathname === '/api/vocabulary' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const result = await handleVocabularyRequest(parsed.query || '');
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        if (pathname === '/api/tutor' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const parsed = JSON.parse(body || '{}');
              const result = await handleTutorRequest(parsed.word, parsed.message, parsed.history);
              res.statusCode = 200;
              res.end(JSON.stringify(result));
            } catch (err: any) {
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), vercelApiMiddlewarePlugin(env)],
    server: {
      port: 5173,
    },
  };
});
