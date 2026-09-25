/**
 * Gera as versões otimizadas das imagens de public/images em public/images/opt:
 * AVIF, WebP e JPEG, em duas larguras (metade e inteira), já recortadas na proporção
 * que o layout usa. Roda sozinho antes de `npm run dev` e `npm run build`; só refaz
 * o que mudou (compara a data de modificação).
 *
 * Para trocar uma imagem, basta sobrescrever public/images/<nome>.jpg (ou .png).
 */
import { existsSync, statSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'public/images');
const OUTPUT = path.join(SOURCE, 'opt');

/** Proporção de cada família de imagem (precisa bater com width/height em src/data/content.ts). */
const PRESETS = [
  { test: /^work-/, width: 1280, height: 720, position: 'centre' },
  { test: /^profile$/, width: 800, height: 800, position: sharp.strategy.attention },
  { test: /^hero$/, width: 800, height: 1000, position: sharp.strategy.attention },
];

const ENCODERS = {
  avif: (pipeline) => pipeline.avif({ quality: 55, effort: 4 }),
  webp: (pipeline) => pipeline.webp({ quality: 78 }),
  jpg: (pipeline) => pipeline.jpeg({ quality: 80, mozjpeg: true, progressive: true }),
};

const isFresh = (output, sourceTime) => existsSync(output) && statSync(output).mtimeMs >= sourceTime;

await fs.mkdir(OUTPUT, { recursive: true });

const files = (await fs.readdir(SOURCE)).filter((file) => /\.(jpe?g|png)$/i.test(file));
let generated = 0;
let upToDate = 0;

for (const file of files) {
  const name = path.parse(file).name;
  const preset = PRESETS.find(({ test }) => test.test(name));
  if (!preset) {
    console.warn(`images: ignorando ${file} (nenhum preset em scripts/images.mjs)`);
    continue;
  }

  const source = path.join(SOURCE, file);
  const sourceTime = statSync(source).mtimeMs;

  for (const width of [preset.width / 2, preset.width]) {
    const height = Math.round((width * preset.height) / preset.width);
    for (const [ext, encode] of Object.entries(ENCODERS)) {
      const output = path.join(OUTPUT, `${name}-${width}.${ext}`);
      if (isFresh(output, sourceTime)) {
        upToDate += 1;
        continue;
      }
      const pipeline = sharp(source).rotate().resize(width, height, { fit: 'cover', position: preset.position });
      await encode(pipeline).toFile(output);
      generated += 1;
    }
  }
}

console.log(`images: ${generated} gerada(s), ${upToDate} já atualizada(s) em public/images/opt`);
