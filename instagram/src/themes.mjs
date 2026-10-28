// Motywy kolorystyczne: każda marka dostaje paletę wziętą ze swojej strony (zrzut w ../../shots).
// mode: caps = wersaliki, serif = kursywa Gambetta, sans = Clash Grotesk.
// hook / sub: krótkie hasła marketingowe zbudowane wyłącznie z opisu projektu (bez dopisanych liczb i wyników).
// fx, fy: punkt powiększenia (lupa) na zrzucie desktopowym, jako ułamek szerokości i wysokości.
export const themes = {
  salonpieknoscinikola: {
    mode: 'serif', bg: '#F3E3DC', bg2: '#E8CDC3', fg: '#3E2A25', ac: '#A8503F', ac2: '#5D4843', on: '#FFFFFF', soft: '#FBF1EC',
    hook: 'Cennik, galeria, opinie. I szybka rezerwacja.', sub: 'Strona salonu kosmetycznego', short: 'Nikola', fx: 0.2, fy: 0.55,
  },
  'AMBRA-RESTAURACJA': {
    mode: 'caps', bg: '#0F0B06', bg2: '#2A1E13', fg: '#F3E9D7', ac: '#D9A441', ac2: '#8B5E34', on: '#0F0B06', soft: '#1E160E',
    hook: 'Menu w 6, 7 lub 9 daniach', sub: 'Kuchnia Pomorza', short: 'AMBRA', fx: 0.22, fy: 0.45,
  },
  'PORCELANA-KLINIKA': {
    mode: 'sans', bg: '#E8F0F2', bg2: '#CFE0E6', fg: '#14303A', ac: '#2A6B83', ac2: '#C99A6A', on: '#FFFFFF', soft: '#F6FAFB',
    hook: 'Licówki, implanty, ortodoncja nakładkowa', sub: 'Stomatologia estetyczna', short: 'PORCELANA', fx: 0.25, fy: 0.45,
  },
  'HORYZONT-NIERUCHOMOSCI': {
    mode: 'caps', bg: '#141827', bg2: '#4A3F4C', fg: '#F4EDE6', ac: '#F0A670', ac2: '#6D7BA8', on: '#141827', soft: '#222742',
    hook: '28 pięter. Pięć pór dnia.', sub: 'Latarnia Orłowo', short: 'HORYZONT', fx: 0.25, fy: 0.5,
  },
  'SYGNATURA-KANCELARIA': {
    mode: 'sans', bg: '#101417', bg2: '#17261F', fg: '#F2F4F3', ac: '#3DBE8B', ac2: '#134933', on: '#08140F', soft: '#1A2127',
    hook: 'Prawo gospodarcze, spadki, praca, rodzina', sub: 'Kancelaria adwokacko-radcowska', short: 'SYGNATURA', fx: 0.25, fy: 0.4,
  },
  BARBERSHOP: {
    mode: 'caps', bg: '#0F0D09', bg2: '#2A1D10', fg: '#F2E7D0', ac: '#D0AA5A', ac2: '#6F4F30', on: '#120E08', soft: '#1C150C',
    hook: 'Strzyżenie, broda, golenie brzytwą', sub: 'Rzemiosło w przedwojennym duchu', short: 'SFM', fx: 0.28, fy: 0.45,
  },
  'TRZASK-PALARNIA': {
    mode: 'caps', bg: '#EFE9DD', bg2: '#E3DAC8', fg: '#0B0907', ac: '#F2C230', ac2: '#0B0907', on: '#0B0907', soft: '#FAF6EC',
    hook: 'Wypalona w czwartek. Wysłana w 48 godzin.', sub: 'Palarnia kawy z Księżego Młyna', short: 'TRZASK', fx: 0.22, fy: 0.45,
  },
  'STRONA-SZYCIE': {
    mode: 'serif', bg: '#A64E23', bg2: '#7F3714', fg: '#FAF2E7', ac: '#F4CDA5', ac2: '#FAF2E7', on: '#4A1E0A', soft: '#B8643A',
    hook: 'Siatki i fartuszki szyte na zamówienie', sub: 'Ręcznie, z sercem', short: 'Szyte z Sercem', fx: 0.25, fy: 0.45,
  },
  'az-historia-zlotych-euro': {
    mode: 'serif', bg: '#F6F1E6', bg2: '#E9DDC2', fg: '#3A0B0E', ac: '#571114', ac2: '#B8923A', on: '#F6F1E6', soft: '#FFFAEF',
    hook: 'Złota moneta z Janem Pawłem II', sub: 'Kolekcja złotych monet euro', short: 'Złote Euro', fx: 0.3, fy: 0.45,
  },
  'az-250-lat-usa': {
    mode: 'caps', bg: '#10243F', bg2: '#0A1626', fg: '#F3F1EA', ac: '#E6B84F', ac2: '#C8323C', on: '#10243F', soft: '#1B3556',
    hook: '250 lat USA w złocie', sub: 'Statua Wolności na monecie', short: '250 lat USA', fx: 0.3, fy: 0.4,
  },
  miastometr: {
    mode: 'caps', bg: '#EC6535', bg2: '#D24E1F', fg: '#1B0F0A', ac: '#FFF1E3', ac2: '#1B0F0A', on: '#1B0F0A', soft: '#F58455',
    hook: 'Zmierz swoje miasto', sub: 'Dane GUS i GIOŚ', short: 'Miastometr', fx: 0.5, fy: 0.62,
  },
  'generator-dokumentow-online': {
    mode: 'sans', bg: '#122B6C', bg2: '#0A1A47', fg: '#F5F7FB', ac: '#FFD24A', ac2: '#8FA4E8', on: '#122B6C', soft: '#1F3A85',
    hook: '30 wzorów pism. Jeden PDF.', sub: 'CV, wypowiedzenia, pełnomocnictwa', short: 'Generator', fx: 0.3, fy: 0.42,
  },
  kalkulatory: {
    mode: 'sans', bg: '#E4F1EC', bg2: '#C7E2D7', fg: '#082B25', ac: '#0C5347', ac2: '#F2B63D', on: '#FFFFFF', soft: '#F5FBF8',
    hook: '60 kalkulatorów. Bez rejestracji.', sub: 'VAT, procenty, raty, BMI', short: 'Kalkulatory', fx: 0.3, fy: 0.45,
  },
  'NURT-CRM': {
    mode: 'sans', bg: '#0F141A', bg2: '#1C2530', fg: '#E9EEF2', ac: '#FF7A59', ac2: '#5B6B7C', on: '#160A06', soft: '#1B232C',
    hook: 'Lejek, leady, wyniki. Jeden pulpit.', sub: 'Panel sprzedaży', short: 'NURT', fx: 0.3, fy: 0.2,
  },
  SILECZKOMAT: {
    mode: 'caps', bg: '#0F1216', bg2: '#1E1416', fg: '#F4F4F2', ac: '#FF4D4D', ac2: '#FFFFFF', on: '#190606', soft: '#1D2126',
    hook: 'Plan treningowy z kieszeni. Działa offline.', sub: 'Aplikacja treningowa PWA', short: 'SIŁECZKOMAT', fx: 0.5, fy: 0.26,
  },
};
