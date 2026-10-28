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
  ['o-mnie', 'projekty', 'oferta', 'faq'].forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el); });

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
