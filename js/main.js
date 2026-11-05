(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Nav ---------- */
  const nav = $('#nav');
  const onScroll = () => nav.classList.toggle('is-solid', scrollY > 20);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('.nav__burger'), menu = $('#menu');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    menu.hidden = !open;
    nav.classList.toggle('is-solid', open || scrollY > 20);
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  const links = $$('.nav__links a');
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => (a.getAttribute('href') === `#${e.target.id}` ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['co-buduje', 'realizacje', 'o-mnie', 'wspolpraca', 'faq'].forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el); });

  /* Hero entrance is pure CSS now (see .hero__title .ln in style.css) — no GSAP download */

})();

/* ---------- Contact: choice dialog, copy on desktop instead of tel: ---------- */
(() => {
  const dlg = document.getElementById('contact-dialog');
  const toast = document.querySelector('.toast');
  const desktop = matchMedia('(hover: hover) and (pointer: fine)');
  let tT;
  const say = (msg) => { toast.textContent = msg; toast.classList.add('is-on'); clearTimeout(tT); tT = setTimeout(() => toast.classList.remove('is-on'), 2400); };
  const copy = async (text, msg) => {
    try { await navigator.clipboard.writeText(text); }
    catch { const t = document.createElement('textarea'); t.value = text; document.body.append(t); t.select(); document.execCommand('copy'); t.remove(); }
    say(msg);
  };

  document.querySelectorAll('[data-contact]').forEach((a) => a.addEventListener('click', (e) => {
    if (!dlg || !dlg.showModal) return; // old browsers: fall back to the contact section
    e.preventDefault();
    const menu = document.getElementById('menu');
    if (menu && !menu.hidden) document.querySelector('.nav__burger').click();
    dlg.showModal();
  }));
  dlg?.querySelector('.cdlg__close').addEventListener('click', () => dlg.close());
  dlg?.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-copy]');
    if (btn) { copy(btn.dataset.copy, btn.dataset.copied || 'Skopiowano'); return; }
    const tel = e.target.closest('a[href^="tel:"]');
    if (tel && desktop.matches) { e.preventDefault(); copy(tel.textContent.trim() || tel.getAttribute('href').slice(4), 'Skopiowano numer telefonu'); }
  });
})();

/* ---------- Project category filter ---------- */
(() => {
  const bar = document.querySelector('.filters');
  if (!bar) return;
  const groups = [...document.querySelectorAll('.cases .group')];
  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    const f = btn.dataset.filter;
    bar.querySelectorAll('button').forEach((b) => { const on = b === btn; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
    groups.forEach((g) => { g.hidden = f !== 'all' && g.id !== f; });
    const top = bar.closest('.cases').querySelector('.sec-head').getBoundingClientRect().bottom + scrollY - 90;
    if (scrollY > top) scrollTo({ top, behavior: 'smooth' });
  });
})();

/* =====================================================================
   MOTION PACK (2026-10-12). Nothing here hides content; all of it is
   skipped when the visitor asks the system to reduce motion.
   ===================================================================== */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Long screenshots: preload the full-page capture, then swap it in */
  const swapIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    $$('img[data-full]', e.target).forEach((im) => {
      const pre = new Image();
      pre.onload = () => { im.src = im.dataset.full; im.removeAttribute('data-full'); };
      pre.src = im.dataset.full;
    });
    swapIO.unobserve(e.target);
  }), { rootMargin: '300px 0px' });
  $$('.card').forEach((c) => swapIO.observe(c));

  if (reduce) return;

  /* Touch screens: each card tours its screenshot once when it comes into view */
  if (!fine) {
    const tourIO = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const c = e.target;
      setTimeout(() => { c.classList.add('is-tour'); setTimeout(() => c.classList.remove('is-tour'), 9000); }, 700);
      tourIO.unobserve(c);
    }), { threshold: 0.6 });
    $$('.card').forEach((c) => { if (c.querySelector('.browser img')) tourIO.observe(c); });
  }

  /* Hero sketches follow the cursor (desktop) */
  const hero = document.querySelector('.hero');
  const sketches = $$('.sketch');
  if (fine && hero && sketches.length) {
    const depth = [26, 34, 18, 22];
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      sketches.forEach((s, i) => { s.style.setProperty('--px', `${(-nx * depth[i % 4]).toFixed(1)}px`); s.style.setProperty('--py', `${(-ny * depth[i % 4]).toFixed(1)}px`); });
    });
    hero.addEventListener('pointerleave', () => sketches.forEach((s) => { s.style.setProperty('--px', '0px'); s.style.setProperty('--py', '0px'); }));
  }

  /* Counters in "O mnie": numbers stay visible, they just count up once */
  const countIO = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    countIO.unobserve(e.target);
    const el = e.target, end = parseInt(el.textContent, 10);
    if (!end) return;
    const t0 = performance.now(), dur = 1300;
    const tick = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(end * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick); else el.textContent = end;
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.8 });
  $$('.facts b').forEach((b) => { if (/^\d+$/.test(b.textContent.trim())) countIO.observe(b); });

  /* Process timeline: rail fills with scroll, steps light up in order */
  const proc = document.querySelector('.process');
  const steps = $$('.process .steps li');
  const rail = document.querySelector('.timeline');
  if (proc && steps.length) {
    proc.classList.add('tl-on');
    let ticking = false;
    const update = () => {
      ticking = false;
      const line = innerHeight * 0.72;
      const cols = getComputedStyle(proc.querySelector('.steps')).gridTemplateColumns.split(' ').length;
      if (cols > 1 && rail) {
        // steps share a row: the rail fills with scroll and lights each step as it reaches it
        const first = steps[0].getBoundingClientRect();
        const p = Math.max(0, Math.min(1, (line - first.top + first.height) / (first.height * 1.7)));
        rail.style.setProperty('--tl', p.toFixed(3));
        steps.forEach((s, i) => s.classList.toggle('lit', p >= (i + 0.6) / steps.length));
      } else {
        steps.forEach((s) => s.classList.toggle('lit', s.getBoundingClientRect().top < line));
      }
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    update();
  }

  /* Magnetic buttons (desktop) */
  if (fine) {
    $$('.hero__cta .btn, .nav .btn').forEach((b) => {
      b.classList.add('magnet');
      b.addEventListener('pointermove', (e) => {
        const r = b.getBoundingClientRect();
        b.style.setProperty('--mx', `${((e.clientX - r.left - r.width / 2) * 0.22).toFixed(1)}px`);
        b.style.setProperty('--my', `${((e.clientY - r.top - r.height / 2) * 0.32).toFixed(1)}px`);
      });
      b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
    });
  }

  /* Filter: cards of the chosen category glide in */
  const bar = document.querySelector('.filters');
  if (bar && Element.prototype.animate) {
    bar.addEventListener('click', (e) => {
      if (!e.target.closest('button[data-filter]')) return;
      requestAnimationFrame(() => {
        $$('.cases .group:not([hidden]) .card').slice(0, 8).forEach((c, i) => {
          c.animate([{ opacity: 0, transform: 'translateY(18px) scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 520, delay: i * 55, easing: 'cubic-bezier(.22,1,.36,1)' });
        });
      });
    });
  }
})();

/* ---------- Showroom: four areas as tabs on desktop, stacked cards on phones ---------- */
(() => {
  const tabs = [...document.querySelectorAll('.show__tab')];
  const panels = [...document.querySelectorAll('.show__panel')];
  if (!tabs.length) return;
  const wide = matchMedia('(min-width: 961px)');
  const hover = matchMedia('(hover: hover) and (pointer: fine)');
  let current = 0, hoverT;
  const select = (i, focus) => {
    if (i === current && panels[i].hidden === false) return;
    current = i;
    tabs.forEach((t, k) => { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; });
    panels.forEach((p, k) => { p.hidden = k !== i; p.classList.toggle('is-in', k === i); });
    if (focus) tabs[i].focus();
  };
  const layout = () => {
    if (wide.matches) { panels.forEach((p, k) => { p.hidden = k !== current; }); tabs.forEach((t, k) => { t.tabIndex = k === current ? 0 : -1; }); }
    else panels.forEach((p) => { p.hidden = false; p.classList.remove('is-in'); });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(i));
    t.addEventListener('pointerenter', () => { if (!hover.matches) return; clearTimeout(hoverT); hoverT = setTimeout(() => select(i), 140); });
    t.addEventListener('pointerleave', () => clearTimeout(hoverT));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); select((i + d + tabs.length) % tabs.length, true); }
      if (e.key === 'Home') { e.preventDefault(); select(0, true); }
      if (e.key === 'End') { e.preventDefault(); select(tabs.length - 1, true); }
    });
  });
  wide.addEventListener('change', layout);
  layout();
})();

/* =====================================================================
   PREMIUM HOME (2026-11-05): pinned hero devices, screen cycler,
   lit statement, reel arrows. Everything is visible without this code.
   ===================================================================== */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* Screens inside the laptop and phone cycle through real projects */
  const dev = $('[data-cycle]');
  if (dev) {
    const mac = $$('.mac .scr', dev), ph = $$('.iphone .scr', dev), cap = $('[data-cap]');
    let i = 0, timer;
    const show = (n) => {
      i = (n + mac.length) % mac.length;
      mac.forEach((s, k) => s.classList.toggle('is-on', k === i));
      ph.forEach((s, k) => s.classList.toggle('is-on', k === i));
      if (cap) { cap.textContent = mac[i].dataset.title; cap.href = mac[i].dataset.url; }
    };
    const run = () => { clearInterval(timer); if (!reduce && !document.hidden) timer = setInterval(() => show(i + 1), 3200); };
    document.addEventListener('visibilitychange', run);
    // only cycle while the hero is on screen
    new IntersectionObserver(([e]) => (e.isIntersecting ? run() : clearInterval(timer))).observe(dev);
  }

  /* Hero: pinned on desktop, devices rise and grow while the headline drifts away */
  const hero = $('.hero');
  const pinOK = matchMedia('(min-width: 900px) and (prefers-reduced-motion: no-preference)');
  if (hero && dev) {
    const copy = $('.hero__copy', hero);
    let ticking = false;
    const update = () => {
      ticking = false;
      if (!pinOK.matches) { dev.style.removeProperty('--dev-y'); dev.style.removeProperty('--dev-s'); copy.style.removeProperty('--copy-o'); copy.style.removeProperty('--copy-y'); return; }
      const r = hero.getBoundingClientRect();
      const span = hero.offsetHeight - innerHeight;
      const p = Math.min(1, Math.max(0, -r.top / Math.max(1, span)));
      const e = 1 - Math.pow(1 - p, 2);
      dev.style.setProperty('--dev-y', `${(-e * 34).toFixed(2)}vh`);
      dev.style.setProperty('--dev-s', (1 + e * 0.16).toFixed(4));
      copy.style.setProperty('--copy-o', Math.max(0, 1 - p * 2.2).toFixed(3));
      copy.style.setProperty('--copy-y', `${(-p * 80).toFixed(1)}px`);
    };
    const setPin = () => { hero.classList.toggle('is-pinned', pinOK.matches); update(); };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener('resize', update);
    pinOK.addEventListener('change', setPin);
    setPin();
  }

  /* Statement: words light up as the paragraph passes the middle of the screen */
  const lit = $('[data-lit]');
  if (lit) {
    const words = lit.textContent.trim().split(/\s+/);
    lit.innerHTML = words.map((w) => `<span class="w">${w}</span>`).join(' ');
    const ws = $$('.w', lit);
    if (reduce) ws.forEach((w) => w.classList.add('on'));
    else {
      let ticking = false;
      const update = () => {
        ticking = false;
        const r = lit.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (innerHeight * 0.78 - r.top) / (r.height + innerHeight * 0.3)));
        const n = Math.round(p * ws.length);
        ws.forEach((w, k) => w.classList.toggle('on', k < n));
      };
      addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      update();
    }
  }

  /* Reel arrows */
  const reel = $('.reel');
  if (reel) {
    const prev = $('[data-reel="-1"]'), next = $('[data-reel="1"]');
    const step = () => (reel.querySelector('.rcard')?.offsetWidth || 400) + 20;
    const sync = () => {
      if (prev) prev.disabled = reel.scrollLeft < 8;
      if (next) next.disabled = reel.scrollLeft + reel.clientWidth > reel.scrollWidth - 8;
    };
    $$('[data-reel]').forEach((b) => b.addEventListener('click', () => reel.scrollBy({ left: step() * +b.dataset.reel, behavior: reduce ? 'auto' : 'smooth' })));
    reel.addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync);
    sync();
  }
})();
