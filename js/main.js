(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- Rulers ---------- */
  const hero = $('.hero');
  const rx = $('.ruler--x'), ry = $('.ruler--y');
  function drawRulers() {
    if (!rx || getComputedStyle(rx).display === 'none') return;
    $$('.n', rx).concat($$('.n', ry)).forEach((n) => n.remove());
    const w = hero.clientWidth, h = hero.clientHeight;
    for (let x = 100; x < w; x += 100) rx.insertAdjacentHTML('beforeend', `<span class="n" style="left:${x}px">${x}</span>`);
    for (let y = 100; y < h; y += 100) ry.insertAdjacentHTML('beforeend', `<span class="n" style="top:${y + 16}px">${y}</span>`);
  }
  hero.addEventListener('pointermove', (e) => {
    const r = hero.getBoundingClientRect();
    $('.ruler__mark', rx).style.left = `${e.clientX - r.left}px`;
    $('.ruler__mark', ry).style.top = `${e.clientY - r.top - 22}px`;
  });

  /* ---------- Selection box: resize = font width ---------- */
  const sel = $('#sel'), grip = $('#grip'), cursor = $('#cursor');
  const outW = $('#selW'), outH = $('#selH');
  let w0 = 0, wMin = 0, wMax = 0, w = 0, base = 100;
  const title = $('.hero__title');

  function measure() {
    sel.style.width = 'max-content';
    sel.style.setProperty('--wdth', 100);
    const board = sel.parentElement, cs = getComputedStyle(board);
    const avail = board.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 24;
    const natural = title.scrollWidth;
    // condense the face until the headline fits its column
    base = natural > avail ? Math.max(50, (100 * avail) / natural) : 100;
    w0 = Math.min(natural, avail);
    wMax = avail;
    wMin = Math.round(w0 * 0.56);
    wMax = Math.max(w0, wMax);
    setW(w0);
  }
  function setW(v) {
    w = clamp(v, wMin, wMax);
    sel.style.width = `${w}px`;
    sel.style.setProperty('--wdth', clamp((base * w) / w0, 50, 150).toFixed(1));
    outW.textContent = Math.round(w);
    outH.textContent = Math.round(sel.offsetHeight);
  }

  // drag + keyboard
  let drag = null;
  grip.addEventListener('pointerdown', (e) => {
    drag = { x: e.clientX, w };
    grip.setPointerCapture(e.pointerId);
    sel.classList.add('is-drag');
    stopIntro = true;
  });
  grip.addEventListener('pointermove', (e) => { if (drag) setW(drag.w + (e.clientX - drag.x)); });
  const end = () => { drag = null; sel.classList.remove('is-drag'); };
  grip.addEventListener('pointerup', end);
  grip.addEventListener('pointercancel', end);
  grip.addEventListener('dblclick', () => setW(w0));
  grip.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 48 : 16;
    if (e.key === 'ArrowLeft') { setW(w - step); e.preventDefault(); }
    if (e.key === 'ArrowRight') { setW(w + step); e.preventDefault(); }
    if (e.key === 'Home' || e.key === 'Escape') setW(w0);
  });

  /* ---------- Intro: wireframe → live, then a cursor resizes it ---------- */
  let stopIntro = false;
  const place = (x, y) => { cursor.style.transform = `translate(${x}px, ${y}px)`; };
  function tween(ms, fn, ease = (t) => 1 - Math.pow(1 - t, 3)) {
    return new Promise((res) => {
      const t0 = performance.now();
      const tick = (now) => {
        if (stopIntro) return res();
        const t = Math.min(1, (now - t0) / ms);
        fn(ease(t));
        t < 1 ? requestAnimationFrame(tick) : res();
      };
      requestAnimationFrame(tick);
    });
  }
  const inOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  async function intro() {
    const h = () => sel.offsetHeight;
    const gx = () => w + 12, gy = () => h() / 2 - 2;
    let cx = w0 * 0.9, cy = h() + 90;
    cursor.style.transition = 'opacity .3s';
    place(cx, cy);
    await wait(350);
    cursor.style.opacity = 1;
    // glide to the start of the first line
    const sx = cx, sy = cy;
    await tween(700, (t) => { cx = sx + (-6 - sx) * t; cy = sy + (h() * .14 - sy) * t; place(cx, cy); });
    if (stopIntro) return finish();
    // "render" the text, cursor sweeps with the wipe
    hero.classList.add('revealing');
    hero.classList.remove('intro');
    const ax = cx, ay = cy;
    await tween(1100, (t) => { cx = ax + (w * .96 - ax) * t; cy = ay + (h() * .82 - ay) * Math.min(1, t * 1.1); place(cx, cy); });
    if (stopIntro) return finish();
    // go to the right handle
    await wait(250);
    const bx = cx, by = cy;
    await tween(600, (t) => { cx = bx + (gx() - bx) * t; cy = by + (gy() - by) * t; place(cx, cy); });
    if (stopIntro) return finish();
    // drag narrower, then wider, then back
    sel.classList.add('is-drag');
    const drift = async (to, ms) => {
      const from = w;
      await tween(ms, (t) => { setW(from + (to - from) * t); place(gx(), gy()); }, inOut);
    };
    await drift(w0 * .62, 1000);
    await wait(250);
    await drift(Math.min(wMax, w0 * 1.18), 900);
    await wait(200);
    await drift(w0, 700);
    sel.classList.remove('is-drag');
    if (stopIntro) return finish();
    await wait(300);
    const ex = cx = gx(), ey = gy();
    await tween(700, (t) => { place(ex + 60 * t, ey + 70 * t); cursor.style.opacity = 1 - t; });
    finish();
  }
  function finish() {
    hero.classList.remove('intro');
    hero.classList.add('revealing');
    sel.classList.remove('is-drag');
    cursor.style.opacity = 0;
  }

  const start = () => {
    measure();
    drawRulers();
    if (!reduce) intro(); else finish();
  };
  if (!reduce) hero.classList.add('intro');
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);

  let rT;
  addEventListener('resize', () => {
    clearTimeout(rT);
    rT = setTimeout(() => {
      const ratio = w / w0;
      measure();
      if (!drag && ratio !== 1 && stopIntro) setW(w0 * ratio);
      drawRulers();
    }, 120);
  });

  /* ---------- Scroll spy: layers + header ---------- */
  const cats = $$('.layers__cat');
  const items = $$('.layers li a');
  const setOn = (list, id) => list.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === `#${id}`));
  const spy = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      const t = e.target;
      if (t.classList.contains('group')) {
        setOn(cats, t.id);
        const on = cats.find((a) => a.classList.contains('is-on'));
        const bar = $('.layers');
        if (on && bar.scrollWidth > bar.clientWidth) bar.scrollTo({ left: on.offsetLeft - 16, behavior: reduce ? 'auto' : 'smooth' });
      } else setOn(items, t.id);
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  $$('.group, .art').forEach((el) => spy.observe(el));

  const navs = $$('.bar__nav a');
  const navSpy = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      navs.forEach((a) => (a.getAttribute('href') === `#${e.target.id}` ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['projekty', 'o-mnie', 'proces', 'kontakt'].forEach((id) => { const el = document.getElementById(id); if (el) navSpy.observe(el); });

  /* ---------- Reveal ---------- */
  if (!reduce && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('rv-on');
    const targets = $$('.group__head, .art, .about__photo, .about__text, .flow');
    targets.forEach((el) => el.classList.add('rv'));
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    targets.forEach((el) => io.observe(el));
  }
})();
