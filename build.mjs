// Renders data/projects.json into index.html (between the LAYERS / PROJECTS markers).
// Usage: node build.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const data = JSON.parse(readFileSync('data/projects.json', 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const arrow = '<svg class="i" viewBox="0 0 20 20" aria-hidden="true"><path d="M6 14L14 6M7.5 6H14v6.5"/></svg>';

const layers = data.categories.map((c) => `
        <div class="layers__group">
          <a class="layers__cat" href="#${c.id}"><svg class="i" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 3h14v14H3zM3 7h14"/></svg>${esc(c.name)}<span>${c.projects.length}</span></a>
          <ul>${c.projects.map((p) => `<li><a href="#p-${p.repo.toLowerCase()}">${esc(p.title)}</a></li>`).join('')}</ul>
        </div>`).join('');

const card = (p, i, all) => {
  const flip = i > 0 && i === all.length - 1 && (all.length - 1) % 2 === 1;
  const url = data.base + p.repo + '/';
  const shot = `shots/${p.repo}.jpg`;
  const phone = `shots/${p.repo}-m.jpg`;
  const hasPhone = existsSync(phone);
  return `
          <article class="art${i === 0 ? ' art--lead' : ''}${flip ? ' art--lead art--flip' : ''}" id="p-${p.repo.toLowerCase()}">
            <p class="frame__name" aria-hidden="true">${esc(url.replace('https://', ''))}</p>
            <a class="art__board" href="${url}" target="_blank" rel="noopener" aria-label="${esc(p.title)}: otwórz stronę w nowej karcie">
              <span class="art__shot"><img src="${shot}" alt="" width="1200" height="750" loading="lazy" decoding="async"></span>
              ${hasPhone ? `<span class="art__phone"><img src="${phone}" alt="" width="390" height="844" loading="lazy" decoding="async"></span>` : ''}
              <span class="art__sel" aria-hidden="true"><i></i><i></i><i></i><i></i><em><b></b>Live · otwórz</em></span>
            </a>
            <div class="art__meta">
              <h4><a href="${url}" target="_blank" rel="noopener">${esc(p.title)}</a></h4>
              <p class="art__client">${esc(p.client)}</p>
              <p class="art__desc">${esc(p.desc)}</p>
              <ul class="tags">${p.tags.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
              <a class="art__open" href="${url}" target="_blank" rel="noopener" tabindex="-1" aria-hidden="true">Otwórz stronę ${arrow}</a>
            </div>
          </article>`;
};

const groups = data.categories.map((c) => `
        <section class="group" id="${c.id}" aria-labelledby="${c.id}-t">
          <header class="group__head">
            <h3 id="${c.id}-t">${esc(c.name)} <span>${c.projects.length}</span></h3>
            <p>${esc(c.lead)}</p>
          </header>
          <div class="group__grid">${c.projects.map(card).join('')}
          </div>
        </section>`).join('');

let html = readFileSync('index.html', 'utf8');
const put = (name, body) => {
  const re = new RegExp(`(<!-- ${name}:START -->)[\\s\\S]*?(\\s*<!-- ${name}:END -->)`);
  html = html.replace(re, `$1${body}$2`);
};
put('LAYERS', layers);
put('PROJECTS', groups);
const total = data.categories.reduce((n, c) => n + c.projects.length, 0);
writeFileSync('index.html', html);
console.log(`built: ${data.categories.length} categories, ${total} projects`);
