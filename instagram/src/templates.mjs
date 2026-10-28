import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data/projects.json'), 'utf8'));
export const contact = JSON.parse(fs.readFileSync(path.join(root, 'data/contact.json'), 'utf8'));

export const projects = data.groups.flatMap(g => g.projects.map(p => ({ ...p, group: g.id, groupTitle: g.title })));
export const byShot = s => projects.find(p => p.shot === s);
export const slug = p => p.shot.toLowerCase();

export const FORMATS = {
  post:   { w: 1080, h: 1350 },
  square: { w: 1080, h: 1080 },
  story:  { w: 1080, h: 1920 },
};

const S = '../../../shots/';
const A = '../../../assets/';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const isClient = p => p.kind === 'Realizacja dla klienta';
const badge = p => `<span class="badge ${isClient(p) ? 'badge--client' : 'badge--own'}">${esc(p.kind)}</span>`;
const sentences = p => p.desc.split(/(?<=[.!?])\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ0-9„"])/);
const phoneShot = p => p.phones ? p.phones[0] : p.shot + '-m';
const maxWord = t => Math.max(...t.split(/\s+/).map(w => w.length));
const fit = (t, avail, max, min = 60) => Math.max(min, Math.min(max, Math.floor(avail / (t.length * 0.56))));
const fitWord = (t, avail, max) => Math.min(max, Math.floor(avail / (maxWord(t) * 0.62)));

export const phone = (p, w, extra = '', shot = phoneShot(p)) =>
  `<div class="phone" style="--pw:${w}px;${extra}"><div class="phone__screen"><img src="${S}${shot}.jpg" alt=""></div></div>`;
export const laptop = (p, w, extra = '', shot = p.shot, pos = 'top') =>
  `<div class="laptop" style="--lw:${w}px;${extra}"><div class="laptop__lid"><div class="laptop__screen"><img src="${S}${shot}.jpg" style="object-position:${pos}" alt=""></div></div><div class="laptop__base"></div></div>`;
const brand = `<div class="brand"><img src="${A}mark.svg" alt="">PBDesign</div>`;
const rings = () => `<i class="ring" style="width:900px;height:900px;right:-380px;top:-300px"></i><i class="ring" style="width:620px;height:620px;right:-230px;top:-150px"></i>`;
const tagsHtml = p => p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('');
const shell = (fmt, cls, body, extra = '') => `<!doctype html><html lang="pl"><head><meta charset="utf-8">
<link rel="stylesheet" href="../fonts.css"><link rel="stylesheet" href="../tokens.css">
<style>:root{--w:${FORMATS[fmt].w}px;--h:${FORMATS[fmt].h}px}${extra}</style></head>
<body><div class="cv ${cls}">${body}</div></body></html>`;
const city = p => p.category.split(' · ').slice(1).join(' · ');
export const place = p => [p.category.split(' · ')[0], city(p)].filter(Boolean).join(' · ');
const abs = (css, inner) => `<div style="position:absolute;${css}">${inner}</div>`;
const arrow = `<svg width="64" height="28" viewBox="0 0 64 28" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14h56M47 3l12 11-12 11"/></svg>`;

/* A — Projekt w ramce */
export function A_frame(p, fmt = 'post') {
  const post = fmt === 'post';
  const size = post ? Math.min(fitWord(p.title, 936, 128), p.title.length > 14 ? 108 : 128) : fit(p.title, 936, 112, 70);
  return shell(fmt, '', `
    ${rings()}
    ${abs('left:var(--pad);right:var(--pad);top:64px;display:flex;justify-content:space-between;align-items:center', brand + badge(p))}
    ${abs(`left:var(--pad);right:var(--pad);top:${post ? 190 : 170}px`, `<h1 style="font-size:${size}px">${esc(p.title)}</h1><p class="meta" style="margin-top:${post ? 22 : 16}px">${esc(place(p))}</p>`)}
    ${abs(`left:var(--pad);top:${post ? 500 : 350}px`, laptop(p, post ? 800 : 640))}
    ${abs(`right:56px;top:${post ? 600 : 400}px;transform:rotate(3deg)`, phone(p, post ? 320 : 260))}
    <div class="tags" style="position:absolute;left:var(--pad);bottom:${post ? 72 : 56}px;width:${post ? 620 : 600}px">${tagsHtml(p)}</div>
  `);
}

/* B — karuzela */
export function B_cover(p) {
  const size = Math.min(fitWord(p.title, 620, 150), p.title.length > 12 ? 112 : 150);
  return shell('post', 'cv--ivory', `
    <i class="ring" style="width:900px;height:900px;left:-420px;top:-320px;color:var(--green)"></i>
    ${abs('left:var(--pad);right:var(--pad);top:64px;display:flex;justify-content:space-between;align-items:center;color:var(--green)', brand + badge(p))}
    ${abs('left:var(--pad);top:200px;width:640px', `<p class="meta" style="margin-bottom:26px">${esc(place(p))}</p>
      <h1 style="font-size:${size}px;color:var(--green)">${esc(p.title)}</h1>
      <div class="tags" style="margin-top:44px;width:560px">${tagsHtml(p)}</div>`)}
    ${abs('right:-70px;top:560px;transform:rotate(-4deg)', phone(p, 490))}
    ${abs('left:var(--pad);bottom:72px;display:flex;align-items:center;gap:20px;font:700 40px/1 var(--f-text);color:var(--green)', `Przesuń, zobacz projekt ${arrow}`)}
  `);
}

const slideHead = (n, label, p) => `
  ${abs('left:var(--pad);right:var(--pad);top:64px;display:flex;justify-content:space-between;align-items:center', `<span class="tag" style="background:var(--sand);color:var(--green-deep);font-weight:700">${n} / 5</span><span style="font:600 36px/1 var(--f-display);opacity:.85">${esc(p.title)}</span>`)}
  <p style="position:absolute;left:var(--pad);top:200px;font:700 34px/1 var(--f-text);letter-spacing:.14em;text-transform:uppercase;color:var(--sand)">${label}</p>`;

// Teksty slajdu 2 pochodzą wyłącznie z opisu projektu w data/projects.json.
function goal(p) {
  const s = sentences(p);
  const [head, tail] = s[0].split(': ');
  let list = null;
  if (tail) {
    const items = tail.replace(/\.$/, '').split(/,\s*|\s+i\s+/);
    if (items.length >= 3 && items.every(x => x.length >= 2 && !/^\d+$/.test(x))) list = items.map(x => x[0].toUpperCase() + x.slice(1));
  }
  if (list) {
    const lead = s[1] && s[1].length >= 40 ? s[1] : head + '.';
    const rest = (s[1] && s[1].length >= 40 ? s.slice(2) : s.slice(1)).join(' ');
    return { lead, list, rest };
  }
  if (tail) return { lead: head + '.', list: null, rest: [tail[0].toUpperCase() + tail.slice(1), ...s.slice(1)].join(' ') };
  return { lead: s[0], list: null, rest: s.slice(1).join(' ') };
}

export function B_slide(p, n) {
  if (n === 2) {
    const g = goal(p);
    const size = g.lead.length <= 70 ? 92 : g.lead.length <= 110 ? 78 : 66;
    return shell('post', '', `${rings()}${slideHead(2, 'Cel strony', p)}
      ${abs('left:var(--pad);right:var(--pad);top:290px;display:flex;flex-direction:column;gap:44px', `<h2 style="font-size:${size}px;line-height:1.04">${esc(g.lead)}</h2>${!g.list && g.rest ? `<p style="font:500 44px/1.35 var(--f-text);color:rgba(246,243,236,.86)">${esc(g.rest)}</p>` : ''}${g.list ? `<ul style="list-style:none;padding:0;display:grid;gap:14px;font:600 48px/1.1 var(--f-display)">${g.list.map(i => `<li style="display:flex;align-items:center;gap:22px"><i style="width:18px;height:18px;border-radius:50%;background:var(--sand);flex:none"></i>${esc(i)}</li>`).join('')}</ul>` : ''}`)}
      ${g.list
        ? `${g.rest ? abs('left:var(--pad);right:var(--pad);bottom:96px;font:500 44px/1.35 var(--f-text);color:rgba(246,243,236,.86)', esc(g.rest)) : ''}`
        : abs('left:var(--pad);bottom:-210px', laptop(p, 820))}`);
  }
  if (n === 3) {
    return shell('post', 'cv--wine', `
      <i class="ring" style="width:1000px;height:1000px;right:-420px;top:200px;color:var(--ivory)"></i>
      ${slideHead(3, 'Wersja mobilna', p)}
      <h2 style="position:absolute;left:var(--pad);top:290px;width:520px;font-size:96px">Najpierw <em>telefon</em></h2>
      <p style="position:absolute;left:var(--pad);bottom:96px;width:420px;font:500 42px/1.35 var(--f-text);color:rgba(246,243,236,.9)">${isClient(p) ? 'Strona projektowana od widoku na telefonie.' : 'Projekt zaczyna się od widoku na telefonie.'}</p>
      ${abs('right:70px;top:250px;transform:rotate(3deg)', phone(p, 460))}`);
  }
  if (n === 4) {
    return shell('post', 'cv--ivory', `
      <i class="ring" style="width:900px;height:900px;right:-420px;bottom:-380px;color:var(--green)"></i>
      ${abs('left:var(--pad);right:var(--pad);top:64px;display:flex;justify-content:space-between;align-items:center;color:var(--green)', `<span class="tag" style="background:var(--green);color:var(--ivory);font-weight:700">4 / 5</span><span style="font:600 36px/1 var(--f-display)">${esc(p.title)}</span>`)}
      <p style="position:absolute;left:var(--pad);top:200px;font:700 34px/1 var(--f-text);letter-spacing:.14em;text-transform:uppercase;color:var(--wine)">Kluczowe funkcje</p>${abs('left:var(--pad);bottom:-170px', laptop(p, 936, '', (p.shot !== 'HORYZONT-NIERUCHOMOSCI' && fs.existsSync(path.join(root, 'shots', p.shot + '-full.jpg'))) ? p.shot + '-full' : p.shot, p.shot === 'HORYZONT-NIERUCHOMOSCI' ? 'top' : '50% 40%'))}
      <ol style="position:absolute;left:var(--pad);right:var(--pad);top:290px;list-style:none;padding:0;color:var(--green)">${p.tags.map((t, i) => `<li style="display:flex;align-items:baseline;gap:36px;padding:34px 0;border-top:3px solid var(--green)"><span style="font:400 64px/1 var(--f-serif);font-style:italic;color:var(--wine);width:90px">0${i + 1}</span><span style="font:600 ${t.length > 14 ? 76 : 88}px/1.02 var(--f-display);letter-spacing:-.02em">${esc(t)}</span></li>`).join('')}</ol>
`);
  }
  if (n === 5) {
    return shell('post', '', `${rings()}
      ${abs('left:var(--pad);right:var(--pad);top:64px;display:flex;justify-content:space-between;align-items:center', `<span class="tag" style="background:var(--sand);color:var(--green-deep);font-weight:700">5 / 5</span>${brand}`)}
      ${abs('left:var(--pad);right:var(--pad);top:300px', `<h2 style="font-size:116px;line-height:1">Chcesz podobną <em>stronę?</em></h2>
        <p style="margin-top:56px;font:500 44px/1.3 var(--f-text);color:rgba(246,243,236,.86)">Napisz:</p>
        <p style="margin-top:16px;font:600 ${contact.email.length > 22 ? 62 : 72}px/1.1 var(--f-display);color:var(--sand);letter-spacing:-.01em">${esc(contact.email)}</p>`)}
      ${abs('right:60px;top:800px;transform:rotate(3deg)', phone(p, 400))}
      ${abs('left:var(--pad);bottom:96px;width:460px;font:700 40px/1.25 var(--f-text);color:var(--sand)', `Zobacz projekt na żywo: link w bio`)}`);
  }
  throw new Error('slajd ' + n);
}

/* D — Story „Nowy projekt” (bezpieczne marginesy 250 px góra/dół) */
export function D_newProject(p) {
  return shell('story', '', `
    ${rings()}
    ${abs('left:var(--pad);right:var(--pad);top:268px;display:flex;justify-content:space-between;align-items:center', `<span class="cta-pill" style="padding:20px 38px;transform:rotate(-3deg)">Nowy projekt</span>${badge(p)}`)}
    ${abs('left:50%;top:380px;transform:translateX(-50%) rotate(-3deg)', phone(p, 420))}
    ${abs('left:var(--pad);right:var(--pad);top:1300px', `<h1 style="font-size:${fit(p.title, 936, 116, 64)}px;white-space:nowrap">${esc(p.title)}</h1><p class="meta" style="margin-top:14px;font-size:42px">${esc(place(p))}</p>`)}
    ${abs('left:var(--pad);right:var(--pad);bottom:250px;display:flex;justify-content:space-between;align-items:center', `<span style="font:700 40px/1 var(--f-text);color:var(--sand)">Zobacz na żywo: link w bio</span>${brand}`)}
  `);
}

/* D2 — Story „Dostępne terminy zleceń” */
export function D_available() {
  return shell('story', '', `
    <i class="ring" style="width:1100px;height:1100px;left:-420px;top:120px"></i><i class="ring" style="width:760px;height:760px;left:-240px;top:300px"></i>
    ${abs('left:var(--pad);right:var(--pad);top:250px', brand)}
    ${abs('left:var(--pad);right:var(--pad);top:520px', `<span class="cta-pill" style="transform:rotate(-3deg);margin-bottom:56px">Dostępne zlecenia</span>
      <h1 style="font-size:150px;line-height:.95">Dostępne <em>terminy</em> zleceń</h1>
      <p style="margin-top:56px;font:500 46px/1.3 var(--f-text);color:rgba(246,243,236,.86)">Strony i narzędzia online dla lokalnych firm usługowych: projekt, kod i publikacja.</p>`)}
    ${abs('left:var(--pad);right:var(--pad);bottom:250px', `<p style="font:500 40px/1.2 var(--f-text);color:rgba(246,243,236,.86)">Napisz:</p><p style="margin-top:12px;font:600 62px/1.1 var(--f-display);color:var(--sand);letter-spacing:-.01em">${esc(contact.email)}</p>`)}
  `);
}

/* E — grafiki wartości */
export function E_value(n) {
  if (n === 1) {
    const p = byShot('AMBRA-RESTAURACJA');
    return shell('post', 'cv--wine', `
      <i class="ring" style="width:1000px;height:1000px;right:-420px;top:200px;color:var(--ivory)"></i>
      ${abs('left:var(--pad);right:var(--pad);top:64px', brand)}
      <h1 style="position:absolute;left:var(--pad);top:230px;width:480px;font-size:100px">Najpierw <em>telefon</em></h1>
      <p style="position:absolute;left:var(--pad);top:700px;width:420px;font:500 42px/1.35 var(--f-text);color:rgba(246,243,236,.9)">Każdą stronę zaczynam od widoku na telefonie, bo stamtąd przychodzi większość klientów.</p>
      ${abs('right:40px;top:200px;transform:rotate(3deg)', phone(p, 450))}
      ${abs('left:var(--pad);bottom:72px;font:500 32px/1.2 var(--f-text);color:rgba(246,243,236,.8)', 'Na zdjęciu: AMBRA, projekt autorski')}`);
  }
  if (n === 2) {
    const steps = [['Projekt', 'układ, typografia, identyfikacja'], ['Kod', 'HTML, CSS, JavaScript'], ['Publikacja', 'strona działa online']];
    return shell('post', 'cv--ivory', `
      <i class="ring" style="width:900px;height:900px;right:-420px;top:-340px;color:var(--green)"></i>
      ${abs('left:var(--pad);right:var(--pad);top:64px;color:var(--green)', brand)}
      <h1 style="position:absolute;left:var(--pad);top:210px;font-size:112px;color:var(--green)">Projekt <em>+</em> kod <em>+</em> publikacja</h1>
      <ol style="position:absolute;left:var(--pad);right:var(--pad);top:560px;list-style:none;padding:0;color:var(--green)">${steps.map(([a, b], i) => `<li style="display:flex;align-items:baseline;gap:32px;padding:34px 0;border-top:3px solid var(--green)"><span style="font:400 56px/1 var(--f-serif);font-style:italic;color:var(--wine);width:70px">0${i + 1}</span><span style="font:600 64px/1 var(--f-display);width:370px">${a}</span><span style="font:500 36px/1.25 var(--f-text);color:var(--ink-2)">${b}</span></li>`).join('')}</ol>
      ${abs('left:var(--pad);right:var(--pad);bottom:72px;font:700 36px/1.2 var(--f-text);color:var(--green)', 'Od pomysłu po działającą stronę, bez przerw po drodze')}`);
  }
  const four = ['salonpieknoscinikola', 'AMBRA-RESTAURACJA', 'PORCELANA-KLINIKA', 'SYGNATURA-KANCELARIA'].map(byShot);
  const lab = ['Salon', 'Restauracja', 'Klinika', 'Kancelaria'];
  return shell('post', '', `${rings()}
    ${abs('left:var(--pad);right:var(--pad);top:64px', brand)}
    <h1 style="position:absolute;left:var(--pad);top:190px;font-size:116px;width:936px">Strony dla <em>lokalnych</em> firm</h1>
    ${four.map((p, i) => abs(`left:${36 + i * 250}px;top:${470 + (i % 2 ? 0 : 50)}px;transform:rotate(${[-3, 2, -2, 3][i]}deg)`, phone(p, 262))).join('')}
    ${abs('left:var(--pad);right:var(--pad);bottom:72px', `<div class="tags">${lab.map(l => `<span class="tag">${l}</span>`).join('')}</div><p style="margin-top:22px;font:500 30px/1.25 var(--f-text);color:rgba(246,243,236,.8)">Salon Nikola: realizacja dla klienta. Pozostałe: projekty autorskie.</p>`)}`);
}
