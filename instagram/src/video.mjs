// Wideo 5 s: te same motywy co grafiki, ale z ruchem. Cała animacja to oś czasu Web Animations API,
// którą renderer "przewija" klatka po klatce (window.__seek), więc ruch jest dokładnie powtarzalny i płynny.
import * as V from './v2.mjs';
import { themes } from './themes.mjs';
import { FORMATS } from './templates.mjs';
import { isClient, place } from './templates.mjs';

const { shell, abs, bdg, brand, glow, esc, fitBox, th, mTop, mFull, dFull, has, ratio, blank, inverse, leadOf, tagsHtml } = V;
const S = '../../../shots/';
const A = '../../../assets/';
export const DURATION = 5;
export const E = { out: 'cubic-bezier(.16,1,.3,1)', io: 'cubic-bezier(.65,0,.35,1)', back: 'cubic-bezier(.34,1.56,.64,1)', in: 'cubic-bezier(.7,0,.84,0)', lin: 'linear' };

const css = `
.w{display:inline-block;overflow:hidden;padding:.16em 0 .12em;margin:-.16em 0 -.12em;vertical-align:top}
.c{display:inline-block;will-change:transform}
.sp{display:inline-block;width:.28em}
.cam{position:absolute;inset:0;transform-origin:50% 55%;z-index:2}
.persp{position:absolute;inset:0;perspective:2400px}
.scr{transform-origin:40% 30%;width:100%;height:auto!important;object-fit:initial!important;object-position:initial!important;will-change:transform}
.phone__screen,.bw__body{position:relative}
.endcard{position:absolute;inset:0;background:var(--ac);color:var(--on);z-index:40;clip-path:inset(100% 0 0 0)}
.endcard h2{font-family:var(--f-display);font-weight:600;letter-spacing:-.02em;line-height:1}
.endcard .ln{overflow:hidden;padding:.12em 0;margin:-.12em 0}
.endcard .ln>span{display:block}
.cv2::after{animation:none}
`;

// rozbija tekst na litery w maskach (każde słowo osobno, żeby łamanie wierszy było naturalne)
const split = (text, cls = 'c') => text.split(' ').map(w => `<span class="w">${[...w].map(ch => `<span class="${cls}">${esc(ch)}</span>`).join('')}</span>`).join('<span class="sp"></span>');

const phoneScroll = (p, w, shot, depthScreens = 2.6) => {
  const sw = w * (1 - 0.068), sh = sw * (1688 / 780), imgH = sw * ratio(shot);
  const scroll = Math.max(0, Math.min(imgH - sh, sh * depthScreens));
  const pct = (scroll / imgH) * 100;
  return { html: `<div class="phone" style="--pw:${w}px"><div class="phone__screen"><img class="scr" src="${S}${shot}.jpg" alt=""></div></div>`, pct };
};
const browserScroll = (p, w, shot, depthScreens = 1.5) => {
  const bodyW = w, bodyH = w * 0.625, imgH = bodyW * ratio(shot);
  const scroll = Math.max(0, Math.min(imgH - bodyH, bodyH * depthScreens));
  const pct = (scroll / imgH) * 100;
  return { html: `<div class="bw" style="--bwid:${w}px"><div class="bw__bar"><i></i><i></i><i></i><b>${esc(new URL(p.url).host)}</b></div><div class="bw__body"><img class="scr" src="${S}${shot}.jpg" alt=""></div></div>`, pct };
};

// buduje stronę z osią czasu: tl = [{s, kf, at, dur, ease, st}]
function page(fmt, t, body, tl, extra = '') {
  const html = shell(fmt, t, body, css + extra);
  const script = `<script>
const T=${JSON.stringify(tl)};const anims=[];
for(const t of T){document.querySelectorAll(t.s).forEach((el,i)=>{const a=el.animate(t.kf,{duration:t.dur*1000,delay:(t.at+(t.st||0)*i)*1000,easing:t.ease||'linear',fill:t.fill||'both'});a.pause();anims.push(a)})}
window.__seek=ms=>{for(const a of anims)a.currentTime=ms;return 1};window.__seek(0);
</script>`;
  return html.replace('</body>', script + '</body>');
}

const tx = (x = 0, y = 0, extra = '') => `translate3d(${x}px,${y}px,0) ${extra}`.trim();

/* ======== WIDEO 1: telefon z przewijaną stroną (9:16) ======== */
export function W_telefon(p) {
  const t = th(p), ttl = t.short.length > 11 ? p.title : t.short;
  const ts = fitBox(ttl, t.mode, 936, 190, 210, 80), hs = fitBox(t.hook, t.mode, 936, 250, 108, 54);
  const shot = p.phones ? p.phones[0] : (!blank(p) && has(p.shot + '-m-full') ? p.shot + '-m-full' : p.shot + '-m');
  const pw = 520, ph = phoneScroll(p, pw, shot);
  if (p.phones) ph.html = `<div class="phone" style="--pw:${pw}px"><div class="phone__screen">${p.phones.map((x, i) => `<img class="pimg" src="${S}${x}.jpg" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:${i ? 0 : 1}" alt="">`).join('')}</div></div>`;
  const cased = s => (t.mode === 'caps' ? s.toUpperCase() : s);
  const modeCls = `hd hd--${t.mode}`;
  const tg = p.tags.slice(0, 3);
  const body = `
    <i class="glow" id="g1" style="width:1300px;height:1300px;left:-100px;top:560px;background:radial-gradient(circle,var(--ac) 0%,transparent 62%);opacity:.5;filter:none"></i>
    <div class="band" data-deco id="bnd" style="left:-300px;top:1210px;width:3400px;height:130px;transform:rotate(-8deg);z-index:1"><span style="font-size:70px">${[...Array(10)].map(() => `${esc(cased(t.hook))}<i></i>`).join('')}</span></div>
    ${abs('left:72px;right:72px;top:268px;display:flex;justify-content:space-between;align-items:center;z-index:30', `<span id="hd1">${brand}</span><span id="hd2">${bdg(p)}</span>`)}
    <div class="abs" style="left:72px;top:390px;width:936px;z-index:20;height:300px">
      <div id="ttl" class="${modeCls}" style="font-size:${ts}px;position:absolute;left:0;top:0;width:936px">${split(cased(ttl))}</div>
      <p id="kick" style="position:absolute;left:0;top:${Math.round(ts * 1.02 + 22)}px;font:400 46px/1.2 var(--f-serif);font-style:italic;color:var(--ac)">${esc(place(p))}</p>
      <div id="hook" class="${modeCls}" style="font-size:${hs}px;position:absolute;left:0;top:0;width:936px;color:var(--fg)">${split(cased(t.hook))}</div>
    </div>
    <div class="cam" id="cam">
      <div class="persp">
        ${abs(`left:${(1080 - pw) / 2}px;top:720px;z-index:5`, `<div id="ph">${ph.html}</div>`)}
        ${abs('left:36px;top:880px;z-index:8', `<span class="chip chip-a" style="font-size:42px;padding:22px 40px;rotate:-7deg">${esc(tg[0])}</span>`)}
        ${abs('right:36px;top:1160px;z-index:8', `<span class="chip chip-a" style="font-size:42px;padding:22px 40px;rotate:6deg;background:var(--fg);color:var(--bg)">${esc(tg[1] || t.sub)}</span>`)}
        ${abs('left:60px;top:1450px;z-index:8', `<span class="chip chip-a" style="font-size:42px;padding:22px 40px;rotate:-4deg">${esc(tg[2] || t.sub)}</span>`)}
      </div>
    </div>
    <svg class="abs" id="stamp" style="right:40px;top:600px;z-index:25" width="220" height="220" viewBox="0 0 200 200"><circle cx="100" cy="100" r="99" fill="var(--ac)"/><defs><path id="cc" d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"/></defs><text font-family="Satoshi" font-weight="700" font-size="21" fill="var(--on)"><textPath href="#cc" textLength="462" lengthAdjust="spacing">${isClient(p) ? 'NOWA REALIZACJA • NOWA REALIZACJA • ' : 'NOWY PROJEKT • NOWY PROJEKT • NOWY PROJEKT • '}</textPath></text><path d="M82 118l36-36M92 82h26v26" stroke="var(--on)" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div class="endcard" id="end">
      <div class="abs" style="left:72px;right:72px;top:268px;display:flex;justify-content:space-between;align-items:center"><span class="brand2"><img src="${A}mark.svg" width="64" height="64" alt="">PBDesign</span><span class="bdg bdg--own" style="color:var(--on)">${esc(p.kind)}</span></div>
      <div class="abs" style="left:72px;right:72px;top:520px">
        <div class="ln"><h2 class="e1" style="font-size:150px;display:block;${t.mode === 'serif' ? 'font-family:var(--f-serif);font-style:italic;font-weight:400' : ''}"><span style="display:block">Chcesz</span></h2></div>
        <div class="ln"><h2 class="e1" style="font-size:150px;${t.mode === 'serif' ? 'font-family:var(--f-serif);font-style:italic;font-weight:400' : ''}"><span style="display:block">podobną</span></h2></div>
        <div class="ln"><h2 class="e1" style="font-size:150px;${t.mode === 'serif' ? 'font-family:var(--f-serif);font-style:italic;font-weight:400' : ''}"><span style="display:block">stronę?</span></h2></div>
        <div class="ln" style="margin-top:70px"><p class="e1" style="font:500 46px/1.3 var(--f-text)"><span style="display:block">Napisz:</span></p></div>
        <div class="ln"><p class="e1" style="font:700 64px/1.15 var(--f-display)"><span style="display:block">pborkowski0301@gmail.com</span></p></div>
      </div>
      <div class="abs" style="left:72px;right:72px;bottom:250px;font:700 42px/1.2 var(--f-text)"><span class="e2" style="display:block">Zobacz projekt na żywo: link w bio</span></div>
    </div>`;
  const tl = [
    { s: '#g1', kf: [{ transform: 'scale(.8)', opacity: 0 }, { transform: 'scale(1.18)', opacity: 0.5 }], at: 0, dur: 5, ease: E.io },
    { s: '#hd1,#hd2', kf: [{ opacity: 0, transform: tx(0, -24) }, { opacity: 1, transform: tx(0, 0) }], at: 0.05, dur: 0.5, ease: E.out, st: 0.08 },
    { s: '#ttl .c', kf: [{ transform: 'translate3d(0,140%,0) rotate(5deg)' }, { transform: tx(0, 0, 'rotate(0)') }], at: 0.1, dur: 0.75, ease: E.out, st: 0.03 },
    { s: '#kick', kf: [{ opacity: 0, transform: tx(0, 30) }, { opacity: 1, transform: tx(0, 0) }], at: 0.55, dur: 0.6, ease: E.out },
    { s: '#stamp', kf: [{ transform: 'scale(0) rotate(-140deg)' }, { transform: 'scale(1.12) rotate(14deg)', offset: 0.65 }, { transform: 'scale(1) rotate(10deg)' }], at: 0.7, dur: 0.8, ease: E.out },
    { s: '#stamp', kf: [{ rotate: '0deg' }, { rotate: '40deg' }], at: 0.7, dur: 4.3, ease: E.lin },
    // telefon wlatuje z dołu z obrotem 3D, potem strona się przewija
    { s: '#ph', kf: [{ transform: tx(0, 1200, 'rotateY(38deg) rotateZ(10deg) scale(.86)'), opacity: 1 }, { transform: tx(0, 0, 'rotateY(-9deg) rotateZ(-4deg) scale(1)'), opacity: 1 }], at: 0.4, dur: 1.15, ease: E.out },
    { s: '#ph .scr', kf: [{ transform: 'translate3d(0,0,0)' }, { transform: `translate3d(0,-${ph.pct.toFixed(3)}%,0)` }], at: 1.15, dur: 2.5, ease: E.io },
    ...(p.phones ? [
      { s: '#ph .pimg:nth-child(2)', kf: [{ opacity: 0, transform: 'scale(1.08)' }, { opacity: 1, transform: 'scale(1)' }], at: 1.9, dur: 0.5, ease: E.out },
      { s: '#ph .pimg:nth-child(3)', kf: [{ opacity: 0, transform: 'scale(1.08)' }, { opacity: 1, transform: 'scale(1)' }], at: 2.9, dur: 0.5, ease: E.out },
    ] : ph.pct < 1 ? [{ s: '#ph .scr', kf: [{ transform: 'scale(1)' }, { transform: 'scale(1.18) translate3d(0,-2%,0)' }], at: 1.15, dur: 2.5, ease: E.io }] : []),
    { s: '#cam', kf: [{ transform: 'scale(1) rotate(0deg)' }, { transform: 'scale(1.07) rotate(-1.2deg)' }], at: 0, dur: 5, ease: E.io },
    { s: '#bnd', kf: [{ transform: 'rotate(-8deg) translate3d(0,0,0)', opacity: 0 }, { opacity: 1, offset: 0.12 }, { transform: 'rotate(-8deg) translate3d(-1500px,0,0)', opacity: 1 }], at: 0.5, dur: 3.6, ease: E.lin },
    { s: '.chip-a', kf: [{ opacity: 0, transform: tx(0, 60, 'scale(.4)') }, { opacity: 1, transform: tx(0, 0, 'scale(1)') }], at: 1.55, dur: 0.6, ease: E.back, st: 0.22 },
    // tytuł wychodzi, wchodzi hasło
    { s: '#ttl .c', kf: [{ transform: tx(0, 0) }, { transform: 'translate3d(0,-140%,0) rotate(-4deg)' }], at: 2.55, dur: 0.45, ease: E.in, st: 0.012, fill: 'forwards' },
    { s: '#kick', kf: [{ opacity: 1 }, { opacity: 0 }], at: 2.55, dur: 0.3, ease: E.lin, fill: 'forwards' },
    { s: '#stamp', kf: [{ scale: '1' }, { scale: '0' }], at: 2.5, dur: 0.35, ease: E.in, fill: 'forwards' },
    { s: '#hook .c', kf: [{ transform: 'translate3d(0,140%,0) rotate(4deg)' }, { transform: tx(0, 0, 'rotate(0)') }], at: 3.0, dur: 0.6, ease: E.out, st: 0.014 },
    // wipe do end card
    { s: '#end', kf: [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)' }], at: 3.75, dur: 0.55, ease: E.io },
    { s: '.e1>span', kf: [{ transform: 'translate3d(0,130%,0)' }, { transform: tx(0, 0) }], at: 4.1, dur: 0.6, ease: E.out, st: 0.07 },
    { s: '.e2', kf: [{ opacity: 0, transform: tx(0, 30) }, { opacity: 1, transform: tx(0, 0) }], at: 4.5, dur: 0.45, ease: E.out },
  ];
  return page('story', t, body, tl);
}

/* ======== WIDEO 2: okno przeglądarki w 3D z przewijaną stroną (4:5) ======== */
export function W_przegladarka(p) {
  const t = th(p), inv = inverse(t);
  const ttl = t.short.length > 11 ? p.title : t.short;
  const ts = fitBox(ttl, t.mode, 936, 170, 190, 80), hs = fitBox(t.hook, t.mode, 936, 230, 100, 54);
  const shot = dFull(p), bwid = 880, b = browserScroll(p, bwid, shot);
  const cased = s => (t.mode === 'caps' ? s.toUpperCase() : s);
  const modeCls = `hd hd--${t.mode}`;
  const tg = p.tags.slice(0, 3);
  const body = `
    <i class="glow" id="g1" style="width:1100px;height:1100px;right:-300px;top:200px;background:radial-gradient(circle,var(--ac) 0%,transparent 62%);opacity:.45;filter:none"></i>
    <div class="band" data-deco id="bnd" style="left:-300px;top:760px;width:3400px;height:120px;transform:rotate(-5deg);z-index:1"><span style="font-size:64px">${[...Array(10)].map(() => `${esc(cased(t.hook))}<i></i>`).join('')}</span></div>
    ${abs('left:72px;right:72px;top:56px;display:flex;justify-content:space-between;align-items:center;z-index:30', `<span id="hd1">${brand}</span><span id="hd2">${bdg(p)}</span>`)}
    <div class="abs" style="left:72px;top:170px;width:936px;z-index:20;height:260px">
      <div id="ttl" class="${modeCls}" style="font-size:${ts}px;position:absolute;left:0;top:0;width:936px">${split(cased(ttl))}</div>
      <p id="kick" style="position:absolute;left:0;top:${Math.round(ts * 1.02 + 20)}px;font:400 44px/1.2 var(--f-serif);font-style:italic;color:var(--ac)">${esc(place(p))}</p>
      <div id="hook" class="${modeCls}" style="font-size:${hs}px;position:absolute;left:0;top:0;width:936px">${split(cased(t.hook))}</div>
    </div>
    <div class="cam" id="cam"><div class="persp">
      ${abs(`left:${(1080 - bwid) / 2}px;top:500px;z-index:5`, `<div id="bwin" style="transform-origin:50% 50%">${b.html}</div>`)}
      ${abs('left:36px;top:470px;z-index:8', `<span class="chip chip-a" style="font-size:38px;padding:20px 36px;rotate:-6deg">${esc(tg[0])}</span>`)}
      ${abs('right:36px;top:880px;z-index:8', `<span class="chip chip-a" style="font-size:38px;padding:20px 36px;rotate:5deg;background:var(--fg);color:var(--bg)">${esc(tg[1] || t.sub)}</span>`)}
      ${abs('left:60px;top:1130px;z-index:8', `<span class="chip chip-a" style="font-size:38px;padding:20px 36px;rotate:-3deg">${esc(tg[2] || t.sub)}</span>`)}
    </div></div>
    <div class="endcard" id="end">
      <div class="abs" style="left:72px;right:72px;top:56px;display:flex;justify-content:space-between;align-items:center"><span class="brand2"><img src="${A}mark.svg" width="64" height="64" alt="">PBDesign</span><span class="bdg bdg--own" style="color:var(--on)">${esc(p.kind)}</span></div>
      <div class="abs" style="left:72px;right:72px;top:250px">
        <div class="ln"><h2 class="e1" style="font-size:130px;${t.mode === 'serif' ? 'font-family:var(--f-serif);font-style:italic;font-weight:400' : ''}"><span style="display:block">Chcesz podobną</span></h2></div>
        <div class="ln"><h2 class="e1" style="font-size:130px;${t.mode === 'serif' ? 'font-family:var(--f-serif);font-style:italic;font-weight:400' : ''}"><span style="display:block">stronę?</span></h2></div>
        <div class="ln" style="margin-top:60px"><p class="e1" style="font:500 44px/1.3 var(--f-text)"><span style="display:block">Napisz:</span></p></div>
        <div class="ln"><p class="e1" style="font:700 62px/1.15 var(--f-display)"><span style="display:block">pborkowski0301@gmail.com</span></p></div>
      </div>
      <div class="abs" style="left:72px;right:72px;bottom:64px;font:700 40px/1.2 var(--f-text)"><span class="e2" style="display:block">Zobacz projekt na żywo: link w bio</span></div>
    </div>`;
  const tl = [
    { s: '#g1', kf: [{ transform: 'scale(.8)', opacity: 0 }, { transform: 'scale(1.15)', opacity: 0.45 }], at: 0, dur: 5, ease: E.io },
    { s: '#hd1,#hd2', kf: [{ opacity: 0, transform: tx(0, -24) }, { opacity: 1, transform: tx(0, 0) }], at: 0.05, dur: 0.5, ease: E.out, st: 0.08 },
    { s: '#ttl .c', kf: [{ transform: 'translate3d(0,140%,0) rotate(5deg)' }, { transform: tx(0, 0, 'rotate(0)') }], at: 0.1, dur: 0.75, ease: E.out, st: 0.03 },
    { s: '#kick', kf: [{ opacity: 0, transform: tx(0, 30) }, { opacity: 1, transform: tx(0, 0) }], at: 0.55, dur: 0.6, ease: E.out },
    // okno: z izometrycznego pochylenia prostuje się do kadru, strona się przewija
    { s: '#bwin', kf: [{ transform: tx(0, 520, 'rotateX(62deg) rotateZ(-34deg) scale(.7)'), opacity: 1 }, { transform: tx(0, 0, 'rotateX(7deg) rotateZ(0deg) rotateY(-6deg) scale(1)'), opacity: 1 }], at: 0.35, dur: 1.5, ease: E.out },
    { s: '#bwin .scr', kf: [{ transform: 'translate3d(0,0,0)' }, { transform: `translate3d(0,-${b.pct.toFixed(3)}%,0)` }], at: 1.2, dur: 2.4, ease: E.io },
    ...(b.pct < 1 ? [{ s: '#bwin .scr', kf: [{ transform: 'scale(1)' }, { transform: 'scale(1.2) translate3d(-3%,-2%,0)' }], at: 1.2, dur: 2.4, ease: E.io }] : []),
    { s: '#cam', kf: [{ transform: 'scale(1) rotate(0deg)' }, { transform: 'scale(1.06) rotate(1deg)' }], at: 0, dur: 5, ease: E.io },
    { s: '#bnd', kf: [{ transform: 'rotate(-5deg) translate3d(0,0,0)', opacity: 0 }, { opacity: 1, offset: 0.12 }, { transform: 'rotate(-5deg) translate3d(-1500px,0,0)', opacity: 1 }], at: 0.5, dur: 3.6, ease: E.lin },
    { s: '.chip-a', kf: [{ opacity: 0, transform: tx(0, 60, 'scale(.4)') }, { opacity: 1, transform: tx(0, 0, 'scale(1)') }], at: 1.6, dur: 0.6, ease: E.back, st: 0.22 },
    { s: '#ttl .c', kf: [{ transform: tx(0, 0) }, { transform: 'translate3d(0,-140%,0) rotate(-4deg)' }], at: 2.55, dur: 0.45, ease: E.in, st: 0.012, fill: 'forwards' },
    { s: '#kick', kf: [{ opacity: 1 }, { opacity: 0 }], at: 2.55, dur: 0.3, ease: E.lin, fill: 'forwards' },
    { s: '#stamp', kf: [{ scale: '1' }, { scale: '0' }], at: 2.5, dur: 0.35, ease: E.in, fill: 'forwards' },
    { s: '#hook .c', kf: [{ transform: 'translate3d(0,140%,0) rotate(4deg)' }, { transform: tx(0, 0, 'rotate(0)') }], at: 3.0, dur: 0.6, ease: E.out, st: 0.014 },
    { s: '#end', kf: [{ clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)' }], at: 3.75, dur: 0.55, ease: E.io },
    { s: '.e1>span', kf: [{ transform: 'translate3d(0,130%,0)' }, { transform: tx(0, 0) }], at: 4.1, dur: 0.6, ease: E.out, st: 0.07 },
    { s: '.e2', kf: [{ opacity: 0, transform: tx(0, 30) }, { opacity: 1, transform: tx(0, 0) }], at: 4.5, dur: 0.45, ease: E.out },
  ];
  return page('post', t, body, tl);
}

export const VIDEOS = { telefon: { fn: W_telefon, fmt: 'story' }, przegladarka: { fn: W_przegladarka, fmt: 'post' } };
