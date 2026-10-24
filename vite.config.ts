import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const envPath = join(process.cwd(), '.env');
const googleKeys: Record<string, string> = {};
try {
  const envText = readFileSync(envPath, 'utf-8');
  for (const line of envText.split(/\r?\n/)) {
    const m = line.match(/^(GOOGLE_API_KEY_\d+)=(.+)$/);
    if (m) googleKeys[m[1]] = m[2].replace(/^"|"$/g, '');
  }
} catch {
  // .env tidak ada atau tidak bisa dibaca — kunci harus dimasukkan via UI
}

const defineEnv: Record<string, string> = {};
let idx = 0;
for (const [key, val] of Object.entries(googleKeys).sort()) {
  defineEnv[`import.meta.env.VITE_${key}`] = JSON.stringify(val);
  defineEnv[`import.meta.env.${key}`] = JSON.stringify(val);
  idx += 1;
}
defineEnv['import.meta.env.VITE_GOOGLE_KEY_COUNT'] = JSON.stringify(String(idx));
defineEnv['import.meta.env.GOOGLE_KEY_COUNT'] = JSON.stringify(String(idx));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'appmi-api-dev-server',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (!req.url || !req.url.startsWith('/api/')) return next();

          const urlPath = req.url.split('?')[0];
          const relative = urlPath.replace(/^\/api\//, '').replace(/\/+$/, '');
          if (!relative) return next();

          // Shim Vercel-style response helpers.
          (res as any).status = (code: number) => { res.statusCode = code; return res; };
          (res as any).json = (data: any) => {
            if (!res.getHeader('Content-Type')) res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
            return res;
          };

          // Parse JSON body like Vercel does.
          if (!['GET', 'HEAD'].includes(req.method || 'GET')) {
            const chunks: Buffer[] = [];
            for await (const chunk of req) chunks.push(Buffer.from(chunk));
            const raw = Buffer.concat(chunks).toString('utf8');
            if (raw) {
              const ct = String(req.headers['content-type'] || '');
              if (ct.includes('application/json')) {
                try { (req as any).body = JSON.parse(raw); }
                catch { (req as any).body = raw; }
              } else {
                (req as any).body = raw;
              }
            } else {
              (req as any).body = {};
            }
          }

          try {
            const mod: any = await server.ssrLoadModule(`/api/${relative}.ts`);
            const handler = mod.default || mod.handler;
            if (typeof handler !== 'function') {
              res.statusCode = 404;
              res.end('Handler not found');
              return;
            }
            await handler(req, res);
            if (!res.writableEnded) res.end();
          } catch (err: any) {
            // Fall through to Vite for unknown paths.
            if (err?.code === 'ENOENT' || /Cannot find module|Failed to resolve import/.test(String(err?.message))) {
              return next();
            }
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err?.message || 'API error' }));
          }
        });
      },
    },
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/generativelanguage\.googleapis\.com\/.*/,
            handler: 'NetworkOnly',
            options: { cacheName: 'llm-api-cache' },
          },
        ],
      },
      manifest: {
        name: 'APPMI — Statistik Umat Lingkungan',
        short_name: 'APPMI',
        description: 'Aplikasi Input & Verifikasi Statistik Umat (1 Lingkungan)',
        start_url: '/',
        display: 'standalone',
        background_color: '#F6F8FB',
        theme_color: '#285A9D',
        icons: [
          {
            src: '/icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: '/icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@engine': new URL('./src/engine', import.meta.url).pathname,
      '@db': new URL('./src/db', import.meta.url).pathname,
      '@backup': new URL('./src/backup', import.meta.url).pathname,
      '@export': new URL('./src/export', import.meta.url).pathname,
      '@import': new URL('./src/import', import.meta.url).pathname,
      '@llm': new URL('./src/llm', import.meta.url).pathname,
      '@ui': new URL('./src/ui', import.meta.url).pathname,
      '@generated': new URL('./src/generated', import.meta.url).pathname,
    },
  },
  define: defineEnv,
  test: {
    environment: 'node',
    globals: false,
    include: ['tests/**/*.{test,spec}.{ts,tsx}', 'src/**/*.{test,spec}.{ts,tsx}'],
  },
});
