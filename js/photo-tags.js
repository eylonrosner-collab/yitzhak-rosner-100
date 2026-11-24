(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const T=(k,fb)=>window.I18N?I18N.t(k,fb):fb;
const LANG=()=>(window.I18N&&I18N.lang)||'he';

let DATA=null;
const ready=fetch('data/photo_tags.json',{cache:'no-cache'})
  .then(r=>{if(!r.ok)throw new Error('photo_tags.json');return r.json()})
  .then(d=>{DATA=d;return d})
  .catch(err=>{console.error(err);DATA={};return DATA});

function fileOf(src){
  if(!src)return '';
  const q=String(src).split('?')[0].split('#')[0];
  return q.split('/').pop();
}
function setFor(src){
  if(!DATA||!src)return null;
  const file=fileOf(src);
  for(const id of Object.keys(DATA)){
    const rec=DATA[id];
    const match=rec.match||[id+'.jpg'];
    if(match.some(m=>file===m || String(src).indexOf(m)!==-1)) return rec;
  }
  return null;
}
function personText(p){
  const k='photo.wedding1934.'+p.id;
  const name=T(k+'.name', p.name);
  const rel=p.rel?T(k+'.rel', p.rel):'';
  return {name, rel};
}
function namesIndex(rec){
  if(!rec)return '';
  const parts=rec.people.map(p=>{
    const t=personText(p);
    return t.rel?t.name+' — '+t.rel:t.name;
  });
  return parts.join(' · ');
}

function numbered(rec){
  return rec.people.slice().sort((a,b)=>(a.box[0]+a.box[2]/2)-(b.box[0]+b.box[2]/2))
    .map((p,i)=>({p,n:i+1}));
}
function renderHotspots(rec){
  return numbered(rec).map(({p,n})=>{
    const [l,t,w,h]=p.box;
    const txt=personText(p);
    const aria=txt.rel?txt.name+' · '+txt.rel:txt.name;
    const body=txt.rel
      ?`<span class="tp-name">${esc(txt.name)}</span><span class="tp-rel">${esc(txt.rel)}</span>`
      :`<span class="tp-name">${esc(txt.name)}</span>`;
    return `<button type="button" class="tp-hot" data-id="${esc(p.id)}" data-n="${n}" data-anchor="${esc(p.anchor||'top')}"
      style="left:${l}%;top:${t}%;width:${w}%;height:${h}%"
      aria-label="${esc(aria)}">
      <span class="tp-num" aria-hidden="true">${n}</span>
      <span class="tp-tip">${body}</span>
    </button>`;
  }).join('');
}
function renderLegend(rec){
  const items=numbered(rec).map(({p,n})=>{
    const txt=personText(p);
    const rel=txt.rel?`<span class="tp-leg-rel">${esc(txt.rel)}</span>`:'';
    return `<button type="button" class="tp-leg-item" data-id="${esc(p.id)}"><span class="tp-num">${n}</span><span class="tp-leg-text"><span class="tp-leg-name">${esc(txt.name)}</span>${rel}</span></button>`;
  }).join('');
  return `<div class="tp-legend" hidden>${items}</div>`;
}

function closeOpen(root){
  if(!root)return;
  root.querySelectorAll('.tp-hot.is-on').forEach(h=>{
    h.classList.remove('is-on');
    h.setAttribute('aria-expanded','false');
  });
}
if(!window.__tpDocBound){
  window.__tpDocBound=1;
  document.addEventListener('click',e=>{
    document.querySelectorAll('.tagged-photo').forEach(root=>{
      if(!root.contains(e.target)) closeOpen(root);
    });
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape') document.querySelectorAll('.tagged-photo').forEach(closeOpen);
  });
}
function bindFrame(root){
  const frame=root.querySelector('.tp-frame');
  if(!frame||frame.dataset.tpBound)return;
  frame.dataset.tpBound='1';
  frame.addEventListener('click',e=>{
    const hot=e.target.closest('.tp-hot');
    if(!hot){closeOpen(root);return}
    e.preventDefault();
    e.stopPropagation();
    const was=hot.classList.contains('is-on');
    closeOpen(root);
    if(!was){
      hot.classList.add('is-on');
      hot.setAttribute('aria-expanded','true');
    }
  });
  frame.addEventListener('pointerover',e=>{
    if(e.pointerType && e.pointerType!=='mouse')return;
    const hot=e.target.closest('.tp-hot');
    if(!hot)return;
    closeOpen(root);
    hot.classList.add('is-on');
    hot.setAttribute('aria-expanded','true');
  });
  frame.addEventListener('pointerleave',e=>{
    if(e.pointerType && e.pointerType!=='mouse')return;
    closeOpen(root);
  });
}

function bindToggle(root){
  const btn=root.querySelector('.tp-toggle');
  if(!btn||btn.dataset.tpBound)return;
  btn.dataset.tpBound='1';
  const legend=root.querySelector('.tp-legend');
  const set=on=>{
    root.classList.toggle('show-all', on);
    btn.setAttribute('aria-pressed', on?'true':'false');
    btn.textContent=on?T('photo.tags.toggleOff','הסתר את השמות'):T('photo.tags.toggleOn','הצג את כל השמות');
    if(legend) legend.hidden=!on;
  };
  set(false);
  btn.addEventListener('click',e=>{
    e.preventDefault();
    e.stopPropagation();
    set(!root.classList.contains('show-all'));
  });
  if(legend){
    legend.addEventListener('click',e=>{
      const item=e.target.closest('.tp-leg-item');
      if(!item)return;
      e.preventDefault();
      e.stopPropagation();
      const hot=root.querySelector('.tp-hot[data-id="'+item.dataset.id+'"]');
      if(!hot)return;
      closeOpen(root);
      hot.classList.add('is-on');
      hot.setAttribute('aria-expanded','true');
      legend.querySelectorAll('.tp-leg-item').forEach(x=>x.classList.toggle('on',x===item));
    });
  }
}

function render({src, alt, featured}){
  const rec=setFor(src);
  if(!rec)return null;
  const root=document.createElement('figure');
  root.className='tagged-photo'+(featured?' tp-featured':'');
  const hint=T('photo.tags.hint','עצרו עם העכבר מעל דמות, או לחצו, כדי לראות את השם ואת הקרבה לז׳אק.');
  const toggle=T('photo.tags.toggleOn','הצג את כל השמות');
  const idx=namesIndex(rec);
  root.innerHTML=`<div class="tp-frame">
      <img src="${esc(src)}" alt="${esc(alt||'')}">
      <div class="tp-hots">${renderHotspots(rec)}</div>
    </div>
    <div class="tp-bar">
      <button type="button" class="tp-toggle" aria-pressed="false">${esc(toggle)}</button>
      <span class="tp-hint">${esc(hint)}</span>
    </div>
    ${renderLegend(rec)}
    <p class="tp-index">${esc(idx)}</p>`;
  bindFrame(root);
  bindToggle(root);
  return root;
}

function unwrapLb(figure,img){
  const frame=figure.querySelector('.tp-frame');
  if(frame && img && frame.contains(img)){
    figure.insertBefore(img, frame);
    frame.remove();
  }
  const bar=figure.querySelector('.tp-bar');
  if(bar) bar.remove();
  figure.classList.remove('tagged-photo','show-all');
}
function decorateLightbox(src){
  const figure=$('#lb figure');
  const img=$('#lbImg');
  if(!figure||!img)return;
  const rec=setFor(src);
  unwrapLb(figure,img);
  if(!rec)return;
  const frame=document.createElement('div');
  frame.className='tp-frame';
  img.parentNode.insertBefore(frame, img);
  frame.appendChild(img);
  const hots=document.createElement('div');
  hots.className='tp-hots';
  hots.innerHTML=renderHotspots(rec);
  frame.appendChild(hots);
  const bar=document.createElement('div');
  bar.className='tp-bar';
  bar.innerHTML=`<button type="button" class="tp-toggle" aria-pressed="false">${esc(T('photo.tags.toggleOn','הצג את כל השמות'))}</button>
    <span class="tp-hint">${esc(T('photo.tags.hint','עצרו עם העכבר מעל דמות, או לחצו, כדי לראות את השם ואת הקרבה לז׳אק.'))}</span>`;
  const cap=$('#lbCap');
  if(cap&&cap.parentNode===figure) cap.after(bar);
  else figure.appendChild(bar);
  const wrap=document.createElement('div');
  wrap.innerHTML=renderLegend(rec);
  bar.after(wrap.firstElementChild);
  figure.classList.add('tagged-photo');
  bindFrame(figure);
  bindToggle(figure);
}
function clearLightbox(){
  const figure=$('#lb figure');
  const img=$('#lbImg');
  if(figure&&img) unwrapLb(figure,img);
}

window.PhotoTags={
  ready,
  has:src=>!!setFor(src),
  namesIndex,
  setFor,
  render,
  decorateLightbox,
  clearLightbox
};
})();
