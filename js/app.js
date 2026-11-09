(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getJSON=u=>fetch(u,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(u);return r.json()});
/* ---------- lightbox ---------- */
let LB=[],LI=0;
function openLB(list,i){LB=list;LI=i;showLB();$('#lb').hidden=false;document.body.style.overflow='hidden'}
function showLB(){const it=LB[LI];$('#lbImg').src=it.src;$('#lbImg').alt=it.label||'';$('#lbCap').textContent=it.label||'';$('#lbOpen').href=it.src;
  $('.lb-prev').style.display=$('.lb-next').style.display=LB.length>1?'':'none'}
function closeLB(){$('#lb').hidden=true;document.body.style.overflow='';$('#lbImg').src=''}
$('.lb-x').onclick=closeLB;$('#lb').addEventListener('click',e=>{if(e.target.id==='lb')closeLB()});
$('.lb-prev').onclick=()=>{LI=(LI-1+LB.length)%LB.length;showLB()};
$('.lb-next').onclick=()=>{LI=(LI+1)%LB.length;showLB()};
document.addEventListener('keydown',e=>{if($('#lb').hidden)return;if(e.key==='Escape')closeLB();if(e.key==='ArrowLeft')$('.lb-next').click();if(e.key==='ArrowRight')$('.lb-prev').click()});
/* ---------- timeline ---------- */
const ERAS=[['הכול',0,9999],['1926–1940',0,1940.99],['1941–1945',1941,1945.99],['1946–1968',1946,1968.99],['1969–2016',1969,2016.99]];
getJSON('data/timeline.json').then(d=>{
  const ev=d.events.slice().sort((a,b)=>a.year-b.year);
  const tl=$('#tl');
  tl.innerHTML=ev.map(e=>{
    const imgs=e.sources.filter(s=>s.type==='image');
    const srcHtml=e.sources.map(s=>{
      if(s.type==='image'){const k=imgs.indexOf(s);return `<button class="src-img" data-ev="${e.id}" data-k="${k}" title="${esc(s.label)}"><img loading="lazy" src="${esc(s.thumb||s.src)}" alt="${esc(s.label)}"><span>${esc(s.label)}</span></button>`}
      if(s.type==='story')return `<a class="src-link" href="${esc(s.src)}">📖 ${esc(s.label)}</a>`;
      if(s.type==='anchor')return `<a class="src-link" href="${esc(s.src)}">▶ ${esc(s.label)}</a>`;
      return `<a class="src-link" href="${esc(s.src)}" target="_blank" rel="noopener">🔗 ${esc(s.label)}</a>`}).join('');
    return `<li class="ev" data-year="${e.year}" id="${e.id}"><div class="ev-card"><div class="ev-date">${esc(e.date)}</div><h3>${esc(e.title)}</h3>${e.text?`<p>${esc(e.text)}</p>`:''}${e.note?`<p class="note">לבדיקה: ${esc(e.note)}</p>`:''}${e.sources.length?`<div class="srcs">${srcHtml}</div>`:''}</div></li>`}).join('');
  tl.addEventListener('click',x=>{const b=x.target.closest('.src-img');if(!b)return;const e=ev.find(q=>q.id===b.dataset.ev);openLB(e.sources.filter(s=>s.type==='image'),+b.dataset.k)});
  const f=$('#tlFilter');f.innerHTML=ERAS.map((r,i)=>`<button data-i="${i}" class="${i?'':'on'}">${r[0]}</button>`).join('');
  f.onclick=x=>{const b=x.target.closest('button');if(!b)return;f.querySelectorAll('button').forEach(q=>q.classList.toggle('on',q===b));const r=ERAS[+b.dataset.i];
    tl.querySelectorAll('.ev').forEach(li=>{const y=+li.dataset.year;li.style.display=(y>=r[1]&&y<=r[2])?'':'none'})};
}).catch(e=>{$('#tl').innerHTML='<li>שגיאה בטעינת ציר הזמן</li>';console.error(e)});
/* ---------- stories ---------- */
getJSON('data/stories.json').then(st=>{$('#storyCards').innerHTML=st.map(s=>`<a class="card" href="${esc(s.url)}"><span class="period">${esc(s.period)}</span><h3 ${s.lang==='en'?'dir="ltr" style="text-align:right"':''}>${esc(s.title)}</h3><p>${esc(s.summary)}</p><span class="by">${esc(s.author)} · לקריאה ←</span></a>`).join('')});
/* ---------- transcript ---------- */
fetch('data/transcript_part2.txt').then(r=>r.ok?r.text():'').then(t=>{$('#tr2').textContent=t||'תמלול בהכנה.'});
/* ---------- documents ---------- */
getJSON('data/documents.json').then(ds=>{$('#docs').innerHTML=ds.map((d,i)=>`<div class="doc"><h3>${esc(d.title)}</h3><div class="meta">${esc(d.date)} · ${esc(d.lang)}</div><p>${esc(d.caption)}</p><div class="pages">${d.images.map((p,k)=>`<button data-d="${i}" data-k="${k}"><img loading="lazy" src="${esc(p.thumb)}" alt="${esc(p.label)}"></button>`).join('')}</div></div>`).join('');
  $('#docs').onclick=x=>{const b=x.target.closest('button');if(!b)return;openLB(ds[+b.dataset.d].images,+b.dataset.k)}});
/* ---------- gallery ---------- */
getJSON('data/gallery.json').then(g=>{
  const items=g.map(x=>({src:x.full,label:x.caption,thumb:x.thumb,period:x.period}));
  const periods=[...new Set(items.map(x=>x.period))];
  $('#galleryWrap').innerHTML=periods.map(p=>`<h3 class="g-period">${esc(p)}</h3><div class="grid">${items.map((x,i)=>x.period===p?`<button data-i="${i}"><img loading="lazy" src="${esc(x.thumb)}" alt="${esc(x.label)}"><span>${esc(x.label)}</span></button>`:'').join('')}</div>`).join('');
  $('#galleryWrap').onclick=x=>{const b=x.target.closest('button');if(!b)return;openLB(items,+b.dataset.i)}});
/* ---------- memories ---------- */
const CFG=window.SITE_CONFIG||{};const EP=CFG.MEMORIES_ENDPOINT||'';const MAXMB=CFG.MAX_UPLOAD_MB||25;$('#maxMb').textContent=MAXMB;
function renderMem(list){if(!list.length){$('#memList').innerHTML='';return}
  $('#memList').innerHTML=list.map(m=>`<div class="mem"><div class="who">${esc(m.name)}${m.relation?` · <span class="muted">${esc(m.relation)}</span>`:''}</div><div>${esc(m.memory).replace(/\n/g,'<br>')}</div></div>`).join('')}
const staticMem=getJSON('data/memories.json').catch(()=>[]);
const liveMem=EP?getJSON(EP+'?action=list').then(r=>r.items||[]).catch(()=>[]):Promise.resolve([]);
Promise.all([staticMem,liveMem]).then(([a,b])=>renderMem(a.concat(b)));
const form=$('#memForm'),st=$('#memStatus');
if(!EP){const n=document.createElement('p');n.className='notice';n.textContent='טיוטה: הטופס עוד לא מחובר. אחרי ההפעלה, הפניות יישמרו אצל המשפחה ויפורסמו רק אחרי אישור.';form.prepend(n)}
const toB64=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=rej;r.readAsDataURL(f)});
form.addEventListener('submit',async e=>{e.preventDefault();st.className='status';
  const fd=new FormData(form);
  if(!fd.get('name').trim()||!fd.get('memory').trim()){st.textContent='נא למלא שם וזיכרון.';st.classList.add('err');return}
  if(!form.consent.checked){st.textContent='נא לסמן את תיבת ההסכמה.';st.classList.add('err');return}
  if(!EP){st.textContent='הטופס עדיין לא מחובר (טיוטה). לא נשלח דבר.';st.classList.add('err');return}
  const files=[...form.files.files];const total=files.reduce((s,f)=>s+f.size,0);
  if(total>MAXMB*1048576){st.textContent=`הקבצים גדולים מדי (מעל ${MAXMB}MB). אפשר לשלוח בכמה פעמים או להדביק קישור.`;st.classList.add('err');return}
  st.textContent='שולח…';form.querySelector('button[type=submit]').disabled=true;
  try{const payload={name:fd.get('name'),relation:fd.get('relation'),memory:fd.get('memory'),links:fd.get('links'),email:fd.get('email'),website:fd.get('website'),files:[]};
    for(const f of files)payload.files.push({name:f.name,type:f.type||'application/octet-stream',data:await toB64(f)});
    const r=await fetch(EP,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
    const j=await r.json();if(!j.ok)throw new Error(j.error||'error');
    form.reset();st.textContent='תודה! הזיכרון התקבל ויפורסם אחרי אישור המשפחה.';st.classList.add('ok');
  }catch(err){console.error(err);st.textContent='השליחה נכשלה. נסו שוב מאוחר יותר.';st.classList.add('err')}
  finally{form.querySelector('button[type=submit]').disabled=false}});
})();
