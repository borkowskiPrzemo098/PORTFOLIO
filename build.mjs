// Renders data/*.json into index.html between the <!-- NAME:START/END --> markers.
// Usage: node build.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const read = (f, d) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : d);
const { projects } = read('data/projects.json', { projects: [] });
const { cases } = read('data/cases.json', { cases: [] });
const contact = read('data/contact.json', {});
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const arrow = '<svg class="i" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 14L14 6M7.5 6H14v6.5"/></svg>';
const host = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
const img = (src, w, h, alt = '') => `<img src="${src}" alt="${esc(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async">`;

// ---- portrait
const photo = existsSync('assets/portret.jpg')
  ? `<img src="assets/portret.jpg" alt="Przemysław Borkowski" width="912" height="1172" fetchpriority="high">`
  : `<div class="portrait__ph">PB</div>`;

// ---- case studies
const caseHtml = cases.map((c, i) => `
      <article class="case" id="case-${c.id}">
        <header class="case__head">
          <div>
            <h3>${esc(c.title)}</h3>
            <p class="case__lead">${esc(c.lead)}</p>
            <a class="btn btn--ink btn--sm" href="${c.url}" target="_blank" rel="noopener">Zobacz stronę na żywo ${arrow}</a>
          </div>
          <dl class="case__meta">${c.meta.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
        </header>
        <div class="case__gallery">
          <a class="case__main" href="${c.url}" target="_blank" rel="noopener" aria-label="${esc(c.title)}: otwórz stronę">
            <span class="browser"><span class="browser__bar" aria-hidden="true"><i></i><i></i><i></i><b>${esc(host(c.url))}</b></span>${img(`shots/case/${c.shots.main}.jpg`, 1440, 900, `${c.title}, widok na komputerze`)}</span>
          </a>
          <div class="case__phones">${c.shots.phones.map((s) => `<span class="phone">${img(`shots/case/${s}.jpg`, 390, 844, `${c.title}, widok na telefonie`)}</span>`).join('')}</div>
          ${c.shots.wide.map((s) => `<span class="case__wide browser">${img(`shots/case/${s}.jpg`, 1440, 900, `${c.title}, kolejna sekcja strony`)}</span>`).join('')}
        </div>
        <div class="case__story">
          <div><h4>Wyzwanie</h4><p>${esc(c.challenge)}</p></div>
          <div><h4>Rozwiązanie</h4><p>${esc(c.solution)}</p></div>
          <div><h4>Co zrobiłem</h4><p>${esc(c.work)}</p></div>
        </div>
      </article>`).join('');

// ---- remaining work (projects not already shown as case studies)
const inCase = new Set(cases.map((c) => c.repo));
const rest = projects.filter((p) => !inCase.has(p.repo));
const workHtml = rest.map((p, i) => `
        <a class="card${i === 0 && rest.length % 2 === 1 ? ' card--wide' : ''}" href="${p.url}" target="_blank" rel="noopener">
          <span class="card__media">
            ${img(`shots/${p.repo}.jpg`, 1200, 750)}
            ${existsSync(`shots/${p.repo}-m.jpg`) ? `<span class="phone phone--sm">${img(`shots/${p.repo}-m.jpg`, 390, 844)}</span>` : ''}
          </span>
          <span class="card__body">
            <span class="card__title">${esc(p.title)}</span>
            <span class="card__cat">${esc(p.category)}</span>
            <span class="card__desc">${esc(p.desc)}</span>
            <span class="card__go">Zobacz stronę ${arrow}</span>
          </span>
        </a>`).join('');

// ---- contact
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

let html = readFileSync('index.html', 'utf8');
const put = (name, body) => { html = html.replace(new RegExp(`(<!-- ${name}:START -->)[\\s\\S]*?(<!-- ${name}:END -->)`), `$1${body}$2`); };
put('PHOTO', `\n          ${photo}\n          `);
put('CASES', caseHtml + '\n      ');
put('WORK', workHtml + '\n        ');
put('CONTACT', contactHtml);
put('FOOTCONTACT', `\n      ${footHtml}\n      `);
writeFileSync('index.html', html);
console.log(`built: ${cases.length} cases, ${rest.length} other projects, contact rows: ${rows.length}`);
