(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const nav = $('#nav');

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduce && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 4), smoothWheel: true });
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
  }
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    const el = id.length > 1 ? $(id) : null;
    if (!el && id !== '#top') return;
    e.preventDefault();
    const target = id === '#top' ? 0 : el;
    if (lenis) lenis.scrollTo(target, { offset: id === '#top' ? 0 : -8 });
    else if (el) el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    else scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    history.replaceState(null, '', id);
  }));

  /* ---------- Nav: solid after hero start, hides on scroll down ---------- */
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-solid', y > 40);
    nav.classList.toggle('is-hidden', y > 600 && y > lastY + 4);
    if (y < lastY - 4) nav.classList.remove('is-hidden');
    lastY = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const links = $$('.nav__links a');
  const spy = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((a) => (a.getAttribute('href') === `#${e.target.id}` ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current')));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['realizacje', 'o-mnie', 'wspolpraca', 'kontakt'].forEach((id) => { const el = document.getElementById(id); if (el) spy.observe(el); });

  /* ---------- Motion ---------- */
  if (reduce || !window.gsap) return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const ease = 'expo.out';

  // Hero entrance: lines rise, portrait settles, gold frame draws itself.
  const tl = gsap.timeline({ defaults: { ease } });
  tl.from('.hero__title .line > span', { yPercent: 110, duration: 1.3, stagger: .12 })
    .from('.hero__img', { scale: 1.06, opacity: 0, duration: 1.6 }, 0.1)
    .fromTo('.hero__frame', { clipPath: 'inset(0% 100% 100% 0% round 40px)' }, { clipPath: 'inset(0% 0% 0% 0% round 40px)', duration: 1.8, ease: 'power3.inOut' }, 0.6)
    .from(['.hero__who', '.hero__lede', '.hero__cta'], { y: 24, opacity: 0, duration: 1.1, stagger: .08 }, 0.45)
    .from('.nav__in', { y: -20, opacity: 0, duration: 1 }, 0.2);

  if (!window.ScrollTrigger) return;

  // Portrait drifts slightly slower than the page.
  gsap.to('.hero__photo', { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  // Section headings.
  $$('.work__head, .about__title, .about__body, .process__head, .contact__in > *').forEach((el) => {
    gsap.from(el, { y: 40, opacity: 0, duration: 1.2, ease, scrollTrigger: { trigger: el, start: 'top 88%' } });
  });

  // Project rows: browser rises, phone follows with its own parallax.
  $$('.proj').forEach((row) => {
    const browser = $('.proj__browser', row), phone = $('.proj__phone', row), info = $('.proj__info', row);
    gsap.from(browser, { y: 70, opacity: 0, duration: 1.4, ease, scrollTrigger: { trigger: row, start: 'top 85%' } });
    gsap.from(info.children, { y: 26, opacity: 0, duration: 1.1, stagger: .06, ease, scrollTrigger: { trigger: row, start: 'top 78%' } });
    if (phone) gsap.fromTo(phone, { y: 60 }, { y: -30, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Skills and steps.
  gsap.from('.skills li', { y: 30, opacity: 0, duration: 1, stagger: .08, ease, scrollTrigger: { trigger: '.skills', start: 'top 88%' } });
  gsap.from('.step', { y: 36, opacity: 0, duration: 1.1, stagger: .12, ease, scrollTrigger: { trigger: '.steps', start: 'top 85%' } });
  gsap.fromTo('.steps__rail span', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 80%', end: 'bottom 60%', scrub: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
