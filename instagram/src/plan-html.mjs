// Strona index.html dla folderu PUBLIKACJE: podgląd każdego dnia, przyciski „Kopiuj opis”, odhaczanie opublikowanych.
export const pageHtml = (days, held) => `<!doctype html>
<html lang="pl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Plan publikacji PBDesign</title>
<link rel="stylesheet" href="../src/fonts.css">
<style>
:root{--ivory:#F6F3EC;--green:#1F4435;--green-deep:#15302A;--soft:#DFE8E1;--sand:#E4C99A;--wine:#6B1E2E;--ink:#16181A;--ink2:#4F5450;--line:#D9D4C7}
*{box-sizing:border-box;margin:0}button,.btn,.tab{font-family:inherit}
body{background:var(--ivory);color:var(--ink);font:500 17px/1.45 "Satoshi",system-ui,sans-serif;-webkit-font-smoothing:antialiased}
header{background:var(--green);color:var(--ivory);padding:28px 20px 24px}
.wrap{max-width:980px;margin:0 auto}
h1{font:600 clamp(30px,5vw,44px)/1.05 "Clash Grotesk","Satoshi",sans-serif;letter-spacing:-.02em}
header p{margin-top:10px;color:rgba(246,243,236,.85);max-width:60ch}
.bar{position:sticky;top:0;z-index:5;background:var(--ivory);border-bottom:1px solid var(--line);padding:12px 20px}
.bar .wrap{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.tab{border:2px solid var(--green);background:transparent;color:var(--green);border-radius:999px;padding:9px 18px;font:700 15px/1 inherit;cursor:pointer}
.tab[aria-pressed=true]{background:var(--green);color:var(--ivory)}
.count{margin-left:auto;color:var(--ink2);font-size:15px}
main{padding:22px 20px 60px}
.how{background:#fff;border:1px solid var(--line);border-radius:18px;padding:18px 20px;margin-bottom:22px}
.how ol{padding-left:20px;margin-top:8px}.how li{margin:4px 0}
.card{background:#fff;border:1px solid var(--line);border-radius:22px;overflow:hidden;margin-bottom:18px}
.card.done{opacity:.55}
.card.today{box-shadow:0 0 0 3px var(--sand)}
.top{display:flex;gap:18px;padding:16px;flex-wrap:wrap}
.media{display:flex;gap:6px;flex:0 0 auto;max-width:100%;overflow-x:auto}
.media img,.media video{height:190px;width:auto;border-radius:12px;background:var(--soft);display:block}
.info{flex:1 1 260px;min-width:0}
.date{font:700 14px/1 inherit;letter-spacing:.12em;text-transform:uppercase;color:var(--wine)}
.title{font:600 26px/1.1 "Clash Grotesk","Satoshi",sans-serif;margin-top:8px}
.meta{margin-top:8px;color:var(--ink2);font-size:15px}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
.chip{background:var(--soft);color:var(--green-deep);border-radius:999px;padding:6px 12px;font:700 13px/1 inherit}
.note{margin-top:10px;font-size:15px;color:var(--wine);font-weight:700}
.actions{display:flex;gap:10px;flex-wrap:wrap;padding:0 16px 16px;align-items:center}
.btn{border:0;background:var(--green);color:var(--ivory);border-radius:12px;padding:13px 18px;font:700 16px/1 inherit;cursor:pointer;text-decoration:none;display:inline-block}
.btn.alt{background:var(--soft);color:var(--green-deep)}
.btn.ok{background:var(--sand);color:var(--green-deep)}
label.chk{display:flex;gap:10px;align-items:center;margin-left:auto;font-weight:700;cursor:pointer}
label.chk input{width:22px;height:22px;accent-color:var(--green)}
details{border-top:1px solid var(--line);padding:0 16px}
summary{cursor:pointer;padding:14px 0;font-weight:700;color:var(--green)}
pre{white-space:pre-wrap;font:500 16px/1.5 "Satoshi",system-ui,sans-serif;background:var(--ivory);border-radius:12px;padding:14px;margin-bottom:16px}
.hold{margin-top:24px;color:var(--ink2);font-size:15px}
@media(max-width:560px){.media img,.media video{height:150px}label.chk{margin-left:0}}
</style></head><body>
<header><div class="wrap"><h1>Plan publikacji PBDesign</h1><p>Każdy dzień ma gotowe pliki i opis. Kliknij „Kopiuj opis”, wgraj pliki z folderu dnia i opublikuj o podanej godzinie.</p></div></header>
<div class="bar"><div class="wrap"><button class="tab" data-f="todo" aria-pressed="true">Do opublikowania</button><button class="tab" data-f="all" aria-pressed="false">Wszystko</button><button class="tab" data-f="done" aria-pressed="false">Opublikowane</button><span class="count" id="count"></span></div></div>
<main><div class="wrap">
<div class="how"><b>Jak opublikować w 2 minuty</b><ol><li>Wgraj pliki z folderu dnia (przycisk „Otwórz folder”) do Instagrama: plus → Post albo Rolka.</li><li>Kliknij „Kopiuj opis” i wklej tekst jako opis.</li><li>Przy wideo dodaj muzykę w aplikacji. Opcjonalnie wklej tekst alternatywny.</li><li>Opublikuj i zaznacz „Opublikowane” (zapamiętuje się w tej przeglądarce).</li></ol></div>
<div id="list"></div>
<p class="hold">Wstrzymane do zgody klientów: ${held}. Nie ma ich w kalendarzu.</p>
</div></main>
<script>
const DAYS=${JSON.stringify(days)};
const KEY='pbdesign-ig-done';let done={};try{done=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(done))}catch(e){}};
const today=new Date();const iso=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
let filter='todo';
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
async function copy(text,btn,label){try{await navigator.clipboard.writeText(text)}catch(e){const t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();document.execCommand('copy');t.remove()}const o=btn.textContent;btn.textContent='Skopiowano';btn.classList.add('ok');setTimeout(()=>{btn.textContent=o;btn.classList.remove('ok')},1400)}
function render(){
  const list=document.getElementById('list');list.innerHTML='';let n=0;
  DAYS.forEach((d,i)=>{
    const isDone=!!done[d.folder];
    if(filter==='todo'&&isDone)return;if(filter==='done'&&!isDone)return;n++;
    const el=document.createElement('article');el.className='card'+(isDone?' done':'')+(d.date===iso?' today':'');
    const media=d.files.map(f=>/\\.mp4$/i.test(f)?'<video src="'+esc(d.folder+'/'+f)+'" muted loop playsinline controls preload="metadata"></video>':'<img loading="lazy" src="'+esc(d.folder+'/'+f)+'" alt="">').join('');
    el.innerHTML='<div class="top"><div class="media">'+media+'</div><div class="info"><div class="date">'+esc(d.dow)+' '+esc(d.date)+' · '+esc(d.hour)+(d.date===iso?' · dzisiaj':'')+'</div><div class="title">'+esc(d.who)+'</div><div class="meta">'+esc(d.fmt)+'</div>'+(d.note?'<div class="note">'+esc(d.note)+'</div>':'')+(d.story?'<div class="chips"><span class="chip">Story ok. '+esc(d.storyHour)+': plik '+esc(d.story)+'</span></div>':'')+'</div></div>'+
    '<div class="actions"><button class="btn" data-a="cap">Kopiuj opis</button><button class="btn alt" data-a="alt">Kopiuj tekst alternatywny</button><a class="btn alt" href="'+esc(d.folder)+'/" target="_blank" rel="noopener">Otwórz folder</a><label class="chk"><input type="checkbox" '+(isDone?'checked':'')+'>Opublikowane</label></div>'+
    '<details><summary>Zobacz opis</summary><pre>'+esc(d.caption)+'</pre></details>';
    el.querySelector('[data-a=cap]').onclick=e=>copy(d.caption,e.target);
    el.querySelector('[data-a=alt]').onclick=e=>copy(d.alt,e.target);
    el.querySelector('input').onchange=e=>{if(e.target.checked)done[d.folder]=1;else delete done[d.folder];save();render()};
    list.appendChild(el);
  });
  if(!n)list.innerHTML='<p>Brak pozycji w tym widoku.</p>';
  document.getElementById('count').textContent='Opublikowano: '+Object.keys(done).length+' z '+DAYS.length;
}
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{filter=b.dataset.f;document.querySelectorAll('.tab').forEach(x=>x.setAttribute('aria-pressed',x===b));render()});
render();
</script></body></html>`;
