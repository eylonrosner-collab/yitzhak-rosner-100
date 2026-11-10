(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getJSON=u=>fetch(u,{cache:'no-cache'}).then(r=>{if(!r.ok)throw new Error(u);return r.json()});
const T=(k,fb)=>window.I18N?I18N.t(k,fb):fb;
function withLang(href){
  const lang=window.I18N&&I18N.lang;
  if(!lang||lang==='he'||!href||/^(https?:|mailto:)/i.test(href)||href.startsWith('#')) return href;
  const hashIdx=href.indexOf('#'); const hash=hashIdx>=0?href.slice(hashIdx):'';
  const before=hashIdx>=0?href.slice(0,hashIdx):href;
  return before+(before.includes('?')?'&':'?')+'lang='+lang+hash;
}
function locEv(e){
  const p=(e.context?'ctx.':'tl.')+e.id;
  return Object.assign({},e,{
    date:T(p+'.date',e.date),
    title:T(p+'.title',e.title),
    text:T(p+'.text',e.text||''),
    note:e.note?T(p+'.note',e.note):e.note,
    sources:(e.sources||[]).map((s,i)=>Object.assign({},s,{label:T(p+'.src.'+i,s.label)}))
  });
}
const ready=(window.I18N&&I18N.ready)?I18N.ready:Promise.resolve();
ready.then(()=>{
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
/* ---------- document translation modal ---------- */
let DOC_TR=null;
function loadDocTr(){return DOC_TR?Promise.resolve(DOC_TR):getJSON('data/doc_translations.json').then(d=>DOC_TR=d)}
function closeDocTr(){
  const m=$('#docTr');
  if(!m||m.hidden)return;
  m.hidden=true;
  if($('#lb').hidden) document.body.style.overflow='';
}
function fillDocTr(id){
  const data=DOC_TR&&DOC_TR[id];
  if(!data)return;
  const lang=(window.I18N&&I18N.lang)||'he';
  $('#docTrTitle').textContent=T('doc.'+id+'.tr.title',{dep:'תרגום אישור הגירוש',tr:'תרגום אישור השירות כמתורגמן'}[id]||'תרגום המסמך');
  const xbtn=$('#docTrX');
  if(xbtn) xbtn.setAttribute('aria-label',T('doc.'+id+'.tr.close','סגירה'));
  $('#docTrBody').innerHTML=data.pages.map((p,i)=>{
    const tr=(p.tr&&(p.tr[lang]||p.tr.he))||'';
    const pageLabel=T('doc.'+id+'.tr.page'+(i+1), i?'עמוד 2':'עמוד 1');
    return `<section class="doc-tr-page">
      <h4>${esc(pageLabel)}</h4>
      <div class="doc-tr-text">${esc(tr).replace(/\n/g,'<br>')}</div>
      <h5>${esc(T('doc.'+id+'.tr.orig',{tr:'המקור ברומנית (תרגום מרוסית)'}[id]||'המקור ברומנית'))}</h5>
      <pre class="doc-tr-orig" dir="ltr" lang="ro">${esc(p.original)}</pre>
      <p class="doc-tr-scan"><a href="${esc(p.scan)}" target="_blank" rel="noopener">${esc(T('doc.'+id+'.tr.scan','לצפייה בסריקה'))}</a></p>
    </section>`;
  }).join('');
}
function openDocTr(id){
  loadDocTr().then(()=>{
    fillDocTr(id);
    $('#docTr').hidden=false;
    document.body.style.overflow='hidden';
    const x=$('#docTrX'); if(x) x.focus();
  }).catch(err=>console.error(err));
}
(function(){
  const m=$('#docTr'); if(!m)return;
  const x=$('#docTrX'); if(x) x.onclick=closeDocTr;
  m.addEventListener('click',e=>{if(e.target.id==='docTr')closeDocTr()});
  document.addEventListener('keydown',e=>{if(m.hidden)return;if(e.key==='Escape'){e.preventDefault();closeDocTr();}});
})();
/* ---------- timeline ---------- */
const ERAS=[[T('tl.era.all','הכול'),0,9999],['1926–1940',0,1940.99],['1941–1945',1941,1945.99],['1946–1968',1946,1968.99],['1969–2016',1969,2016.99]];
Promise.all([getJSON('data/timeline.json'),getJSON('data/timeline_context.json').catch(()=>({events:[]}))]).then(([d,c])=>{
  const ev=d.events.concat(c.events).sort((a,b)=>a.year-b.year).map(locEv);
  const raw=d.events.concat(c.events);
  const tl=$('#tl');
  tl.innerHTML=ev.map(e=>{
    const imgs=e.sources.filter(s=>s.type==='image');
    const srcHtml=e.sources.map(s=>{
      if(s.type==='image'){const k=imgs.indexOf(s);return `<button class="src-img" data-ev="${e.id}" data-k="${k}" title="${esc(s.label)}"><img loading="lazy" src="${esc(s.thumb||s.src)}" alt="${esc(s.label)}"><span>${esc(s.label)}</span></button>`}
      if(s.type==='story')return `<a class="src-link" href="${esc(withLang(s.src))}">📖 ${esc(s.label)}</a>`;
      if(s.type==='anchor')return `<a class="src-link" href="${esc(s.src)}">▶ ${esc(s.label)}</a>`;
      if(s.type==='video')return `<a class="src-link vid" href="${esc(s.src)}" target="_blank" rel="noopener">🎥 ${esc(s.label)}</a>`;
      return `<a class="src-link" href="${esc(s.src)}" target="_blank" rel="noopener">🔗 ${esc(s.label)}</a>`}).join('');
    return `<li class="ev${e.context?' ev-ctx':''}" data-year="${e.year}" id="${e.id}"><div class="ev-card">${e.context?'<span class="ctx-tag">'+esc(T('tl.ctxTag','רקע היסטורי'))+'</span>':''}<div class="ev-date">${esc(e.date)}</div><h3>${esc(e.title)}</h3>${e.text?`<p>${esc(e.text)}</p>`:''}${e.note?`<p class="note${e.check===false?' note-info':''}">${e.check===false?'':esc(T('ui.to_check','לבדיקה'))+': '}${esc(e.note)}</p>`:''}${e.translateDoc?`<p class="ev-tr"><button type="button" class="btn ev-tr-btn" data-doc="${esc(e.translateDoc)}">${esc(T('doc.'+e.translateDoc+'.tr.btn',{dep:'תרגום התעודה'}[e.translateDoc]||'תרגום המסמך'))}</button></p>`:''}${e.sources.length?`<div class="srcs">${srcHtml}</div>`:''}</div></li>`}).join('');
  tl.addEventListener('click',x=>{
    const trb=x.target.closest('.ev-tr-btn');
    if(trb){openDocTr(trb.dataset.doc);return;}
    const b=x.target.closest('.src-img');
    if(!b)return;
    const e=ev.find(q=>q.id===b.dataset.ev);
    openLB(e.sources.filter(s=>s.type==='image'),+b.dataset.k);
  });
  const f=$('#tlFilter');f.innerHTML=ERAS.map((r,i)=>`<button data-i="${i}" class="${i?'':'on'}">${r[0]}</button>`).join('')+'<label class="ctx-toggle"><input type="checkbox" id="ctxToggle"> '+esc(T('tl.showCtx','הצג אירועי רקע היסטורי'))+'</label>';
  const ctx=()=>tl.classList.toggle('show-ctx',$('#ctxToggle').checked);$('#ctxToggle').onchange=ctx;
  f.onclick=x=>{const b=x.target.closest('button[data-i]');if(!b)return;f.querySelectorAll('button').forEach(q=>q.classList.toggle('on',q===b));const r=ERAS[+b.dataset.i];
    tl.querySelectorAll('.ev').forEach(li=>{const y=+li.dataset.year;li.style.display=(y>=r[1]&&y<=r[2])?'':'none'})};
}).catch(e=>{$('#tl').innerHTML='<li>'+esc(T('tl.error','שגיאה בטעינת ציר הזמן'))+'</li>';console.error(e)});
/* ---------- stories ---------- */
getJSON('data/stories.json').then(st=>{$('#storyCards').innerHTML=st.map(s=>{
  const title=T('story.'+s.id+'.title',s.title);
  const period=T('story.'+s.id+'.period',s.period);
  const summary=T('story.'+s.id+'.summary',s.summary);
  const author=T('story.'+s.id+'.author',s.author);
  const ltr=s.lang==='en'&&(!window.I18N||I18N.lang==='he');
  return `<a class="card" href="${esc(withLang(s.url))}"><span class="period">${esc(period)}</span><h3 ${ltr?'dir="ltr" style="text-align:start"':''}>${esc(title)}</h3><p>${esc(summary)}</p><span class="by">${esc(author)} · ${esc(T('stories.read','לקריאה ←'))}</span></a>`;
}).join('')});
/* ---------- transcript ---------- */
document.querySelectorAll('.tr-text[data-src]').forEach(el=>fetch(el.dataset.src).then(r=>r.ok?r.text():Promise.reject()).then(h=>{el.innerHTML=h;if(window.I18N)I18N.annotateChapters(el);const t=location.hash&&el.querySelector(location.hash.replace(/[^#\w-]/g,''));if(t){el.closest('details').open=true;setTimeout(()=>t.scrollIntoView({block:'start'}),50)}}).catch(()=>{el.textContent=T('tr.pending','תמלול בהכנה.')}));
document.addEventListener('click',e=>{const b=e.target.closest('button.ts[data-t]');if(!b)return;const a=$('#rec2016');a.currentTime=+b.dataset.t;a.play();a.scrollIntoView({behavior:'smooth',block:'center'})});
if(/^#rec-/.test(location.hash)){const d=$('#tr-rec2016');if(d)d.open=true}
if(/^#(part[12])-/.test(location.hash)){const d=document.getElementById('tr-'+location.hash.slice(1).split('-')[0]);if(d)d.open=true}
/* ---------- documents ---------- */
getJSON('data/documents.json').then(ds=>{
  const loc=ds.map(d=>Object.assign({},d,{
    title:T('doc.'+d.id+'.title',d.title),
    lang:T('doc.'+d.id+'.lang',d.lang),
    caption:T('doc.'+d.id+'.caption',d.caption),
    images:d.images.map((im,k)=>Object.assign({},im,{label:T('doc.'+d.id+'.img.'+k,im.label)}))
  }));
  $('#docs').innerHTML=loc.map((d,i)=>`<div class="doc"><h3>${esc(d.title)}</h3><div class="meta">${esc(d.date)} · ${esc(d.lang)}</div><p>${esc(d.caption)}</p><div class="pages">${d.images.map((p,k)=>`<button data-d="${i}" data-k="${k}"><img loading="lazy" src="${esc(p.thumb)}" alt="${esc(p.label)}"></button>`).join('')}</div></div>`).join('');
  $('#docs').onclick=x=>{const b=x.target.closest('button');if(!b)return;openLB(loc[+b.dataset.d].images,+b.dataset.k)}});
/* ---------- gallery ---------- */
const PERIOD_KEY={
  '1926–1940 · ילדות במולדוביצה':'gallery.period.1',
  '1941–1945 · מלחמה ושחרור':'gallery.period.2',
  '1945–1968 · בוקרשט':'gallery.period.3',
  '1968– · בישראל':'gallery.period.4',
  '2000–2016':'gallery.period.5'
};
getJSON('data/gallery.json').then(g=>{
  const items=g.map(x=>({src:x.full,label:T('gallery.'+x.id,x.caption),thumb:x.thumb,period:x.period}));
  const periods=[...new Set(items.map(x=>x.period))];
  $('#galleryWrap').innerHTML=periods.map(p=>`<h3 class="g-period">${esc(T(PERIOD_KEY[p]||'',p))}</h3><div class="grid">${items.map((x,i)=>x.period===p?`<button data-i="${i}"><img loading="lazy" src="${esc(x.thumb)}" alt="${esc(x.label)}"><span>${esc(x.label)}</span></button>`:'').join('')}</div>`).join('');
  $('#galleryWrap').onclick=x=>{const b=x.target.closest('button');if(!b)return;openLB(items,+b.dataset.i)}});
/* ---------- memories ---------- */
const CFG=window.SITE_CONFIG||{};const EP=CFG.MEMORIES_ENDPOINT||'';const MAXMB=CFG.MAX_UPLOAD_MB||25;if($('#maxMb'))$('#maxMb').textContent=MAXMB;
const MEM_KEY='yitzhak-mem-edits';
const memTokens=()=>{try{return JSON.parse(localStorage.getItem(MEM_KEY)||'{}')||{}}catch(e){return {}}};
const saveMemToken=(id,token)=>{if(!id||!token)return;const o=memTokens();o[id]=token;try{localStorage.setItem(MEM_KEY,JSON.stringify(o))}catch(e){}};
const normFiles=files=>{
  if(!files)return[];
  if(typeof files==='string')return files.split(/\n+/).filter(Boolean).map(url=>({url,type:'',name:''}));
  return Array.isArray(files)?files.filter(Boolean):[];
};
const fileIsImage=f=>!!(f&&(f.thumb||(f.type&&String(f.type).indexOf('image/')===0)||/\.(jpe?g|png|gif|webp|bmp|heic)$/i.test(f.name||f.url||'')));
const parseUserLinks=s=>String(s||'').split(/[\s,]+/).map(x=>x.trim()).filter(x=>/^https?:\/\//i.test(x));
const memTime=m=>{const t=Date.parse(m.date||m.timestamp||'');return Number.isFinite(t)?t:0};
const sortMems=list=>list.slice().sort((a,b)=>(b._pending?1:0)-(a._pending?1:0)||memTime(b)-memTime(a));
let memItems=[];
function renderMem(list){
  memItems=sortMems(list);
  const box=$('#memList');
  if(!memItems.length){box.innerHTML='<p class="muted" id="memEmpty">'+esc(T('mem.empty','אין עדיין זיכרונות. היו הראשונים לכתוב.'))+'</p>';return}
  const tokens=memTokens();
  box.innerHTML=memItems.map((m,i)=>{
    const files=normFiles(m.files);
    const imgs=files.filter(fileIsImage);
    const others=files.filter(f=>!fileIsImage(f));
    const extra=parseUserLinks(m.links);
    const media=[
      ...imgs.map(f=>`<a class="img" href="${esc(f.url)}" target="_blank" rel="noopener"><img loading="lazy" src="${esc(f.thumb||f.url)}" alt="${esc(f.name||m.name||'')}"></a>`),
      ...others.map(f=>`<a class="file" href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.name||T('mem.file','קובץ'))}</a>`),
      ...extra.map(u=>`<a class="file" href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a>`)
    ].join('');
    const canEdit=!!(m.id&&tokens[m.id]);
    return `<article class="mem" data-i="${i}"${m.id?` data-id="${esc(m.id)}"`:''}>
      <div class="who">${esc(m.name||'')}${m.relation?` · <span class="muted">${esc(m.relation)}</span>`:''}</div>
      <div class="when">${esc(m.date||'')}${m.edited?` <span class="edited">${esc(T('mem.edited','(נערך)'))}</span>`:''}</div>
      <div class="mem-body">${esc(m.memory||'').replace(/\n/g,'<br>')}</div>
      ${media?`<div class="mem-media">${media}</div>`:''}
      ${canEdit?`<button type="button" class="mem-edit" data-edit="${esc(m.id)}">${esc(T('mem.edit','ערוך'))}</button>`:''}
    </article>`;
  }).join('');
}
function mergeMem(remote, optimistic){
  let list=(remote||[]).slice();
  if(optimistic){
    const id=optimistic.id;
    if(id&&!list.some(x=>x.id===id)) list=[optimistic,...list];
    else if(!id&&!list.some(x=>x.name===optimistic.name&&x.memory===optimistic.memory)) list=[optimistic,...list];
  }
  return sortMems(list);
}
const staticMem=getJSON('data/memories.json').catch(()=>[]);
function loadLiveMem(){return EP?getJSON(EP+'?action=list').then(r=>r.items||[]).catch(()=>[]):Promise.resolve([])}
function refreshMem(optimistic){
  return Promise.all([staticMem,loadLiveMem()]).then(([a,b])=>renderMem(mergeMem(a.concat(b),optimistic)));
}
refreshMem();
const form=$('#memForm'),st=$('#memStatus'),modal=$('#memModal'),flash=$('#memFlash');
let editing=null,existingFiles=[],removedIds=[];
function setModalMode(edit){
  $('#memModalTitle').textContent=edit?T('mem.editTitle','עריכת זיכרון'):T('mem.add','הוסף זיכרון');
  $('#memSubmit').textContent=edit?T('mem.save','שמירה'):T('mem.submit','שליחה');
}
function renderExisting(){
  const wrap=$('#memExistingFiles');
  const visible=existingFiles.filter(f=>removedIds.indexOf(String(f.id||''))===-1);
  if(!visible.length){wrap.hidden=true;wrap.innerHTML='';return}
  wrap.hidden=false;
  wrap.innerHTML=visible.map(f=>{
    const label=esc(f.name||T('mem.file','קובץ'));
    const thumb=fileIsImage(f)?`<img src="${esc(f.thumb||f.url)}" alt="">`:'';
    return `<div class="ex" data-fid="${esc(f.id||'')}">${thumb}<span>${label}</span><button type="button" class="rm" data-rm="${esc(f.id||'')}">${esc(T('mem.removeFile','הסר'))}</button></div>`;
  }).join('');
}
function openMemModal(item){
  editing=item||null;
  existingFiles=item?normFiles(item.files).slice():[];
  removedIds=[];
  form.reset();st.className='status';st.textContent='';
  if(item){
    form.name.value=item.name||'';
    form.relation.value=item.relation||'';
    form.memory.value=item.memory||'';
    form.links.value=item.links||'';
  }
  setModalMode(!!item);
  renderExisting();
  modal.hidden=false;
  document.body.style.overflow='hidden';
  setTimeout(()=>form.name.focus(),50);
}
function closeMemModal(){
  modal.hidden=true;
  document.body.style.overflow='';
  editing=null;existingFiles=[];removedIds=[];
  form.reset();st.className='status';st.textContent='';
  setModalMode(false);
  const wrap=$('#memExistingFiles');wrap.hidden=true;wrap.innerHTML='';
}
if($('#memOpen'))$('#memOpen').onclick=()=>openMemModal(null);
if($('#memClose'))$('#memClose').onclick=closeMemModal;
modal.addEventListener('click',e=>{if(e.target===modal)closeMemModal()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.hidden)closeMemModal()});
$('#memExistingFiles').addEventListener('click',e=>{
  const b=e.target.closest('[data-rm]');if(!b)return;
  const id=b.getAttribute('data-rm');if(id)removedIds.push(id);
  renderExisting();
});
$('#memList').addEventListener('click',e=>{
  const b=e.target.closest('[data-edit]');if(!b)return;
  const id=b.getAttribute('data-edit');
  const item=memItems.find(m=>m.id===id);
  if(item)openMemModal(item);
});
if(!EP){const n=document.createElement('p');n.className='notice';n.textContent=T('mem.notice','טיוטה: הטופס עוד לא מחובר.');form.prepend(n)}
const toB64=f=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=rej;r.readAsDataURL(f)});
form.addEventListener('submit',async e=>{e.preventDefault();st.className='status';
  const fd=new FormData(form);
  const name=fd.get('name').trim(),memory=fd.get('memory').trim();
  if(!name||!memory){st.textContent=T('mem.err.required','נא למלא שם וזיכרון.');st.classList.add('err');return}
  if(name.length>100||memory.length>10000||String(fd.get('relation')||'').length>100||String(fd.get('links')||'').length>1000||String(fd.get('email')||'').length>200){
    st.textContent=T('mem.err.required','נא למלא שם וזיכרון.');st.classList.add('err');return}
  if(!form.consent.checked){st.textContent=T('mem.err.consent','נא לסמן את תיבת ההסכמה.');st.classList.add('err');return}
  if(!EP){st.textContent=T('mem.err.offline','הטופס עדיין לא מחובר (טיוטה). לא נשלח דבר.');st.classList.add('err');return}
  const files=[...form.files.files];const total=files.reduce((s,f)=>s+f.size,0);
  if(total>MAXMB*1048576){st.textContent=T('mem.err.size','הקבצים גדולים מדי (מעל {n}MB). אפשר לשלוח בכמה פעמים או להדביק קישור.').replace('{n}',MAXMB);st.classList.add('err');return}
  st.textContent=T('mem.sending','שולח…');form.querySelector('button[type=submit]').disabled=true;
  try{
    const payload={name,relation:fd.get('relation'),memory,links:fd.get('links'),email:fd.get('email'),website:fd.get('website'),files:[]};
    for(const f of files)payload.files.push({name:f.name,type:f.type||'application/octet-stream',data:await toB64(f)});
    if(editing&&editing.id&&memTokens()[editing.id]){
      payload.action='update';payload.id=editing.id;payload.token=memTokens()[editing.id];payload.removeIds=removedIds.slice();
    }
    const r=await fetch(EP,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(payload)});
    const j=await r.json();if(!j.ok)throw new Error(j.error||'error');
    if(j.token&&(j.id||(j.item&&j.item.id)))saveMemToken(j.id||j.item.id,j.token);
    const previewFiles=files.filter(f=>f.type.indexOf('image/')===0).map(f=>({url:URL.createObjectURL(f),thumb:URL.createObjectURL(f),name:f.name,type:f.type}));
    const item=j.item||{id:j.id,name,relation:fd.get('relation'),memory,links:fd.get('links'),date:new Date().toISOString().slice(0,10),files:previewFiles,edited:!!editing};
    if(editing) item.edited=true;
    item._pending=true;
    closeMemModal();
    if(flash){flash.className='status ok';flash.textContent=editing?T('mem.okEdit','הזיכרון עודכן.'):T('mem.ok','תודה! הזיכרון נוסף לספר.');}
    refreshMem(item);
  }catch(err){console.error(err);st.textContent=T('mem.err.fail','השליחה נכשלה. נסו שוב מאוחר יותר.');st.classList.add('err')}
  finally{const btn=form.querySelector('button[type=submit]');if(btn)btn.disabled=false}});
});
})();
