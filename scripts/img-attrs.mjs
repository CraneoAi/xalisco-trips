// Agrega width/height reales + loading="lazy" decoding="async" a <img> que no los tienen.
// Uso: node scripts/img-attrs.mjs index.html index-en.html
import sharp from "sharp";
import { readFileSync, writeFileSync, existsSync } from "fs";

const EAGER = new Set(["img/destinos/chapala1.webp"]); // primera tarjeta visible: sin lazy
for (const file of process.argv.slice(2)) {
  let html = readFileSync(file, "utf8");
  const tags = [...html.matchAll(/<img\b[^>]*>/gs)].map((m) => m[0]);
  let n = 0;
  for (const tag of new Set(tags)) {
    const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1];
    if (!src || !existsSync(src)) continue;
    let t = tag;
    const add = [];
    if (!/\swidth=/.test(t) && !src.endsWith(".svg")) {
      const m = await sharp(src).metadata();
      const w = m.orientation >= 5 ? m.height : m.width, h = m.orientation >= 5 ? m.width : m.height;
      add.push(`width="${w}"`, `height="${h}"`);
    }
    if (!/\sloading=/.test(t) && !EAGER.has(src)) add.push('loading="lazy"');
    if (!/\sdecoding=/.test(t)) add.push('decoding="async"');
    if (!add.length) continue;
    t = t.replace(/\s*\/?>$/, (end) => " " + add.join(" ") + (end.includes("/") ? " />" : ">"));
    html = html.split(tag).join(t);
    n++;
  }
  writeFileSync(file, html);
  console.log(`${file}: ${n} etiquetas <img> actualizadas`);
}
