import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { handleContact } from './api/contact.ts';

const FALLBACK_SITE_URL = 'https://gustavo-bueno.vercel.app';

/**
 * URL pública do site, usada no canonical, Open Graph, JSON-LD e sitemap.
 * Ordem: SITE_URL (definida por você) → domínio de produção que a Vercel
 * injeta no build → fallback.
 */
function resolveSiteUrl(env: Record<string, string>): string {
  const vercelHost = env.VERCEL_PROJECT_PRODUCTION_URL;
  const url = env.SITE_URL || (vercelHost ? `https://${vercelHost}` : FALLBACK_SITE_URL);
  return url.replace(/\/+$/, '');
}

/** Troca o marcador __SITE_URL__ do index.html pela URL real. */
function siteUrlPlugin(siteUrl: string): Plugin {
  return {
    name: 'portfolio:site-url',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('__SITE_URL__', siteUrl),
    },
  };
}

/**
 * Build do cliente: preload das duas fontes críticas (o nome com hash só existe
 * depois do bundle) e geração de robots.txt + sitemap.xml.
 */
function seoPlugin(siteUrl: string): Plugin {
  let isSsrBuild = false;
  return {
    name: 'portfolio:seo',
    apply: 'build',
    configResolved(config) {
      isSsrBuild = Boolean(config.build.ssr);
    },
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const critical = /(oswald-latin-700|manrope-latin-400)-normal-[\w-]+\.woff2$/;
        return Object.values(ctx.bundle ?? {})
          .filter((file) => file.type === 'asset' && critical.test(file.fileName))
          .map((file) => ({
            tag: 'link',
            attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${file.fileName}`, crossorigin: '' },
            injectTo: 'head-prepend' as const,
          }));
      },
    },
    generateBundle() {
      if (isSsrBuild) return;
      const today = new Date().toISOString().slice(0, 10);
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
      });
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: [
          '<?xml version="1.0" encoding="UTF-8"?>',
          '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
          `  <url><loc>${siteUrl}/</loc><lastmod>${today}</lastmod><changefreq>monthly</changefreq><priority>1.0</priority></url>`,
          '</urlset>',
          '',
        ].join('\n'),
      });
    },
  };
}

/**
 * Serve POST /api/contact no `npm run dev` e no `npm run preview` com o mesmo código da
 * função da Vercel. Sem RESEND_API_KEY (.env.local), só registra a mensagem no terminal.
 */
function contactApiPlugin(env: Record<string, string>): Plugin {
  const apiKey = env.RESEND_API_KEY || undefined;
  const middleware = async (req: IncomingMessage, res: ServerResponse) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (typeof value === 'string') headers.set(key, value);
      else if (Array.isArray(value)) headers.set(key, value.join(', '));
    }
    const method = req.method ?? 'GET';
    const request = new Request('http://localhost/api/contact', {
      method,
      headers,
      body: method === 'GET' || method === 'HEAD' ? undefined : Buffer.concat(chunks),
    });

    const response = await handleContact(request, {
      apiKey,
      to: env.CONTACT_TO_EMAIL || 'gustavoriedel2202@gmail.com',
      from: env.CONTACT_FROM_EMAIL || 'Portfólio Gustavo Bueno <onboarding@resend.dev>',
      dryRun: !apiKey,
    });
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    res.end(Buffer.from(await response.arrayBuffer()));
  };

  return {
    name: 'portfolio:contact-api',
    configureServer(server) {
      server.middlewares.use('/api/contact', (req, res) => void middleware(req, res));
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/contact', (req, res) => void middleware(req, res));
    },
  };
}

export default defineConfig(({ mode, isSsrBuild }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const siteUrl = resolveSiteUrl(env);

  return {
    plugins: [react(), siteUrlPlugin(siteUrl), seoPlugin(siteUrl), contactApiPlugin(env)],
    define: {
      __BUILD_YEAR__: JSON.stringify(new Date().getFullYear()),
    },
    build: {
      copyPublicDir: !isSsrBuild,
      // Source maps públicos: não há segredo no cliente e os stack traces ficam legíveis.
      sourcemap: !isSsrBuild,
      // O maior chunk é o three.js (~130 kB gzip), carregado sob demanda depois do load.
      chunkSizeWarningLimit: 600,
    },
  };
});
