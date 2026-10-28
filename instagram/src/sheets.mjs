// Arkusze podglądu (tylko do kontroli wzrokowej): node src/sheets.mjs <katalog-wyjściowy>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../out');
const dest = path.resolve(process.argv[2] || path.join(here, '../.preview'));
fs.mkdirSync(dest, { recursive: true });

const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const files = walk(out).filter(f => f.endsWith('.png')).sort();
const rel = f => path.relative(out, f).replace(/\\/g, '/');
const groups = {};
for (const f of files) {
  const r = rel(f), [kind, proj, name] = r.split('/');
  if (kind === 'posty') (groups[`posty-${name.replace(/^\d+-|\.png$/g, '')}`] ||= []).push(f);
  else if (kind === 'stories') (groups[`stories-${(name || '').replace(/^\d+-|\.png$/g, '')}`] ||= []).push(f);
  else if (kind === 'karuzele') (groups[`karuzela-${proj}`] ||= []).push(f);
  else if (kind === 'stickery') (groups.stickery ||= []).push(f);
}

const browser = await chromium.launch();
for (const [name, list] of Object.entries(groups)) {
  const story = name.startsWith('stories'), car = name.startsWith('karuzela'), st = name === 'stickery';
  const cols = car ? 6 : story ? 8 : st ? 4 : 5, cw = car ? 330 : story ? 240 : st ? 380 : 380;
  const per = 16;
  for (let i = 0, n = 1; i < list.length; i += per, n++) {
    const chunk = list.slice(i, i + per);
    const html = `<body style="margin:0;background:${st ? '#888' : '#222'};display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:8px;padding:8px;width:max-content">${chunk.map(f => `<img src="file:///${f.replace(/\\/g, '/')}" style="width:${cw}px;display:block" title="${rel(f)}">`).join('')}</body>`;
    const hp = path.join(dest, `_${name}-${n}.html`);
    fs.writeFileSync(hp, html);
    const page = await browser.newPage({ viewport: { width: cols * (cw + 8) + 8, height: 600 } });
    await page.goto('file:///' + hp.replace(/\\/g, '/'));
    await page.waitForFunction(() => [...document.images].every(i => i.complete));
    await page.screenshot({ path: path.join(dest, `${name}-${n}.png`), fullPage: true });
    await page.close();
  }
}
await browser.close();
console.log('gotowe:', dest);
