(function(){
const KEY='yitzhak-lang';
const SUPPORTED=['he','en','fr'];
const DIR={he:'rtl',en:'ltr',fr:'ltr'};

function detect(){
  const q=new URLSearchParams(location.search).get('lang');
  if(SUPPORTED.includes(q)){
    try{localStorage.setItem(KEY,q)}catch(e){}
    return q;
  }
  try{const s=localStorage.getItem(KEY); if(SUPPORTED.includes(s)) return s}catch(e){}
  return 'he';
}
function prefix(){
  return /\/stories\/[^/]*$/.test(location.pathname) ? '../' : '';
}
function withLang(href, lang){
  if(!href || /^(https?:|mailto:|javascript:)/i.test(href)) return href;
  if(href.startsWith('#')) return href;
  const hashIdx=href.indexOf('#');
  const hash=hashIdx>=0?href.slice(hashIdx):'';
  const before=hashIdx>=0?href.slice(0,hashIdx):href;
  const qIdx=before.indexOf('?');
  const path=qIdx>=0?before.slice(0,qIdx):before;
  const params=new URLSearchParams(qIdx>=0?before.slice(qIdx+1):'');
  if(lang==='he') params.delete('lang'); else params.set('lang', lang);
  const q=params.toString();
  return path+(q?'?'+q:'')+hash;
}
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const I18N={
  lang:detect(),
  dict:{},
  t(key, fallback){
    if(key && this.lang!=='he' && Object.prototype.hasOwnProperty.call(this.dict,key) && this.dict[key]!=null) return this.dict[key];
    return fallback!=null?fallback:(key||'');
  },
  apply(root){
    root=root||document;
    document.documentElement.lang=this.lang;
    document.documentElement.dir=DIR[this.lang]||'rtl';
    document.documentElement.setAttribute('data-lang', this.lang);
    const setOrig=(el,attr,val)=>{if(!el.hasAttribute(attr)) el.setAttribute(attr,val)};
    root.querySelectorAll('[data-i18n]').forEach(el=>{
      const k=el.getAttribute('data-i18n');
      setOrig(el,'data-i18n-orig',el.textContent);
      el.textContent=this.t(k, el.getAttribute('data-i18n-orig'));
    });
    root.querySelectorAll('[data-i18n-html]').forEach(el=>{
      const k=el.getAttribute('data-i18n-html');
      setOrig(el,'data-i18n-orig',el.innerHTML);
      el.innerHTML=this.t(k, el.getAttribute('data-i18n-orig'));
    });
    root.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
      const k=el.getAttribute('data-i18n-placeholder');
      setOrig(el,'data-i18n-ph-orig',el.getAttribute('placeholder')||'');
      el.setAttribute('placeholder', this.t(k, el.getAttribute('data-i18n-ph-orig')));
    });
    root.querySelectorAll('[data-i18n-aria]').forEach(el=>{
      const k=el.getAttribute('data-i18n-aria');
      setOrig(el,'data-i18n-aria-orig',el.getAttribute('aria-label')||'');
      el.setAttribute('aria-label', this.t(k, el.getAttribute('data-i18n-aria-orig')));
    });
    root.querySelectorAll('[data-i18n-alt]').forEach(el=>{
      const k=el.getAttribute('data-i18n-alt');
      setOrig(el,'data-i18n-alt-orig',el.getAttribute('alt')||'');
      el.setAttribute('alt', this.t(k, el.getAttribute('data-i18n-alt-orig')));
    });
    const titleEl=document.querySelector('title');
    if(titleEl && titleEl.hasAttribute('data-i18n')){
      setOrig(titleEl,'data-i18n-orig', titleEl.getAttribute('data-i18n-orig')||document.title);
      document.title=this.t(titleEl.getAttribute('data-i18n'), titleEl.getAttribute('data-i18n-orig'));
    }
    const meta=document.querySelector('meta[name="description"]');
    if(meta){
      setOrig(meta,'data-i18n-orig', meta.getAttribute('data-i18n-orig')||meta.getAttribute('content')||'');
      meta.setAttribute('content', this.t('doc.description', meta.getAttribute('data-i18n-orig')));
    }
    root.querySelectorAll('a[href]').forEach(a=>{
      const href=a.getAttribute('href');
      if(!href || /^(https?:|mailto:|javascript:)/i.test(href) || href.startsWith('#')) return;
      if(a.hasAttribute('data-no-lang')) return;
      a.setAttribute('href', withLang(href, this.lang));
    });
    document.querySelectorAll('.lang-switch [data-set-lang]').forEach(b=>{
      const on=b.getAttribute('data-set-lang')===this.lang;
      b.classList.toggle('on', on);
      b.setAttribute('aria-current', on?'true':'false');
    });
    root.querySelectorAll('[data-summary-for]').forEach(el=>this.fillSummary(el));
  },
  fillSummary(el){
    if(this.lang==='he'){el.hidden=true;el.innerHTML='';return}
    const id=el.getAttribute('data-summary-for');
    const orig=el.getAttribute('data-orig-lang')||'he';
    const sum=this.t('story.'+id+'.long', this.t('story.'+id+'.summary',''));
    if(!sum){el.hidden=true;return}
    const note=orig==='en'?this.t('ui.orig_en','(original in English)'):this.t('ui.orig_he','(original in Hebrew)');
    el.innerHTML='<p>'+esc(sum)+'</p><p class="muted">'+esc(note)+'</p>';
    el.hidden=false;
  },
  annotateChapters(container){
    if(!container || this.lang==='he') return;
    container.querySelectorAll('h4[id]').forEach(h=>{
      if(h.nextElementSibling && h.nextElementSibling.classList.contains('chapter-sum')) return;
      const sum=this.t('chapter.'+h.id,'');
      if(!sum) return;
      const p=document.createElement('p');
      p.className='i18n-summary chapter-sum';
      p.innerHTML=esc(sum)+' <span class="muted">'+esc(this.t('ui.orig_he','(original in Hebrew)'))+'</span>';
      h.after(p);
    });
  },
  set(lang){
    if(!SUPPORTED.includes(lang)) return;
    try{localStorage.setItem(KEY,lang)}catch(e){}
    const u=new URL(location.href);
    if(lang==='he') u.searchParams.delete('lang'); else u.searchParams.set('lang',lang);
    location.href=u.toString();
  }
};

I18N.ready=(async()=>{
  if(I18N.lang!=='he'){
    try{
      const r=await fetch(prefix()+'data/i18n/'+I18N.lang+'.json',{cache:'no-cache'});
      if(r.ok) I18N.dict=await r.json();
    }catch(e){console.error(e)}
  }
  const go=()=>{
    I18N.apply();
    document.addEventListener('click',e=>{
      const b=e.target.closest('[data-set-lang]');
      if(!b || !b.closest('.lang-switch')) return;
      e.preventDefault();
      I18N.set(b.getAttribute('data-set-lang'));
    });
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',go);
  else go();
})();

window.I18N=I18N;
})();
