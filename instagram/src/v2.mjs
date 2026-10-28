// Szablony v2: osobny motyw kolorystyczny i kilka różnych układów dla każdego projektu.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { projects, byShot, slug, FORMATS, contact, isClient, place } from './templates.mjs';
import { themes } from './themes.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const S = '../../../shots/';
const A = '../../../assets/';
export { projects, slug, themes };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- pomocnicze ---------- */
const jpgSize = f => {
  const b = fs.readFileSync(f);
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1];
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + b.readUInt16BE(i + 2);
  }
  return { w: 1440, h: 900 };
};
const has = n => fs.existsSync(path.join(root, 'shots', n + '.jpg'));
const ratio = n => { const s = jpgSize(path.join(root, 'shots', n + '.jpg')); return s.h / s.w; };
const blank = p => p.shot === 'HORYZONT-NIERUCHOMOSCI';
const dFull = p => (!blank(p) && has(p.shot + '-full') ? p.shot + '-full' : p.shot);
const mFull = p => (!blank(p) && has(p.shot + '-m-full') ? p.shot + '-m-full' : p.phones ? p.phones[1] : p.shot + '-m');
const mTop = p => (p.phones ? p.phones[0] : p.shot + '-m');

const inverse = t => ({ ...t, bg: t.ac, bg2: t.ac, fg: t.on, ac: t.bg, on: t.fg, soft: t.bg2 });
const vars = t => `--bg:${t.bg};--bg2:${t.bg2};--fg:${t.fg};--ac:${t.ac};--ac2:${t.ac2};--on:${t.on};--soft:${t.soft}`;
const th = p => themes[p.shot];

const lum = hex => { const c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
function shell(fmt, t, body, css = '') {
  const { w, h } = FORMATS[fmt];
  return `<!doctype html><html lang="pl" style="${vars(t)}"><head><meta charset="utf-8">
<link rel="stylesheet" href="../fonts.css"><link rel="stylesheet" href="../tokens.css"><link rel="stylesheet" href="../v2.css">
<style>:root{--w:${w}px;--h:${h}px}${css}</style></head><body><div class="cv2" ${lum(t.bg) > 0.55 ? 'data-light' : ''} style="${vars(t)}">${body}</div></body></html>`;
}

const CW = { caps: 0.64, sans: 0.55, serif: 0.5 };
const wrapCount = (text, per) => {
  let lines = 1, cur = 0;
  for (const w of text.split(' ')) {
    if (!cur) cur = w.length;
    else if (cur + 1 + w.length <= per) cur += 1 + w.length;
    else { lines++; cur = w.length; }
  }
  return lines;
};
const fitBox = (text, mode, width, maxH, max = 200, min = 48, lh = 1.0) => {
  const up = mode === 'caps' || text === text.toUpperCase();
  const cw = up ? 0.7 : CW[mode], longest = Math.max(...text.split(' ').map(w => w.length));
  for (let s = max; s >= min; s -= 2) {
    if (longest * s * cw > width) continue;
    if (wrapCount(text, Math.floor(width / (s * cw))) * s * lh <= maxH) return s;
  }
  return min;
};
const cased = (t, text) => (t.mode === 'caps' ? text.toUpperCase() : text);
const hd = (t, text, size, css = '', tag = 'h1') =>
  `<${tag} class="hd hd--${t.mode}" style="font-size:${size}px;${css}">${esc(cased(t, text)).replace(/(^|\s)([IiWwZzOoUuAa])\s/g, '$1$2\u00a0')}</${tag}>`;
const abs = (css, inner) => `<div class="abs" style="${css}">${inner}</div>`;
const tagsHtml = (p, cls = '') => p.tags.map(x => `<span class="chip ${cls}">${esc(x)}</span>`).join('');
const sentences = p => p.desc.split(/(?<=[.!?])\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ0-9„"])/);
const city = p => p.category.split(' · ').slice(1).join(' · ');
const bdg = p => `<span class="bdg ${isClient(p) ? 'bdg--client' : 'bdg--own'}">${esc(p.kind)}</span>`;
const brand = `<div class="brand2"><img src="${A}mark.svg" width="64" height="64" alt="">PBDesign</div>`;
const head = (p, top = 56) => abs(`left:72px;right:72px;top:${top}px;display:flex;justify-content:space-between;align-items:center`, brand + bdg(p));
const arrowR = `<svg width="64" height="28" viewBox="0 0 64 28" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14h56M47 3l12 11-12 11"/></svg>`;

let sid = 0;
const stamp = (text, size, css, bg = 'var(--ac)', fg = 'var(--on)') => {
  const id = 'c' + ++sid;
  return `<div class="abs" style="${css};width:${size}px;height:${size}px"><svg width="${size}" height="${size}" viewBox="0 0 200 200"><circle cx="100" cy="100" r="99" fill="${bg}"/><defs><path id="${id}" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"/></defs><text font-family="Satoshi" font-weight="700" font-size="21" fill="${fg}"><textPath href="#${id}" textLength="462" lengthAdjust="spacing">${text}</textPath></text><path d="M82 118l36-36M92 82h26v26" stroke="${fg}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
};
const band = (text, css, size = 70, h = 130) =>
  `<div class="band" data-deco style="${css};height:${h}px">${Array.from({ length: 6 }, () => `<span style="font-size:${size}px">${esc(text)}</span><i></i>`).join('')}</div>`;
const swoosh = (css, color = 'var(--ac)', w = 190) => `<svg class="abs" style="${css}" width="${w}" viewBox="0 0 740 440" fill="none" stroke="${color}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"><path d="M40 380C120 120 380 40 640 150"/><path d="M540 70l110 84-132 40"/></svg>`;
const glow = (css, color = 'var(--ac)', o = 0.5) => `<i class="glow" style="${css};background:${color};opacity:${o}"></i>`;

const phoneX = (w, shot, pos = 'top', extra = '') =>
  `<div class="phone" style="--pw:${w}px;${extra}"><div class="phone__screen"><img src="${S}${shot}.jpg" style="object-position:${pos}" alt=""></div></div>`;
const laptopX = (w, shot, pos = 'top', extra = '') =>
  `<div class="laptop" style="--lw:${w}px;${extra}"><div class="laptop__lid"><div class="laptop__screen"><img src="${S}${shot}.jpg" style="object-position:${pos}" alt=""></div></div><div class="laptop__base"></div></div>`;
const bw = (p, w, shot, pos = 'top', extra = '') =>
  `<div class="bw" style="--bwid:${w}px;${extra}"><div class="bw__bar"><i></i><i></i><i></i><b>${esc(new URL(p.url).host)}</b></div><div class="bw__body"><img src="${S}${shot}.jpg" style="object-position:${pos}" alt=""></div></div>`;
const lens = (shot, size, fx, fy, z, css, W0 = 936) => {
  const r = ratio(shot), inner = size - 24, W = W0 * z;
  return `<div class="lens" style="width:${size}px;height:${size}px;${css}"><img src="${S}${shot}.jpg" style="width:${W}px;left:${inner / 2 - fx * W}px;top:${inner / 2 - fy * W * r}px" alt=""></div>`;
};
const ring = (x, y, d) => `<i class="abs" data-deco style="z-index:3;left:${x - d / 2}px;top:${y - d / 2}px;width:${d}px;height:${d}px;border-radius:50%;border:5px dashed var(--ac)"></i>`;

/* =====================  POSTY 4:5 / kwadrat  ===================== */
export const POST_NAMES = ['plakat', 'pasek', 'przegladarka', 'trio', 'zoom', 'kolaz'];

function P_plakat(p, fmt = 'post') {
  const t = th(p), sq = fmt === 'square';
  const hookW = sq ? 470 : 500, hs = fitBox(t.hook, t.mode, hookW, sq ? 360 : 500, sq ? 96 : 120, 56);
  return shell(fmt, t, `
    ${glow(`width:${sq ? 600 : 760}px;height:${sq ? 600 : 760}px;right:-220px;top:${sq ? 260 : 380}px`, 'var(--ac)', 0.4)}
    ${head(p)}
    ${abs(`left:72px;top:${sq ? 170 : 190}px;width:${hookW + 40}px`, `<p class="kick">${esc(place(p))}</p>`)}
    ${abs(`left:72px;top:${sq ? 280 : 300}px;width:${hookW}px`, hd(t, t.hook, hs))}
    ${abs(`right:${sq ? -40 : -80}px;top:${sq ? 400 : 590}px;transform:rotate(7deg)`, phoneX(sq ? 400 : 540, mTop(p)))}
    ${abs(`left:${sq ? -130 : -170}px;top:${sq ? 700 : 980}px;transform:perspective(1800px) rotateY(24deg) rotateX(5deg) rotate(-3deg)`, laptopX(sq ? 600 : 800, p.shot))}
    ${stamp(isClient(p) ? 'NOWA REALIZACJA • NOWA REALIZACJA • ' : 'NOWY PROJEKT • NOWY PROJEKT • NOWY PROJEKT • ', sq ? 190 : 230, `right:${sq ? 50 : 60}px;top:${sq ? 150 : 150}px;transform:rotate(12deg);z-index:6`)}
    ${sq ? '' : abs('left:72px;top:830px;width:560px', `<div class="row">${tagsHtml(p, 'chip--line')}</div>`)}
  `);
}

function P_pasek(p) {
  const t = th(p), ts = fitBox(t.short.length > 11 ? p.title : t.short, t.mode, 936, 200, 230, 90);
  const ttl = t.short.length > 11 ? p.title : t.short;
  return shell('post', t, `
    ${glow('width:700px;height:700px;left:-200px;top:700px', 'var(--ac)', 0.25)}
    ${head(p)}
    ${abs('left:72px;top:170px;width:936px', hd(t, ttl, ts) + `<p style="margin-top:24px;font:400 44px/1.2 var(--f-serif);font-style:italic;color:var(--ac)">${esc(place(p))}</p>`)}
    ${band(t.hook, 'top:505px;transform:rotate(-4deg);z-index:1', 66, 124)}
    ${abs('left:90px;top:640px;transform:rotate(-3deg);z-index:2', laptopX(860, p.shot))}
    ${abs('right:46px;top:830px;transform:rotate(6deg);z-index:3', phoneX(310, mFull(p), '50% 30%'))}
    ${abs('left:72px;bottom:70px;width:600px;z-index:4', `<div class="row">${tagsHtml(p)}</div>`)}
  `);
}

function P_przegladarka(p) {
  const t = th(p), hs = fitBox(t.hook, t.mode, 936, 300, 100, 56);
  const arrowRot = (css, rot, flip = false) => swoosh(`${css};transform:rotate(${rot}deg) ${flip ? 'scaleX(-1)' : ''};z-index:6`, 'var(--ac)', 150);
  return shell('post', t, `
    ${glow('width:800px;height:800px;right:-300px;top:-200px', 'var(--ac)', 0.3)}
    ${head(p)}
    ${abs('left:72px;top:170px;width:936px', hd(t, t.hook, hs))}
    ${abs('left:100px;top:540px;transform:rotate(-2deg);z-index:2', bw(p, 880, p.shot))}
    ${abs('left:40px;top:470px;transform:rotate(-6deg);z-index:7', `<span class="chip" style="font-size:38px;padding:20px 36px">${esc(p.tags[0])}</span>`)}
    ${abs('right:36px;top:790px;transform:rotate(5deg);z-index:7', `<span class="chip chip--soft" style="font-size:38px;padding:20px 36px;box-shadow:0 0 0 4px var(--ac) inset">${esc(p.tags[1] || p.tags[0])}</span>`)}
    ${abs('left:70px;top:1130px;transform:rotate(-3deg);z-index:7', `<span class="chip" style="font-size:38px;padding:20px 36px;background:var(--fg);color:var(--bg)">${esc(p.tags[2] || t.sub)}</span>`)}
    ${abs('left:72px;right:72px;bottom:64px;display:flex;justify-content:space-between;align-items:center', `<span style="font:400 44px/1.2 var(--f-serif);font-style:italic;color:var(--ac)">${esc(place(p))}</span><span style="display:flex;align-items:center;gap:16px;font:700 38px/1 var(--f-text);white-space:nowrap">Link w bio ${arrowR}</span>`)}
  `);
}

function P_trio(p) {
  const t = th(p), ttl = t.short.length > 11 ? p.title : t.short, ts = fitBox(ttl, t.mode, 936, 220, 190, 80), hs = fitBox(t.hook, t.mode, 936, 130, 60, 44);
  return shell('post', t, `
    <i class="glow" style="width:1000px;height:1000px;left:40px;top:420px;background:radial-gradient(circle,var(--ac) 0%,transparent 65%);opacity:.5;filter:none"></i>
    ${head(p)}
    ${abs('left:72px;top:160px;width:936px', hd(t, ttl, ts) + hd(t, t.hook, hs, 'color:var(--ac);margin-top:22px', 'p'))}
    <div class="abs" style="left:0;top:560px;width:1080px;height:800px;perspective:2200px">
      ${abs('left:150px;top:40px;transform:rotateY(-16deg) rotateX(4deg);transform-origin:center', laptopX(790, p.shot))}
      ${abs('left:30px;top:330px;transform:rotateY(16deg) rotate(-4deg);z-index:3', phoneX(310, mTop(p)))}
      ${abs('right:30px;top:380px;transform:rotateY(-18deg) rotate(4deg);z-index:3', phoneX(300, mFull(p), '50% 38%'))}
    </div>
    
  `);
}

function P_zoom(p) {
  const t = th(p), hs = fitBox(t.hook, t.mode, 936, 220, 92, 56);
  const bx = 72, by = 410, bwid = 936, bodyTop = by + bwid * 0.06;
  const z = 2.4, lsz = 500;
  return shell('post', t, `
    ${head(p)}
    ${abs('left:72px;top:170px;width:936px', hd(t, t.hook, hs))}
    ${abs(`left:${bx}px;top:${by}px;z-index:1`, bw(p, bwid, p.shot))}
    ${ring(bx + t.fx * bwid, bodyTop + t.fy * bwid * 0.625, lsz / z)}
    ${lens(p.shot, lsz, t.fx, t.fy, z, 'right:54px;top:770px;z-index:5')}
    ${abs('left:72px;top:1060px;width:440px;z-index:5', `<div class="row">${p.tags.slice(0, 2).map(x => `<span class="chip chip--line">${esc(x)}</span>`).join('')}</div><p style="margin-top:22px;font:400 34px/1.2 var(--f-serif);font-style:italic;color:var(--ac)">${esc(place(p))}</p>`)}
  `);
}

function P_kolaz(p) {
  const t = inverse(th(p)), o = th(p), ttl = o.short.length > 11 ? p.title : o.short;
  const ts = fitBox(ttl, o.mode, 936, 330, 230, 90), hs = 0;
  const stroke = o.mode === 'serif' ? '' : 'color:transparent;-webkit-text-stroke:3px var(--fg);';
  return shell('post', t, `
    ${head(p)}
    ${abs('left:72px;top:150px;width:936px', hd(o, ttl, ts, stroke))}
    <div class="card" style="left:50px;top:480px;width:600px;transform:rotate(-5deg);z-index:2"><img src="${S}${p.shot}.jpg" alt=""></div>
    <div class="tape" style="left:220px;top:462px;transform:rotate(-12deg);z-index:6"></div>
    <div class="card" style="right:46px;top:440px;width:400px;transform:rotate(6deg);z-index:1"><div style="aspect-ratio:1/1;overflow:hidden;border-radius:4px"><img src="${S}${dFull(p)}.jpg" style="object-fit:cover;object-position:50% 30%;height:100%" alt=""></div></div>
    <div class="tape" style="right:190px;top:420px;transform:rotate(8deg);z-index:6"></div>
    ${abs('left:70px;top:900px;transform:rotate(-4deg);z-index:3', phoneX(310, mTop(p)))}
    ${stamp(isClient(p) ? 'REALIZACJA DLA KLIENTA • REALIZACJA • ' : 'PROJEKT AUTORSKI • PROJEKT AUTORSKI • ', 210, 'right:70px;top:890px;transform:rotate(-10deg);z-index:6', 'var(--fg)', 'var(--bg)')}
    ${abs('left:440px;right:72px;bottom:64px;z-index:6;text-align:right', hd(o, o.hook, fitBox(o.hook, o.mode, 568, 220, 64, 44), 'color:var(--fg)', 'p'))}
  `);
}

export const POSTS = { plakat: P_plakat, pasek: P_pasek, przegladarka: P_przegladarka, trio: P_trio, zoom: P_zoom, kolaz: P_kolaz };
export const postsFor = i => [0, 1, 2, 3].map(k => POST_NAMES[(i + k) % 6]);

/* =====================  KARUZELE  ===================== */
const slideHead = (p, n, total, t) => abs('left:72px;right:72px;top:56px;display:flex;justify-content:space-between;align-items:center;z-index:20', `<div class="brand2">${`<img src="${A}mark.svg" width="56" height="56" alt="">`}<span style="font-size:34px">${esc(p.title.length > 16 ? t.short : p.title)}</span></div><span class="chip chip--line" style="padding:14px 26px;font-size:32px">${n} / ${total}</span>`);

function cta(p, t, css = '') {
  return abs(`left:72px;right:72px;${css}`, `<h2 class="hd hd--${t.mode === 'caps' ? 'sans' : t.mode}" style="font-size:112px;line-height:1">${esc('Chcesz podobną stronę?')}</h2>
    <p style="margin-top:48px;font:500 44px/1.3 var(--f-text);opacity:.9">Napisz:</p>
    <p style="margin-top:12px;font:600 ${contact.email.length > 22 ? 62 : 72}px/1.1 var(--f-display);color:var(--ac)">${esc(contact.email)}</p>
    <p style="margin-top:36px;font:600 54px/1.1 var(--f-display)">${esc(contact.phone)}</p>
    <p style="margin-top:36px;font:700 40px/1.25 var(--f-text);display:flex;align-items:center;gap:18px">Zobacz projekt na żywo: link w bio</p>`);
}

const leadOf = p => {
  const s = sentences(p);
  const rest = s.slice(1).join(' ');
  return { lead: s[0], rest: rest.length <= 220 ? rest : s[1] && s[1].length <= 220 ? s[1] : '' };
};

/* S1 — panorama: 5 slajdów to jedna ciągła grafika (przesuwając, widz widzi ją jako całość) */
function panoSlide(p, n) {
  const t = th(p), W = 5400, off = -(n - 1) * 1080;
  const ttl = t.short.length > 11 ? p.title : t.short;
  const ts = fitBox(ttl, t.mode, 936, 400, 300, 100);
  const { lead } = leadOf(p), ls = fitBox(lead, t.mode === 'caps' ? 'sans' : t.mode, 840, 470, 84, 46);
  const tg = p.tags.slice(0, 3);
  const inv = inverse(t);
  const pano = `
    <div class="abs" style="left:4300px;top:0;width:1100px;height:1350px;background:var(--ac);clip-path:polygon(110px 0,100% 0,100% 100%,0 100%)"></div>
    ${glow('width:900px;height:900px;left:-250px;top:640px', 'var(--ac)', 0.28)}
    ${glow('width:900px;height:900px;left:2100px;top:-300px', 'var(--ac)', 0.2)}
    ${abs('left:72px;top:168px;width:900px', `<p class="kick">${esc(place(p))}</p>`)}
    ${abs('left:72px;top:230px;width:936px', hd(t, ttl, ts))}
    ${abs('left:700px;top:700px;transform:rotate(-6deg);z-index:3', phoneX(420, mTop(p)))}
    ${abs('left:72px;top:1210px;display:flex;align-items:center;gap:20px;font:700 40px/1 var(--f-text);color:var(--ac)', `Przesuń ${arrowR}`)}
    ${abs('left:1152px;top:200px;width:840px', `<p class="kick" style="margin-bottom:26px">O projekcie</p>${hd(t.mode === 'caps' ? { ...t, mode: 'sans' } : t, lead, ls, '', 'h2')}`)}
    ${abs('left:1250px;top:800px;transform:rotate(-2deg);z-index:2', laptopX(1500, p.shot))}
    ${abs('left:2232px;top:200px;width:900px', `<p class="kick" style="margin-bottom:30px">Kluczowe cechy</p>${tg.map((x, i) => `<div style="display:flex;align-items:baseline;gap:30px;padding:22px 0;border-top:3px solid currentColor"><span style="font:400 56px/1 var(--f-serif);font-style:italic;color:var(--ac);width:80px">0${i + 1}</span><span class="hd hd--${t.mode === 'caps' ? 'sans' : t.mode}" style="font-size:84px;line-height:1">${esc(x)}</span></div>`).join('')}`)}
    ${abs('left:3312px;top:200px;width:900px', `<p class="kick" style="margin-bottom:20px">Wersja mobilna</p>${hd(t.mode === 'caps' ? { ...t, mode: 'sans' } : t, 'Najpierw telefon', 100, '', 'h2')}`)}
    ${abs('left:3265px;top:600px;transform:rotate(-5deg)', phoneX(380, mTop(p)))}
    ${abs('left:3590px;top:700px;transform:rotate(2deg)', phoneX(380, mFull(p), '50% 38%'))}
    ${abs('left:3915px;top:560px;transform:rotate(6deg);z-index:2', phoneX(380, mFull(p), '50% 100%'))}
    ${abs('left:4452px;top:230px;width:870px;color:var(--on);z-index:3', `<h2 class="hd hd--${t.mode === 'caps' ? 'sans' : t.mode}" style="font-size:112px;line-height:1">Chcesz podobną stronę?</h2>
      <p style="margin-top:44px;font:500 44px/1.3 var(--f-text)">Napisz:</p>
      <p style="margin-top:12px;font:700 ${contact.email.length > 22 ? 58 : 66}px/1.1 var(--f-display)">${esc(contact.email)}</p>
      <p style="margin-top:30px;font:600 54px/1.1 var(--f-display)">${esc(contact.phone)}</p>
      <p style="margin-top:50px;font:700 40px/1.25 var(--f-text)">Zobacz projekt na żywo: link w bio</p>`)}
    ${stamp('DZIĘKUJĘ • DZIĘKUJĘ • DZIĘKUJĘ • ', 230, 'left:4800px;top:1000px;transform:rotate(-10deg);z-index:3', 'var(--on)', 'var(--ac)')}
  `;
  const top = n === 1
    ? head(p)
    : abs('left:72px;right:72px;top:56px;display:flex;justify-content:space-between;align-items:center;z-index:20' + (n === 5 ? ';color:var(--on)' : ''), `<div class="brand2"><img src="${A}mark.svg" width="56" height="56" alt=""><span style="font-size:34px">${esc(p.title.length > 16 ? t.short : p.title)}</span></div><span class="chip ${n === 5 ? '' : 'chip--line'}" style="padding:14px 26px;font-size:32px${n === 5 ? ';background:var(--on);color:var(--ac)' : ''}">${n} / 5</span>`);
  return shell('post', t, `<div class="abs" data-deco style="left:${off}px;top:0;width:${W}px;height:1350px">${pano}</div>${top}`);
}

/* S2 — przewijanie telefonu: kolejne ekrany strony */
function scrollSlide(p, n) {
  const t = th(p), inv = inverse(t), total = 6;
  const ttl = t.short.length > 11 ? p.title : t.short;
  if (n === 1) {
    const ts = fitBox(ttl, t.mode, 600, 520, 190, 80);
    return shell('post', t, `
      ${glow('width:900px;height:900px;right:-300px;top:380px', 'var(--ac)', 0.45)}
      ${head(p)}
      ${abs('left:72px;top:190px;width:620px', `<p class="kick" style="margin-bottom:24px">${esc(t.sub)}</p>${hd(t, ttl, ts)}<p style="margin-top:34px;font:400 44px/1.2 var(--f-serif);font-style:italic;color:var(--ac)">${esc(place(p))}</p>`)}
      ${abs('right:-40px;top:700px;transform:rotate(-7deg)', phoneX(540, mTop(p)))}
      ${stamp('PRZESUŃ • PRZESUŃ • PRZESUŃ • PRZESUŃ • ', 220, 'left:72px;top:1030px;transform:rotate(-10deg);z-index:6')}
    `);
  }
  if (n === 2) {
    const { lead, rest } = leadOf(p), ls = fitBox(lead, t.mode === 'caps' ? 'sans' : t.mode, 936, 620, 96, 52);
    return shell('post', inv, `
      ${slideHead(p, n, total, inv)}
      ${abs('left:72px;top:200px;width:936px', `<p class="kick">O projekcie</p>`)}
      ${abs('left:72px;top:290px;width:936px', hd(inv.mode === 'caps' ? { ...inv, mode: 'sans' } : inv, lead, ls, '', 'h2'))}
      ${rest ? abs('left:72px;bottom:96px;width:936px', `<p class="lead">${esc(rest)}</p>`) : ''}
    `);
  }
  if (n === 6) {
    return shell('post', inv, `
      ${slideHead(p, n, total, inv)}
      ${stamp('NAPISZ DO MNIE • NAPISZ DO MNIE • ', 240, 'right:70px;top:150px;transform:rotate(12deg)', 'var(--fg)', 'var(--bg)')}
      ${cta(p, inv, 'top:420px')}
    `);
  }
  const i = n - 3, labels = ['Początek strony', 'Środek strony', 'Koniec strony'], poses = ['50% 0%', '50% 40%', '50% 100%'];
  const tag = p.tags[i] || p.tags[p.tags.length - 1];
  const shot = p.phones ? p.phones[i] : i === 0 ? mTop(p) : mFull(p);
  const pos = p.phones ? 'top' : poses[i];
  const vis = p.phones ? 1 / 3 : 0.222, thumbTop = p.phones ? i * (1 / 3) : [0, 0.4 * (1 - vis), 1 - vis][i];
  return shell('post', t, `
    ${glow('width:800px;height:800px;left:200px;top:500px', 'var(--ac)', 0.28)}
    ${slideHead(p, n, total, t)}
    ${abs('left:72px;top:180px;width:936px', `<p class="kick">Fragment strony ${i + 1} z 3</p>${hd(t, labels[i], fitBox(labels[i], t.mode, 936, 110, 104, 56), 'margin-top:14px;white-space:nowrap', 'h2')}`)}
    <div class="track" style="left:72px;top:440px;height:820px"><i style="top:${thumbTop * 820}px;height:${vis * 820}px"></i></div>
    ${abs('left:130px;top:440px;width:300px', `<p class="kick" style="font-size:30px;margin-bottom:18px">Kluczowe</p><span class="chip" style="white-space:normal;line-height:1.1;font-size:40px;padding:22px 30px">${esc(tag)}</span>`)}
    ${abs('left:60px;bottom:40px;font:600 300px/1 var(--f-display);color:var(--ac);opacity:.22', '0' + (i + 1))}
    ${abs('right:60px;top:380px;transform:rotate(' + [4, -3, 4][i] + 'deg);z-index:3', phoneX(540, shot, pos))}
  `);
}

/* S3 — zbliżenia i kolaż: duże kontrastowe slajdy */
function detailSlide(p, n) {
  const t = th(p), inv = inverse(t), total = 6, o = t;
  const ttl = t.short.length > 11 ? p.title : t.short;
  if (n === 1) {
    const ts = fitBox(ttl, t.mode, 936, 380, 250, 90);
    return shell('post', inv, `
      ${head(p)}
      ${abs('left:72px;top:170px;width:936px', hd(o, ttl, ts, o.mode === 'serif' ? '' : 'color:transparent;-webkit-text-stroke:3px var(--fg)') + `<p class="kick" style="color:var(--fg);margin-top:24px">${esc(place(p))}</p>`)}
      ${abs('left:-60px;top:620px;transform:perspective(2000px) rotateY(14deg) rotateX(4deg) rotate(-3deg);z-index:3', laptopX(1000, p.shot))}
      ${abs('right:56px;top:880px;transform:rotate(7deg);z-index:4', phoneX(300, mTop(p)))}
      ${stamp('PRZESUŃ • PRZESUŃ • PRZESUŃ • PRZESUŃ • ', 210, 'right:80px;top:380px;transform:rotate(12deg);z-index:6', 'var(--fg)', 'var(--bg)')}
    `);
  }
  if (n === 2) {
    const { lead, rest } = leadOf(p), ls = fitBox(lead, t.mode === 'caps' ? 'sans' : t.mode, 936, 640, 98, 52);
    return shell('post', t, `
      ${glow('width:800px;height:800px;right:-300px;bottom:-300px', 'var(--ac)', 0.35)}
      ${slideHead(p, n, total, t)}
      ${abs('left:72px;top:200px', `<p class="kick">O projekcie</p>`)}
      ${abs('left:72px;top:290px;width:936px', hd(t.mode === 'caps' ? { ...t, mode: 'sans' } : t, lead, ls, '', 'h2'))}
      ${rest ? abs('left:72px;bottom:96px;width:936px', `<p class="lead">${esc(rest)}</p>`) : ''}
    `);
  }
  if (n === 3 || n === 4) {
    const a = n === 3;
    const shot = a ? p.shot : (has(p.shot + '-full') ? p.shot + '-full' : p.shot);
    const fx = a ? t.fx : (has(p.shot + '-full') ? 0.5 : Math.min(0.8, t.fx + 0.4)), fy = a ? t.fy : (has(p.shot + '-full') ? 0.3 : Math.min(0.8, t.fy + 0.3));
    return shell('post', a ? inv : t, `
      ${slideHead(p, n, total, a ? inv : t)}
      ${abs('left:72px;top:180px;width:936px', `<p class="kick" style="${a ? 'color:var(--fg)' : ''}">Zbliżenie ${a ? '1' : '2'} z 2</p>${hd(a ? inv : t, a ? 'Detale, których nie widać z daleka' : 'Dalszy ciąg strony', 76, 'margin-top:14px', 'h2')}`)}
      ${lens(shot, 860, fx, fy, 2.6, 'left:110px;top:430px;border-width:16px', 936)}
      ${abs('left:72px;bottom:64px;display:flex;gap:14px', `<span class="chip chip--line">${esc(p.title.length > 18 ? t.short : p.title)}</span>`)}
    `);
  }
  if (n === 5) {
    const tg = p.tags.slice(0, 3);
    return shell('post', t, `
      ${glow('width:800px;height:800px;right:-300px;top:200px', 'var(--ac)', 0.4)}
      ${slideHead(p, n, total, t)}
      ${abs('left:72px;top:180px;width:936px', `<p class="kick">Wersja mobilna</p>${hd(t.mode === 'caps' ? t : t, 'Najpierw telefon', 92, 'margin-top:14px', 'h2')}`)}
      ${abs('left:72px;top:520px;width:420px', tg.map((x, i) => `<div style="padding:20px 0;border-top:3px solid currentColor"><span style="font:400 48px/1 var(--f-serif);font-style:italic;color:var(--ac)">0${i + 1}</span><div class="hd hd--${t.mode === 'caps' ? 'sans' : t.mode}" style="font-size:${x.length > 12 ? 52 : 64}px;line-height:1.05;margin-top:8px">${esc(x)}</div></div>`).join(''))}
      ${abs('left:520px;top:380px;transform:rotate(-4deg);z-index:2', phoneX(300, mTop(p)))}
      ${abs('left:740px;top:500px;transform:rotate(5deg)', phoneX(300, mFull(p), '50% 40%'))}
    `);
  }
  return shell('post', inv, `
    ${slideHead(p, n, total, inv)}
    ${stamp('NAPISZ DO MNIE • NAPISZ DO MNIE • ', 240, 'right:70px;top:150px;transform:rotate(12deg)', 'var(--fg)', 'var(--bg)')}
    ${cta(p, inv, 'top:420px')}
  `);
}

export const CAROUSELS = [
  { name: 'panorama', count: 5, fn: panoSlide },
  { name: 'przewijanie', count: 6, fn: scrollSlide },
  { name: 'zblizenia', count: 6, fn: detailSlide },
];

/* =====================  STORIES (1080×1920, bezpieczne pola 250 px)  ===================== */
function T_plakat(p) {
  const t = th(p), ttl = t.short.length > 11 ? p.title : t.short, ts = fitBox(ttl, t.mode, 936, 260, 260, 90);
  return shell('story', t, `
    ${glow('width:1000px;height:1000px;left:40px;top:760px', 'var(--ac)', 0.4)}
    ${abs('left:72px;right:72px;top:268px;display:flex;justify-content:space-between;align-items:center;z-index:6', `<span class="chip" style="transform:rotate(-3deg);font-size:36px">${isClient(p) ? 'Nowa realizacja' : 'Nowy projekt'}</span>${bdg(p)}`)}
    ${abs('left:72px;top:420px;width:936px', hd(t, ttl, ts) + `<p style="margin-top:24px;font:400 46px/1.2 var(--f-serif);font-style:italic;color:var(--ac)">${esc(place(p))}</p>`)}
    ${band(t.hook, 'top:1090px;transform:rotate(-9deg);z-index:1', 70, 130)}
    ${abs('left:300px;top:760px;transform:perspective(2000px) rotateY(-12deg) rotate(-5deg);z-index:3', phoneX(470, mTop(p)))}
    ${stamp('ZOBACZ NA ŻYWO • ZOBACZ NA ŻYWO • ZOBACZ • ', 230, 'right:56px;top:1360px;transform:rotate(12deg);z-index:6')}
    ${abs('left:72px;bottom:250px;z-index:6;font:700 40px/1.2 var(--f-text);width:360px', `Link do strony jest w bio`)}
  `);
}
function T_przegladarka(p) {
  const t = th(p), hs = fitBox(t.hook, t.mode, 936, 520, 150, 60);
  return shell('story', t, `
    ${glow('width:900px;height:900px;right:-300px;top:200px', 'var(--ac)', 0.35)}
    ${abs('left:72px;right:72px;top:268px;display:flex;justify-content:space-between;align-items:center', brand + bdg(p))}
    ${abs('left:72px;top:420px;width:936px', `<p class="kick" style="margin-bottom:26px">${esc(place(p))}</p>${hd(t, t.hook, hs)}`)}
    ${abs('left:90px;top:975px;transform:rotate(-3deg);z-index:2', bw(p, 900, p.shot))}
    ${abs('left:40px;top:915px;transform:rotate(-7deg);z-index:6', `<span class="chip" style="font-size:38px;padding:20px 36px">${esc(p.tags[0])}</span>`)}
    ${abs('right:40px;top:1450px;transform:rotate(5deg);z-index:6', `<span class="chip" style="font-size:38px;padding:20px 36px;background:var(--fg);color:var(--bg)">${esc(p.tags[1] || t.sub)}</span>`)}
    ${abs('left:72px;bottom:250px;display:flex;align-items:center;gap:16px;font:700 40px/1 var(--f-text);color:var(--ac)', `Link w bio ${arrowR}`)}
  `);
}
function T_podzial(p) {
  const t = th(p), inv = inverse(t), ttl = t.short.length > 11 ? p.title : t.short, ts = fitBox(ttl, t.mode, 936, 230, 230, 90), hs = fitBox(t.hook, t.mode, 936, 280, 70, 46);
  return shell('story', t, `
    <div class="abs" style="left:0;top:0;width:1080px;height:1060px;background:var(--ac);clip-path:polygon(0 0,100% 0,100% 82%,0 100%)"></div>
    ${abs('left:72px;right:72px;top:268px;display:flex;justify-content:space-between;align-items:center;color:var(--on);z-index:5', brand + `<span class="bdg ${isClient(p) ? '' : 'bdg--own'}" style="${isClient(p) ? 'background:var(--on);color:var(--ac)' : 'color:var(--on)'}">${esc(p.kind)}</span>`)}
    ${abs('left:72px;top:420px;width:936px;color:var(--on);z-index:5', hd(t, ttl, ts) + `<p style="margin-top:24px;font:400 46px/1.2 var(--f-serif);font-style:italic">${esc(place(p))}</p>`)}
    ${abs('right:50px;top:800px;transform:rotate(6deg);z-index:4', phoneX(470, mFull(p), '50% 32%'))}
    ${abs('left:72px;top:1060px;width:450px;z-index:6', hd(t, t.hook, fitBox(t.hook, t.mode, 450, 440, 80, 46), 'color:var(--fg)', 'p'))}
    ${abs('left:72px;top:1490px;width:450px;z-index:6', `<div class="row">${p.tags.slice(0, 2).map(x => `<span class="chip">${esc(x)}</span>`).join('')}</div>`)}
  `);
}
export const STORIES = { plakat: T_plakat, przegladarka: T_przegladarka, podzial: T_podzial };
export const STORY_NAMES = ['plakat', 'przegladarka', 'podzial'];
export const storiesFor = i => [STORY_NAMES[i % 3], STORY_NAMES[(i + 1) % 3]];

/* =====================  GRAFIKI WARTOŚCI / MARKA  ===================== */
const sw = key => themes[key];

export function E_value(n) {
  if (n === 1) {
    const p = byShot('AMBRA-RESTAURACJA'), t = sw('AMBRA-RESTAURACJA');
    return shell('post', t, `
      ${glow('width:1000px;height:1000px;right:-300px;top:300px', 'var(--ac)', 0.4)}
      ${abs('left:72px;right:72px;top:56px', brand)}
      ${abs('left:72px;top:200px;width:440px', hd(t, 'Najpierw telefon', 104))}
      ${abs('left:72px;top:690px;width:420px', `<p class="lead">Każdą stronę zaczynam od widoku na telefonie, bo stamtąd przychodzi większość klientów.</p>`)}
      ${abs('right:-60px;top:240px;transform:rotate(6deg)', phoneX(500, mTop(p)))}
      ${stamp('MOBILE FIRST • MOBILE FIRST • MOBILE FIRST • ', 220, 'left:340px;top:1000px;transform:rotate(-10deg);z-index:5')}
      ${abs('left:72px;bottom:64px;font:500 32px/1.2 var(--f-text);opacity:.8', 'Na zdjęciu: AMBRA, projekt autorski')}
    `);
  }
  if (n === 2) {
    const t = sw('generator-dokumentow-online');
    const steps = [['Projekt', 'układ, typografia, identyfikacja'], ['Kod', 'HTML, CSS, JavaScript'], ['Publikacja', 'strona działa online']];
    return shell('post', t, `
      ${abs('left:72px;right:72px;top:56px', brand)}
      ${abs('left:72px;top:190px;width:936px', hd(t, 'Projekt + kod + publikacja', 118))}
      ${steps.map(([a, b], i) => `<div class="abs" style="left:72px;right:72px;top:${560 + i * 220}px;padding:30px 36px;border-radius:28px;background:${i === 1 ? 'var(--ac)' : 'var(--soft)'};color:${i === 1 ? 'var(--on)' : 'var(--fg)'};display:flex;align-items:center;gap:30px;transform:rotate(${[-1.5, 1.2, -1][i]}deg)"><span style="font:400 72px/1 var(--f-serif);font-style:italic;color:${i === 1 ? 'var(--on)' : 'var(--ac)'}">0${i + 1}</span><span><span style="display:block;font:600 72px/1 var(--f-display)">${a}</span><span style="display:block;margin-top:10px;font:500 36px/1.2 var(--f-text);opacity:.85">${b}</span></span></div>`).join('')}
      ${abs('left:72px;right:72px;bottom:64px;font:700 36px/1.2 var(--f-text)', 'Od pomysłu po działającą stronę, bez przerw po drodze')}
    `);
  }
  const t = sw('TRZASK-PALARNIA');
  const four = ['salonpieknoscinikola', 'AMBRA-RESTAURACJA', 'PORCELANA-KLINIKA', 'SYGNATURA-KANCELARIA'].map(byShot);
  const lab = ['Salon', 'Restauracja', 'Klinika', 'Kancelaria'];
  return shell('post', t, `
    ${four.map((p, i) => glow(`width:420px;height:420px;left:${20 + i * 250}px;top:${620 + (i % 2 ? 0 : 60)}px`, themes[p.shot].ac, 0.55)).join('')}
    ${abs('left:72px;right:72px;top:56px', brand)}
    ${abs('left:72px;top:170px;width:936px', hd(t, 'Strony dla lokalnych firm', 118))}
    ${four.map((p, i) => abs(`left:${30 + i * 250}px;top:${500 + (i % 2 ? 0 : 60)}px;transform:rotate(${[-3, 2, -2, 3][i]}deg);z-index:${i}`, phoneX(260, mTop(p)))).join('')}
    ${abs('left:72px;right:72px;bottom:64px', `<div class="row">${lab.map(l => `<span class="chip">${l}</span>`).join('')}</div><p style="margin-top:20px;font:500 30px/1.25 var(--f-text);opacity:.85">Salon Nikola: realizacja dla klienta. Pozostałe: projekty autorskie.</p>`)}
  `);
}

export function E_mosaic() {
  const t = sw('NURT-CRM');
  const w = 330, cols = [0, 1, 2].map(c => projects.filter((_, i) => i % 3 === c));
  const items = cols.map((list, c) => list.map((p, r) => abs(`left:${40 + c * (w + 22)}px;top:${430 + r * 262 + [-60, 60, -10][c]}px;transform:rotate(${[-2, 1.5, -1.5][c]}deg)`, bw(p, w, p.shot, 'top', 'border-radius:14px'))).join('')).join('');
  return shell('post', t, `
    ${glow('width:900px;height:900px;left:100px;top:300px', 'var(--ac)', 0.25)}
    ${items}
    <div class="abs" data-deco style="left:0;right:0;top:0;height:400px;background:linear-gradient(var(--bg) 70%,transparent);z-index:5"></div>
    <div class="abs" data-deco style="left:0;right:0;bottom:0;height:260px;background:linear-gradient(transparent,var(--bg) 70%);z-index:5"></div>
    ${abs('left:72px;right:72px;top:56px;z-index:6', brand)}
    ${abs('left:72px;top:170px;width:936px;z-index:6', hd(t, 'Strony, narzędzia, aplikacje', 96))}
    ${abs('left:72px;bottom:64px;z-index:6;display:flex;align-items:center;gap:16px;font:700 40px/1 var(--f-text);color:var(--ac)', `Portfolio PBDesign: link w bio ${arrowR}`)}
  `);
}

export function E_palety() {
  const t = sw('miastometr');
  const tiles = projects.map((p, i) => {
    const x = themes[p.shot], c = i % 2, r = Math.floor(i / 2);
    return `<div class="abs" style="left:${72 + c * 480}px;top:${400 + r * 112}px;width:456px;height:98px;border-radius:20px;background:${x.bg === x.bg2 ? x.bg : `linear-gradient(120deg,${x.bg},${x.bg2})`};box-shadow:inset 0 0 0 3px rgba(0,0,0,.08);display:flex;align-items:center;padding:0 24px;gap:18px;color:${x.fg};font:600 40px/1 var(--f-display)"><i style="width:42px;height:42px;border-radius:50%;background:${x.ac};flex:none"></i><span>${esc(x.short)}</span></div>`;
  });
  const i = projects.length, c = i % 2, r = Math.floor(i / 2);
  tiles.push(`<div class="abs" style="left:${72 + c * 480}px;top:${400 + r * 112}px;width:456px;height:98px;border-radius:20px;background:#1F4435;color:#F6F3EC;display:flex;align-items:center;padding:0 24px;gap:18px;font:600 40px/1 var(--f-display)"><i style="width:42px;height:42px;border-radius:50%;background:#E4C99A;flex:none"></i><span>PBDesign</span></div>`);
  return shell('post', t, `
    ${abs('left:72px;right:72px;top:56px', brand)}
    ${abs('left:72px;top:170px;width:936px', hd(t, 'Każda marka ma swój kolor', 108))}
    ${tiles.join('')}
  `);
}

export function D_available() {
  const t = sw('miastometr');
  return shell('story', t, `
    ${glow('width:1100px;height:1100px;left:-300px;top:700px', 'var(--ac)', 0.35)}
    ${abs('left:72px;right:72px;top:268px', brand)}
    ${abs('left:72px;top:480px;width:936px', `<span class="chip" style="transform:rotate(-3deg);margin-bottom:50px;font-size:38px;padding:20px 38px;background:var(--fg);color:var(--bg)">Dostępne zlecenia</span>${hd(t, 'Dostępne terminy zleceń', 150, 'margin-top:44px')}
      <p style="margin-top:50px;font:500 46px/1.3 var(--f-text)">Strony i narzędzia online dla lokalnych firm usługowych: projekt, kod i publikacja.</p>`)}
    ${band('Napisz do mnie', 'top:1180px;transform:rotate(-7deg);z-index:1', 66, 124)}
    ${abs('left:72px;right:72px;bottom:250px', `<p style="font:500 40px/1.2 var(--f-text)">Napisz:</p><p style="margin-top:12px;font:700 62px/1.1 var(--f-display)">${esc(contact.email)}</p>`)}
  `);
}

export { shell, hd, abs, bdg, brand, glow, phoneX, laptopX, bw, th, mTop, mFull, dFull, fitBox, band, stamp, tagsHtml, esc, inverse, leadOf, arrowR, has, ratio, blank, sentences };
