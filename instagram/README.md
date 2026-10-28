# PBDesign: grafiki na Instagram (wersja 2)

Grafiki są budowane z HTML/CSS i eksportowane do PNG przez Playwright (Chromium, headless). Treści pochodzą z `../data/projects.json` i `../data/contact.json`, zrzuty z `../shots/`, logo z `../assets/mark.svg`.

## Renderowanie wszystkiego jedną komendą

```bash
npm install && npx playwright install chromium && npm run build
```

Przy kolejnych uruchomieniach wystarczy `npm run build`. Komenda czyści `out/posty`, `out/karuzele` i `out/stories`, renderuje wszystko od nowa, wypisuje ostrzeżenia kontroli i odtwarza `captions.md`.
Jeden projekt albo jeden typ: `node src/export.mjs --only=ambra` (lub `--only=stories`).

## Co powstaje (`out/`)

| Folder | Zawartość |
|---|---|
| `posty/<projekt>/01…04-<szablon>.png` | 4 posty 4:5 (1080×1350), każdy w innym szablonie |
| `posty/<projekt>/kwadrat-plakat.png` | wersja kwadratowa 1080×1080 |
| `posty/_marka/` | 3 grafiki wartości, mozaika portfolio, „Każda marka ma swój kolor” |
| `karuzele/<projekt>/NN-<styl>.png` | karuzela (5 lub 6 slajdów) w jednym z 3 stylów |
| `stories/<projekt>/01…02-<szablon>.png` | 2 stories 1080×1920 (marginesy 250 px) |
| `stories/_marka/dostepne-terminy-zlecen.png` | story „Dostępne terminy zleceń” |
| `wideo/<projekt>/telefon.mp4` | wideo 5 s, 1080×1920, 30 kl./s (rolka, story), telefon z przewijaną stroną |
| `wideo/<projekt>/przegladarka.mp4` | wideo 5 s, 1080×1350, 30 kl./s (feed), okno przeglądarki w 3D z przewijaną stroną |
| `stickery/` | 10 naklejek tekstowych i 24 strzałki, obwódki, podkreślenia (PNG z przezroczystością) |
| `captions.md` | opisy po polsku, hashtagi, propozycje terminów |

`out-v1/` to poprzednia (prostsza) wersja serii, zostawiona do porównania. Można ją usunąć.

## Szablony

- **Posty:** plakat (hasło + telefon + laptop 3D), pasek (laptop z ukośnym paskiem hasła), przeglądarka (okno z dymkami), trio (laptop i dwa telefony w perspektywie), zbliżenie (lupa na fragment strony), kolaż (karty z taśmą na kolorowym tle). Każdy projekt dostaje 4 kolejne z 6.
- **Karuzele:** panorama (5 slajdów to jedna ciągła grafika), przewijanie (telefon pokazuje początek, środek i koniec strony), zbliżenia (lupy i kontrastowe slajdy).
- **Stories:** plakat, przeglądarka, podział (kolorowy blok + telefon).

## Wideo

Render: `node src/render-video.mjs` (wszystkie) albo `node src/render-video.mjs --only=barbershop --fmt=telefon`. Wymaga zainstalowanego `ffmpeg`. Animacja to oś czasu Web Animations API przewijana klatka po klatce (90 kl./s, po 3 klatki uśredniane do 30 kl./s dla rozmycia ruchu). Filmy są bez dźwięku. Szablony: `src/video.mjs`.

## Kolory

Każdy projekt ma własną paletę w `src/themes.mjs`, wziętą z jego strony (SFM: czerń i złoto, Miastometr: pomarańcz, Generator: granat i żółć, Szyte z Sercem: terakota itd.). Tam też są krótkie hasła marketingowe (`hook`) zbudowane z opisów projektów oraz punkty powiększenia lupy (`fx`, `fy`).

## Struktura źródeł

- `src/v2.mjs` to szablony, `src/v2.css` ich style, `src/themes.mjs` palety i hasła.
- `src/tokens.css`, `src/fonts.css`, `src/fonts/` to wspólne tokeny, ramki urządzeń i lokalne fonty (render działa offline).
- `src/templates.mjs` to dane projektów i pomocnicze funkcje, `src/stickers.mjs` stickery, `src/export.mjs` render i kontrola, `src/captions.mjs` opisy.
- `src/sheets.mjs <katalog>` robi arkusze podglądu całej serii do szybkiego przeglądu (opcjonalnie). `src/palette.mjs` wyciąga dominujące kolory ze zrzutów.
- `src/export.v1.mjs` to eksport poprzedniej wersji.

## Zasady treści

- Projekty autorskie mają plakietkę „Projekt autorski”, realizacje „Realizacja dla klienta” (jak w portfolio). Nowe hasła nie zawierają liczb ani obietnic spoza opisów projektów.
- Zmiana treści projektu: edytuj `../data/projects.json` (lub hasło w `src/themes.mjs`), potem `npm run build`.
- Szablon „przed / po” nadal pominięty: brak materiałów „przed”.

Nic nie jest publikowane ani wysyłane poza ten folder.

## Plan publikacji (ręczne wrzucanie)

`node src/plan.mjs` (opcje `--start=2026-10-28 --dni=30`) tworzy folder `PUBLIKACJE/`: osobny folder na każdy dzień z numerowanymi plikami do wrzucenia, `opis.txt` (opis do wklejenia, hashtagi, tekst alternatywny, godzina) i opcjonalnym `STORY_*.png`. `PUBLIKACJE/START.md` ma instrukcję i kalendarz. Realizacje klientów (Salon Nikola, AZ Aurum) są pomijane do czasu zgody klientów.
