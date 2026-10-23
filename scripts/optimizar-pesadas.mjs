// Reduce imagenes pesadas (> 300 KB) a max 1200 px de ancho, WebP q72.
// Respalda el original como <nombre>-original.webp (ignorado por .gitignore, no se publica).
// Uso: node scripts/optimizar-pesadas.mjs img/destinos/a.webp img/destinos/b.webp ...
import sharp from "sharp";
import { copyFileSync, existsSync, statSync, writeFileSync } from "fs";

const files = process.argv.slice(2);
let before = 0, after = 0;
for (const src of files) {
  const backup = src.replace(/\.webp$/i, "-original.webp");
  if (!existsSync(backup)) copyFileSync(src, backup);
  const meta = await sharp(backup).metadata();
  const buf = await sharp(backup)
    .rotate()
    .resize({ width: Math.min(1200, meta.width), withoutEnlargement: true })
    .webp({ quality: 72, effort: 6 })
    .toBuffer();
  const b = statSync(backup).size;
  if (buf.length >= b) { console.log(`= ${src} sin ganancia, se deja igual`); before += b; after += b; continue; }
  writeFileSync(src, buf);
  const out = await sharp(src).metadata();
  before += b; after += buf.length;
  console.log(`✓ ${src}  ${Math.round(b / 1024)} KB -> ${Math.round(buf.length / 1024)} KB  (${meta.width}x${meta.height} -> ${out.width}x${out.height})`);
}
console.log(`TOTAL ${(before / 1048576).toFixed(1)} MB -> ${(after / 1048576).toFixed(1)} MB`);
