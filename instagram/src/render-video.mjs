// Renderer wideo: przewija oś czasu strony klatka po klatce (90 kl./s), miesza po 3 klatki (rozmycie ruchu)
// i koduje do MP4 30 kl./s przez ffmpeg. Użycie: node src/render-video.mjs --only=barbershop [--fmt=telefon]
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { FORMATS } from './templates.mjs';
import * as W from './video.mjs';
import { projects, slug } from './v2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.resolve(here, '../out/wideo');
const htmlDir = path.join(here, 'html');
const arg = k => (process.argv.find(a => a.startsWith(`--${k}=`)) || '').split('=')[1];
const only = arg('only'), fmtOnly = arg('fmt'), stills = arg('stills'); // stills = lista sekund, np. 0.5,1.5,3
const SUB = 3, FPS = 30, DUR = W.DURATION;

const jobs = [];
projects.forEach((p, i) => {
  if (only && !slug(p).includes(only)) return;
  for (const [name, v] of Object.entries(W.VIDEOS)) {
    if (fmtOnly && name !== fmtOnly) continue;
    jobs.push({ p, name, v, rel: `${slug(p)}/${name}.mp4` });
  }
});

fs.mkdirSync(htmlDir, { recursive: true });
const browser = await chromium.launch();
for (const j of jobs) {
  const { w, h } = FORMATS[j.v.fmt];
  const hp = path.join(htmlDir, `wideo__${slug(j.p)}__${j.name}.html`);
  fs.writeFileSync(hp, j.v.fn(j.p));
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  await page.goto('file:///' + hp.replace(/\\/g, '/'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() => [...document.images].every(i => i.complete));
  const dest = path.join(out, j.rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (stills) {
    for (const s of stills.split(',')) {
      await page.evaluate(ms => window.__seek(ms), Number(s) * 1000);
      await page.screenshot({ path: dest.replace('.mp4', `_t${s}.png`), clip: { x: 0, y: 0, width: w, height: h } });
    }
    await page.close();
    continue;
  }
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-i', '-',
    '-vf', `tmix=frames=${SUB},select='not(mod(n\\,${SUB}))',setpts=N/(${FPS}*TB)`, '-r', String(FPS),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', dest], { stdio: ['pipe', 'inherit', 'inherit'] });
  const total = DUR * FPS * SUB;
  for (let f = 0; f < total; f++) {
    await page.evaluate(ms => window.__seek(ms), (f / (FPS * SUB)) * 1000);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95, clip: { x: 0, y: 0, width: w, height: h } });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await page.close();
  console.log('gotowe:', j.rel);
}
await browser.close();
