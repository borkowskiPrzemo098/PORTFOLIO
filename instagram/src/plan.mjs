// Generuje PUBLIKACJE/: folder na każdy dzień z plikami do wrzucenia i opisem do skopiowania.
// Użycie: node src/plan.mjs [--start=2026-10-28] [--dni=30]
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as T from './templates.mjs';
import * as V from './v2.mjs';
import { pageHtml } from './plan-html.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const out = path.join(root, 'out');
const dest = path.join(root, 'PUBLIKACJE');
const arg = (k, d) => (process.argv.find(a => a.startsWith(`--${k}=`)) || `=${d}`).split('=')[1];
const [y, m, d0] = arg('start', '2026-10-28').split('-').map(Number);
const DAYS = Number(arg('dni', 30));
const mail = T.contact.email;
const wd = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
const wds = ['nd', 'pn', 'wt', 'sr', 'cz', 'pt', 'sb'];
const pad = n => String(n).padStart(2, '0');

// realizacje klientów czekają na zgodę klienta na publikację
const HOLD = new Set(['salonpieknoscinikola', 'az-historia-zlotych-euro', 'az-250-lat-usa']);
const eligible = T.projects.filter(p => !HOLD.has(T.slug(p)));
const held = T.projects.filter(p => HOLD.has(T.slug(p)));

const tagsByGroup = {
  firmowe: ['#stronainternetowa', '#stronadlafirmy', '#webdesign', '#projektowaniestron', '#mobilefirst', '#seolokalne'],
  sklepy: ['#sklepinternetowy', '#ecommerce', '#webdesign', '#projektowaniestron', '#branding'],
  landing: ['#landingpage', '#kampania', '#ecommerce', '#webdesign', '#projektowaniestron'],
  portale: ['#narzedziaonline', '#webdesign', '#webdev', '#seo', '#projektowaniestron'],
  aplikacje: ['#aplikacjawebowa', '#dashboard', '#crm', '#webdesign', '#uxui'],
  mobilne: ['#pwa', '#aplikacjamobilna', '#webapp', '#mobilefirst', '#webdesign'],
};
const cityTag = p => {
  const c = p.category.split(' · ')[1];
  return c && /^[A-ZĄĆĘŁŃÓŚŹŻ]/.test(c) && !/[a-ząćęłńóśźż]+ [a-z]/.test(c) ? '#' + c.toLowerCase().replace('ł', 'l').normalize('NFD').replace(/[̀-ͯ]/g, '') : null;
};
const caption = p => {
  const s = p.desc.split(/(?<=[.!?])\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ0-9„"])/);
  const client = T.isClient(p);
  const hook = client ? `Nowa realizacja: ${p.title}.` : `Nowy projekt autorski: ${p.title}.`;
  const kind = client ? 'To realizacja dla klienta.' : 'To projekt autorski, nie realizacja dla klienta.';
  const tags = [...tagsByGroup[p.group], cityTag(p), '#PBDesign'].filter(Boolean).slice(0, 8);
  return `${hook}\n\n${p.category.replace(' · ', ', ')}. ${s.join(' ')} ${kind}\n\nChcesz podobną stronę? Napisz: ${mail}\nLink do portfolio jest w bio.\n\n${tags.join(' ')}`;
};
const alt = p => `Wizualizacja strony ${p.title} (${p.category.replace(' · ', ', ')}) na telefonie i komputerze.`;

const brands = [
  ['wartosci-1-najpierw-telefon.png', 'Najpierw telefon', `Najpierw telefon.\n\nKażdą stronę zaczynam od widoku na telefonie, bo stamtąd przychodzi większość klientów. Na grafice widać AMBRĘ, projekt autorski.\n\nChcesz podobną stronę? Napisz: ${mail}\n\n#mobilefirst #webdesign #stronainternetowa #projektowaniestron #responsywnastrona #PBDesign`],
  ['wartosci-2-projekt-kod-publikacja.png', 'Projekt + kod + publikacja', `Projekt + kod + publikacja.\n\nProjektuję i sam koduję strony dla firm, więc nic nie ginie po drodze między pomysłem a działającą stroną.\n\nChcesz podobną stronę? Napisz: ${mail}\n\n#webdesign #webdev #stronainternetowa #frontend #projektowaniestron #PBDesign`],
  ['portfolio-mozaika.png', 'Portfolio PBDesign', `Strony, narzędzia, aplikacje.\n\nWybrane projekty z portfolio PBDesign: strony firmowe, sklepy, landing page, portale z narzędziami i aplikacje.\n\nChcesz podobną stronę? Napisz: ${mail}\nLink do portfolio jest w bio.\n\n#portfolio #webdesign #stronainternetowa #projektowaniestron #webdev #PBDesign`],
  ['kazda-marka-ma-swoj-kolor.png', 'Każda marka ma swój kolor', `Każda marka ma swój kolor.\n\nDla każdego projektu dobieram paletę z jego własnej identyfikacji, zamiast jednego szablonu dla wszystkich.\n\nChcesz podobną stronę? Napisz: ${mail}\n\n#identyfikacjawizualna #branding #webdesign #kolory #projektowaniestron #PBDesign`],
];

// kolejność formatów dla kolejnych pojawień się tego samego projektu
const SEQ = ['karuzela', 'rolka', 'post1', 'feedwideo', 'post2', 'post3', 'post4'];
const files = (p, kind) => {
  const s = T.slug(p);
  const ls = d => fs.readdirSync(path.join(out, d)).sort();
  if (kind === 'karuzela') return ls(`karuzele/${s}`).map(f => `karuzele/${s}/${f}`);
  if (kind === 'rolka') return [`wideo/${s}/telefon.mp4`];
  if (kind === 'feedwideo') return [`wideo/${s}/przegladarka.mp4`];
  const n = Number(kind.slice(4)) - 1;
  return [`posty/${s}/${ls(`posty/${s}`).filter(f => /^\d\d-/.test(f))[n]}`];
};
const labelOf = { karuzela: 'karuzela', rolka: 'rolka', feedwideo: 'wideo-feed', post1: 'post', post2: 'post', post3: 'post', post4: 'post' };

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
const rows = [];
const days = [];
const uses = {};
let pc = 0;
for (let i = 0; i < DAYS; i++) {
  const date = new Date(y, m - 1, d0 + i);
  const dow = date.getDay(), weekend = dow === 0 || dow === 6;
  const hour = weekend ? '10:00' : '18:00', storyHour = weekend ? '11:30' : '19:30';
  const ds = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  let label, list, cap, altText, note = '', story = null, who, fmtName;
  if (i % 7 === 6) {
    const b = brands[Math.floor(i / 7) % brands.length];
    list = [`posty/_marka/${b[0]}`]; cap = b[2]; altText = `Grafika PBDesign: ${b[1]}.`; who = 'PBDesign'; fmtName = 'post'; label = 'marka-' + b[0].replace('.png', '').slice(0, 24);
  } else {
    const pi = pc % eligible.length, p = eligible[pi], n = (uses[T.slug(p)] = (uses[T.slug(p)] ?? -1) + 1), kind = SEQ[(n + pi * 3) % SEQ.length];
    pc++;
    list = files(p, kind); cap = caption(p); altText = alt(p); who = p.title; fmtName = labelOf[kind];
    label = `${T.slug(p)}_${labelOf[kind]}`;
    story = `stories/${T.slug(p)}/${fs.readdirSync(path.join(out, 'stories', T.slug(p))).sort()[0]}`;
    if (kind === 'rolka' || kind === 'feedwideo') note = 'Wideo jest bez dźwięku: dodaj muzykę w aplikacji Instagram (ikona nutki) przed publikacją.';
    if (kind === 'karuzela') note = 'Karuzela: dodaj slajdy po kolei, w kolejności numerów w nazwach plików.';
  }
  const folder = `${ds}_${wds[dow]}_${label}`;
  const fd = path.join(dest, folder);
  fs.mkdirSync(fd, { recursive: true });
  list.forEach((f, k) => fs.copyFileSync(path.join(out, f), path.join(fd, `${pad(k + 1)}_${path.basename(f).replace(/^\d\d-/, '')}`)));
  if (story) fs.copyFileSync(path.join(out, story), path.join(fd, `STORY_${path.basename(story)}`));
  fs.writeFileSync(path.join(fd, 'opis.txt'), `${wd[dow].toUpperCase()} ${ds}, godzina ${hour}\nFormat: ${fmtName === 'karuzela' ? `karuzela (${list.length} slajdów)` : fmtName}\nProjekt: ${who}\n${note ? note + '\n' : ''}${story ? `Story (opcjonalnie, ok. ${storyHour}): plik STORY_*.png, dodaj naklejkę z out/stickery w aplikacji.\n` : ''}\n=== OPIS DO WKLEJENIA ===\n${cap}\n\n=== TEKST ALTERNATYWNY (Ustawienia zaawansowane przy dodawaniu posta) ===\n${altText}\n`);
  days.push({ date: ds, dow: wd[dow], hour, who, fmt: fmtName === 'karuzela' ? `karuzela (${list.length} slajdów)` : fmtName === 'rolka' ? 'rolka (wideo 9:16)' : fmtName === 'wideo-feed' ? 'wideo na feed (4:5)' : fmtName === 'post' ? 'post (grafika 4:5)' : fmtName, folder, files: list.map((f, k) => `${pad(k + 1)}_${path.basename(f).replace(/^[0-9]{2}-/, '')}`), story: story ? `STORY_${path.basename(story)}` : '', storyHour, note, caption: cap, alt: altText });
  rows.push(`| ${ds} | ${wd[dow]} | ${hour} | ${who} | ${fmtName}${fmtName === 'karuzela' ? ` (${list.length})` : ''} | \`${folder}\` |`);
}

fs.writeFileSync(path.join(dest, 'index.html'), pageHtml(days, held.map(p => p.title).join(', ')));
console.log(`PUBLIKACJE: ${DAYS} dni, folder ${dest}`);
