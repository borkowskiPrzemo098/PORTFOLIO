import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import * as T from './templates.mjs';
import { pills, arts, stickerPage } from './stickers.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../out');
const htmlDir = path.join(here, 'html');
const sample = process.argv.includes('--sample');

const jobs = [];
const add = (rel, fmt, html, extra = {}) => jobs.push({ rel, fmt, html, ...extra });

if (sample) {
  const nik = T.byShot('salonpieknoscinikola'), amb = T.byShot('AMBRA-RESTAURACJA');
  add('posty/nikola-ramka.png', 'post', T.A_frame(nik));
  add('posty/ambra-ramka.png', 'post', T.A_frame(amb));
  add('karuzele/nikola/01-okladka.png', 'post', T.B_cover(nik));
  add('karuzele/nikola/02-cel.png', 'post', T.B_slide(nik, 2));
  add('karuzele/nikola/03-mobile.png', 'post', T.B_slide(nik, 3));
  add('stories/nikola-nowy-projekt.png', 'story', T.D_newProject(nik));
} else {
  const names = ['01-okladka', '02-cel', '03-mobile', '04-funkcje', '05-kontakt'];
  for (const p of T.projects) {
    const s = T.slug(p);
    add(`posty/${s}-ramka-4x5.png`, 'post', T.A_frame(p, 'post'));
    add(`posty/${s}-ramka-kwadrat.png`, 'square', T.A_frame(p, 'square'));
    add(`karuzele/${s}/${names[0]}.png`, 'post', T.B_cover(p));
    for (let n = 2; n <= 5; n++) add(`karuzele/${s}/${names[n - 1]}.png`, 'post', T.B_slide(p, n));
    add(`stories/${s}-nowy-projekt.png`, 'story', T.D_newProject(p), { story: true });
  }
  add('stories/dostepne-terminy-zlecen.png', 'story', T.D_available(), { story: true });
  add('posty/wartosci-1-najpierw-telefon.png', 'post', T.E_value(1));
  add('posty/wartosci-2-projekt-kod-publikacja.png', 'post', T.E_value(2));
  add('posty/wartosci-3-strony-dla-lokalnych-firm.png', 'post', T.E_value(3));
  for (const [n, h] of pills) add(`stickery/${n}.png`, 'post', stickerPage(h), { sticker: true });
  for (const [n, h] of arts) add(`stickery/ksztalty/${n}.png`, 'post', stickerPage(h), { sticker: true });
}

// kontrola: tekst poza marginesem, ucięty tekst, tekst nachodzący na ramki, tekst poza strefą bezpieczną story
const check = ({ w, h, story }) => {
  const res = [];
  const txt = [...document.querySelectorAll('h1,h2,p,li,.tag,.badge,.cta-pill,.brand,span')].filter(e => !e.closest('.phone,.laptop') && e.children.length === 0 || /^(H1|H2|P)$/.test(e.tagName));
  const dev = [...document.querySelectorAll('.phone,.laptop__lid')].map(e => e.getBoundingClientRect());
  for (const e of txt) {
    const r = e.getBoundingClientRect();
    if (!r.width || e.closest('.tag')&&e.className!=='tag') continue;
    const name = (e.textContent || '').trim().slice(0, 28);
    if (r.left < 28 || r.right > w - 28 || r.top < 28 || r.bottom > h - 28) res.push(`poza marginesem: "${name}"`);
    if (story && (r.top < 244 || r.bottom > h - 244)) res.push(`poza strefą bezpieczną: "${name}"`);
    if (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).display !== 'inline') res.push(`ucięty: "${name}"`);
    for (const d of dev) {
      const ix = Math.min(r.right, d.right) - Math.max(r.left, d.left), iy = Math.min(r.bottom, d.bottom) - Math.max(r.top, d.top);
      if (ix > 12 && iy > 12) { res.push(`nachodzi na ramkę: "${name}"`); break; }
    }
  }
  return [...new Set(res)];
};

fs.mkdirSync(htmlDir, { recursive: true });
const browser = await chromium.launch();
const warns = [];
for (const j of jobs) {
  const name = j.rel.replace(/[\\/]/g, '__').replace('.png', '.html');
  const hp = path.join(htmlDir, name);
  fs.writeFileSync(hp, j.html);
  const { w, h } = T.FORMATS[j.fmt];
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
