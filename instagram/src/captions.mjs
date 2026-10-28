// Generuje captions.md. Opisy opierają się wyłącznie na data/projects.json (bez dopisanych faktów, liczb i wyników).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as T from './templates.mjs';
import * as V from './v2.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const mail = T.contact.email;
const nn = n => String(n).padStart(2, '0');

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
const slots = [['wtorek', '18:00'], ['czwartek', '18:00'], ['sobota', '10:00']];

let md = `# Opisy do postów, karuzel i stories PBDesign

Opisy powstały wyłącznie z treści w \`data/projects.json\` (czyli z index.html portfolio). Nie ma w nich liczb, wyników ani opinii spoza strony.
Przed publikacją przeczytaj każdy opis i dopasuj go do swojego głosu. Linki do stron wstaw w bio (Instagram nie klika linków w opisie).

Każdy projekt ma teraz własną paletę kolorów (wziętą z jego strony) i kilka różnych układów:
- **4 posty 4:5** w różnych szablonach (plakat, pasek, przeglądarka, trio 3D, zbliżenie, kolaż) + kwadrat. Publikuj je w różnych tygodniach, ten sam opis.
- **1 karuzela** w jednym z trzech stylów (panorama = jedna ciągła grafika, przewijanie telefonu, zbliżenia).
- **2 stories** w różnych układach.
- **2 wideo po 5 s** (\`wideo/<projekt>/telefon.mp4\` 9:16 na rolkę lub story, \`wideo/<projekt>/przegladarka.mp4\` 4:5 na feed). Bez dźwięku: muzykę dodaj w aplikacji Instagram. Ten sam opis co posty.

Plan: 3 publikacje tygodniowo (wtorek 18:00, czwartek 18:00, sobota 10:00), karuzela jest głównym formatem. Story z tego samego dnia idzie o 19:30.
Godziny to propozycja do sprawdzenia w statystykach konta po 2-3 tygodniach.

`;

T.projects.forEach((p, i) => {
  const [day, hour] = slots[i % 3];
  const week = Math.floor(i / 3) + 1;
  const client = T.isClient(p);
  const s = p.desc.split(/(?<=[.!?])\s+(?=[A-ZĄĆĘŁŃÓŚŹŻ0-9„"])/);
  const hook = client ? `Nowa realizacja: ${p.title}.` : `Nowy projekt autorski: ${p.title}.`;
  const kind = client ? 'To realizacja dla klienta.' : 'To projekt autorski, nie realizacja dla klienta.';
  const tags = [...tagsByGroup[p.group], cityTag(p), '#PBDesign'].filter(Boolean).slice(0, 8);
  const sl = T.slug(p), car = V.CAROUSELS[i % 3];
  const posts = V.postsFor(i).map((n, k) => `\`posty/${sl}/${nn(k + 1)}-${n}.png\``).join(', ');
  const stories = V.storiesFor(i).map((n, k) => `\`stories/${sl}/${nn(k + 1)}-${n}.png\``).join(', ');
  md += `## ${i + 1}. ${p.title} (${p.kind})

**Publikacja:** tydzień ${week}, ${day} ${hour}, karuzela \`karuzele/${sl}/\` (${car.count} slajdów, styl: ${car.name}).
**Dodatkowo:** stories ${stories} tego samego dnia o 19:30. Posty 4:5 do wykorzystania w kolejnych tygodniach: ${posts} (oraz \`posty/${sl}/kwadrat-plakat.png\`), ten sam opis. Wideo: \`wideo/${sl}/telefon.mp4\` (rolka) i \`wideo/${sl}/przegladarka.mp4\` (feed).

\`\`\`
${hook}

${p.category.replace(' · ', ', ')}. ${s.join(' ')} ${kind}

Chcesz podobną stronę? Napisz: ${mail}
Link do portfolio jest w bio.

${tags.join(' ')}
\`\`\`

`;
});

md += `## Grafiki marki (posty)

Kolejność i terminy: po pierwszych trzech karuzelach, np. tydzień 2 w czwartek, tydzień 4 we wtorek, tydzień 6 w sobotę (godziny jak wyżej).

**\`posty/_marka/wartosci-1-najpierw-telefon.png\`**
\`\`\`
Najpierw telefon.

Każdą stronę zaczynam od widoku na telefonie, bo stamtąd przychodzi większość klientów. Na grafice widać AMBRĘ, projekt autorski.

Chcesz podobną stronę? Napisz: ${mail}

#mobilefirst #webdesign #stronainternetowa #projektowaniestron #responsywnastrona #PBDesign
\`\`\`

**\`posty/_marka/wartosci-2-projekt-kod-publikacja.png\`**
\`\`\`
Projekt + kod + publikacja.

Projektuję i sam koduję strony dla firm, więc nic nie ginie po drodze między pomysłem a działającą stroną.

Chcesz podobną stronę? Napisz: ${mail}

#webdesign #webdev #stronainternetowa #frontend #projektowaniestron #PBDesign
\`\`\`

**\`posty/_marka/wartosci-3-strony-dla-lokalnych-firm.png\`**
\`\`\`
Strony dla lokalnych firm.

Salon, restauracja, klinika, kancelaria: strony, które budują zaufanie i prowadzą do rezerwacji albo kontaktu. Salon Nikola to realizacja dla klienta, pozostałe to projekty autorskie.

Chcesz podobną stronę? Napisz: ${mail}

#stronadlafirmy #lokalnybiznes #seolokalne #webdesign #stronainternetowa #PBDesign
\`\`\`

**\`posty/_marka/portfolio-mozaika.png\`**
\`\`\`
Strony, narzędzia, aplikacje.

Wybrane projekty z portfolio PBDesign: strony firmowe, sklepy, landing page, portale z narzędziami i aplikacje. Każdy projekt oznaczam jako projekt autorski albo realizację dla klienta.

Chcesz podobną stronę? Napisz: ${mail}
Link do portfolio jest w bio.

#portfolio #webdesign #stronainternetowa #projektowaniestron #webdev #PBDesign
\`\`\`

**\`posty/_marka/kazda-marka-ma-swoj-kolor.png\`**
\`\`\`
Każda marka ma swój kolor.

Dla każdego projektu dobieram paletę z jego własnej identyfikacji, zamiast jednego szablonu dla wszystkich.

Chcesz podobną stronę? Napisz: ${mail}

#identyfikacjawizualna #branding #webdesign #kolory #projektowaniestron #PBDesign
\`\`\`

## Story „Dostępne terminy zleceń”

Plik: \`stories/_marka/dostepne-terminy-zlecen.png\`. Publikuj, gdy faktycznie masz wolne terminy. Grafika nie podaje dat ani liczby wolnych miejsc. Jeśli chcesz je dodać, napisz mi konkretne dane.
Dodaj naklejkę z \`stickery/\` (np. „Napisz do mnie”) bezpośrednio w aplikacji Instagram.
`;

fs.writeFileSync(path.resolve(here, '../captions.md'), md);
console.log('captions.md gotowy');
