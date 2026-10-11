import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import vocabHandler from './api/vocabulary.ts';
import tutorHandler from './api/tutor.ts';
import statusHandler from './api/status.ts';

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

        // Polyfill express/Vercel helpers for ServerResponse
        const resAny = res as any;
        if (!resAny.status) {
          resAny.status = (code: number) => {
            res.statusCode = code;
            return resAny;
          };
        }
        if (!resAny.json) {
          resAny.json = (data: any) => {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(data));
          };
        }

        if (pathname === '/api/status') {
          return statusHandler(req, resAny);
        }

        if (pathname === '/api/vocabulary' || pathname === '/api/tutor') {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            (req as any).body = body;
            if (pathname === '/api/vocabulary') {
              return vocabHandler(req, resAny);
            } else {
              return tutorHandler(req, resAny);
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
