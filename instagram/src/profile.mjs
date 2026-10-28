// Generuje PROFIL/: zdjęcia profilowe, okładki wyróżnionych i stronę z gotowymi tekstami do profilu (nazwa, bio, link, kontakt).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import { contact } from './templates.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const dest = path.join(root, 'PROFIL');
fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(path.join(dest, 'wyroznione'), { recursive: true });
const A = '../../../assets/';

const LINK = 'https://borkowskiprzemo098.github.io/PORTFOLIO/';
const NAME = 'PBDesign | Strony i narzędzia';
const BIOS = [
  'Strony internetowe, landing page i narzędzia online.\nProjektuję i koduję: od pomysłu po publikację.\nPrzemysław Borkowski, PBDesign',
  'Web designer i developer. Strony firmowe, landing page, narzędzia online.\nProjekty autorskie i dla klientów.\nPrzemysław Borkowski',
  'Projektuję i koduję strony dla lokalnych firm.\nPierwszy ekran zawsze na telefonie.\nWybrane projekty w linku ↓',
];
const USERNAMES = ['pbdesign.pl', 'pbdesign_studio', 'pb.design.pl', 'przemek.pbdesign'];

const icons = {
  realizacje: '<rect x="10" y="20" width="100" height="80" rx="12"/><path d="M10 42H110"/><circle cx="24" cy="31" r="2.5" fill="currentColor"/><circle cx="34" cy="31" r="2.5" fill="currentColor"/><circle cx="44" cy="31" r="2.5" fill="currentColor"/><path d="M26 62H62M26 76H84"/>',
  oferta: '<path d="M60 18L108 42L60 66L12 42Z"/><path d="M12 62L60 86L108 62"/><path d="M12 82L60 106L108 82"/>',
  proces: '<path d="M14 96H44V66H76V36H106"/><circle cx="14" cy="96" r="6" fill="currentColor"/><circle cx="44" cy="66" r="6" fill="currentColor"/><circle cx="76" cy="36" r="6" fill="currentColor"/>',
  kontakt: '<rect x="10" y="26" width="100" height="68" rx="10"/><path d="M14 32L60 70L106 32"/>',
};
const covers = [['realizacje', 'Realizacje', '#1F4435', '#E4C99A'], ['oferta', 'Oferta', '#F6F3EC', '#1F4435'], ['proces', 'Proces', '#6B1E2E', '#E4C99A'], ['kontakt', 'Kontakt', '#E4C99A', '#15302A']];

const css = '*{margin:0;box-sizing:border-box}html,body{width:1080px;height:1080px;background:#1F4435}';
const jobs = [
  ['zdjecie-profilowe-logo.png', 1080, 1080, `<style>${css}body{display:grid;place-items:center}img{width:860px;height:860px}</style><body><img src="${A}mark.svg"></body>`],
  ['zdjecie-profilowe-portret.png', 1080, 1080, `<style>${css}body{overflow:hidden;position:relative}img{position:absolute;width:1759px;left:-679px;top:-231px}</style><body><img src="${A}portret.jpg"></body>`],
  ...covers.map(([k, , bg, fg]) => [`wyroznione/okladka-${k}.png`, 1080, 1920, `<style>*{margin:0}html,body{width:1080px;height:1920px;background:${bg};display:grid;place-items:center}svg{width:400px;height:400px;color:${fg}}</style><body><svg viewBox="0 0 120 120" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">${icons[k]}</svg></body>`]),
];
const browser = await chromium.launch();
for (const [rel, w, h, html] of jobs) {
  const hp = path.join(here, 'html', 'profil__' + rel.replace(/[\\/]/g, '__') + '.html');
  fs.writeFileSync(hp, `<!doctype html><meta charset="utf-8">${html}`);
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  await page.goto('file:///' + hp.replace(/\\/g, '/'));
  await page.waitForFunction(() => [...document.images].every(i => i.complete));
  await page.screenshot({ path: path.join(dest, rel) });
  await page.close();
}
await browser.close();

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const field = (label, text, max, hint = '') => `<section class="f"><div class="lab">${label}<span class="len" data-max="${max || ''}"></span></div><pre>${esc(text)}</pre>${hint ? `<p class="hint">${hint}</p>` : ''}<button class="btn" data-copy>Kopiuj</button></section>`;
const html = `<!doctype html><html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Profil Instagram PBDesign</title>
<link rel="stylesheet" href="../src/fonts.css">
<style>
:root{--ivory:#F6F3EC;--green:#1F4435;--soft:#DFE8E1;--sand:#E4C99A;--wine:#6B1E2E;--ink:#16181A;--ink2:#4F5450;--line:#D9D4C7}
*{box-sizing:border-box;margin:0}body{background:var(--ivory);color:var(--ink);font:500 17px/1.5 "Satoshi",system-ui,sans-serif}
header{background:var(--green);color:var(--ivory);padding:28px 20px}.wrap{max-width:900px;margin:0 auto}
h1{font:600 clamp(30px,5vw,42px)/1.05 "Clash Grotesk","Satoshi",sans-serif;letter-spacing:-.02em}header p{margin-top:10px;color:rgba(246,243,236,.85)}
main{padding:22px 20px 60px}h2{font:600 26px/1.1 "Clash Grotesk","Satoshi",sans-serif;margin:30px 0 12px}
.card{background:#fff;border:1px solid var(--line);border-radius:20px;padding:18px 20px}
.f{background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 18px;margin-bottom:12px}
.lab{font:700 13px/1 "Satoshi",system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--wine);display:flex;justify-content:space-between}.len{color:var(--ink2);letter-spacing:0}
pre{white-space:pre-wrap;font:500 18px/1.5 "Satoshi",system-ui,sans-serif;margin:10px 0 12px;background:var(--ivory);border-radius:12px;padding:12px 14px}
.hint{font-size:15px;color:var(--ink2);margin:-4px 0 12px}
.btn{border:0;background:var(--green);color:var(--ivory);border-radius:12px;padding:12px 18px;font:700 16px/1 "Satoshi",system-ui,sans-serif;cursor:pointer;text-decoration:none;display:inline-block}.btn.ok{background:var(--sand);color:#15302A}.btn.alt{background:var(--soft);color:#15302A}
.imgs{display:flex;gap:14px;flex-wrap:wrap}.im{background:#fff;border:1px solid var(--line);border-radius:18px;padding:12px;text-align:center}.im img{display:block;width:180px;border-radius:12px;margin-bottom:10px}.im .circ{border-radius:50%}
ol{padding-left:22px}li{margin:6px 0}
</style></head><body>
<header><div class="wrap"><h1>Profil Instagram PBDesign</h1><p>Gotowe teksty i obrazki do założenia konta. Kliknij „Kopiuj” przy każdym polu i wklej je w ustawieniach profilu.</p></div></header>
<main><div class="wrap">
<h2>Zdjęcie profilowe</h2>
<div class="imgs">
<div class="im"><img class="circ" src="zdjecie-profilowe-logo.png" alt=""><a class="btn alt" href="zdjecie-profilowe-logo.png" download>Logo (pb.)</a></div>
<div class="im"><img class="circ" src="zdjecie-profilowe-portret.png" alt=""><a class="btn alt" href="zdjecie-profilowe-portret.png" download>Twoje zdjęcie</a></div>
</div>
<p class="hint" style="margin-top:10px;font-size:15px;color:var(--ink2)">Instagram przycina zdjęcie do koła, oba pliki są przygotowane tak, żeby nic ważnego nie wypadło. Dla usług projektowych częściej wybiera się logo, żeby spójnie wyglądało z grafikami, a zdjęcie przydaje się w bio lub w story „O mnie”.</p>
<h2>Nazwa i bio</h2>
${field('Nazwa (pole „Imię i nazwisko / nazwa”)', NAME, 30, 'Nazwa pomaga w wyszukiwaniu, dlatego zawiera, czym się zajmujesz.')}
${BIOS.map((b, i) => field(`Bio, wersja ${'ABC'[i]}`, b, 150)).join('')}
${field('Link w bio', LINK, 0, 'Adres Twojego portfolio. Opisy postów odsyłają do niego.')}
${field('Nazwa użytkownika (propozycje)', USERNAMES.join('\n'), 0, 'Nie sprawdzałem dostępności, wybierz pierwszą wolną i ustaw tę samą w Metricool, jeśli będziesz go używać.')}
${field('Kategoria konta', 'Projektant stron internetowych', 0, 'Ustaw przy przełączaniu na konto zawodowe. Jeśli nie ma takiej kategorii, wybierz najbliższą (np. web designer).')}
<h2>Dane kontaktowe (opcjonalnie)</h2>
${field('E-mail', contact.email, 0, 'Przycisk „Napisz” na profilu zawodowym.')}
${field('Telefon', contact.phone, 0, 'Dodaj tylko, jeśli chcesz, żeby numer był publiczny.')}
<h2>Okładki wyróżnionych (highlights)</h2>
<div class="imgs">${covers.map(([k, n]) => `<div class="im"><img src="wyroznione/okladka-${k}.png" alt=""><a class="btn alt" href="wyroznione/okladka-${k}.png" download>${n}</a></div>`).join('')}</div>
<p class="hint" style="margin-top:10px;font-size:15px;color:var(--ink2)">Dodasz je po opublikowaniu pierwszych story: w profilu „Nowe wyróżnione”, wybierasz story, potem „Edytuj okładkę” i wgrywasz plik. Nazwy: Realizacje, Oferta, Proces, Kontakt.</p>
<h2>Kolejność zakładania konta</h2>
<div class="card"><ol><li>Załóż konto na Instagramie (osobiście, ze swoim e-mailem) i ustaw nazwę użytkownika.</li><li>Przełącz na konto <b>zawodowe</b> (w ustawieniach: typ konta), wybierz kategorię.</li><li>Wgraj zdjęcie profilowe, wklej nazwę, bio i link.</li><li>Dodaj przycisk kontaktu (e-mail).</li><li>Wejdź do <b>PUBLIKACJE/index.html</b> i opublikuj pierwszy post.</li></ol><p class="hint" style="margin-top:8px">Nazwy opcji w aplikacji mogą się nieco różnić, bo Instagram często je zmienia.</p></div>
</div></main>
<script>
const cnt=document.querySelectorAll('.f');cnt.forEach(f=>{const t=f.querySelector('pre').textContent;const l=f.querySelector('.len');const m=l.dataset.max;if(m)l.textContent=[...t].length+' / '+m+' znaków'});
document.querySelectorAll('[data-copy]').forEach(b=>b.onclick=async()=>{const t=b.parentElement.querySelector('pre').textContent;try{await navigator.clipboard.writeText(t)}catch(e){const x=document.createElement('textarea');x.value=t;document.body.appendChild(x);x.select();document.execCommand('copy');x.remove()}const o=b.textContent;b.textContent='Skopiowano';b.classList.add('ok');setTimeout(()=>{b.textContent=o;b.classList.remove('ok')},1400)});
</script></body></html>`;
fs.writeFileSync(path.join(dest, 'profil.html'), html);
const lens = [NAME, ...BIOS].map(s => [...s].length);
console.log('PROFIL gotowy. Długości (nazwa, bio A/B/C):', lens.join(', '));
