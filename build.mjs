// Renders data/*.json into index.html between the <!-- NAME:START/END --> markers.
// Usage: node build.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const read = (f, d) => (existsSync(f) ? JSON.parse(readFileSync(f, 'utf8')) : d);
const { groups } = read('data/projects.json', { groups: [] });
const contact = read('data/contact.json', {});
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const arrow = '<svg class="i" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 14L14 6M7.5 6H14v6.5"/></svg>';
const host = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');
const img = (src, w, h, alt = '') => `<img src="${src}" alt="${esc(alt)}" width="${w}" height="${h}" loading="lazy" decoding="async">`;

// ---- portrait
const photo = existsSync('assets/portret.jpg')
  ? `<img src="assets/portret.jpg" alt="Przemysław Borkowski" width="912" height="1172" fetchpriority="high">`
  : `<div class="portrait__ph">PB</div>`;

// ---- grouped projects
const card = (p, layout) => `
          <a class="card card--${layout}" href="${p.url}" target="_blank" rel="noopener">
            <span class="card__media">
              <span class="browser"><span class="browser__bar" aria-hidden="true"><i></i><i></i><i></i><b>${esc(host(p.url))}</b></span>${img(`shots/${p.shot}.jpg`, 1440, 900, `${p.title}, widok na komputerze`)}</span>
              ${existsSync(`shots/${p.shot}-m.jpg`) ? `<span class="phone phone--sm">${img(`shots/${p.shot}-m.jpg`, 390, 844, `${p.title}, widok na telefonie`)}</span>` : ''}
            </span>
            <span class="card__body">
              <span class="card__title">${esc(p.title)}</span>
              <span class="card__cat">${esc(p.category)}</span>
              <span class="card__desc">${esc(p.desc)}</span>
              <span class="tags">${p.tags.map((t) => `<span>${esc(t)}</span>`).join('')}</span>
              <span class="card__go">Zobacz stronę na żywo ${arrow}</span>
            </span>
          </a>`;
const projectsHtml = groups.map((g) => {
  const layout = g.projects.length === 1 ? 'wide' : 'half';
  return `
      <div class="group" id="${g.id}">
        <div class="group__head">
          <h3>${esc(g.title)}<span>${g.projects.length}</span></h3>
          <p>${esc(g.lead)}</p>
        </div>
        <div class="grid">${g.projects.map((p) => card(p, layout)).join('')}
        </div>
      </div>`;
}).join('');

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
put('PROJECTS', projectsHtml + '\n      ');
put('CONTACT', contactHtml);
put('FOOTCONTACT', `\n      ${footHtml}\n      `);
writeFileSync('index.html', html);
console.log(`built: ${groups.length} groups, ${groups.reduce((n, g) => n + g.projects.length, 0)} projects, contact rows: ${rows.length}`);
