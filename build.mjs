// Renders data/*.json into index.html between the <!-- NAME:START/END --> markers.
// Usage: node build.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const { projects } = JSON.parse(readFileSync('data/projects.json', 'utf8'));
const contact = existsSync('data/contact.json') ? JSON.parse(readFileSync('data/contact.json', 'utf8')) : {};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const arrow = '<svg class="i" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 14L14 6M7.5 6H14v6.5"/></svg>';
const host = (u) => u.replace(/^https?:\/\//, '').replace(/\/$/, '');

// Hero portrait: assets/portret.jpg when present, otherwise a placeholder.
const photo = existsSync('assets/portret.jpg')
  ? `<img src="assets/portret.jpg" alt="Przemysław Borkowski" width="800" height="1000" fetchpriority="high">`
  : `<div class="hero__ph" role="img" aria-label="Miejsce na zdjęcie Przemysława Borkowskiego"><span>PB</span></div>`;

const names = projects.map((p) => `<span>${esc(p.title)}</span><i></i>`).join('');
const marquee = `\n        <div class="marquee__set">${names}</div>\n        <div class="marquee__set">${names}</div>\n        `;

const rows = projects.map((p, i) => {
  const desk = `shots/${p.repo}.jpg`, phone = `shots/${p.repo}-m.jpg`;
  return `
      <article class="proj${i % 2 ? ' proj--rev' : ''}">
        <a class="proj__media" href="${p.url}" target="_blank" rel="noopener" aria-label="${esc(p.title)}: otwórz stronę w nowej karcie">
          <span class="proj__browser">
            <span class="proj__bar" aria-hidden="true"><i></i><i></i><i></i><b>${esc(host(p.url))}</b></span>
            <span class="proj__shot"><img src="${desk}" alt="" width="1200" height="750" loading="lazy" decoding="async"></span>
          </span>
          ${existsSync(phone) ? `<span class="proj__phone"><img src="${phone}" alt="" width="390" height="844" loading="lazy" decoding="async"></span>` : ''}
        </a>
        <div class="proj__info">
          <h3><a href="${p.url}" target="_blank" rel="noopener">${esc(p.title)}</a></h3>
          <p class="proj__cat">${esc(p.category)}</p>
          <p class="proj__desc">${esc(p.desc)}</p>
          <ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          <a class="link" href="${p.url}" target="_blank" rel="noopener" tabindex="-1">Zobacz stronę na żywo ${arrow}</a>
        </div>
      </article>`;
}).join('');

const mail = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3.5 6.5L12 13l8.5-6.5"/></svg>';
const tel = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>';
const gh = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4 1.5-4-2-6-2.5m12 5v-3.5a3 3 0 0 0-.9-2.4c3-.3 6-1.4 6-6.5a5 5 0 0 0-1.4-3.5 4.7 4.7 0 0 0-.1-3.5s-1.1-.3-3.6 1.4a12.4 12.4 0 0 0-6.5 0C6.1 1.6 5 1.9 5 1.9a4.7 4.7 0 0 0-.1 3.5A5 5 0 0 0 3.5 9c0 5 3 6.2 6 6.5a3 3 0 0 0-.9 2.3V21"/></svg>';
const li = '<svg class="i" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/></svg>';
let links = '';
if (contact.email) links += `\n        <a class="btn btn--gold btn--lg" href="mailto:${esc(contact.email)}">${mail}${esc(contact.email)}</a>`;
if (contact.phone) links += `\n        <a class="btn btn--line btn--lg" href="tel:${esc(contact.phone.replace(/\s/g, ''))}">${tel}${esc(contact.phone)}</a>`;
if (contact.linkedin) links += `\n        <a class="btn btn--line btn--lg" href="${esc(contact.linkedin)}" target="_blank" rel="noopener">${li}LinkedIn</a>`;
links += `\n        <a class="btn ${contact.email ? 'btn--line' : 'btn--gold'} btn--lg" href="https://github.com/borkowskiPrzemo098" target="_blank" rel="noopener">${gh}GitHub</a>\n        `;

let html = readFileSync('index.html', 'utf8');
const put = (name, body) => {
  html = html.replace(new RegExp(`(<!-- ${name}:START -->)[\\s\\S]*?(<!-- ${name}:END -->)`), `$1${body}$2`);
};
put('PHOTO', `\n          ${photo}\n          `);
put('MARQUEE', marquee);
put('PROJECTS', rows + '\n      ');
put('CONTACT', links);
writeFileSync('index.html', html);
console.log(`built: ${projects.length} projects, photo: ${existsSync('assets/portret.jpg')}, email: ${!!contact.email}`);
