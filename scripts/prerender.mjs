/**
 * Pré-renderiza as páginas para HTML estático (último passo do `npm run build`) e
 * faz algumas verificações que derrubam o build se algo sair errado.
 *
 *   dist/index.html → Home completa (inclusive o rodapé, que é lazy no cliente)
 *   dist/404.html   → página 404 (a Vercel serve este arquivo para rotas inexistentes)
 */
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// React/Router em modo produção no pré-render (precisa vir antes do import do bundle SSR).
process.env.NODE_ENV = 'production';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const SSR = path.join(ROOT, 'dist-ssr');

const { render } = await import(pathToFileURL(path.join(SSR, 'entry-server.js')).href);
const template = await fs.readFile(path.join(DIST, 'index.html'), 'utf8');

// `route` vai para <div id="root" data-route>: o main.tsx só hidrata se bater com a URL.
const PAGES = [
  { url: '/', route: 'home', file: 'index.html', head: '', mustContain: ['id="work"', 'id="career"', 'id="about"', 'id="services"', 'id="recommendations"', 'id="contact"'] },
  { url: '/404', route: 'not-found', file: '404.html', head: '<meta name="robots" content="noindex" />', mustContain: ['404', 'id="contact"'] },
];

const problems = [];

if (!template.includes('<div id="root"><!--app-html-->')) problems.push('index.html sem <div id="root"><!--app-html-->');
if (template.includes('__SITE_URL__')) problems.push('marcador __SITE_URL__ não foi substituído');

for (const page of PAGES) {
  const appHtml = await render(page.url);
  let html = template.replace('<div id="root"><!--app-html-->', `<div id="root" data-route="${page.route}">${appHtml}`);
  if (page.head) html = html.replace('</head>', `  ${page.head}\n  </head>`);

  const h1Count = (appHtml.match(/<h1[\s>]/g) ?? []).length;
  if (h1Count !== 1) problems.push(`${page.file}: esperado 1 <h1>, encontrado ${h1Count}`);
  for (const snippet of page.mustContain) {
    if (!appHtml.includes(snippet)) problems.push(`${page.file}: não contém ${snippet}`);
  }

  // Todo arquivo local referenciado (PDFs, imagens) precisa existir no dist — evita link quebrado.
  const refs = new Set();
  for (const [, value] of appHtml.matchAll(/\b(?:href|src)="(\/[^"#?]+)"/g)) refs.add(value);
  for (const [, list] of appHtml.matchAll(/\bsrcSet="([^"]+)"/gi)) {
    for (const candidate of list.split(',')) refs.add(candidate.trim().split(/\s+/)[0]);
  }
  for (const ref of refs) {
    if (!ref.startsWith('/') || !path.extname(ref)) continue; // só arquivos (/, /#secao etc. não)
    const exists = await fs
      .access(path.join(DIST, decodeURIComponent(ref)))
      .then(() => true)
      .catch(() => false);
    if (!exists) problems.push(`${page.file}: link para arquivo inexistente ${ref} (coloque o arquivo em public/)`);
  }

  await fs.writeFile(path.join(DIST, page.file), html);
  console.log(`prerender: ${page.url} → dist/${page.file} (${(Buffer.byteLength(html) / 1024).toFixed(1)} kB)`);
}

// CSP: todo <script> inline executável precisa ter o hash liberado no vercel.json.
const vercelConfig = await fs.readFile(path.join(ROOT, 'vercel.json'), 'utf8');
const inlineScripts = [...template.matchAll(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .filter(([, attrs = '']) => !/\bsrc=/.test(attrs) && !/type="application\/ld\+json"/.test(attrs))
  .map(([, , body]) => body);
for (const body of inlineScripts) {
  const token = `'sha256-${createHash('sha256').update(body).digest('base64')}'`;
  if (!vercelConfig.includes(token)) {
    problems.push(`CSP: o script inline do index.html mudou — atualize script-src no vercel.json para ${token}`);
  }
}

await fs.rm(SSR, { recursive: true, force: true });

if (problems.length) {
  console.error('\nprerender: falhou nas verificações:');
  for (const problem of problems) console.error(`  ✗ ${problem}`);
  process.exit(1);
}
console.log('prerender: verificações OK (1 <h1> por página, seções presentes, arquivos linkados existem, CSP em dia)');
