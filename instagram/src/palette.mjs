// Narzędzie pomocnicze: wyciąga dominujące kolory ze zrzutów projektów i robi arkusz podglądu.
// node src/palette.mjs <katalog-wyjściowy>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import * as T from './templates.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const shots = path.resolve(here, '../../shots');
const dest = path.resolve(process.argv[2] || path.join(here, '../.preview'));
fs.mkdirSync(dest, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 900 } });
const report = [];
const cells = [];
for (const p of T.projects) {
  const f = path.join(shots, p.shot + '.jpg').replace(/\\/g, '/');
  await page.goto('file:///' + f);
  const cols = await page.evaluate(() => {
    const img = document.images[0];
    const c = document.createElement('canvas'); c.width = 64; c.height = 40;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0, 64, 40);
    const d = x.getImageData(0, 0, 64, 40).data, m = new Map();
    for (let i = 0; i < d.length; i += 4) {
      const k = [d[i] >> 5, d[i + 1] >> 5, d[i + 2] >> 5].join(',');
      const e = m.get(k) || { n: 0, r: 0, g: 0, b: 0 }; e.n++; e.r += d[i]; e.g += d[i + 1]; e.b += d[i + 2]; m.set(k, e);
    }
    return [...m.values()].sort((a, b) => b.n - a.n).slice(0, 6).map(e => '#' + [e.r, e.g, e.b].map(v => Math.round(v / e.n).toString(16).padStart(2, '0')).join(''));
  });
  report.push(`${p.shot}: ${cols.join(' ')}`);
  cells.push(`<div style="width:300px"><img src="file:///${f}" style="width:300px"><div style="display:flex">${cols.map(c => `<i style="flex:1;height:26px;background:${c}"></i>`).join('')}</div><small style="color:#fff">${p.shot}</small></div>`);
}
fs.writeFileSync(path.join(dest, 'palette.txt'), report.join('\n'));
const hp = path.join(dest, 'palette.html');
fs.writeFileSync(hp, `<body style="margin:0;background:#222;display:grid;grid-template-columns:repeat(5,300px);gap:10px;padding:10px;width:max-content">${cells.join('')}</body>`);
const pg = await browser.newPage({ viewport: { width: 1600, height: 800 } });
await pg.goto('file:///' + hp.replace(/\\/g, '/'));
await pg.waitForFunction(() => [...document.images].every(i => i.complete));
await pg.screenshot({ path: path.join(dest, 'palette.png'), fullPage: true });
await browser.close();
console.log(report.join('\n'));
