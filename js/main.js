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
