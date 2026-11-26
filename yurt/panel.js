// Yurt School: boshqaruv paneli (yangi ko'rinish) — yozuvli chap menyu, yuqori panel va admin bosh sahifasi.
// dizayn.js dan keyin yuklanadi. Barcha raqamlar va grafiklar bazadagi haqiqiy ma'lumotlardan olinadi.
(function(){
Object.assign(IC,{bell:IC.bell||'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
 bolt:'<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',pie:'<path d="M21.2 15.9A10 10 0 1 1 8 2.8"/><path d="M22 12A10 10 0 0 0 12 2v10z"/>',
 rocket:'<path d="M4.5 16.5c-1.5 1.3-2 5-2 5s3.7-.5 5-2c.7-.8.7-2.1-.1-2.9a2.2 2.2 0 0 0-2.9-.1z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.9A12.9 12.9 0 0 1 22 2c0 2.7-.8 7.5-6 11a22.4 22.4 0 0 1-4 2z"/><path d="M9 12H4s.6-3 2-4c1.6-1.1 5 0 5 0M12 15v5s3-.6 4-2c1.1-1.6 0-5 0-5"/>',
 chev:'<path d="m6 9 6 6 6-6"/>',search:IC.search||'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>'});
const fN=v=>Number(v||0).toLocaleString('ru-RU').replace(/,/g,' '),isA=()=>!!ME&&ME.role=='admin';

// ===== Chap menyu: yozuvli, to'q ko'k (telefonda — pastki menyu) =====
const AMENU=[['baholash','Sinflar va baholash'],['kelmagan','Davomat'],['gap',"Baho qo'yilmaganlar"],['oqrey',"O'quvchilar reytingi"],['ulanish','Ota-onalar'],['oqit',"O'qituvchilar"],['oreyting',"O'qituvchilar reytingi"],['tolov',"To'lovlar"],['taom','Taomnoma'],['fikr','Xabarlar'],['parol','Parolni tiklash'],['xodim','Xodimlar va ruxsatlar'],['zaxira','Zaxira nusxa']];
function brand(){return `<div class="yp-brand"><img src="img/logo.png" alt=""><div><b>${esc(M.nomi||'')}</b><small>${esc(M.shior||'Bilim — kelajak kaliti')}</small></div></div>`}
function promo(){return `<div class="yp-promo"><b>${esc(M.nomi||'')}</b><span>bilan maktabingiz yanada rivojlanadi!</span><i>${ic('rocket')}</i></div><div class="yp-copy">© ${new Date().getFullYear()} ${esc(M.nomi||'')}<br>Barcha huquqlar himoyalangan.</div>`}
function paintSide(side){if(!ME){return}
 if(isA()){const L=ADM(),nb=S.ypN||0;
  side.innerHTML=brand()+`<button class="ys-nav yp-n${S.ah&&!S.as?' on':''}" data-ah="1">${ic('home')}<span class="yp-l">Boshqaruv paneli</span></button>`+
   AMENU.map(([k,t])=>{const x=L.find(a=>a[1]==k);return x?`<button class="ys-nav yp-n${S.as==k?' on':''}" data-as="${k}">${ic(x[4])}<span class="yp-l">${esc(t)}</span>${k=='fikr'&&S.ypF?`<em>${S.ypF}</em>`:k=='parol'&&S.ypP?`<em>${S.ypP}</em>`:''}</button>`:''}).join('')+
   `<span class="ys-sp"></span>${promo()}<button class="ys-nav yp-n" data-ys="out">${ic('logout')}<span class="yp-l">Chiqish</span></button>`}
 else{if(!side.querySelector('.yp-brand'))side.insertAdjacentHTML('afterbegin',brand());
  side.querySelectorAll('.ys-nav').forEach(b=>{if(!b.querySelector('.yp-l'))b.insertAdjacentHTML('beforeend',`<span class="yp-l">${esc(b.dataset.tip||'')}</span>`);b.classList.add('yp-n')});
  const l=side.querySelector('.ys-lg');if(l)l.remove()}
 side.dataset.yp='1'}
function watch(){const side=document.querySelector('.ys-side');if(!side)return;
 new MutationObserver(()=>{if(side.dataset.yp!=='1'||(isA()&&!side.querySelector('.yp-brand'))||(!isA()&&side.querySelector('.ys-lg'))){side.dataset.yp='0';paintSide(side)}else if(!isA()&&side.querySelector('.ys-nav:not(.yp-n)'))paintSide(side)}).observe(side,{childList:true});
 side.addEventListener('click',e=>{const b=e.target.closest('.yp-n');if(b&&isA())setTimeout(()=>{side.dataset.yp='0';paintSide(side)},0)})}
watch();

// ===== Yuqori panel: qidiruv, bildirishnoma, maktab, foydalanuvchi =====
function topbar(){const h=document.querySelector('header .hin');if(!h||!ME)return;let t=h.querySelector('.yp-top');
 if(!t){h.insertAdjacentHTML('afterbegin','<div class="yp-top"></div>');t=h.querySelector('.yp-top')}
 const role=ME.role=='admin'?(ME._a2?'Yordamchi admin':ME._obs?'Kuzatuvchi':'Administrator'):ME._bux?'Buxgalter':ME.role=='teacher'?"O'qituvchi":ME.role=='parent'?'Ota-ona':'',nm=ME.full_name||role,ini=String(nm).trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase();
 t.innerHTML=(isA()?`<label class="yp-q">${ic('search')}<input id="ypq" placeholder="Qidiruv… (sinf, bo'lim)" autocomplete="off"><kbd>Ctrl K</kbd><div class="yp-res" id="ypr"></div></label>`:'<span class="yp-q yp-q0"></span>')+
  (isA()?`<button class="yp-bell" data-as="kelmagan" title="Bugungi xabarnomalar">${ic('bell')}${S.ypN?`<em>${S.ypN}</em>`:''}</button>`:'')+
  (M.portal?`<a class="yp-sch" href="${esc(M.portal)}" title="Maktabni almashtirish">${ic('school')}<b>${esc(M.nomi||'')}</b>${ic('chev')}</a>`:'')+
  `<div class="yp-me"><span class="yp-av">${esc(ini||'?')}</span><span><b>${esc(nm)}</b><small>${esc(role)}</small></span></div>`}
document.addEventListener('input',e=>{if(e.target.id!='ypq')return;const v=e.target.value.trim().toLowerCase(),r=$('ypr');if(!r)return;if(!v){r.classList.remove('on');return}
 const A=ADM().filter(x=>(x[2]+' '+x[3]).toLowerCase().includes(v)).slice(0,6),C=CL.filter(c=>clsLbl(c).toLowerCase().includes(v)).sort(clsCmp).slice(0,8);
 r.innerHTML=A.map(x=>`<button data-as="${x[1]}">${ic(x[4])}${esc(x[2])}<small>bo'lim</small></button>`).join('')+C.map(c=>`<button class="chip" data-c="${c.id}">${ic('school')}${esc(clsLbl(c))}<small>${c.kind=='rep'?'repetitor':c.grp||c.subject?'guruh':'sinf'}</small></button>`).join('')||'<p>Hech narsa topilmadi</p>';r.classList.add('on')});
document.addEventListener('click',e=>{if(!e.target.closest('.yp-q')){const r=$('ypr');if(r)r.classList.remove('on')}if(e.target.closest('#ypr button')){const i=$('ypq');if(i)i.value=''}});
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()=='k'){const i=$('ypq');if(i){e.preventDefault();i.focus()}}});
const _r=render;render=function(){const p=_r.apply(this,arguments);try{topbar()}catch(e){}return p};

// ===== Admin bosh sahifasi =====
const pc=(a,b)=>b?Math.min(100,Math.round(a/b*100)):0,iso=d=>d.toISOString().slice(0,10);
async function dash(){const t=nowT(),ci=CL.filter(mainCls).map(c=>c.id),d0=new Date(Date.UTC(+t.d.slice(0,4),+t.d.slice(5,7)-1,+t.d.slice(8,10)));
 const from=iso(new Date(d0-29*864e5)),mFrom=t.d.slice(0,8)+'01';
 const[k,att,gr,ss,py,fb,gaps,fbN,pwR]=await Promise.all([admStats().catch(()=>({st:0,ph:0,cn:0,tc:0,pr:0})),
  ci.length?all(()=>sb.from('daily_scores').select('day,att,excused,students!inner(class_id)').gte('day',from).lte('day',t.d).not('att','is',null).in('students.class_id',ci).order('day')).catch(()=>[]):[],
  all(()=>sb.from('subject_scores').select('grade').gte('day',mFrom).not('grade','is',null).order('id')).catch(()=>[]),
  sb.from('subject_scores').select('subject,grade,updated_at,students(full_name)').order('updated_at',{ascending:false}).limit(5).then(r=>r.data||[],()=>[]),
  sb.from('payments').select('amount,method,received_at,students(full_name)').not('received_at','is',null).order('received_at',{ascending:false}).limit(4).then(r=>r.data||[],()=>[]),
  ON('fikr')?sb.from('feedback').select('category,created_at').order('created_at',{ascending:false}).limit(3).then(r=>r.data||[],()=>[]):[],
  sb.rpc('teacher_gaps',{p_day:t.d}).then(r=>r.error?null:r.data||[],()=>null),
  ON('fikr')?sb.from('feedback').select('id',{count:'exact',head:true}).gte('created_at',t.d+'T00:00:00+05:00').then(r=>r.count||0,()=>0):0,
  ON('xodimlar')&&ADM().some(a=>a[1]=='parol')?sb.rpc('pw_requests').then(r=>r.error?[]:r.data||[],()=>[]):[]]);
 // Davomat: kunlar bo'yicha kelganlar (yakshanbasiz, oxirgi 30 kun)
 const day={};att.forEach(r=>{const x=day[r.day]=day[r.day]||{k:0,y:0};if(+r.att==1)x.k++;else if(!r.excused)x.y++});
 const D=[];for(let i=29;i>=0;i--){const d=new Date(d0-i*864e5);if(d.getUTCDay()==0)continue;const s=iso(d);D.push({d:s,v:(day[s]||{}).k||0,y:(day[s]||{}).y||0,has:!!day[s]})}
 const td=day[t.d]||{k:0,y:0},G={5:0,4:0,3:0,2:0};gr.forEach(r=>{const g=+r.grade;if(g>=5)G[5]++;else if(g==4)G[4]++;else if(g==3)G[3]++;else G[2]++});
 const act=[...ss.map(r=>({t:r.updated_at,c:'#1a5cff',x:`${(r.students||{}).full_name||"O'quvchi"} — ${r.subject||'fan'} bahosi: ${r.grade??'—'}`})),
  ...py.map(r=>({t:r.received_at,c:'#12a150',x:`To'lov qabul qilindi: ${(r.students||{}).full_name||''}${r.amount?' — '+fN(r.amount)+" so'm":''}`})),
  ...fb.map(r=>({t:r.created_at,c:'#f08c00',x:`Yangi fikr-mulohaza: ${r.category||''}`}))].filter(x=>x.t).sort((a,b)=>String(b.t).localeCompare(String(a.t))).slice(0,6);
 S.ypP=pwR.filter(r=>!r.active).length;S.ypN=(td.y?1:0)+(fbN?1:0)+(gaps&&gaps.some(g=>g.done<g.n)?1:0)+(S.ypP?1:0);S.ypF=fbN;
 return{t,k,D,td,G,act,gaps,fbN}}
// Chiziqli grafik (bitta qator: kelganlar soni) — tegilganda sana va qiymat
function lineSvg(D){const W=480,H=320,l=40,r=14,tp=16,b=30,mx=Math.max(10,...D.map(x=>x.v)),top=Math.ceil(mx/(mx>200?100:mx>50?20:5))*(mx>200?100:mx>50?20:5);
 const X=i=>l+(D.length<2?0:i*(W-l-r)/(D.length-1)),Y=v=>tp+(H-tp-b)*(1-v/top),pts=D.map((x,i)=>[X(i),Y(x.v)]);
 const path=pts.map((p,i)=>(i?'L':'M')+p[0].toFixed(1)+' '+p[1].toFixed(1)).join(' '),area=path+` L${X(D.length-1)} ${H-b} L${X(0)} ${H-b} Z`;
 const ticks=[0,.25,.5,.75,1].map(f=>Math.round(top*f)),lb=D.map((x,i)=>(i%Math.ceil(D.length/7)==0&&D.length-1-i>=Math.ceil(D.length/7)/2)||i==D.length-1?`<text x="${X(i)}" y="${H-10}" class="yp-ax" text-anchor="middle">${x.d.slice(8)}.${x.d.slice(5,7)}</text>`:'').join('');
 const last=pts[pts.length-1];
 return `<div class="yp-lc"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Kunlar bo'yicha maktabga kelganlar soni">
  <defs><linearGradient id="ypg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a5cff" stop-opacity=".22"/><stop offset="1" stop-color="#1a5cff" stop-opacity="0"/></linearGradient></defs>
  ${ticks.map(v=>`<line x1="${l}" x2="${W-r}" y1="${Y(v)}" y2="${Y(v)}" class="yp-gr"/><text x="${l-8}" y="${Y(v)+4}" class="yp-ax" text-anchor="end">${v}</text>`).join('')}${lb}
  <path d="${area}" fill="url(#ypg)"/><path d="${path}" fill="none" stroke="#1a5cff" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
  ${last?`<circle cx="${last[0]}" cy="${last[1]}" r="5" fill="#1a5cff" stroke="var(--card)" stroke-width="2"/>`:''}
  <line class="yp-ch" x1="0" x2="0" y1="${tp}" y2="${H-b}"/><circle class="yp-cd" r="5" fill="#1a5cff" stroke="var(--card)" stroke-width="2"/></svg><div class="yp-tt"></div>
  ${last?`<span class="yp-pin" style="left:${last[0]/W*100}%;top:${last[1]/H*100}%">${D[D.length-1].v}</span>`:''}</div>`}
function lineHover(el,D){const svg=el.querySelector('svg'),tt=el.querySelector('.yp-tt'),ch=el.querySelector('.yp-ch'),cd=el.querySelector('.yp-cd');if(!svg)return;const W=480,H=320,l=40,r=14;
 const mx=Math.max(10,...D.map(x=>x.v)),st=mx>200?100:mx>50?20:5,top=Math.ceil(mx/st)*st,Y=v=>16+(H-16-30)*(1-v/top);
 el.addEventListener('pointermove',e=>{const b=svg.getBoundingClientRect(),x=(e.clientX-b.left)/b.width*W,i=Math.max(0,Math.min(D.length-1,Math.round((x-l)/((W-l-r)/(D.length-1||1))))),px=l+i*(W-l-r)/(D.length-1||1);
  ch.setAttribute('x1',px);ch.setAttribute('x2',px);cd.setAttribute('cx',px);cd.setAttribute('cy',Y(D[i].v));el.classList.add('hv');
  const dd=D[i].d;tt.innerHTML=`<b>${+dd.slice(8)}-${MON[+dd.slice(5,7)-1]}</b><span><i></i>Keldi: <b>${D[i].v}</b></span>${D[i].y?`<span class="mut">Kelmadi (sababsiz): ${D[i].y}</span>`:''}${D[i].has?'':'<span class="mut">Davomat belgilanmagan</span>'}`;
  tt.style.left=Math.min(b.width-150,Math.max(0,px/W*b.width-70))+'px'});
 el.addEventListener('pointerleave',()=>el.classList.remove('hv'))}
function donut(G){const L=[['A\'lo (5)',G[5],'#12a150'],['Yaxshi (4)',G[4],'#1a5cff'],['Qoniqarli (3)',G[3],'#f0a400'],['Qoniqarsiz (1–2)',G[2],'#e5484d']],n=L.reduce((q,x)=>q+x[1],0);
 if(!n)return `<div class="yp-emp">${ic('pie')}<b>Bu oy hali fan baholari qo'yilmagan</b><span class="mut">Fan o'qituvchilari baho qo'yishi bilan shu yerda tahlil paydo bo'ladi.</span></div>`;
 const R=52,C=2*Math.PI*R,gap=n>1?2:0;let off=0;const seg=L.filter(x=>x[1]).map(([t,v,c])=>{const len=v/n*C,s=`<circle r="${R}" cx="70" cy="70" fill="none" stroke="${c}" stroke-width="18" stroke-dasharray="${Math.max(0,len-gap)} ${C}" stroke-dashoffset="${-off}" transform="rotate(-90 70 70)"><title>${t}: ${v} ta (${pc(v,n)}%)</title></circle>`;off+=len;return s}).join('');
 const avg=Math.round((G[5]*100+G[4]*80+G[3]*60+G[2]*30)/n);
 return `<div class="yp-dn"><svg viewBox="0 0 140 140" role="img" aria-label="Baholar taqsimoti">${seg}<text x="70" y="68" text-anchor="middle" class="yp-dv">${pc(G[5]+G[4],n)}%</text><text x="70" y="86" text-anchor="middle" class="yp-dl">4 va 5 baho</text></svg>
  <ul>${L.map(([t,v,c])=>`<li><i style="background:${c}"></i><span>${t}</span><b>${pc(v,n)}%</b><small>${v} ta</small></li>`).join('')}</ul></div>
  <div class="yp-note">${ic('trophy')}<span>Bu oy a'lo baholar: <b>${G[5]} ta</b> · jami ${n} ta fan bahosi</span></div>`}
function spark(D,c){const v=D.slice(-14).map(x=>x.v),mx=Math.max(1,...v),pts=v.map((y,i)=>`${(i*(100/(v.length-1||1))).toFixed(1)},${(28-y/mx*24).toFixed(1)}`).join(' ');
 return `<svg class="yp-sp" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/></svg>`}
const tm=v=>new Date(v).toLocaleTimeString('uz-UZ',{timeZone:TZ,hour:'2-digit',minute:'2-digit'}),dm=v=>{const d=new Date(v).toLocaleDateString('en-CA',{timeZone:TZ});return d==today?tm(v):d.slice(8)+'.'+d.slice(5,7)};
const _ap=adminPage;
adminPage=async function(tk,quiet){if(S.as||!ME||ME.role!='admin')return _ap(tk,quiet);
 if(!quiet)$('view').innerHTML='<div class="ld"><i class="spin"></i>Yuklanmoqda…</div>';
 let X;try{X=await dash()}catch(e){return _ap(tk,quiet)}if(tk!=S.rt)return;
 chips();const ch=$('chips').innerHTML;$('chips').innerHTML='';$('chips').className='';
 const{t,k,D,td,G,act,gaps}=X,A=ADM(),has=x=>A.some(a=>a[1]==x),nCls=CL.filter(mainCls).length,nGr=CL.length-nCls;
 const hero=`<section class="yp-hero"><div class="yp-hx"><h1><span>${esc(M.nomi||'')}</span> — zamonaviy maktab boshqaruv platformasi</h1><p>Bilim, tarbiya va muvaffaqiyat sari birgalikda!</p>
  <button class="yp-hb" data-yp="xizmat">${ic('chart')}Tizim imkoniyatlari ${ic('arr')}</button></div>${M.kirish&&M.kirish.rasm?`<img src="${esc(M.kirish.rasm)}" alt="">`:''}</section>
  <section class="yp-greet"><h2>Assalomu alaykum!</h2><p>${esc(M.nomi||'')} bilan har doim yuksak maqsad sari!</p><small>${t.wd}, ${t.lbl}</small></section>`;
 const kp=[['users',fN(k.st),"Jami o'quvchilar",'#1a5cff',`asosiy sinflarda · ota-onasi ulangan: ${pc(k.cn,k.st)}%`,''],
  ['cap',fN(k.tc),"Jami o'qituvchilar",'#12a150','akkauntlar',''],
  ['school',fN(nCls),'Sinflar soni','#7048e8',`+ ${nGr} ta fan va repetitor guruhi`,''],
  ['calcheck',fN(td.k),'Bugun kelganlar','#f0a400',t.h<9&&!td.k?'davomat 9:00 gacha belgilanadi':`${pc(td.k,k.st)}% · kelmadi: ${td.y}`,spark(D,'#f0a400')]];
 const gl=(gaps||[]).filter(g=>g.done<g.n),gt={};gl.forEach(g=>{(gt[g.user_id]=gt[g.user_id]||{n:g.teacher,m:0,c:[]}).m+=g.n-g.done;gt[g.user_id].c.push(g.class_name)});const GT=Object.values(gt).sort((a,b)=>b.m-a.m);
 const QA=[['baholash','edit','Baholarni kiritish','#1a5cff'],['kelmagan','calcheck','Davomatni ko\'rish','#12a150'],['gap','userx',"Baho qo'yilmaganlar",'#e5484d'],['oqrey','trophy',"O'quvchilar reytingi",'#f0a400'],['tolov','card',"To'lovlar",'#d6336c'],['parol','key','Parolni tiklash','#e8590c'],['zaxira','down','Zaxira nusxani yuklab olish','#475569']].filter(x=>has(x[0]));
 $('view').innerHTML=`<div class="yp-row yp-r1">${hero}</div>
 <div class="yp-kpi">${kp.map(([i,v,l,c,s,sp])=>`<div class="yp-k" style="--k:${c}"><span class="yp-ki">${ic(i)}</span><div><span class="yp-kl">${l}</span><b>${v}</b><small>${esc(s)}</small></div>${sp}</div>`).join('')}</div>
 <div class="yp-row yp-r3">
  <section class="yp-c"><div class="yp-h">${ic('chart')}<b>Davomat dinamikasi</b><span class="mut">Oxirgi 30 kun · kelganlar soni</span></div>${D.some(x=>x.has)?lineSvg(D):`<div class="yp-emp">${ic('calcheck')}<b>Hali davomat belgilanmagan</b><span class="mut">Sinf rahbarlari davomatni belgilashi bilan grafik paydo bo'ladi.</span></div>`}</section>
  <section class="yp-c"><div class="yp-h">${ic('pie')}<b>Baholar bo'yicha tahlil</b><span class="mut">${MON[+t.d.slice(5,7)-1]} · fan baholari</span></div>${donut(G)}</section>
  <section class="yp-c"><div class="yp-h">${ic('bolt')}<b>Tezkor amallar</b></div><div class="yp-qa">${QA.map(([k2,i,n,c])=>`<button data-as="${k2}" style="--k:${c}">${ic(i)}<span>${n}${k2=='parol'&&S.ypP?` <em class="yp-qn">${S.ypP} ta so'rov</em>`:''}</span>${ic('arr')}</button>`).join('')}</div></section></div>
 <div class="yp-row yp-r4">
  <section class="yp-c"><div class="yp-h">${ic('clock')}<b>So'nggi faollik</b></div>${act.length?`<ul class="yp-act">${act.map(x=>`<li><i style="background:${x.c}"></i><time>${dm(x.t)}</time><span>${esc(x.x)}</span></li>`).join('')}</ul>`:`<div class="yp-emp"><span class="mut">Hozircha faollik yo'q.</span></div>`}</section>
  <section class="yp-c"><div class="yp-h">${ic('userx')}<b>Bugun baholanmaganlar</b>${has('gap')?`<button class="yp-lk" data-as="gap">Barchasi ${ic('arr')}</button>`:''}</div>
   ${gaps==null?`<div class="yp-emp"><span class="mut">Bu blok uchun Supabase'da 16-yangilanish kerak.</span></div>`:GT.length?`<div class="yp-gt">${GT.slice(0,4).map(g=>`<div><b>${esc(g.n||'')}</b><span class="mut">${esc(g.c.slice(0,2).join(', '))}${g.c.length>2?' …':''}</span><em>${g.m} ta</em></div>`).join('')}</div>`:`<div class="yp-emp yp-ok">${ic('check')}<b>Hozircha hammasi baholangan</b><span class="mut">yoki bugun dars hali bo'lmagan</span></div>`}</section>
  <section class="yp-c yp-st"><div class="yp-h"><b>Maktab holati</b><span class="yp-on"><i></i>Faol</span></div>
   <div class="yp-sw"><span class="yp-ring" style="--p:${pc(k.cn,k.st)}"><b>${pc(k.cn,k.st)}%</b></span><ul><li><span class="mut">Ulangan ota-onalar</span><b>${fN(k.cn)} / ${fN(k.st)}</b></li><li><span class="mut">Telefoni yozilgan</span><b>${fN(k.ph)}</b></li><li><span class="mut">Bugungi davomat</span><b>${pc(td.k,k.st)}%</b></li></ul></div>
   ${has('ulanish')?`<button class="yp-gb" data-as="ulanish">${ic('link')}Ota-onalarni taklif qilish</button>`:''}</section></div>
 <h3 class="ys-sec" id="ypx">${ic('grid')}Barcha bo'limlar</h3><div class="yp-all">${A.map(x=>`<button data-as="${x[1]}" style="--k:${x[5]||'#1a5cff'}"><span>${ic(x[4])}</span><b>${esc(x[2])}</b><small>${esc(x[3])}</small></button>`).join('')}</div>
 ${ch?`<h3 class="ys-sec">${ic('grid')}Sinflar va guruhlar</h3><div class="ys-chips">${ch}</div>`:''}`;
 const lc=$('view').querySelector('.yp-lc');if(lc)lineHover(lc,D);
 topbar();const sd=document.querySelector('.ys-side');if(sd){sd.dataset.yp='0';paintSide(sd)}};
document.addEventListener('click',e=>{if(e.target.closest('[data-yp="xizmat"]')){const x=$('ypx');if(x)x.scrollIntoView({behavior:'smooth'})}});
})();
