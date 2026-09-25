(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
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
  ['oferta', 'case-studies', 'realizacje', 'o-mnie'].forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el); });

  /* ---------- Offer: preview follows the cursor ---------- */
  const preview = $('.svc-preview');
  if (fine && preview) {
    const pimg = $('img', preview);
    let x = 0, y = 0, tx = 0, ty = 0, raf = 0;
    const loop = () => {
      x += (tx - x) * .18; y += (ty - y) * .18;
      preview.style.left = `${x + 28}px`; preview.style.top = `${y - 100}px`;
      raf = Math.abs(tx - x) + Math.abs(ty - y) > .5 ? requestAnimationFrame(loop) : 0;
    };
    $$('.svc').forEach((row) => {
      row.addEventListener('mouseenter', (e) => {
        pimg.src = row.dataset.preview; x = tx = e.clientX; y = ty = e.clientY;
        preview.classList.add('is-on'); loop();
      });
      row.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; if (!raf) raf = requestAnimationFrame(loop); });
      row.addEventListener('mouseleave', () => preview.classList.remove('is-on'));
    });
  }

  /* ---------- Motion (quick, never blocks scrolling) ---------- */
  if (reduce || !window.gsap) return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const ease = 'power3.out';

  gsap.timeline({ defaults: { ease } })
    .from('.hero__title .ln > span', { yPercent: 105, duration: .9, stagger: .08 })
    .from('.portrait', { opacity: 0, scale: .96, duration: 1 }, .05)
    .from('.portrait img', { scale: 1.14, duration: 1.6, ease: 'power2.out' }, .05)
    .from(['.hero__lede', '.hero__cta', '.hero__facts'], { y: 18, opacity: 0, duration: .7, stagger: .06 }, .3)
    .from('.seal', { opacity: 0, scale: .6, duration: .8, ease: 'back.out(1.6)' }, .6)
    .from('.latest', { y: 24, opacity: 0, duration: .7 }, .7);

  if (!window.ScrollTrigger) return;
  const rise = (targets, trigger, opts = {}) => gsap.from(targets, { y: 32, opacity: 0, duration: .75, ease, stagger: .07, scrollTrigger: { trigger, start: 'top 86%', once: true }, ...opts });

  $$('.sec-head').forEach((h) => rise(h.children, h));
  rise('.svc', '.services');
  $$('.case').forEach((c) => {
    rise($('.case__head', c).children, c);
    rise($$('.case__main, .case__phones .phone, .case__wide', c), $('.case__gallery', c), { y: 48 });
    rise($$('.case__story > div', c), $('.case__story', c));
  });
  rise('.card', '.grid', { y: 48 });
  rise(['.about__quote', '.about__lead', '.about__p'], '.about');
  rise('.principles li', '.principles');
  rise('.steps li', '.steps');
  rise(['.contact__main > *', '.contact__card'], '.contact');

  addEventListener('load', () => ScrollTrigger.refresh());
})();
