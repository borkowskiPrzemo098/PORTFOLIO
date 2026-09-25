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
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const ease = 'power3.out';

  gsap.timeline({ defaults: { ease } })
    .from('.hero__title .ln > span', { yPercent: 105, duration: 1, stagger: .09 })
    .from(['.hero__who', '.hero__cta', '.hero__scroll'], { y: 20, opacity: 0, duration: .8, stagger: .08 }, .35);

  if (!window.ScrollTrigger) return;
  const rise = (targets, trigger, opts = {}) => gsap.from(targets, { y: 32, opacity: 0, duration: .75, ease, stagger: .07, scrollTrigger: { trigger, start: 'top 86%', once: true }, ...opts });

  $$('.sec-head').forEach((h) => rise(h.children, h));
  rise('.svc', '.services');
  rise(['.about__photo', '.about__text > *'], '.about');
  rise('.qa details', '.qa');
  $$('.case').forEach((c) => {
    rise($('.case__head', c).children, c);
    rise($$('.case__main, .case__phones .phone, .case__wide', c), $('.case__gallery', c), { y: 48 });
    rise($$('.case__story > div', c), $('.case__story', c));
  });
  rise('.card', '.grid', { y: 48 });
  rise('.steps li', '.steps');
  rise(['.contact__main > *', '.contact__card'], '.contact');

  addEventListener('load', () => ScrollTrigger.refresh());
})();
