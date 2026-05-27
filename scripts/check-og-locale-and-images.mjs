#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from 'path';

const root = process.cwd();
const outDir = path.join(root, 'reports');
const outFile = path.join(outDir, 'OG_LOCALE_IMAGE_CHECK.csv');

async function walk(dir) {
  const res = [];
  for (const name of await fs.readdir(dir)) {
    const p = path.join(dir, name);
    const stat = await fs.stat(p);
    if (stat.isDirectory()) {
      res.push(...await walk(p));
    } else if (p.endsWith('.html')) res.push(p);
  }
  return res;
}

function extractMeta(content, prop) {
  // search for property or name attributes
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${prop}["'][^>]*content=["']([^"']+)["'][^>]*>`, 'i');
  const m = content.match(re);
  return m ? m[1].trim() : '';
}

function expectedLocaleFor(filePath) {
  const rel = path.relative(root, filePath).replace(/\\/g, '/');
  if (rel.startsWith('en/') || rel.includes('/en/') || /-en\.html$/.test(rel) || rel.startsWith('en\\')) return 'en_US';
  return 'es_MX';
}

async function checkUrl(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    let res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);
    if (res.status === 405 || res.status === 501) {
      // server doesn't allow HEAD, try GET
      const c2 = new AbortController();
      const t2 = setTimeout(() => c2.abort(), 15000);
      res = await fetch(url, { method: 'GET', signal: c2.signal });
      clearTimeout(t2);
    }
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: String(err.message).replace(/\r?\n/g, ' ') };
  }
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const files = await walk(root);
  const rows = [
    'file,og_locale,og_locale_expected,locale_ok,og_image,og_image_http_ok,og_image_http_status'
  ];

  for (const f of files) {
    const txt = await fs.readFile(f, 'utf8');
    const ogLocale = extractMeta(txt, 'og:locale') || extractMeta(txt, 'locale') || '';
    const expected = expectedLocaleFor(f);
    const localeOk = ogLocale ? (ogLocale === expected) : 'MISSING';
    const ogImage = extractMeta(txt, 'og:image') || '';
    let imgStatus = 'NO_URL';
    let imgOk = 'false';
    if (ogImage) {
      const check = await checkUrl(ogImage);
      imgOk = check.ok ? 'true' : 'false';
      imgStatus = check.status;
    }
    const rel = path.relative(root, f).replace(/\\/g, '/');
    rows.push([`"${rel}"`, `"${ogLocale}"`, `"${expected}"`, `"${localeOk}"`, `"${ogImage}"`, `"${imgOk}"`, `"${imgStatus}"`].join(','));
  }

  await fs.writeFile(outFile, rows.join('\n'), 'utf8');
  console.log('Wrote', outFile);
}

main().catch(err => { console.error(err); process.exit(1); });
