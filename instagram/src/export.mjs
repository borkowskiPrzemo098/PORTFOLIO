import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { FORMATS } from './templates.mjs';
import * as V from './v2.mjs';
import { pills, arts, stickerPage } from './stickers.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../out');
const htmlDir = path.join(here, 'html');
const arg = process.argv.find(a => a.startsWith('--only='));
const only = arg ? arg.slice(7) : null; // np. --only=ambra  albo --only=stories

const jobs = [];
const add = (rel, fmt, html, extra = {}) => { if (!only || rel.includes(only)) jobs.push({ rel, fmt, html, ...extra }); };
const nn = n => String(n).padStart(2, '0');

V.projects.forEach((p, i) => {
  const s = V.slug(p);
  V.postsFor(i).forEach((name, k) => add(`posty/${s}/${nn(k + 1)}-${name}.png`, 'post', V.POSTS[name](p, 'post')));
  add(`posty/${s}/kwadrat-plakat.png`, 'square', V.POSTS.plakat(p, 'square'));
  const c = V.CAROUSELS[i % 3];
  for (let n = 1; n <= c.count; n++) add(`karuzele/${s}/${nn(n)}-${c.name}.png`, 'post', c.fn(p, n));
  V.storiesFor(i).forEach((name, k) => add(`stories/${s}/${nn(k + 1)}-${name}.png`, 'story', V.STORIES[name](p), { story: true }));
});
add('posty/_marka/wartosci-1-najpierw-telefon.png', 'post', V.E_value(1));
add('posty/_marka/wartosci-2-projekt-kod-publikacja.png', 'post', V.E_value(2));
add('posty/_marka/wartosci-3-strony-dla-lokalnych-firm.png', 'post', V.E_value(3));
add('posty/_marka/portfolio-mozaika.png', 'post', V.E_mosaic());
add('posty/_marka/kazda-marka-ma-swoj-kolor.png', 'post', V.E_palety());
add('stories/_marka/dostepne-terminy-zlecen.png', 'story', V.D_available(), { story: true });
for (const [n, h] of pills) add(`stickery/${n}.png`, 'post', stickerPage(h), { sticker: true });
for (const [n, h] of arts) add(`stickery/ksztalty/${n}.png`, 'post', stickerPage(h), { sticker: true });

// kontrola: tekst poza marginesem, ucięty, nachodzący na ramki urządzeń, poza strefą bezpieczną story (dekoracje [data-deco] pomijane)
const check = ({ w, h, story }) => {
  const res = [];
  const txt = [...document.querySelectorAll('h1,h2,p,li,.chip,.bdg,.brand2,.kick,.lead')].filter(e => !e.closest('.phone,.laptop,.bw,.lens,[data-deco]'));
  const dev = [...document.querySelectorAll('.phone,.laptop__lid,.bw,.lens')].map(e => e.getBoundingClientRect());
  for (const e of txt) {
    const r = e.getBoundingClientRect();
    if (!r.width) continue;
    const name = (e.textContent || '').trim().slice(0, 28);
    if (r.left < 28 || r.right > w - 28 || r.top < 28 || r.bottom > h - 28) res.push(`poza marginesem: "${name}"`);
    if (story && (r.top < 244 || r.bottom > h - 244)) res.push(`poza strefą bezpieczną: "${name}"`);
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).display !== 'inline') res.push(`ucięty: "${name}"`);
    if (/^(H1|H2|P|LI)$/.test(e.tagName)) {
      for (const d of dev) {
        const ix = Math.min(r.right, d.right) - Math.max(r.left, d.left), iy = Math.min(r.bottom, d.bottom) - Math.max(r.top, d.top);
        if (ix > 12 && iy > 12) { res.push(`nachodzi na ramkę: "${name}"`); break; }
      }
    }
  }
  return [...new Set(res)];
};

fs.mkdirSync(htmlDir, { recursive: true });
if (!only) for (const d of ['posty', 'karuzele', 'stories']) fs.rmSync(path.join(out, d), { recursive: true, force: true });
const browser = await chromium.launch();
const warns = [];
for (const j of jobs) {
  const name = j.rel.replace(/[\\/]/g, '__').replace('.png', '.html');
  const hp = path.join(htmlDir, name);
  fs.writeFileSync(hp, j.html);
  const { w, h } = FORMATS[j.fmt];
  const page = await browser.newPage({ viewport: { width: j.sticker ? 1000 : w, height: j.sticker ? 800 : h }, deviceScaleFactor: 1 });
  await page.goto('file:///' + hp.replace(/\\/g, '/'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every(i => i.complete));
  const dest = path.join(out, j.rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (j.sticker) {
    await page.locator('#s').screenshot({ path: dest, omitBackground: true });
  } else {
    await page.screenshot({ path: dest, clip: { x: 0, y: 0, width: w, height: h } });
    const issues = await page.evaluate(`(${check.toString()})(${JSON.stringify({ w, h, story: !!j.story })})`);
    for (const i of issues) warns.push(`${j.rel}: ${i}`);
  }
  await page.close();
}
await browser.close();
console.log(`Wyrenderowano: ${jobs.length} plików.`);
if (warns.length) console.log('Ostrzeżenia kontroli:\n' + warns.join('\n'));
