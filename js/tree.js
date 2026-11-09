(function(){
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const W=168,H=70;

const PEOPLE=[
  {id:'ysr',x:500,y:24,sex:'m',living:false,name:'יצחק רוזנר',dates:'1850 – בערך 1910',role:'סבא מצד האב',detail:'נולד ב־1850 בפוטילה, בוקובינה. נפטר בערך ב־1910 בפוטילה.'},
  {id:'khaya',x:684,y:24,sex:'f',living:false,name:'חיה רוזנר (שרף)',dates:'בערך 1850 – 1935',role:'סבתא מצד האב',detail:'נולדה בערך ב־1850. נפטרה ב־20.11.1935 במולדוביצה. שם נעוריה: שרף (Scharf).'},
  {id:'natan',x:960,y:24,sex:'m',living:false,name:'נתן מרקוביץ׳',dates:'',role:'סבא מצד האם',detail:'בעלה של לואיז מרקוביץ׳ (טאובס) ואביה של רגינה. תאריכי הלידה והפטירה אינם מופיעים ב־Geni.'},
  {id:'louise',x:1144,y:24,sex:'f',living:false,name:'לואיז מרקוביץ׳ (טאובס)',dates:'1873 – 1940',role:'סבתא מצד האם',detail:'נולדה ב־1873 בבורדוז׳ן, רומניה. נפטרה באפריל 1940 במולדוביצה.'},
  {id:'mendel',x:24,y:186,sex:'m',living:false,name:'מנדל וסרמן',dates:'1906 – בערך 1986',role:'גיסו של ליטמן',detail:'בעלה של פפי (רוזנר) וסרמן. 1906 – בערך 1986.'},
  {id:'pepi',x:208,y:186,sex:'f',living:false,name:'פפי וסרמן (רוזנר)',dates:'1909 –',role:'אחותו של ליטמן',detail:'בתם של יצחק וחיה רוזנר, אחות ליטמן. נולדה ב־1909. אשת מנדל וסרמן ואמו של מאיר וסרמן.'},
  {id:'litman',x:540,y:186,sex:'m',living:false,name:'ליטמן רוזנר',dates:'13.1.1886 – 3.3.1979',role:'אבא',detail:'נולד ב־13.1.1886 בקיסליצני, בוקובינה. נפטר ב־3.3.1979 בירושלים.'},
  {id:'regina',x:724,y:186,sex:'f',living:false,name:'רגינה (גינה) רוזנר (מרקוביץ׳)',dates:'15.8.1898 – 23.9.1987',role:'אמא',detail:'נולדה ב־15.8.1898 בבורדוז׳ן, רומניה. נפטרה ב־23.9.1987 בירושלים.'},
  {id:'meyer',x:116,y:360,sex:'m',living:true,name:'מאיר וסרמן',dates:'',role:'בן דוד',detail:'בנם של פפי ומנדל וסרמן.'},
  {id:'berta',x:390,y:360,sex:'f',living:false,name:'ברתה רוזנר (רוזנטל)',dates:'בערך 1914 – 2002',role:'אשתו לשעבר',detail:'נולדה בערך בפברואר 1914 בסלטינה, רומניה. נפטרה בינואר 2002 בחיפה. אמו של דן.'},
  {id:'yitzhak',x:574,y:360,sex:'m',living:false,focus:true,name:'יצחק (ז׳אק) רוזנר',dates:'25.11.1926 – 13.8.2016',role:'',detail:'נולד ב־25.11.1926 ביאשי, רומניה. נפטר ב־13.8.2016 בכפר יונה. בנם של ליטמן ורגינה, אחיה של נלי.',photo:'img/hero.jpg'},
  {id:'ruth',x:758,y:360,sex:'f',living:true,name:'רות רוזנר (וולד)',dates:'',role:'אשתו',detail:'אשתו של יצחק ואמם של שרון ואילון.'},
  {id:'nelly',x:1520,y:360,sex:'f',living:false,name:'נלי גודאנו (רוזנר)',dates:'',role:'אחות',detail:'בתם של ליטמן ורגינה, אחותו של יצחק. אשת הרמן גודאנו ואמו של זאב (אנדי).'},
  {id:'dan',x:196,y:534,sex:'m',living:true,name:'דן רוזנר',dates:'',role:'בן',detail:'בנם של יצחק וברתה.'},
  {id:'sharon',x:560,y:534,sex:'m',living:true,name:'שרון רוזנר',dates:'',role:'בן',detail:'בנם של יצחק ורות. בן זוגה של זהר שפי.'},
  {id:'zohar',x:744,y:534,sex:'f',living:true,name:'זהר שפי',dates:'',role:'בת זוג של שרון',detail:'בת זוגו של שרון רוזנר.'},
  {id:'eylon',x:1114,y:534,sex:'m',living:true,name:'אילון רוזנר',dates:'',role:'בן',detail:'בנם של יצחק ורות. בעלה של שרון (לולאצ׳י).'},
  {id:'sharonL',x:1298,y:534,sex:'f',living:true,name:'שרון רוזנר (לולאצ׳י)',dates:'',role:'אשת אילון',detail:'אשתו של אילון רוזנר.'},
  {id:'zeev',x:1520,y:534,sex:'m',living:true,name:'זאב (אנדי)',dates:'',role:'אחיין',detail:'בנם של נלי והרמן גודאנו. אנדי הוא כינוי הבית.'},
  {id:'ben',x:16,y:708,sex:'m',living:true,name:'בן',dates:'',role:'נכד',detail:'בנו של דן רוזנר.'},
  {id:'ady',x:196,y:708,sex:null,living:true,name:'עדי',dates:'',role:'נכד/ה',detail:'ילדו/ה של דן רוזנר.'},
  {id:'eran',x:376,y:708,sex:'m',living:true,name:'ערן',dates:'',role:'נכד',detail:'בנו של דן רוזנר.'},
  {id:'emanuel',x:560,y:708,sex:'m',living:true,name:'עמנואל',dates:'',role:'נכד',detail:'בנם של שרון רוזנר וזהר שפי.'},
  {id:'noa',x:744,y:708,sex:'f',living:true,name:'נועה',dates:'',role:'נכדה',detail:'בתם של שרון רוזנר וזהר שפי.'},
  {id:'yali',x:936,y:708,sex:'m',living:true,name:'יהלי',dates:'',role:'נכד',detail:'בנם של אילון ושרון רוזנר.'},
  {id:'maya',x:1116,y:708,sex:'f',living:true,name:'מאיה',dates:'',role:'נכדה',detail:'בתם של אילון ושרון רוזנר.'},
  {id:'omri',x:1296,y:708,sex:'m',living:true,name:'עמרי',dates:'',role:'נכד',detail:'בנם של אילון ושרון רוזנר.'},
  {id:'bar',x:1476,y:708,sex:'m',living:true,name:'בר',dates:'',role:'נכד',detail:'בנם של אילון ושרון רוזנר.'}
];
const BY=Object.fromEntries(PEOPLE.map(p=>[p.id,p]));
const CAN_W=1720, CAN_H=820;

const avatar=(sex)=>{
  const fill=sex==='f'?'#e8a0b5':sex==='m'?'#8eb4cc':'#c4b8a8';
  return `<svg class="ft-photo" viewBox="0 0 46 70" aria-hidden="true"><rect width="46" height="70" fill="${fill}"/><circle cx="23" cy="24" r="11" fill="rgba(255,255,255,.55)"/><ellipse cx="23" cy="56" rx="16" ry="18" fill="rgba(255,255,255,.55)"/></svg>`;
};

function cardHTML(p){
  const cls=['ft-card', p.sex==='f'?'f':p.sex==='m'?'m':'n', p.focus?'focus':'', p.living?'':'deceased'].filter(Boolean).join(' ');
  const img=p.photo?`<img class="ft-photo" src="${esc(p.photo)}" alt="">`:avatar(p.sex);
  const dates=p.dates?`<div class="ft-dates">${esc(p.dates)}</div>`:'';
  return `<button type="button" class="${cls}" data-id="${p.id}" style="left:${p.x}px;top:${p.y}px" dir="ltr" aria-label="${esc(p.name)}">
    ${img}<span class="ft-body" dir="rtl"><span class="ft-name">${esc(p.name)}</span>${dates}</span>
  </button>`;
}

function cx(id){const p=BY[id];return p.x+W/2}
function topY(id){return BY[id].y}
function botY(id){return BY[id].y+H}
function coupleMid(a,b){return {x:(cx(a)+cx(b))/2,y:Math.max(botY(a),botY(b))}}

function marry(a,b,dashed){
  const pa=BY[a],pb=BY[b];
  const y=Math.min(pa.y,pb.y)+H/2;
  const x1=Math.min(pa.x+W,pb.x+W), x2=Math.max(pa.x,pb.x);
  return `<line x1="${x1}" y1="${y}" x2="${x2}" y2="${y}" class="${dashed?'ft-dash':''}"/>`;
}
function offspring(parents, kids){
  if(!kids.length)return '';
  let mx, my;
  if(parents.length===2){const m=coupleMid(parents[0],parents[1]);mx=m.x;my=m.y}
  else {mx=cx(parents[0]);my=botY(parents[0])}
  const barY=my+22;
  const xs=kids.map(cx);
  const minX=Math.min(mx,...xs), maxX=Math.max(mx,...xs);
  let s=`<line x1="${mx}" y1="${my}" x2="${mx}" y2="${barY}"/>`;
  if(kids.length>1 || Math.abs(xs[0]-mx)>1) s+=`<line x1="${minX}" y1="${barY}" x2="${maxX}" y2="${barY}"/>`;
  kids.forEach(id=>{s+=`<line x1="${cx(id)}" y1="${barY}" x2="${cx(id)}" y2="${topY(id)}"/>`});
  return s;
}

function render(){
  const root=$('#treeCanvas'); if(!root)return;
  const lines=[
    marry('ysr','khaya'), marry('natan','louise'),
    marry('mendel','pepi'), marry('litman','regina'),
    marry('berta','yitzhak',true), marry('yitzhak','ruth'),
    marry('sharon','zohar'), marry('eylon','sharonL'),
    offspring(['ysr','khaya'],['pepi','litman']),
    offspring(['natan','louise'],['regina']),
    offspring(['mendel','pepi'],['meyer']),
    offspring(['litman','regina'],['yitzhak','nelly']),
    offspring(['berta','yitzhak'],['dan']),
    offspring(['yitzhak','ruth'],['sharon','eylon']),
    offspring(['nelly'],['zeev']),
    offspring(['dan'],['ben','ady','eran']),
    offspring(['sharon','zohar'],['emanuel','noa']),
    offspring(['eylon','sharonL'],['yali','maya','omri','bar'])
  ].join('');
  root.innerHTML=`<svg class="ft-lines" width="${CAN_W}" height="${CAN_H}" viewBox="0 0 ${CAN_W} ${CAN_H}" aria-hidden="true">${lines}</svg>`+
    PEOPLE.map(cardHTML).join('');
  root.style.width=CAN_W+'px'; root.style.height=CAN_H+'px';
}

function showInfo(id){
  const p=BY[id], box=$('#treeInfo'); if(!p||!box)return;
  rootSelect(id);
  const dates=p.dates?`<p class="ft-info-dates">${esc(p.dates)}</p>`:'';
  const role=p.role?`<p class="ft-info-role">${esc(p.role)}</p>`:'';
  box.innerHTML=`<button class="ft-info-x" type="button" aria-label="סגירה">×</button>
    <h3>${esc(p.name)}</h3>${role}${dates}<p>${esc(p.detail)}</p>
    <p class="muted">מקור: העץ ב־Geni${p.living?' · לבני משפחה בחיים מוצג השם בלבד':''}.</p>`;
  box.hidden=false;
  box.querySelector('.ft-info-x').onclick=()=>{box.hidden=true;rootSelect(null)};
}
function rootSelect(id){
  document.querySelectorAll('.ft-card.selected').forEach(el=>el.classList.remove('selected'));
  if(id){const el=document.querySelector(`.ft-card[data-id="${id}"]`); if(el)el.classList.add('selected')}
}

function setupPanZoom(){
  const vp=$('#treeViewport'), canvas=$('#treeCanvas'); if(!vp||!canvas)return;
  let scale=1,tx=0,ty=0,drag=null;
  const apply=()=>{canvas.style.transform=`translate(${tx}px,${ty}px) scale(${scale})`};
  const fit=()=>{
    const r=vp.getBoundingClientRect();
    scale=Math.min((r.width-24)/CAN_W,(r.height-24)/CAN_H,1);
    tx=(r.width-CAN_W*scale)/2; ty=Math.max(12,(r.height-CAN_H*scale)/2);
    apply();
  };
  const zoom=f=>{
    const r=vp.getBoundingClientRect();
    const ns=Math.min(2.2,Math.max(.35,scale*f));
    const cx=r.width/2, cy=r.height/2;
    tx=cx-(cx-tx)*(ns/scale); ty=cy-(cy-ty)*(ns/scale);
    scale=ns; apply();
  };
  $('#treeZoomIn').onclick=()=>zoom(1.18);
  $('#treeZoomOut').onclick=()=>zoom(1/1.18);
  $('#treeZoomFit').onclick=fit;
  vp.addEventListener('wheel',e=>{
    e.preventDefault();
    zoom(e.deltaY<0?1.1:1/1.1);
  },{passive:false});
  vp.addEventListener('pointerdown',e=>{
    if(e.target.closest('.ft-card'))return;
    drag={x:e.clientX,y:e.clientY,tx,ty}; vp.setPointerCapture(e.pointerId);
  });
  vp.addEventListener('pointermove',e=>{
    if(!drag)return;
    tx=drag.tx+(e.clientX-drag.x); ty=drag.ty+(e.clientY-drag.y); apply();
  });
  vp.addEventListener('pointerup',()=>{drag=null});
  vp.addEventListener('pointercancel',()=>{drag=null});
  canvas.addEventListener('click',e=>{
    const b=e.target.closest('.ft-card'); if(b) showInfo(b.dataset.id);
  });
  fit();
  window.addEventListener('resize',fit);
}

const T=(k,fb)=>window.I18N?I18N.t(k,fb):fb;
function localize(){
  PEOPLE.forEach(p=>{
    const k='tree.'+p.id;
    p.name=T(k+'.name',p.name);
    p.dates=T(k+'.dates',p.dates);
    p.role=T(k+'.role',p.role);
    p.detail=T(k+'.detail',p.detail);
  });
}
const _show=showInfo;
showInfo=function(id){
  const p=BY[id], box=$('#treeInfo'); if(!p||!box)return;
  rootSelect(id);
  const dates=p.dates?`<p class="ft-info-dates">${esc(p.dates)}</p>`:'';
  const role=p.role?`<p class="ft-info-role">${esc(p.role)}</p>`:'';
  const living=p.living?' · '+esc(T('tree.livingNote','לבני משפחה בחיים מוצג השם בלבד')):'';
  box.innerHTML=`<button class="ft-info-x" type="button" aria-label="${esc(T('lb.close','סגירה'))}">×</button>
    <h3>${esc(p.name)}</h3>${role}${dates}<p>${esc(p.detail)}</p>
    <p class="muted">${esc(T('tree.source','מקור: העץ ב־Geni'))}${living}.</p>`;
  box.hidden=false;
  box.querySelector('.ft-info-x').onclick=()=>{box.hidden=true;rootSelect(null)};
};
const ready=(window.I18N&&I18N.ready)?I18N.ready:Promise.resolve();
ready.then(()=>{localize();render();setupPanZoom()});
})();
