// Yurt School: platformaning tashqi ko'rinishi (my.gov.uz uslubida).
// Umumiy kod (platforma/app.js) o'zgarmaydi: bu fayl undan keyin yuklanib, chap menyu va
// admin bosh sahifasini qo'shadi. Bo'limlarning o'zi (baholash, to'lov va h.k.) umumiy koddan ishlaydi.
(function(){
Object.assign(IC,{search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'});

// ===== Chap menyu (telefonda — pastki menyu) =====
const side=document.createElement('nav');side.className='ys-side';side.setAttribute('aria-label','Asosiy menyu');document.body.prepend(side);
const tip=document.createElement('span');tip.className='ys-tip';document.body.append(tip);
function items(){if(!ME)return[];
 if(ME.role=='admin'){const L=ADM();return[['home','Bosh sahifa','data-ah="1"',S.ah&&!S.as]].concat(['baholash','kelmagan','ulanish','tolov','taom','oqit','sreyting','fikr','zaxira'].map(k=>L.find(x=>x[1]==k)).filter(Boolean).map(x=>[x[4],x[2],`data-as="${x[1]}"`,S.as==x[1]]))}
 if(ME.role=='parent'){const P=typeof PSEC=='object'?PSEC:{},need={tolov:'tolov',menu:'taomnoma',fikr:'fikr'};
  return[['home','Bosh sahifa','class="pback"',!S.pv]].concat(['bugun','baho','krit','fan','tanga','tolov','menu','fikr'].filter(k=>P[k]&&(!need[k]||ON(need[k]))).map(k=>[P[k][0],P[k][2],`data-pv="${k}"`,S.pv==k]))}
 return[['home','Bosh sahifa','data-ys="top"',true]]}
function paintSide(){if(!ME){side.innerHTML='';return}
 side.innerHTML=`<span class="ys-lg"><img src="img/logo.png" alt="${esc(M.nomi||'')}"></span>`+items().map(([i,t,a,on],j)=>`<button class="ys-nav${on?' on':''}${j>4?' x':''}" ${a} data-tip="${esc(t)}" aria-label="${esc(t)}">${ic(i)}</button>`).join('')+
  `<hr><span class="ys-sp"></span><button class="ys-nav" data-ys="out" data-tip="Chiqish" aria-label="Chiqish">${ic('logout')}</button>`}
side.addEventListener('click',e=>{const b=e.target.closest('.ys-nav');if(!b)return;tip.style.opacity=0;
 if(b.dataset.ys=='out'){$('out').click();return}
 if(b.dataset.ys=='top'){S.tab=0;render();scrollTo(0,0);return}
 setTimeout(()=>{paintSide();scrollTo(0,0)},0)});
side.addEventListener('mouseover',e=>{const b=e.target.closest('[data-tip]');if(!b){tip.style.opacity=0;return}const r=b.getBoundingClientRect();tip.textContent=b.dataset.tip;tip.style.top=(r.top+r.height/2-16)+'px';tip.style.opacity=1});
side.addEventListener('mouseleave',()=>tip.style.opacity=0);
// Har bir oyna chizilganda menyuning faol bandi yangilanadi
const _render=render;render=function(){paintSide();return _render.apply(this,arguments)};
const _pp=parentPaint;parentPaint=function(){const r=_pp.apply(this,arguments);paintSide();return r};

// ===== Admin bosh sahifasi =====
const TG={kelmagan:'#ff6b6b,#e03131',kech:'#ffb36b,#f08c00',ketish:'#a78bfa,#6d28d9',sreyting:'#ffd76a,#f0a400',ulanish:'#6ee7c7,#0fa88f',baholash:'#5b8cff,#2a4fd8',fikr:'#7dd3fc,#0284c7',oqit:'#a78bfa,#6d28d9',oreyting:'#86efac,#16a34a',tolov:'#ff8fb1,#d6336c',taom:'#ffa26b,#e8590c',zaxira:'#94a3b8,#334155'};
const TK={kelmagan:'#e5484d',kech:'#f08c00',ketish:'#7048e8',sreyting:'#f0a400',ulanish:'#1a5cff',baholash:'#0ea5a4',fikr:'#0284c7',oqit:'#6d28d9',oreyting:'#16a34a',tolov:'#d6336c',taom:'#e8590c',zaxira:'#475569'};
async function homeData(){const ci=CL.filter(mainCls).map(c=>c.id),t=nowT().d;
 const[k,rows,st,fb]=await Promise.all([admStats().catch(()=>({st:0,ph:0,cn:0,tc:0,pr:0})),
  ci.length?all(()=>sb.from('daily_scores').select('student_id,att,excused,students!inner(class_id)').eq('day',t).in('students.class_id',ci)).catch(()=>[]):[],
  ci.length?all(()=>sb.from('students').select('class_id').neq('full_name','').in('class_id',ci)).catch(()=>[]):[],
  ON('fikr')?sb.from('feedback').select('id',{count:'exact',head:true}).gte('created_at',t+'T00:00:00+05:00').then(r=>r.count||0,()=>0):0]);
 const C={};CL.filter(mainCls).forEach(c=>C[c.id]={c,n:0,k:0,s:0,y:0});
 st.forEach(r=>{if(C[r.class_id])C[r.class_id].n++});
 rows.forEach(r=>{const x=C[(r.students||{}).class_id];if(!x||r.att==null)return;if(+r.att==1)x.k++;else if(r.excused)x.s++;else x.y++});
 const L=Object.values(C).filter(x=>x.n).sort((a,b)=>clsCmp(a.c,b.c));
 return{k,L,ab:L.reduce((a,x)=>a+x.y,0),un:L.filter(x=>!(x.k+x.s+x.y)).length,fb}}
const _adminPage=adminPage;
adminPage=async function(tk,quiet){if(S.as||!ME||ME.role!='admin')return _adminPage(tk,quiet);
 if(!quiet)$('view').innerHTML='<div class="ld"><i class="spin"></i>Yuklanmoqda…</div>';
 let D;try{D=await homeData()}catch(e){D={k:{st:0,ph:0,cn:0,tc:0,pr:0},L:[],ab:0,un:0,fb:0}}
 if(tk!=S.rt)return;chips();const ch=$('chips').innerHTML;$('chips').innerHTML='';$('chips').className='';
 const t=nowT(),{k,L}=D,A=ADM(),pc=pct(k.cn,k.st),q0=(S.ysq||'');
 const nt=[[D.ab,'#e5484d',`${D.ab} o'quvchi bugun kelmadi`,'kelmagan'],[D.un,'#f0a400',`${D.un} sinfda davomat belgilanmagan`,'baholash'],[D.fb,'#1a5cff',`${D.fb} ta yangi fikr-mulohaza`,'fikr']].filter(x=>x[0]&&A.some(a=>a[1]==x[3]));
 const svc=x=>{const bd=x[1]=='kelmagan'&&D.ab?`<span class="ys-bd r">${D.ab} nafar</span>`:x[1]=='ulanish'&&k.st?`<span class="ys-bd ${pc>=70?'g':pc>=40?'y':'r'}">${pc}% ulangan</span>`:x[1]=='baholash'&&D.un?`<span class="ys-bd y">${D.un} sinf belgilanmagan</span>`:x[1]=='fikr'&&D.fb?`<span class="ys-bd g">${D.fb} ta yangi</span>`:'';
  return`<button class="ys-svc" data-as="${x[1]}" style="--k:${TK[x[1]]||'#1a5cff'}"><span class="c">${ic(x[4])}</span><span><b>${esc(x[2])}</b><small>${esc(x[3])}</small>${bd}</span>${ic('arr')}</button>`};
 $('view').innerHTML=`<section class="ys-hero"><div class="ys-hrow"><h1>Xush kelibsiz!</h1>
  <div class="ys-search"><label>${ic('search')}<input id="ysq" placeholder="Qidiruv: sinf yoki bo'lim nomi…" value="${esc(q0)}" autocomplete="off"></label><div class="ys-res" id="ysr"></div></div>
  <div class="ys-today"><div><span class="ys-pill">${ic('calcheck')}Bugun keldi</span><div class="l">${k.st} o'quvchidan</div></div><div class="ys-num">${k.pr}<small> · ${pct(k.pr,k.st)}%</small></div></div></div>
  <div class="ys-tiles">${M.kirish&&M.kirish.rasm?`<button class="ys-tile" data-ah="1" style="--g:#1d4ed8"><img src="${esc(M.kirish.rasm)}" alt=""><b>${esc(M.nomi)}</b></button>`:''}${A.map(x=>`<button class="ys-tile" data-as="${x[1]}" style="--g:linear-gradient(150deg,${TG[x[1]]||'#5b8cff,#2a4fd8'})"><span class="ico">${ic(x[4])}</span><b>${esc(x[2])}</b></button>`).join('')}</div></section>
 <div class="ys-duo">${A.some(x=>x[1]=='ulanish')?`<button class="ys-big a" data-as="ulanish"><h2>Ota-onalar ulanishi</h2><p>Platformaga ulangan ota-onalar — sinflar kesimida, real vaqtda.</p><span class="more">Batafsil ma'lumot ${ic('arr')}</span>
   <span class="ys-art"><span class="ys-ring" style="--p:${pc}"><div><b>${pc}%</b><span>${k.cn} / ${k.st}</span></div></span></span></button>`:''}
  <button class="ys-big c" data-as="${nt[0]?nt[0][3]:'kelmagan'}"><h2>Bugungi xabarnomalar</h2><p>Muhim holatlar — hech narsani o'tkazib yubormang.</p><span class="more">${nt.length?'Ko\'rish':'Hammasi joyida'} ${ic('arr')}</span>
   <span class="ys-art ys-notes"><em class="${nt.length?'r':''}">${nt.length||'✓'}</em>${nt.length?nt.map(x=>`<div><i style="background:${x[1]}"></i>${esc(x[2])}</div>`).join(''):`<div><i style="background:#12a150"></i>Bugun muhim holat yo'q</div>`}</span></button></div>
 <h3 class="ys-sec">${ic('chart')}Bugungi ko'rsatkichlar</h3>
 <div class="ys-kpi">${[['users',k.st,"O'quvchilar",'#1a5cff'],['calcheck',t.h<9&&!k.pr?'—':pct(k.pr,k.st)+'%','Davomat','#12a150'],['link',k.cn,'Ulangan ota-onalar','#0fa88f'],['cap',k.tc,"O'qituvchilar",'#f0a400']].map(([i,v,l,c])=>`<div class="ys-k" style="--k:${c}"><span class="c">${ic(i)}</span><div><b>${v}</b><span>${l}</span></div></div>`).join('')}</div>
 <h3 class="ys-sec">${ic('grid')}Xizmatlar</h3><div class="ys-grid">${A.map(svc).join('')}</div>
 ${L.length?`<h3 class="ys-sec">${ic('cap')}Sinflar kesimida bugungi davomat</h3><div class="ys-card"><div class="ys-cls">${L.map(x=>{const n=x.n;return`<button class="ys-cr chip" data-c="${x.c.id}"><span>${esc(clsLbl(x.c))}</span><span class="ys-bar"><i style="width:${x.k/n*100}%;background:#12a150"></i><i style="width:${x.s/n*100}%;background:#f0a400"></i><i style="width:${x.y/n*100}%;background:#e5484d"></i></span><b>${x.k+x.s+x.y?pct(x.k,n)+'%':'—'}</b></button>`}).join('')}</div>
  <div class="ys-lgd"><span><i style="background:#12a150"></i>Keldi</span><span><i style="background:#f0a400"></i>Sababli</span><span><i style="background:#e5484d"></i>Kelmadi</span><span><i style="background:color-mix(in srgb,var(--mut) 25%,var(--card))"></i>Belgilanmagan</span></div></div>`:''}
 ${ch?`<h3 class="ys-sec">${ic('grid')}Sinflar va guruhlar</h3><div class="ys-chips">${ch}</div>`:''}`;
 if(q0)ysFind(q0)};
// Qidiruv: sinflar va bo'limlar bo'yicha
function ysFind(v){const r=$('ysr');if(!r)return;v=String(v||'').trim().toLowerCase();S.ysq=v;if(!v){r.classList.remove('on');return}
 const A=ADM().filter(x=>(x[2]+' '+x[3]).toLowerCase().includes(v)).slice(0,6),C=CL.filter(c=>clsLbl(c).toLowerCase().includes(v)).sort(clsCmp).slice(0,8);
 r.innerHTML=A.map(x=>`<button data-as="${x[1]}">${ic(x[4])}${esc(x[2])}<small>bo'lim</small></button>`).join('')+C.map(c=>`<button class="chip" data-c="${c.id}">${ic('school')}${esc(clsLbl(c))}<small>${c.kind=='rep'?'repetitor':c.grp||c.subject?'guruh':'sinf'}</small></button>`).join('')||'<p>Hech narsa topilmadi</p>';
 r.classList.add('on')}
document.addEventListener('input',e=>{if(e.target.id=='ysq')ysFind(e.target.value)});
document.addEventListener('click',e=>{if(!e.target.closest('.ys-search')){const r=$('ysr');if(r)r.classList.remove('on')}if(e.target.closest('#ysr [data-as],#ysr [data-c]'))S.ysq=''});
})();
