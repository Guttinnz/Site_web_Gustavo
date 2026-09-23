/**
 * Gera os assets provisórios do site: capas dos cases, foto de perfil, imagem de
 * Open Graph, favicons, manifest e o PDF do CV.
 *
 *   npm run placeholders                              → cria só o que ainda não existe
 *   npm run placeholders -- --force --only=og,favicons → sobrescreve só esses grupos
 *        grupos: work, profile, og, favicons, cv (--force sempre exige --only)
 *
 * O texto é desenhado como vetor a partir das próprias fontes do site (Oswald e
 * Manrope, via @fontsource), então o resultado é idêntico em qualquer máquina.
 * A cor de acento é lida de src/styles/index.css.
 */
import { existsSync, readFileSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as opentypeModule from 'opentype.js';
import sharp from 'sharp';

const opentype = opentypeModule.default ?? opentypeModule;

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = path.join(ROOT, 'public');
const IMAGES = path.join(PUBLIC, 'images');

const FORCE = process.argv.includes('--force');
const ONLY = process.argv
  .find((arg) => arg.startsWith('--only='))
  ?.slice('--only='.length)
  .split(',');

// Trava de segurança: --force sem --only sobrescreveria o CV real e as suas fotos.
if (FORCE && !ONLY) {
  console.error('placeholders: --force exige --only=<grupos> (work, profile, og, favicons, cv).');
  process.exit(1);
}

const css = readFileSync(path.join(ROOT, 'src/styles/index.css'), 'utf8');
const ACCENT = css.match(/--accent:\s*(#[0-9a-f]{3,8})/i)?.[1] ?? '#22d3ee';
const BG = '#0a0a0a';
const MUTED = '#9ca3af';

/* ----------------------------------------------------------------------------- */
/* Texto → path SVG                                                               */
/* ----------------------------------------------------------------------------- */

function loadFont(relative) {
  const buffer = readFileSync(path.join(ROOT, 'node_modules', relative));
  return opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength));
}

const fonts = {
  display: loadFont('@fontsource/oswald/files/oswald-latin-700-normal.woff'),
  light: loadFont('@fontsource/manrope/files/manrope-latin-300-normal.woff'),
  bold: loadFont('@fontsource/manrope/files/manrope-latin-700-normal.woff'),
};

/** Largura do texto em px. `tracking` em em (ex.: -0.05 = tracking-tighter). */
function measure(font, text, size, tracking = 0) {
  const scale = size / font.unitsPerEm;
  const glyphs = [...text].map((char) => font.charToGlyph(char));
  return glyphs.reduce((width, glyph, i) => {
    const next = glyphs[i + 1];
    const kerning = next ? font.getKerningValue(glyph, next) * scale : 0;
    return width + glyph.advanceWidth * scale + kerning + (next ? tracking * size : 0);
  }, 0);
}

/**
 * Serializa os comandos do path. Não usamos path.toPathData(): no opentype.js 2.0 a
 * "otimização" dele às vezes gera coordenadas NaN, e o SVG para de desenhar ali.
 */
function pathData(commands) {
  const n = (value) => Number(value.toFixed(2));
  return commands
    .map((c) => {
      switch (c.type) {
        case 'M':
        case 'L':
          return `${c.type}${n(c.x)} ${n(c.y)}`;
        case 'Q':
          return `Q${n(c.x1)} ${n(c.y1)} ${n(c.x)} ${n(c.y)}`;
        case 'C':
          return `C${n(c.x1)} ${n(c.y1)} ${n(c.x2)} ${n(c.y2)} ${n(c.x)} ${n(c.y)}`;
        default:
          return 'Z';
      }
    })
    .join('');
}

/** Desenha glifo a glifo (evita o motor de features do opentype.js, que falha em algumas fontes). */
function text(font, value, x, y, size, { tracking = 0, anchor = 'start', ...attrs } = {}) {
  const width = measure(font, value, size, tracking);
  let cursor = anchor === 'middle' ? x - width / 2 : anchor === 'end' ? x - width : x;
  const scale = size / font.unitsPerEm;
  const glyphs = [...value].map((char) => font.charToGlyph(char));
  let d = '';
  glyphs.forEach((glyph, i) => {
    d += pathData(glyph.getPath(cursor, y, size).commands);
    const next = glyphs[i + 1];
    cursor += glyph.advanceWidth * scale + tracking * size;
    if (next) cursor += font.getKerningValue(glyph, next) * scale;
  });
  const extra = Object.entries(attrs)
    .map(([key, val]) => `${key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}="${val}"`)
    .join(' ');
  return `<path d="${d}" ${extra}/>`;
}

/** Maior tamanho (até `max`) em que o texto cabe em `maxWidth`. */
function fit(font, value, max, maxWidth, tracking = 0) {
  const width = measure(font, value, max, tracking);
  return width <= maxWidth ? max : Math.floor((max * maxWidth) / width);
}

/* ----------------------------------------------------------------------------- */
/* Peças visuais                                                                   */
/* ----------------------------------------------------------------------------- */

function backdrop(width, height, { glowX = '85%', glowY = '15%' } = {}) {
  return `
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#161616"/><stop offset="1" stop-color="${BG}"/>
      </linearGradient>
      <radialGradient id="glow" cx="${glowX}" cy="${glowY}" r="65%">
        <stop offset="0" stop-color="${ACCENT}" stop-opacity="0.28"/>
        <stop offset="1" stop-color="${ACCENT}" stop-opacity="0"/>
      </radialGradient>
      <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
        <path d="M64 0H0V64" fill="none" stroke="#ffffff" stroke-opacity="0.05"/>
      </pattern>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    <rect width="${width}" height="${height}" fill="url(#grid)"/>
    <rect width="${width}" height="${height}" fill="url(#glow)"/>`;
}

/** Nuvem de partículas determinística (mesma semente → mesma imagem). */
function particles(cx, cy, radius, count, seed = 7) {
  let state = seed;
  const random = () => {
    state = (state * 16807) % 2147483647;
    return (state - 1) / 2147483646;
  };
  let dots = '';
  for (let i = 0; i < count; i += 1) {
    const r = radius * Math.cbrt(random());
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const x = cx + r * Math.sin(phi) * Math.cos(theta);
    const y = cy + r * Math.sin(phi) * Math.sin(theta);
    const depth = (Math.cos(phi) + 1) / 2;
    const fill = random() < 0.35 ? ACCENT : '#ffffff';
    dots += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.8 + depth * 1.8).toFixed(2)}" fill="${fill}" fill-opacity="${(0.25 + depth * 0.65).toFixed(2)}"/>`;
  }
  return dots;
}

const checkIcon = (x, y, size, color) =>
  `<path d="M${x} ${y + size * 0.5} L${x + size * 0.38} ${y + size * 0.86} L${x + size} ${y + size * 0.14}" fill="none" stroke="${color}" stroke-width="${size * 0.18}" stroke-linecap="round" stroke-linejoin="round"/>`;

const svg = (width, height, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`;

/* ----------------------------------------------------------------------------- */
/* Assets                                                                          */
/* ----------------------------------------------------------------------------- */

const CASES = [
  { file: 'work-icatu', index: '01', kicker: '2025–2026 · Automação E2E', lines: ['Icatu Seguros', 'Previdência'], stat: '5.200h economizadas' },
  { file: 'work-ivy', index: '02', kicker: '2023–2025 · Multiprojeto', lines: ['Grupo IVY', 'AutoAvaliar · RwTech'], stat: '1.500+ validações' },
  { file: 'work-going2', index: '03', kicker: '2022–2023 · QA / CI', lines: ['Going2', 'Do zero ao pipeline'], stat: 'Cypress + BrowserStack' },
  { file: 'work-tcc', index: '04', kicker: 'TCC · UNIJUÍ', lines: ['Prevenção e predição', 'de defeitos'], stat: 'Pesquisa acadêmica' },
  { file: 'work-n8n', index: '05', kicker: 'Laboratório', lines: ['Workflows', 'n8n'], stat: 'Gmail · OpenAI · Sheets' },
];

function workCover({ index, kicker, lines, stat }) {
  const W = 1280;
  const H = 720;
  const titleSize = Math.min(...lines.map((line) => fit(fonts.display, line.toUpperCase(), 104, 1040, -0.02)));
  const statWidth = measure(fonts.bold, stat, 24) + 96;
  return svg(
    W,
    H,
    `${backdrop(W, H)}
    ${text(fonts.display, index, 1210, 690, 420, { anchor: 'end', fill: 'none', stroke: '#ffffff', strokeOpacity: 0.07, strokeWidth: 2 })}
    ${text(fonts.bold, kicker.toUpperCase(), 80, 130, 22, { tracking: 0.16, fill: ACCENT })}
    ${text(fonts.display, lines[0].toUpperCase(), 76, 150 + titleSize, titleSize, { tracking: -0.02, fill: '#ffffff' })}
    ${text(fonts.display, lines[1].toUpperCase(), 76, 150 + titleSize * 2.05, titleSize, { tracking: -0.02, fill: '#ffffff', fillOpacity: 0.35 })}
    <rect x="80" y="520" width="${statWidth}" height="64" rx="32" fill="${ACCENT}" fill-opacity="0.12" stroke="${ACCENT}" stroke-opacity="0.5"/>
    ${checkIcon(106, 540, 24, ACCENT)}
    ${text(fonts.bold, stat, 148, 561, 24, { fill: '#ffffff' })}
    ${text(fonts.light, 'Imagem provisória — substitua por um print com dados mascarados', 80, 660, 18, { fill: MUTED })}`,
  );
}

function profileCover() {
  const S = 800;
  return svg(
    S,
    S,
    `${backdrop(S, S, { glowX: '50%', glowY: '35%' })}
    <circle cx="400" cy="330" r="130" fill="#262626"/>
    <path d="M150 800 C150 610 260 520 400 520 C540 520 650 610 650 800 Z" fill="#262626"/>
    ${text(fonts.bold, 'SUA FOTO AQUI', 400, 130, 26, { anchor: 'middle', tracking: 0.2, fill: ACCENT })}
    ${text(fonts.light, 'public/images/profile.jpg', 400, 170, 20, { anchor: 'middle', fill: MUTED })}`,
  );
}

function ogImage() {
  const W = 1200;
  const H = 630;
  return svg(
    W,
    H,
    `${backdrop(W, H, { glowX: '78%', glowY: '50%' })}
    ${particles(900, 315, 300, 420)}
    <defs><linearGradient id="fade" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity="0.95"/><stop offset="0.55" stop-color="#000" stop-opacity="0.55"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#fade)"/>
    ${text(fonts.light, 'AUTOMAÇÃO · QUALIDADE · CONFIABILIDADE', 80, 118, 22, { tracking: 0.14, fill: ACCENT })}
    ${text(fonts.display, 'ENGENHEIRO', 72, 250, 124, { tracking: -0.05, fill: '#ffffff' })}
    ${text(fonts.display, 'DE SOFTWARE', 72, 374, 124, { tracking: -0.05, fill: '#ffffff' })}
    <rect x="80" y="417" width="48" height="2" fill="${ACCENT}"/>
    ${text(fonts.display, 'ENGENHEIRO DE QUALIDADE E AUTOMAÇÕES', 146, 434, 40, { tracking: -0.01, fill: ACCENT })}
    ${text(fonts.display, 'GUSTAVO BUENO', 80, 530, 36, { tracking: -0.02, fill: '#ffffff' })}
    ${text(fonts.light, 'Cypress · API · Performance · n8n — Santa Rosa, RS', 80, 570, 22, { fill: MUTED })}`,
  );
}

function faviconSvg({ rounded = true } = {}) {
  return svg(
    512,
    512,
    `<rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="${BG}"/>
    <circle cx="256" cy="256" r="170" fill="none" stroke="${ACCENT}" stroke-width="36"/>
    <path d="M168 262 L230 324 L346 200" fill="none" stroke="#ffffff" stroke-width="46" stroke-linecap="round" stroke-linejoin="round"/>`,
  );
}

/** ICO com PNGs embutidos (suportado por todos os navegadores atuais). */
function buildIco(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + 16 * images.length;
  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map(({ png }) => png)]);
}

/** PDF mínimo de uma página (texto ASCII, fonte Helvetica embutida no leitor). */
function placeholderPdf() {
  const lines = [
    [24, 760, 'Gustavo A. R. Bueno'],
    [14, 732, 'Analista de Testes Senior / QA Engineer'],
    [11, 690, 'Este e um arquivo provisorio.'],
    [11, 672, 'Substitua public/cv-gustavo-bueno.pdf pelo seu curriculo em PDF.'],
  ];
  const stream = lines.map(([size, y, value]) => `BT /F1 ${size} Tf 72 ${y} Td (${value}) Tj ET`).join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    `<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = objects.map((body, i) => {
    const offset = Buffer.byteLength(pdf, 'latin1');
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
    return offset;
  });
  const xref = Buffer.byteLength(pdf, 'latin1');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;
  return Buffer.from(pdf, 'latin1');
}

/* ----------------------------------------------------------------------------- */
/* Execução                                                                        */
/* ----------------------------------------------------------------------------- */

const summary = { created: [], skipped: [] };

async function write(group, file, produce) {
  if (ONLY && !ONLY.includes(group)) return;
  const target = path.join(PUBLIC, file);
  if (existsSync(target) && !FORCE) {
    summary.skipped.push(file);
    return;
  }
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, await produce());
  summary.created.push(file);
}

const jpeg = (markup) => sharp(Buffer.from(markup)).jpeg({ quality: 88, mozjpeg: true }).toBuffer();
const png = (markup, size) => sharp(Buffer.from(markup)).resize(size, size).png({ compressionLevel: 9 }).toBuffer();

await fs.mkdir(IMAGES, { recursive: true });

for (const item of CASES) {
  await write('work', `images/${item.file}.jpg`, () => jpeg(workCover(item)));
}
await write('profile', 'images/profile.jpg', () => jpeg(profileCover()));
await write('og', 'og-image.jpg', () => jpeg(ogImage()));

await write('favicons', 'favicon.svg', () => faviconSvg());
await write('favicons', 'favicon-16x16.png', () => png(faviconSvg(), 16));
await write('favicons', 'favicon-32x32.png', () => png(faviconSvg(), 32));
await write('favicons', 'apple-touch-icon.png', () => png(faviconSvg({ rounded: false }), 180));
await write('favicons', 'android-chrome-192x192.png', () => png(faviconSvg(), 192));
await write('favicons', 'android-chrome-512x512.png', () => png(faviconSvg(), 512));
await write('favicons', 'favicon.ico', async () =>
  buildIco(await Promise.all([16, 32, 48].map(async (size) => ({ size, png: await png(faviconSvg(), size) })))),
);
await write('favicons', 'site.webmanifest', () =>
  JSON.stringify(
    {
      name: 'Gustavo Bueno — Engenheiro de Software',
      short_name: 'Gustavo Bueno',
      lang: 'pt-BR',
      start_url: '/',
      display: 'standalone',
      theme_color: BG,
      background_color: BG,
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
      ],
    },
    null,
    2,
  ) + '\n',
);
await write('cv', 'cv-gustavo-bueno.pdf', () => placeholderPdf());

console.log(`placeholders: ${summary.created.length} criado(s), ${summary.skipped.length} já existia(m).`);
for (const file of summary.created) console.log(`  + public/${file}`);
if (summary.skipped.length && !FORCE) console.log('  (use --force --only=<grupo> para sobrescrever)');
