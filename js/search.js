/* Site search (phase 1): client-side, Hebrew-aware. Indexes only text that is displayed on the page.
   Extension point: window.SiteSearch.providers can receive more async providers (e.g. a future AI answer). */
(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const T=(k,fb)=>window.I18N?I18N.t(k,fb):fb;
const LANG=()=>(window.I18N&&I18N.lang)||'he';
const withLang=href=>{const l=LANG();if(l==='he')return href;const i=href.indexOf('#');const b=i>=0?href.slice(0,i):href,h=i>=0?href.slice(i):'';return b+(b.includes('?')?'&':'?')+'lang='+l+h};

/* ---------- normalization ---------- */
const FINALS={'ך':'כ','ם':'מ','ן':'נ','ף':'פ','ץ':'צ'};
const WORD_RE=/[\p{L}\p{N}\u0591-\u05C7\u05F3\u05F4'"’‘”“`]+/gu;
function norm(s){
  return String(s||'').toLowerCase()
    .replace(/[\u05BE\u2010-\u2015\-_/]/g,' ')        // maqaf / hyphens / dashes
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')  // Latin accents
    .replace(/[\u0591-\u05BD\u05BF-\u05C7]/g,'')       // niqqud & te'amim
    .replace(/[\u05F3\u05F4'"’‘”“`´]/g,'')             // geresh / gershayim / quotes
    .replace(/[ךםןףץ]/g,c=>FINALS[c]);
}
const HEB_PREFIX=/^[והבלמשכ]/;
function variants(w,min){ // word forms with up to 2 leading Hebrew prefix letters (ו ה ב ל מ ש כ) removed
  const out=[w];let x=w;min=min||3;
  for(let i=0;i<2&&HEB_PREFIX.test(x)&&x.length-1>=min;i++){x=x.slice(1);out.push(x)}
  return out;
}
function tokens(s){return (norm(s).match(/[\p{L}\p{N}]+/gu)||[])}
function parseQuery(q){
  return tokens(q).filter(t=>t.length>=2||/\d/.test(t)).map(t=>({t,alts:variants(t,4)}));
}
function wordMatches(w,qt){ // w normalized doc word; returns 0 (no), 1 (direct prefix match) or 0.6 (after removing Hebrew prefix letters)
  if(qt.alts.some(a=>w.startsWith(a))) return 1;
  const wv=variants(w);
  for(const a of qt.alts){ for(let i=1;i<wv.length;i++){ if(wv[i].startsWith(a)) return 0.6 } }
  return 0;
}

/* ---------- index (rebuilt from the live DOM / data on each open) ---------- */
const txt=el=>el?el.textContent.replace(/\s+/g,' ').trim():'';
const GROUPS=[
  ['event','search.g.events','אירועים בציר הזמן'],
  ['memory','search.g.memories','זיכרונות'],
  ['photo','search.g.photos','תמונות'],
  ['doc','search.g.docs','מסמכים'],
  ['person','search.g.people','אנשים בעץ המשפחה'],
  ['bio','search.g.bio','קורות חייו'],
  ['story','search.g.stories','סיפורים'],
  ['history','search.g.history','רקע היסטורי']
];
let HISTORY=null;
function loadHistory(){
  if(HISTORY) return Promise.resolve(HISTORY);
  return fetch('history.html').then(r=>r.ok?r.text():'').then(h=>{
    const d=new DOMParser().parseFromString(h,'text/html');const out=[];
    d.querySelectorAll('section.hsec').forEach(sec=>{
      const h3=sec.querySelector('h3[id]');if(!h3)return;
      const tk=h3.getAttribute('data-i18n');
      const title=T(tk,h3.textContent);
      sec.querySelectorAll('p[data-i18n-html]').forEach((p,i)=>{
        const html=T(p.getAttribute('data-i18n-html'),p.innerHTML);
        const tmp=document.createElement('div');tmp.innerHTML=html;
        const body=txt(tmp);
        if(/^(מקורות|Sources|Sources)\s*:/i.test(body))return;
        out.push({type:'history',title,body,href:'history.html#'+h3.id});
      });
    });
    return HISTORY=out;
  }).catch(()=>HISTORY=[]);
}
function buildIndex(){
  const items=[];
  document.querySelectorAll('#tl li.ev').forEach(li=>{
    const card=li.querySelector('.ev-card');if(!card)return;
    const srcLabels=[...card.querySelectorAll('.src-img span,.src-link')].map(txt).join(' · ');
    const srcFull=[...card.querySelectorAll('.src-img[data-full]')].map(b=>b.getAttribute('data-full')||'').join(' ');
    items.push({type:'event',el:li,title:txt(card.querySelector('h3')),sub:txt(card.querySelector('.ev-date')),
      body:[...card.querySelectorAll('p')].map(txt).join(' ')+' '+srcLabels+' '+srcFull});
  });
  document.querySelectorAll('#memList article.mem').forEach(a=>{
    items.push({type:'memory',el:a,title:txt(a.querySelector('.who')),sub:txt(a.querySelector('.when')),body:txt(a.querySelector('.mem-body'))});
  });
  document.querySelectorAll('#galleryWrap .grid button').forEach(b=>{
    const img=b.querySelector('img');
    const per=b.closest('.grid')&&b.closest('.grid').previousElementSibling;
    items.push({type:'photo',el:b,title:txt(b.querySelector('span')),sub:txt(per),body:b.getAttribute('data-full')||'',thumb:img&&img.getAttribute('src')});
  });
  document.querySelectorAll('#docs .doc').forEach(d=>{
    const img=d.querySelector('.pages img');
    items.push({type:'doc',el:d,title:txt(d.querySelector('h3')),sub:txt(d.querySelector('.meta')),body:txt(d.querySelector('p')),thumb:img&&img.getAttribute('src')});
  });
  if(window.TREE) TREE.people.forEach(p=>{
    items.push({type:'person',id:p.id,title:p.name,sub:[p.role,p.dates].filter(Boolean).join(' · '),body:p.detail||''});
  });
  document.querySelectorAll('#bio .bio p').forEach((p,i)=>{
    items.push({type:'bio',el:p,title:T('sec.bio','קורות חייו')+' · '+(i+1),body:txt(p)});
  });
  document.querySelectorAll('#storyCards a.card').forEach(a=>{
    items.push({type:'story',href:a.getAttribute('href'),title:txt(a.querySelector('h3')),sub:txt(a.querySelector('.period')),body:txt(a.querySelector('p'))});
  });
  (HISTORY||[]).forEach(h=>items.push(Object.assign({},h)));
  return items;
}

/* ---------- matching & highlighting ---------- */
function scoreText(s,qs,weight,hit){
  let sc=0;
  for(const m of String(s||'').matchAll(WORD_RE)){
    const w=norm(m[0]).replace(/[^\p{L}\p{N}]/gu,'');if(!w)continue;
    qs.forEach((q,i)=>{const m=wordMatches(w,q);if(m){hit[i]=true;sc+=weight*m}});
  }
  return sc;
}
function search(q,items){
  const qs=parseQuery(q);if(!qs.length)return [];
  const res=[];
  for(const it of items){
    const hit=qs.map(()=>false);
    const sc=scoreText(it.title,qs,5,hit)+scoreText(it.sub,qs,2,hit)+scoreText(it.body,qs,1,hit);
    if(hit.every(Boolean)) res.push(Object.assign({score:sc},it));
  }
  return res.sort((a,b)=>b.score-a.score);
}
function highlight(s,qs){
  let out='',last=0;
  for(const m of String(s).matchAll(WORD_RE)){
    const w=norm(m[0]).replace(/[^\p{L}\p{N}]/gu,'');
    if(w&&qs.some(q=>wordMatches(w,q))){out+=esc(s.slice(last,m.index))+'<mark>'+esc(m[0])+'</mark>';last=m.index+m[0].length}
  }
  return out+esc(s.slice(last));
}
function snippet(s,qs,len){
  s=String(s||'');if(s.length<=len)return s;
  let pos=-1;
  for(const m of s.matchAll(WORD_RE)){const w=norm(m[0]).replace(/[^\p{L}\p{N}]/gu,'');if(w&&qs.some(q=>wordMatches(w,q))){pos=m.index;break}}
  if(pos<0)return s.slice(0,len)+'…';
  let a=Math.max(0,pos-Math.floor(len/3));const sp=s.lastIndexOf(' ',a);if(sp>0&&a-sp<20)a=sp+1;
  return (a>0?'…':'')+s.slice(a,a+len)+(a+len<s.length?'…':'');
}

/* ---------- navigation ---------- */
function flash(el){if(!el)return;el.classList.add('search-flash');setTimeout(()=>el.classList.remove('search-flash'),2600)}
function go(it){
  close();
  if(it.type==='event'){
    const all=document.querySelector('#tlFilter button[data-i="0"]');if(all&&it.el.style.display==='none')all.click();
    if(it.el.classList.contains('ev-ctx')){const c=$('#ctxToggle');if(c&&!c.checked){c.checked=true;c.dispatchEvent(new Event('change'))}}
    setTimeout(()=>{it.el.scrollIntoView({behavior:'smooth',block:'center'});flash(it.el.querySelector('.ev-card'))},30);
  }else if(it.type==='memory'||it.type==='bio'){
    it.el.scrollIntoView({behavior:'smooth',block:'center'});flash(it.el);
  }else if(it.type==='photo'){
    it.el.scrollIntoView({block:'center'});it.el.click();
  }else if(it.type==='doc'){
    it.el.scrollIntoView({block:'center'});flash(it.el);
    const b=it.el.querySelector('button[data-d]');if(b)b.click();
  }else if(it.type==='person'){
    const f=$('#family');if(f)f.scrollIntoView({behavior:'smooth',block:'start'});
    if(window.TREE)TREE.show(it.id);
    setTimeout(()=>{const box=$('#treeInfo');if(box&&!box.hidden){box.scrollIntoView({behavior:'smooth',block:'center'});flash(box)}},400);
  }else if(it.href){
    location.href=it.type==='history'?withLang(it.href):it.href;
  }
}

/* ---------- UI ---------- */
const CHIPS=['מולדוביצה','שרגורוד','בוקרשט','אבו רודס','באר שבע','יד מרדכי','רות'];
const CHIPS_I18N={en:['Moldovița','Shargorod','Bucharest','Abu Rudeis','Beer Sheva','Yad Mordechai','Ruth'],fr:['Moldovița','Chargorod','Bucarest','Abou Rodeis','Beer-Sheva','Yad Mordechai','Ruth']};
let panel,input,out,items=[],last=[],timer=null;
function chipsFor(){return LANG()==='he'?CHIPS:(CHIPS_I18N[LANG()]||CHIPS)}
function ensure(){
  if(panel)return;
  panel=document.createElement('div');panel.className='search-modal';panel.id='searchModal';panel.hidden=true;
  panel.innerHTML=`<div class="search-box" role="dialog" aria-modal="true" aria-labelledby="searchTitle">
    <button type="button" class="search-x" aria-label="${esc(T('lb.close','סגירה'))}">×</button>
    <h3 id="searchTitle">${esc(T('search.title','חיפוש באתר'))}</h3>
    <div class="search-row"><input type="search" id="searchInput" autocomplete="off" enterkeyhint="search"
      placeholder="${esc(T('search.ph','חפשו מקום, שם, שנה…'))}" aria-label="${esc(T('search.title','חיפוש באתר'))}"></div>
    <div class="search-chips" id="searchChips"></div>
    <div class="search-out" id="searchOut" aria-live="polite"></div>
  </div>`;
  document.body.appendChild(panel);
  input=panel.querySelector('#searchInput');out=panel.querySelector('#searchOut');
  panel.querySelector('.search-x').onclick=close;
  panel.addEventListener('click',e=>{if(e.target===panel)close()});
  input.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(run,120)});
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&last.length){e.preventDefault();go(last[0])}});
  panel.querySelector('#searchChips').addEventListener('click',e=>{const c=e.target.closest('button[data-q]');if(!c)return;input.value=c.dataset.q;run();input.focus()});
  out.addEventListener('click',e=>{
    const more=e.target.closest('.search-more');if(more){more.parentElement.classList.add('all');more.remove();return}
    const b=e.target.closest('[data-r]');if(b)go(last[+b.dataset.r]);
  });
}
function renderChips(){
  const box=$('#searchChips');
  const ok=chipsFor().filter(c=>search(c,items).length);
  box.innerHTML=ok.length?`<span class="muted">${esc(T('search.try','נסו:'))}</span> `+ok.map(c=>`<button type="button" data-q="${esc(c)}">${esc(c)}</button>`).join(''):'';
}
function run(){
  const q=input.value.trim();
  if(!q){out.innerHTML='';last=[];return}
  const qs=parseQuery(q);
  last=search(q,items);
  if(!last.length){out.innerHTML=`<p class="muted search-none">${esc(T('search.none','לא נמצאו תוצאות.'))}</p>`;return}
  const counts=`<p class="search-count muted">${esc(T('search.count','{n} תוצאות').replace('{n}',last.length))}</p>`;
  out.innerHTML=counts+GROUPS.map(([type,k,fb])=>{
    const rs=last.map((r,i)=>[r,i]).filter(([r])=>r.type===type);if(!rs.length)return '';
    const cards=rs.map(([r,i],n)=>{
      const th=r.thumb?`<img src="${esc(r.thumb)}" alt="" loading="lazy">`:'';
      const body=r.body?`<span class="sr-body">${highlight(snippet(r.body,qs,170),qs)}</span>`:'';
      return `<button type="button" class="sr${r.thumb?' has-th':''}${n>=6?' extra':''}" data-r="${i}">${th}<span class="sr-txt"><span class="sr-title">${highlight(r.title||'',qs)}</span>${r.sub?`<span class="sr-sub">${highlight(r.sub,qs)}</span>`:''}${body}</span></button>`;
    }).join('');
    const more=rs.length>6?`<button type="button" class="search-more">${esc(T('search.more','עוד {n}').replace('{n}',rs.length-6))}</button>`:'';
    return `<section class="sr-group sr-${type}"><h4>${esc(T(k,fb))} <span class="muted">(${rs.length})</span></h4><div class="sr-list">${cards}${more}</div></section>`;
  }).join('');
}
function open(q){
  ensure();
  items=buildIndex();
  panel.hidden=false;document.body.style.overflow='hidden';
  renderChips();
  if(typeof q==='string'){input.value=q}
  run();
  setTimeout(()=>input.focus(),30);
  if(!HISTORY) loadHistory().then(()=>{items=buildIndex();renderChips();run()});
}
function close(){if(!panel||panel.hidden)return;panel.hidden=true;document.body.style.overflow=''}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&panel&&!panel.hidden){close();return}
  const typing=/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement||{}).tagName||'');
  if(((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k')||(e.key==='/'&&!typing)){e.preventDefault();open()}
});
document.addEventListener('click',e=>{const b=e.target.closest('[data-search-open]');if(b){e.preventDefault();open()}});
const ready=(window.I18N&&I18N.ready)?I18N.ready:Promise.resolve();
ready.then(()=>{
  const q=new URLSearchParams(location.search).get('q');
  if(q) setTimeout(()=>open(q),1200);
});
window.SiteSearch={open,close,search:q=>search(q,buildIndex()),norm,providers:[]};
})();
