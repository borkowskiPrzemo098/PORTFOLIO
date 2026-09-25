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

  /* ---------- Motion (quick, never blocks scrolling) ---------- */
  if (reduce || !window.gsap) return;
  const ease = 'power3.out';

  gsap.timeline({ defaults: { ease } })
    .from('.hero__title .ln > span', { yPercent: 105, duration: 1, stagger: .09 })
    .from(['.hero__who', '.hero__cta', '.hero__scroll'], { y: 20, opacity: 0, duration: .8, stagger: .08 }, .35);


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
