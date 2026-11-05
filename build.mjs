// Renders data/*.json into index.html (between <!-- NAME:START/END --> markers)
// and generates one subpage per area (strony.html, landing-page.html, ...).
// Usage: node build.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const read = (f, d) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : d);
const { groups } = read('data/projects.json', { groups: [] });
const { areas } = read('data/areas.json', { areas: [] });
const contact = read('data/contact.json', {});
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const arrow = '<svg class="i" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 14L14 6M7.5 6H14v6.5"/></svg>';
const arrowR = '<svg class="i" viewBox="0 0 20 20" aria-hidden="true"><path d="M3.5 10h13M11 4.5l5.5 5.5-5.5 5.5"/></svg>';
const host = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
const img = (src, w, h, alt = '') => {
  // long full-page capture, swapped in by JS when the card is near the viewport (scroll-on-hover)
  const full = src.replace(/.jpg$/, '-full.jpg');
  const data = existsSync(full) ? ` data-full="${full}"` : '';
  return `<img src="${src}"${data} alt="${esc(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async">`;
};
const pl = (n, one, few, many) => (n === 1 ? one : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? few : many);
const groupById = Object.fromEntries(groups.map((g) => [g.id, g]));
const areaProjects = (a) => a.groups.flatMap((id) => groupById[id]?.projects || []);
const emTitle = (a) => esc(a.title).replace(esc(a.em), `<em>${esc(a.em)}</em>`);

// ---- portrait
const photo = existsSync('assets/portret.jpg')
  ? `<img src="assets/portret-640.jpg" srcset="assets/portret-640.jpg 640w, assets/portret-912.jpg 912w" sizes="(max-width: 900px) 420px, 520px" alt="Przemysław Borkowski" width="912" height="1172" loading="lazy" decoding="async">`
  : `<div class="portrait__ph">PB</div>`;

// ---- project cards (used on subpages)
const isGame = (p) => groupById.gry?.projects.includes(p);
const card = (p, layout) => `
          <a class="card card--${layout}" href="${p.url}" target="_blank" rel="noopener">
            <span class="card__media${p.phones ? ' card__media--app' : ''}">
              ${p.phones ? p.phones.map((s) => `<span class="phone">${img(`shots/${s}.jpg`, 390, 844, `${p.title}, ekran aplikacji`)}</span>`).join('') : ''}${p.phones ? '' : `<span class="browser"><span class="browser__bar" aria-hidden="true"><i></i><i></i><i></i><b>${esc(host(p.url))}</b></span>${img(`shots/${p.shot}.jpg`, 1440, 900, `${p.title}, widok na komputerze`)}</span>`}
              ${!p.phones && existsSync(`shots/${p.shot}-m.jpg`) ? `<span class="phone phone--sm">${img(`shots/${p.shot}-m.jpg`, 390, 844, `${p.title}, widok na telefonie`)}</span>` : ''}
            </span>
            <span class="card__body">
              <span class="card__title">${esc(p.title)}</span>
              <span class="card__kind${p.kind === 'Realizacja dla klienta' ? ' card__kind--client' : ''}">${esc(p.kind || '')}</span>
              <span class="card__cat">${esc(p.category)}</span>
              <span class="card__desc">${esc(p.desc)}</span>
              <span class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</span>
              <span class="card__go">${p.phones ? (isGame(p) ? 'Zagraj' : 'Otwórz aplikację') : 'Zobacz stronę na żywo'} ${arrow}</span>
            </span>
          </a>`;
const groupHtml = (g, showHead) => `
      <div class="group" id="${g.id}">${showHead ? `
        <div class="group__head">
          <h2>${esc(g.title)}</h2>
          <p>${esc(g.lead)}</p>
        </div>` : ''}
        <div class="grid">${g.projects.map((p, i) => card(p, i === 0 && g.projects.length % 2 ? 'wide' : 'half')).join('')}
        </div>
      </div>`;

// ---- home: showroom of the four areas
const stage = (a) => {
  const s = a.stage;
  if (s.phones) return `<div class="stage stage--phones">${s.phones.map((x) => `<span class="phone">${img(`shots/${x}.jpg`, 390, 844, '')}</span>`).join('')}</div>`;
  return `<div class="stage"><span class="browser"><span class="browser__bar" aria-hidden="true"><i></i><i></i><i></i><b>${esc(s.label)}</b></span>${img(`shots/${s.browser}.jpg`, 1440, 900, '')}</span><span class="phone stage__phone">${img(`shots/${s.phone}.jpg`, 390, 844, '')}</span></div>`;
};
const showroom = `
      <div class="show">
        <div class="show__tabs" role="tablist" aria-label="Obszary">${areas.map((a, i) => {
          const n = areaProjects(a).length;
          return `
          <button class="show__tab" type="button" role="tab" id="tab-${a.id}" aria-controls="area-${a.id}" aria-selected="${i === 0}">
            <span class="show__num">0${i + 1}</span>
            <span class="show__name">${esc(a.tab)}</span>
            <span class="show__count">${n} ${pl(n, 'realizacja', 'realizacje', 'realizacji')}</span>
          </button>`;
        }).join('')}
        </div>
        <div class="show__panels">${areas.map((a, i) => {
          const ps = areaProjects(a);
          const n = ps.length;
          return `
          <article class="show__panel" id="area-${a.id}" role="tabpanel" aria-labelledby="tab-${a.id}">
            <a class="show__stage" href="${a.page}" tabindex="-1" aria-hidden="true">${stage(a)}</a>
            <div class="show__text">
              <div>
                <h3>${esc(a.title)}</h3>
                <p>${esc(a.lead)}</p>
              </div>
              <ul class="show__list">${a.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
              <p class="show__ex">Np. ${ps.slice(0, 3).map((p) => esc(p.title)).join(', ')}${n > 3 ? ` i ${n - 3} ${pl(n - 3, 'inny', 'inne', 'innych')}` : ''}.</p>
              <a class="btn btn--sand show__cta" href="${a.page}">Zobacz ${n} ${pl(n, 'realizację', 'realizacje', 'realizacji')} ${arrowR}</a>
            </div>
          </article>`;
        }).join('')}
        </div>
      </div>
      `;

// ---- contact pieces
const ic = {
  mail: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/></svg>',
  tel: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
  in: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/></svg>',
  pin: '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>',
};
const rows = [];
if (contact.email) rows.push(['E-mail', ic.mail, `<a href="mailto:${esc(contact.email)}">${esc(contact.email)}</a>`]);
if (contact.phone) rows.push(['Telefon', ic.tel, `<a href="tel:${esc(contact.phone.replace(/\s/g, ''))}">${esc(contact.phone)}</a>`]);
if (contact.linkedin) rows.push(['LinkedIn', ic.in, `<a href="${esc(contact.linkedin)}" target="_blank" rel="noopener">${esc(host(contact.linkedin))}</a>`]);
if (contact.city) rows.push(['Lokalizacja', ic.pin, esc(contact.city)]);
const contactHtml = rows.length
  ? rows.map(([k, i, v]) => `\n          <div><dt>${i}${k}</dt><dd>${v}</dd></div>`).join('') + '\n          '
  : `\n          <div class="contact__soon"><dt>${ic.mail}Dane kontaktowe</dt><dd>E-mail i telefon pojawią się tutaj wkrótce.</dd></div>\n          `;
const footHtml = rows.length ? rows.filter(([k]) => k !== 'Lokalizacja').map(([, , v]) => `<p>${v}</p>`).join('') : '<p>Przemysław Borkowski</p>';
const dialogHtml = [
  contact.email && `
      <div class="opt">
        <span class="opt__ic">${ic.mail}</span>
        <span class="opt__label">E-mail</span>
        <strong class="opt__value">${esc(contact.email)}</strong>
        <span class="opt__act">
          <a class="btn btn--wine btn--sm" href="mailto:${esc(contact.email)}">Napisz wiadomość</a>
          <button class="btn btn--line-ink btn--sm" type="button" data-copy="${esc(contact.email)}" data-copied="Skopiowano adres e-mail">Kopiuj adres</button>
        </span>
      </div>`,
  contact.phone && `
      <div class="opt">
        <span class="opt__ic">${ic.tel}</span>
        <span class="opt__label">Telefon</span>
        <strong class="opt__value">${esc(contact.phone)}</strong>
        <span class="opt__act">
          <a class="btn btn--wine btn--sm opt__call" href="tel:${esc(contact.phone.replace(/\s/g, ''))}">Zadzwoń</a>
          <button class="btn btn--line-ink btn--sm" type="button" data-copy="${esc(contact.phone)}" data-copied="Skopiowano numer telefonu">Kopiuj numer</button>
        </span>
      </div>`,
].filter(Boolean).join('') + '\n      ';

// ---- render index.html
let html = readFileSync('index.html', 'utf8');
const putIn = (src, name, body) => src.replace(new RegExp(`(<!-- ${name}:START -->)[\\s\\S]*?(<!-- ${name}:END -->)`), `$1${body}$2`);
const put = (name, body) => { html = putIn(html, name, body); };
put('PHOTO', `\n          ${photo}\n          `);
put('SHOWROOM', showroom);
const nProj = groups.reduce((n, g) => n + g.projects.length, 0);
put('FACTS', `
          <li><b>${nProj}</b><span>${pl(nProj, 'projekt online', 'projekty online', 'projektów online')}</span></li>
          <li><b>${areas.length}</b><span>${pl(areas.length, 'obszar', 'obszary', 'obszarów')}: strony, sklepy, aplikacje, gry</span></li>
          `);
put('CONTACT', contactHtml);
put('DIALOG', dialogHtml);
put('FOOTCONTACT', `\n      ${footHtml}\n      `);
writeFileSync('index.html', html);

// ---- subpages: reuse the home page's head, header, contact, footer and dialog
const cut = (from, to) => html.slice(html.indexOf(from), to ? html.indexOf(to) : undefined);
const head = html.slice(0, html.indexOf('<body>') + '<body>'.length);
const header = cut('<header class="nav"', '<main');
const contactSec = cut('  <section class="contact"', '</main>');
const tail = cut('<footer class="foot">');
const toHome = (s) => s.replace(/href="#(?!kontakt")([\w-]+)"/g, 'href="index.html#$1"').replace(/href="#top"/g, 'href="index.html"');
for (const [i, a] of areas.entries()) {
  const ps = areaProjects(a);
  const gs = a.groups.map((id) => groupById[id]).filter(Boolean);
  const title = `${a.title} — realizacje · PBDesign`;
  const desc = `${a.title}: ${ps.length} ${pl(ps.length, 'realizacja', 'realizacje', 'realizacji')} Przemysława Borkowskiego (PBDesign). ${a.lead}`;
  const pageHead = head
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${esc(desc)}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${esc(a.title)} · PBDesign">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="https://borkowskiprzemo098.github.io/PORTFOLIO/${a.page}">`);
  const switcher = areas.map((b) => b.id === a.id
    ? `<span class="subnav__item is-on" aria-current="page">${esc(b.tab)} <b>${areaProjects(b).length}</b></span>`
    : `<a class="subnav__item" href="${b.page}">${esc(b.tab)} <b>${areaProjects(b).length}</b></a>`).join('');
  const next = areas[(i + 1) % areas.length];
  const page = `${pageHead}
<a class="skip" href="#realizacje">Przejdź do realizacji</a>

${toHome(header)}<main id="top" class="subpage">
  <section class="subhero cases" aria-labelledby="sub-title">
    <div class="wrap">
      <a class="back" href="index.html#projekty"><svg class="i" viewBox="0 0 20 20" aria-hidden="true"><path d="M16.5 10h-13M9 4.5L3.5 10 9 15.5"/></svg>Strona główna</a>
      <h1 id="sub-title">${emTitle(a)}</h1>
      <p class="subhero__lead">${esc(a.lead)}</p>
      <nav class="subnav" aria-label="Obszary realizacji">${switcher}</nav>
    </div>
  </section>

  <section class="cases subwork" id="realizacje" aria-label="Realizacje">
    <div class="wrap">${gs.map((g) => groupHtml(g, gs.length > 1)).join('')}
      <a class="next" href="${next.page}"><span>Następny obszar</span><strong>${esc(next.title)}</strong>${arrowR}</a>
    </div>
  </section>

${contactSec}</main>

${toHome(tail)}`;
  writeFileSync(a.page, page);
}
console.log(`built: index + ${areas.length} subpages, ${nProj} projects, contact rows: ${rows.length}`);
