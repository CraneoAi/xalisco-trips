import fs from 'fs';
import path from 'path';

const root = path.resolve(process.cwd());
const outDir = path.join(root, 'reports');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outFile = path.join(outDir, 'OG_TWITTER_REPORT.csv');

function extract(html, re) {
  const m = html.match(re);
  return m ? m[1].trim() : '';
}

function existsLocal(url) {
  if (!url) return false;
  try {
    const host = 'https://xaliscotrips.lat';
    if (url.startsWith(host)) {
      const rel = url.slice(host.length);
      const p = path.join(root, rel.replace(/^\//, ''));
      return fs.existsSync(p);
    }
    // remote URL — unknown
    return false;
  } catch (e) {
    return false;
  }
}

(async () => {
  // Recursive find .html files
  function walk(dir) {
    const results = [];
    const list = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of list) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) results.push(...walk(full));
      else if (entry.isFile() && full.toLowerCase().endsWith('.html')) results.push(path.relative(root, full));
    }
    return results;
  }

  const files = walk(root);
  const header = [
    'file',
    'title',
    'meta_description',
    'canonical',
    'og_title',
    'og_description',
    'og_url',
    'og_image',
    'og_image_exists_local',
    'twitter_card',
    'twitter_title',
    'twitter_description',
    'twitter_image'
  ];

  const rows = [header.join(',')];

  for (const f of files) {
    const fp = path.join(root, f);
    const html = fs.readFileSync(fp, 'utf8');
    const title = extract(html, /<title>([\s\S]*?)<\/title>/i);
    const metaDesc = extract(html, /<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']\s*\/??>/i);
    const canonical = extract(html, /<link\s+rel=["']canonical["']\s+href=["']([\s\S]*?)["']\s*\/??>/i);
    const ogTitle = extract(html, /property=["']og:title["']\s+content=["']([\s\S]*?)["']/i);
    const ogDesc = extract(html, /property=["']og:description["']\s+content=["']([\s\S]*?)["']/i);
    const ogUrl = extract(html, /property=["']og:url["']\s+content=["']([\s\S]*?)["']/i);
    const ogImage = extract(html, /property=["']og:image["']\s+content=["']([\s\S]*?)["']/i);
    const twitterCard = extract(html, /<meta\s+name=["']twitter:card["']\s+content=["']([\s\S]*?)["']\s*\/??>/i);
    const twitterTitle = extract(html, /<meta\s+name=["']twitter:title["']\s+content=["']([\s\S]*?)["']\s*\/??>/i);
    const twitterDesc = extract(html, /<meta\s+name=["']twitter:description["']\s+content=["']([\s\S]*?)["']\s*\/??>/i);
    const twitterImage = extract(html, /<meta\s+name=["']twitter:image["']\s+content=["']([\s\S]*?)["']\s*\/??>/i);

    const ogImageExists = existsLocal(ogImage) ? 'yes' : 'no';

    const cells = [f, title, metaDesc, canonical, ogTitle, ogDesc, ogUrl, ogImage, ogImageExists, twitterCard, twitterTitle, twitterDesc, twitterImage];
    // Escape CSV: wrap in double quotes and escape existing quotes
    const esc = cells.map(c => '"' + String(c || '').replace(/"/g, '""') + '"');
    rows.push(esc.join(','));
  }

  fs.writeFileSync(outFile, rows.join('\n'));
  console.log('Wrote', outFile);
})();
