// Stickery: PNG z przezroczystym tłem, szerokość 800 px, paleta PBDesign.
const page = (inner) => `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<link rel="stylesheet" href="../fonts.css"><link rel="stylesheet" href="../tokens.css">
<style>html,body{background:transparent!important;width:auto;height:auto}body{padding:0;margin:0;display:inline-block}
#s{width:800px;display:flex;align-items:center;justify-content:center;padding:30px}
.pill{width:100%;display:flex;align-items:center;justify-content:center;gap:28px;text-align:center;padding:44px 48px;border-radius:120px;font:600 74px/1 var(--f-display);letter-spacing:-.02em;border:8px solid var(--ivory);box-shadow:0 14px 0 rgba(0,0,0,.14)}
.pill small{display:block;font:700 40px/1.1 var(--f-text);letter-spacing:.02em;margin-top:10px}
.pill i{width:34px;height:34px;border-radius:50%;background:currentColor;flex:none}
.p-sand{background:var(--sand);color:var(--green-deep)}
.p-green{background:var(--green);color:var(--ivory)}
.p-wine{background:var(--wine);color:var(--ivory)}
.p-ivory{background:var(--ivory);color:var(--green);border-color:var(--green)}
</style></head><body><div id="s">${inner}</div></body></html>`;

const pill = (cls, text, { rot = 0, dot = true, sub = '', icon = '' } = {}) =>
  `<div class="pill ${cls}" style="transform:rotate(${rot}deg)">${icon || (dot ? '<i></i>' : '')}<span>${text}${sub ? `<small>${sub}</small>` : ''}</span></div>`;

const phoneIcon = `<svg width="72" height="96" viewBox="0 0 36 48" fill="none" stroke="currentColor" stroke-width="3.5"><rect x="4" y="2" width="28" height="44" rx="7"/><path d="M14 8h8" stroke-linecap="round"/></svg>`;
const pin = `<svg width="64" height="80" viewBox="0 0 32 40" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M16 38S4 24 4 15a12 12 0 0 1 24 0c0 9-12 23-12 23Z"/><circle cx="16" cy="15" r="4.5"/></svg>`;
const cal = `<svg width="80" height="80" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"><rect x="4" y="7" width="32" height="29" rx="6"/><path d="M4 16h32M12 3v8M28 3v8"/></svg>`;
const mark = `<img src="../../../assets/mark.svg" width="130" height="130" alt="">`;

export const pills = [
  ['nowy-projekt', pill('p-sand', 'Nowy projekt', { rot: -4 })],
  ['dostepne-zlecenia', pill('p-green', 'Dostępne zlecenia', { rot: 3 })],
  ['mobile-first', pill('p-ivory', 'Mobile first', { rot: -3, icon: phoneIcon })],
  ['seo-lokalne', pill('p-green', 'SEO lokalne', { rot: 3, icon: pin })],
  ['rezerwacje-online', pill('p-sand', 'Rezerwacje online', { rot: -3, icon: cal })],
  ['projekt-autorski', pill('p-ivory', 'Projekt autorski', { rot: 2 })],
  ['realizacja-dla-klienta', pill('p-wine', 'Realizacja dla klienta', { rot: -2 })],
  ['napisz-do-mnie', pill('p-wine', 'Napisz do mnie', { rot: 3, dot: false, icon: '<svg width="86" height="40" viewBox="0 0 64 28" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14h56M47 3l12 11-12 11"/></svg>' })],
  ['zobacz-na-zywo', pill('p-sand', 'Zobacz na żywo', { rot: -3, dot: false, sub: '(link w bio)' })],
  ['pbdesign', `<div class="pill p-green" style="transform:rotate(-2deg);gap:34px;padding:34px 60px">${mark}<span>PBDesign</span></div>`],
];

/* strzałki i obwódki — rysowane ręcznie, w 3 kolorach (na ciemne i jasne tła) */
const colors = { piasek: '#E4C99A', kremowy: '#F6F3EC', zielony: '#1F4435' };
const stroke = (c, d, extra = '') => `<svg width="740" height="440" viewBox="0 0 740 440" fill="none" stroke="${c}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const shapes = {
  'strzalka-luk': `<path d="M40 380C120 120 380 40 640 150"/><path d="M540 70l110 84-132 40"/>`,
  'strzalka-prosta': `<path d="M50 220h590"/><path d="M520 110l130 110-130 110"/>`,
  'strzalka-petla': `<path d="M60 390C60 210 300 60 400 180C470 270 330 330 320 230C310 130 520 80 650 140"/><path d="M575 75L660 142L565 190"/>`,
  'strzalka-zygzak': `<path d="M50 90c100 120 160-40 250 90s140-20 240 90"/><path d="M440 300L545 272L522 168"/>`,
  'obwodka-elipsa': `<path d="M370 40C170 40 40 120 40 220s140 180 340 180 320-80 320-180S560 50 330 60"/>`,
  'obwodka-prostokat': `<path d="M90 70C250 50 520 52 660 66c18 100 20 200 6 310-190 18-400 20-580 4C70 280 72 170 90 70Z"/>`,
  'obwodka-podwojna': `<ellipse cx="370" cy="220" rx="320" ry="170"/><ellipse cx="370" cy="220" rx="265" ry="118" stroke-width="10" opacity=".7"/>`,
  'podkreslenie': `<path d="M30 250c120-40 220 30 340-10s220 30 340-10" /><path d="M60 330c130-30 230 20 350-8s200 14 270-4" stroke-width="12"/>`,
};
export const arts = Object.entries(shapes).flatMap(([name, d]) =>
  Object.entries(colors).map(([cn, c]) => [`${name}-${cn}`, `<div style="width:100%;display:flex;justify-content:center">${stroke(c, d)}</div>`]));

export const stickerPage = page;
