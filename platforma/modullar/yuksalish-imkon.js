// Modul: Samarqand Yuksalish maktabidagi imkoniyatlar (sozlama: modullar.yuksalish_imkon). Baza: yurt/sql/16-yuksalish-imkoniyatlari.sql
// Kod Yuksalish platformasidan olingan va Yurt'ga moslangan:
//  ota-onaga barcha baholar va «Bugungi baholar», «Reyting va o'rinlar»; o'qituvchiga dars kunlari, baholanmaganlar,
//  guruh o'qituvchisiga ota-ona telefoni; admin: baho qo'yilmaganlar, davomat to'liq emas, to'lov (naqd/karta, yillik,
//  kvitansiya), hisobot, xarajatlar; buxgalter va kuzatuvchi profillari.
// Eslatma: bu fayl yadrodagi payView va payHtml ni almashtiradi (barcha sinflar bir sahifada).
const YBUX=()=>!!ME&&!!ME._bux,YOBS=()=>!!ME&&!!ME._obs,DNS=['Du','Se','Ch','Pa','Ju','Sh'];
const allQ=async mk=>{let out=[];for(let f=0;;f+=1000){const{data,error}=await mk().range(f,f+999);if(error)return out;out=out.concat(data||[]);if((data||[]).length<1000)return out}};
const RO_ERR={message:"👁 Kuzatuvchi rejimi: faqat ko'rish mumkin — o'zgartirib bo'lmaydi.",code:'RO'};
function roFake(){const r={data:null,error:RO_ERR,count:null,status:403};roNote();const p=new Proxy(function(){},{get(_,k){if(k==='then')return(a,b)=>Promise.resolve(r).then(a,b);return()=>p},apply(){return p}});return p}
let roT=0;function roNote(){flash(RO_ERR.message);clearTimeout(roT);roT=setTimeout(()=>{if(ME&&YOBS())render()},900)}
const RO_RPC=/^(teacher_answer|tk_ignore|parent_pw_mark|switch_kid|parent_ask|set_|close_|reopen_|tk_link|tk_qayta|yk_link|register|parent_set|parent_week_submit|ss_change|grade_ask|grade_answer|send|sms|push|create|delete|del_|upd|save|add_|rename|reset|gen|class_rename|admin_)/;
// O'z telefoniga bildirishnoma yoqish — ruxsat (bu ma'lumotni o'zgartirish emas)
const RO_OK=/^(push_public_key|push_fn_url|push_test)$/,RO_TBL=['push_subs'];
function obsMode(){if(sb.__ro)return;sb.__ro=1;document.body.classList.add('obs');
 const of=sb.from.bind(sb);sb.from=t=>{const b=of(t);if(!RO_TBL.includes(t))['insert','update','upsert','delete'].forEach(m=>b[m]=()=>roFake());return b};
 const orpc=sb.rpc.bind(sb);sb.rpc=(f,a,o)=>RO_RPC.test(f)&&!RO_OK.test(f)?roFake():orpc(f,a,o);
 if(sb.functions)sb.functions.invoke=async()=>{roNote();return{data:null,error:RO_ERR}};
 if(sb.storage){const os=sb.storage.from.bind(sb.storage);sb.storage.from=b=>{const x=os(b);['upload','remove','update','move'].forEach(m=>x[m]=async()=>{roNote();return{data:null,error:RO_ERR}});return x}}
 const lock=()=>document.querySelectorAll('#view table :is(input,select,textarea,button.att,button.ratt):not([data-ro]),#view .tch :is(input,select,textarea):not([data-ro])').forEach(e=>{e.setAttribute('data-ro','');e.disabled=true});
 new MutationObserver(lock).observe($('view'),{childList:true,subtree:true});lock();
 if(!$('obsBn'))document.body.insertAdjacentHTML('afterbegin',`<div id="obsBn" class="obsBn">👁 <b>Kuzatuvchi rejimi</b> — barcha ma'lumotlarni ko'rasiz, o'zgartirish mumkin emas</div>`)}
async function attGapHtml(t,M){const hd=`<b>${ic('clip')}Davomat to'liq emas</b>`;
 if(t.wd=='Yakshanba')return `<div class="card sd dv">${hd}<p class="mut">Bugun dam olish kuni.</p></div>`;
 const ci=M.map(c=>c.id);if(!ci.length)return'';
 const[st,ds,rb]=await Promise.all([
  sb.from('students').select('id,class_id').in('class_id',ci).neq('full_name','').limit(5000),
  sb.from('daily_scores').select('student_id,att,students!inner(class_id)').eq('day',t.d).in('students.class_id',ci).not('att','is',null).limit(5000),
  sb.from('teacher_classes').select('class_id,profiles(full_name)').eq('role','rahbar').in('class_id',ci).then(r=>r,()=>({data:[]}))]);
 if(st.error)throw st.error;if(ds.error)throw ds.error;
 const n={},m={},R={},done=new Set((ds.data||[]).map(r=>r.student_id));
 (st.data||[]).forEach(r=>{n[r.class_id]=(n[r.class_id]||0)+1;if(done.has(r.id))m[r.class_id]=(m[r.class_id]||0)+1});
 (rb.data||[]).forEach(r=>{const f=r.profiles&&r.profiles.full_name;if(f)(R[r.class_id]=R[r.class_id]||[]).push(f)});
 const rows=M.filter(c=>n[c.id]&&(m[c.id]||0)<n[c.id]).map(c=>({c,n:n[c.id],m:m[c.id]||0,p:Math.floor((m[c.id]||0)/n[c.id]*100)})).sort((a,b)=>a.p-b.p||clsCmp(a.c,b.c));
 const all=M.filter(c=>n[c.id]).length,ok=all-rows.length,short=s=>{const w=String(s).trim().split(/\s+/);return w.length>1?w[0]+' '+w[1][0]+'.':w[0]};
 if(!rows.length)return `<div class="card sd dv">${hd}<div class="dvok">${ic('check')}Barcha ${all} ta sinfda davomat 100%</div></div>`;
 const lv=p=>p==0?'z':p<50?'l':p<90?'m':'h';
 return `<div class="card sd dv">${hd}<span class="mut">${t.hms.slice(0,5)} holati · <b>${rows.length}</b> ta sinfda to'liq emas, <b>${ok}</b>/${all} ta to'liq</span>
 <div class="dvt" role="table"><div class="dvh" role="row"><span>Sinf</span><span>Belgilandi</span><span>%</span></div>${rows.map(r=>`<button class="dvr" role="row" data-dvc="${r.c.id}" title="${esc(clsLbl(r.c))} — ${r.n-r.m} ta o'quvchi belgilanmagan${R[r.c.id]?' · Sinf rahbari: '+esc(R[r.c.id].join(', ')):''}"><span class="dvs"><b>${esc(clsLbl(r.c))}</b>${R[r.c.id]?`<small>${esc(R[r.c.id].map(short).join(', '))}</small>`:'<small class="dvn">rahbar yo\'q</small>'}</span><span class="dvc">${r.m}/${r.n}<small>−${r.n-r.m}</small></span><span><span class="dvp ${lv(r.p)}">${r.p}%</span></span></button>`).join('')}</div>
 <p class="mut">Sinfni bosing — davomatini oching.</p></div>`}
// O'qituvchi o'z dars kunlarini belgilaydi (yangilanish-84)
async function myDaysCard(c){if(!c||!c.id||ME.role!='teacher'||YOBS())return '';
 const role=ME.roles&&ME.roles[c.id];
 if([1,2].includes(grpOf(c))&&role=='rahbar')return '';
 if(!(ME.cls||[]).includes(c.id))return '';
 let days=[];try{const r=await sb.from('teacher_classes').select('days').eq('user_id',ME.id).eq('class_id',c.id).maybeSingle();days=(r.data&&r.data.days)||[]}catch(e){}
 return `<div class="card mdc"><b>${ic('cal')}Dars kunlarim</b><p class="mut">Shu guruh/sinfda qaysi kunlari dars o'tasiz — belgilang. Bu kunlari baho qo'yilmasa, admin va sinf rahbariga ko'rinadi.</p>
  <div class="mdays">${DNS.map((n,i)=>`<button class="mday ${days.includes(i+1)?'on':''}" data-d="${i+1}">${n}</button>`).join('')}</div></div>`}
// Ingliz tili / Matematika (guruh) o'qituvchisi: ota-ona telefoni + bitta tugma bilan qo'ng'iroq (yangilanish-84)
function gpTel(ph){return String(ph||'').replace(/[^0-9+]/g,'')}
function gpRow(st,i,ph){const tel=gpTel(ph);
 return `<div class="gphr" data-s="${esc(st.id)}"><span class="gpn"><b>${i+1}.</b> ${esc(st.full_name)}</span>
  <input class="fld gpin" type="tel" inputmode="tel" data-s="${esc(st.id)}" value="${esc(ph||'')}" placeholder="+998 __ ___ __ __">
  <a class="btn gpcall${tel?'':' off'}" ${tel?`href="tel:${esc(tel)}"`:'aria-disabled="true"'}>${ic('phone')}Qo'ng'iroq</a></div>`}
async function groupPhoneView(){await loadCls();const st=S.st.filter(x=>x.full_name.trim());
 let m={};try{const r=await sb.rpc('group_phones',{p_class:S.cls});if(r.error)throw r.error;(r.data||[]).forEach(x=>m[x.student_id]=x.parent_phone)}
 catch(e){return `<div class="card"><p class="mut">${/group_phones/.test(e.message||'')?"Avval Supabase'da <b>yangilanish-84</b> ni ishga tushiring.":esc(netMsg(e))}</p></div>`}
 return `<div class="card"><b>${ic('phone')}Ota-ona bilan aloqa</b><p class="mut">Har bir o'quvchi uchun ota-ona telefon raqamini yozing — avtomatik saqlanadi. So'ng <b>«Qo'ng'iroq»</b> tugmasini bossangiz, telefon raqamiga to'g'ridan-to'g'ri qo'ng'iroq boshlanadi.</p>
  <div class="gph">${st.length?st.map((x,i)=>gpRow(x,i,m[x.id])).join(''):'<p class="mut">O\'quvchilar yo\'q.</p>'}</div></div>`}
// Sinf rahbari: qaysi ustoz qaysi o'quvchini baholamagan (yangilanish-77)
async function clsGapView(){const{data,error}=await sb.rpc('class_gaps',{p_class:S.cls,p_day:S.date});
 const bar=dtBar('<span class="mut">Fan o\'qituvchilari, guruh va repetitor ustozlari hamda kunlik vazifalar bo\'yicha shu kuni baholanmagan o\'quvchilar. Dars kunlari — «O\'qituvchilar» bo\'limidagi jadval bo\'yicha.</span>');
 if(error)return `<div class="card">${bar}<p class="mut">${/class_gaps/.test(error.message||'')?"Bu bo'lim uchun Supabase'da <b>yangilanish-77</b> ni ishga tushiring.":esc(netMsg(error))}</p></div>`;
 const by={};(data||[]).forEach(r=>{const k=r.kind+'|'+r.subject+'|'+r.teacher+'|'+(r.group_name||'');(by[k]=by[k]||{...r,L:[]}).L.push(r.student)});const G=Object.values(by).sort((a,b)=>b.L.length-a.L.length);
 if(S.date==today){clearTimeout(S.cgTm);const tk0=S.rt;S.cgTm=setTimeout(()=>{if(S.rt==tk0&&!document.querySelector('.mwhy'))render()},60000)}
 return `<div class="card">${bar}<div class="kpi" style="margin-top:8px"><div><b>${G.length}</b>⚠️ fan / ustoz</div><div><b>${new Set((data||[]).map(r=>r.student)).size}</b>baholanmagan o'quvchi</div></div></div>
 ${G.length?G.map(x=>`<div class="card tgc"><div class="top"><span class="bxav" style="--c:${x.kind=='rahbar'?'#1971c2':x.kind=='fan'?'#d6336c':'#7048e8'}">${esc((x.subject||'?').trim()[0]||'?')}</span><span class="gpn"><b>${esc(x.subject)}</b><small>${esc(x.teacher||'')}${x.group_name?' · '+esc(x.group_name):x.kind=='rahbar'?' · sinf rahbari':''}</small></span><span class="bdg r" style="margin-left:auto">${x.L.length} ta baholanmagan</span></div><div class="gpm">${x.L.map(n=>`<span>${esc(n)}</span>`).join('')}</div></div>`).join('')
  :`<div class="card"><p>✅ ${S.date==today?'Hozircha':'Bu kuni'} barcha ustozlar baholarni qo'ygan${S.date==today?' (yoki bugun dars hali bo\'lmagan)':''}.</p></div>`}`}
// O'qituvchi: o'zi bugun baholamagan o'quvchilar + har kuni 15:00 eslatmani yoqish
async function myGapCard(){const[{data,error},sub]=await Promise.all([sb.rpc('my_gaps',{p_day:today}),pushOK()?pushSub().catch(()=>null):Promise.resolve(null)]);
 const on=!!sub&&typeof Notification!='undefined'&&Notification.permission=='granted',L=error?[]:(data||[]),miss=L.reduce((q,r)=>q+(r.n-r.done),0);
 const pb=on?'':pushOK()&&!(isIOS()&&!standalone())&&!(typeof Notification!='undefined'&&Notification.permission=='denied')?`<button class="btn" id="pushOn" style="margin:8px 0 0">🔔 Eslatmalarni yoqish — har kuni 15:00</button>`:'';
 if(!L.length)return pb?`<div class="card"><div class="top"><span class="pti" style="--c:#d6336c">${ic('bell')}</span><div><b>Baho eslatmalari</b><br><span class="mut">Baholanmagan o'quvchilar bo'lsa, har kuni soat 15:00 da telefoningizga eslatma keladi.</span></div></div>${pb}</div>`:'';
 return `<div class="card mgap"><div class="top"><span class="pti" style="--c:#d6336c">${ic('edit')}</span><div><b>Bugun baholanmagan o'quvchilar: ${miss} ta</b><br><span class="mut">Iltimos, bugunoq baholang${on?' · 🔔 eslatma yoqilgan':''}.</span></div></div>
 ${L.map(r=>`<div class="gpd"><div class="top"><b>${esc(clsLbl(CL.find(c=>c.id==r.class_id)||{name:r.class_name}))}</b><span class="mut">${r.role=='rahbar'?'kunlik vazifalar':esc(r.subject||'')}</span><span class="mut" style="margin-left:auto">${r.done} / ${r.n}</span><button class="tab" data-c="${r.class_id}">Baholash →</button></div><div class="gpm">${(r.missing||[]).slice(0,12).map(n=>`<span>${esc(n)}</span>`).join('')}${(r.missing||[]).length>12?`<span>+${r.missing.length-12}</span>`:''}</div></div>`).join('')}${pb}</div>`}
// To'lov: barcha asosiy sinflar bir sahifada (sinflar kesimida) — to'lovni belgilash va to'lamaganlarga SMS
const paySt=s=>({navbat:'⏳ navbatda',yuborilmoqda:'⏳ yuborilmoqda',yuborildi:'✅ SMS ketdi',xato:'⚠️ SMS xato'})[s]||'';
// Filtr: barchasi / to'laganlar / to'lamaganlar
const payFilt=(pd,un)=>`<div class="pfl">${[['all',"Barchasi"],['paid',`✅ To'laganlar (${pd})`],['unpaid',`❌ To'lamaganlar (${un})`]].map(([k,t])=>`<button class="tab pfb ${(S.pf||'all')==k?'on':''}" data-f="${k}">${t}</button>`).join('')}${S.pf=='paid'&&pd?`<button class="tab" id="paidPdf" style="margin-left:auto">${ic('printer')}To'laganlar ro'yxati (PDF)</button>`:''}</div>`;
const fSum=v=>v!=null?Number(v).toLocaleString('ru-RU').replace(/,/g,' ')+" so'm":'—',fMet=m=>m=='naqd'?'💵 Naqd':m=='karta'?'💳 Karta':'—';
// To'laganlar — sinflar kesimida (tanlangan oy uchun), to'lov ma'lumoti bilan
function paidHtml(cls,by){const C=cls.map(c=>[c,by[c.id].filter(x=>x.paid)]).filter(([,L])=>L.length);if(!C.length)return '<p class="mut">Bu oy uchun hali to\'lov qilinmagan.</p>';
 return C.map(([c,L])=>`<details class="pcl fold" data-pc="${c.id}"${(S.payOpen||{})[c.id]?' open':''}><summary><b>${esc(clsLbl(c))}</b><span class="rl" style="margin-left:auto">✅ ${L.length} / ${by[c.id].length}</span><span class="chev"></span></summary><div class="fbd">
 <div class="wrap"><table><tr><th>№</th><th class="l">F.I.Sh</th><th>Qaysi oylar to'langan</th><th>Summa</th><th>Usul</th><th class="l">Qabul qildi</th><th>Sana</th><th></th></tr>
 ${L.map((x,i)=>{const r=x.rec||{};return`<tr><td>${i+1}</td><td class="l">${esc(x.n)}${x.yr?' <span class="bdg">📅 yillik</span>':''}</td><td>${pmChips(x)}</td><td>${fSum(r.amount)}</td><td>${fMet(r.method)}</td><td class="l">${esc(r.received_name||'—')}</td><td>${x.on?fd2(x.on):'—'}</td><td style="white-space:nowrap"><button class="tab pinf" data-id="${x.id}">ℹ️ Ma'lumot</button> <button class="tab prc" data-id="${x.id}" title="Kvitansiya (PDF)">🧾</button></td></tr>`}).join('')}</table></div></div></details>`).join('')}
// O'quvchining o'quv yili davomidagi barcha to'lovlari
async function payInfoBox(x){const sy=syMonths().sy,{data,error}=await sb.from('payments').select('*').eq('student_id',x.id).gte('month',sy+'-09-01').lte('month',(sy+1)+'-06-01').order('month');if(error){flash(netMsg(error));return}
 const pm={};(data||[]).forEach(r=>pm[String(r.month).slice(0,7)]=r);const c=CL.find(k=>k.id==x.c)||{},paid=(data||[]).filter(r=>r.paid),yr=paid.filter(r=>r.yearly),tot=paid.filter(r=>!r.yearly).reduce((q,r)=>q+(+r.amount||0),0)+(yr.length?(+yr[0].amount||0):0);
 const rows=PMS.map(m=>{const k=(m>=9?sy:sy+1)+'-'+String(m).padStart(2,'0'),r=pm[k];return `<tr><td class="l">${MON[m-1]} ${k.slice(0,4)}</td><td>${r&&r.paid?(r.yearly?'✅ yillik':"✅ to'langan"):'❌'}</td><td>${r&&r.paid?(r.yearly?'—':fSum(r.amount)):'—'}</td><td>${r&&r.paid?fMet(r.method):'—'}</td><td>${r&&r.paid&&r.paid_on?fd2(r.paid_on):'—'}</td><td class="l">${esc((r&&r.paid&&r.received_name)||'—')}</td><td>${r&&r.paid?`<button class="tab prcm" data-id="${x.id}" data-m="${k}">🧾</button>`:''}</td></tr>`}).join('');
 const o=document.createElement('div');o.className='mwhy';o.innerHTML=`<div class="card pinfo"><div class="top"><b>${ic('card')}${esc(x.n)}</b><span class="mut">${esc(clsLbl(c))}</span><button class="tab" data-no style="margin-left:auto">✕ Yopish</button></div>
 <div class="kpi"><div><b>${paid.length}</b>to'langan oy</div><div><b>${10-paid.length}</b>to'lanmagan</div><div><b>${tot?fSum(tot):'—'}</b>jami summa</div>${yr.length?`<div><b>📅</b>yillik to'lov · ${fSum(yr[0].amount)}</div>`:''}</div>
 <div class="wrap"><table style="min-width:0"><tr><th class="l">Oy</th><th>Holat</th><th>Summa</th><th>Usul</th><th>Sana</th><th class="l">Qabul qildi</th><th></th></tr>${rows}</table></div></div>`;
 document.body.append(o);o.addEventListener('click',async e=>{const b=e.target.closest('button');if(e.target==o||(b&&b.hasAttribute('data-no'))){o.remove();return}if(b&&b.classList.contains('prcm')){e.stopPropagation();await payRcpt(x,b.dataset.m)}})}
function payHtml(){const P=S.pay,t=nowT(),cur=S.pm==t.d.slice(0,7),late=false,by={};P.forEach(x=>(by[x.c]=by[x.c]||[]).push(x));
 const cls=CL.filter(c=>by[c.id]).sort((a,b)=>(grpOf(a)-grpOf(b))||clsCmp(a,b)),pd=P.filter(x=>x.paid).length,un=P.filter(x=>!x.paid&&x.ph).length;
 if(!P.length)return '<p class="mut">Hali o\'quvchilar kiritilmagan.</p>';
 return `<div class="kpi"><div><b>${P.length}</b>o'quvchi</div><div><b>${pd}</b>✅ to'lagan</div><div><b>${P.length-pd}</b>❌ to'lamagan</div></div>
 
 <p class="mut">Sinf nomini bosing — o'quvchilar ro'yxati ochiladi. «To'lanmagan» tugmasini bosish bilan to'lov belgilanadi. <b>«📅 Yillik»</b> — o'quvchi 10 oylik to'lovni bir yo'la qilgan bo'lsa: sentyabr–iyun oylari to'langan bo'ladi, ota-onaga to'lov eslatmasi chiqmaydi.</p>
 ${payFilt(pd,P.length-pd)}${S.pf=='paid'?paidHtml(cls,by):''}
 ${S.pf=='paid'?'':cls.map(c=>{const L0=by[c.id],p=L0.filter(x=>x.paid).length,u=L0.length-p,L=S.pf=='unpaid'?L0.filter(x=>!x.paid):L0;if(!L.length)return '';
  return `<details class="pcl fold" data-pc="${c.id}"${(S.payOpen||{})[c.id]?' open':''}><summary><b>${esc(clsLbl(c))}</b><span class="rl" style="margin-left:auto">${p} / ${L.length}</span>${u?`<span class="bdg r">❌ ${u}</span>`:'<span class="bdg">✅ hammasi</span>'}<span class="chev"></span></summary><div class="fbd">
  ${late&&L.some(x=>!x.paid&&x.ph)?`<button class="tab smsCls" data-pc="${c.id}">${ic('msg')}Shu sinfning to'lamaganlariga SMS</button>`:''}
  <div class="wrap"><table><tr><th>№</th><th class="l">F.I.Sh</th><th>Ota-ona telefoni</th><th>To'lov</th><th>Yillik (10 oy)</th><th>Qaysi oylar to'langan</th><th>To'langan sana</th><th>Kvitansiya</th></tr>
  ${L.map((x,i)=>`<tr><td>${i+1}</td><td class="l">${esc(x.n)}</td><td>${esc(x.phone)||'—'}</td><td><button class="pay ypay ${x.paid?'on':''}" data-id="${x.id}">${x.paid?"✅ To'langan":"❌ To'lanmagan"}</button></td><td><button class="tab pyr ${x.yr?'on':''}" data-id="${x.id}" title="${x.yr?"Yillik to'lov belgisini olib tashlash":"O'quv yilining 10 oyi uchun to'lov qilgan"}">${x.yr?'📅 Yillik ✅':'📅 Yillik'}</button></td><td>${pmChips(x)}</td><td>${x.paid?`<input type="date" class="ypdt" data-id="${x.id}" value="${x.on}" max="${t.d}" title="To'lov qilingan sana (o'zgartirish mumkin)">`:'—'}</td><td>${x.paid?`<button class="tab prc" data-id="${x.id}" title="Kvitansiya (PDF)">🧾 ${x.rec&&x.rec.method?(x.rec.method=='naqd'?'Naqd':'Karta'):'PDF'}</button>`:'—'}</td></tr>`).join('')}</table></div></div></details>`}).join('')}`}
// O'quv yili oylari (sentyabr–iyun): to'langanlari yashil
const PMS=[9,10,11,12,1,2,3,4,5,6],PMN=['S','O','N','D','Y','F','M','A','M','I'];
function pmChips(x){const sy=syMonths().sy,cur=S.pm;return `<span class="pmc">${PMS.map((m,i)=>{const k=(m>=9?sy:sy+1)+'-'+String(m).padStart(2,'0'),ok=x.pm.has(k);return ok?`<i class="ok${k==cur?' cur':''}" title="${MON[m-1]} ${k.slice(0,4)}: to'langan">${PMN[i]}</i>`:`<i class="pmk${k==cur?' cur':''}" data-id="${x.id}" data-m="${k}" title="${MON[m-1]} ${k.slice(0,4)}: to'lanmagan — bosing, to'lov qabul qilish">${PMN[i]}</i>`}).join('')}</span>`}
// To'lov qabul qilish oynasi: usul (naqd / karta) va summa (ixtiyoriy)
function askPay(info,x,m0){return new Promise(res=>{const o=document.createElement('div');o.className='mwhy';let mt='';const sy=syMonths().sy,ks=PMS.map(m=>(m>=9?sy:sy+1)+'-'+String(m).padStart(2,'0')),sel=new Set(x&&m0&&!x.pm.has(m0)?[m0]:[]);
 o.innerHTML=`<div class="card"><b>${ic('card')}To'lovni qabul qilish</b><p class="mut">${info}</p>${x?`<p style="margin:8px 0 6px"><b>Qaysi oy(lar) uchun:</b> <span class="mut">— bir yoki bir nechtasini belgilang</span></p><div class="wq pmos">${ks.map(k=>{const pd=x.pm.has(k);return`<button class="tab pmo ${sel.has(k)?'on':''}" data-k="${k}"${pd?' disabled title="to\'langan"':''}>${pd?'✅ ':''}${MON[+k.slice(5)-1]}${k.slice(5)=='09'||k.slice(5)=='01'?' '+k.slice(0,4):''}</button>`}).join('')}</div>`:''}<p style="margin:8px 0 6px"><b>To'lov usuli:</b></p><div class="wq"><button class="tab pmt" data-m="naqd">💵 Naqd pul</button><button class="tab pmt" data-m="karta">💳 Karta orqali</button></div>
 <p style="margin:8px 0 6px"><b>Summa (so'm)</b> <span class="mut">— ${x?'tanlangan oylar uchun jami, ':''}ixtiyoriy</span></p><input class="fld" type="number" inputmode="numeric" min="0" step="1000" placeholder="masalan, 1500000">
 <p class="mut" style="margin:8px 0">Qabul qildi: <b>${esc(ME.full_name||'')}</b> — kvitansiyada asos sifatida ko'rsatiladi.</p><div class="top"><button class="btn" data-ok disabled>Tasdiqlash</button><button class="tab" data-no>Bekor qilish</button></div></div>`;
 document.body.append(o);const ok=o.querySelector('[data-ok]'),am=o.querySelector('input');
 const okS=()=>ok.disabled=!mt||(x&&!sel.size);
 o.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();if(b.dataset.k){sel.has(b.dataset.k)?sel.delete(b.dataset.k):sel.add(b.dataset.k);b.classList.toggle('on',sel.has(b.dataset.k));okS();return}
  if(b.dataset.m){mt=b.dataset.m;o.querySelectorAll('.pmt').forEach(y=>y.classList.toggle('on',y==b));okS();return}
  if(b.hasAttribute('data-no')){o.remove();res(null);return}if(ok.disabled)return;const a=am.value?Math.max(0,Math.round(+am.value)):null;o.remove();res({method:mt,amount:a,months:[...sel].sort()})})})}
// To'lov qabul qilish: tanlangan oylar uchun (summa oylarga teng bo'linadi)
async function payAccept(x,m0){const v=await askPay(esc(x.n),x,m0);if(!v)return;const ms=v.months,n=ms.length,tot=v.amount,base=tot==null?null:Math.floor(tot/n),rem=tot==null?0:tot-base*n,d=nowT().d;
 const rows=ms.map((k,i)=>({student_id:x.id,month:k+'-01',paid:true,paid_on:d,method:v.method,amount:tot==null?null:base+(i==0?rem:0)}));
 let{error}=await sb.from('payments').upsert(rows,{onConflict:'student_id,month'});
 if(error&&/method|amount/.test(error.message||''))({error}=await sb.from('payments').upsert(rows.map(({method,amount,...r})=>r),{onConflict:'student_id,month'}));
 if(error){flash(netMsg(error));return}ms.forEach(k=>x.pm.add(k));
 if(ms.includes(S.pm)&&!x.paid){x.paid=true;x.on=d;S.pTot.paid++;x.rec={method:v.method,amount:rows.find(r=>r.month==S.pm+'-01').amount,received_name:ME.full_name}}
 if($('payBox'))$('payBox').innerHTML=payHtml();flash(`✅ To'lov qabul qilindi: ${ms.map(k=>MON[+k.slice(5)-1]).join(', ')} — kvitansiya «🧾» tugmasida`)}
// Kvitansiya (PDF): ko'k «To'lov amalga oshirildi» shtampi bilan
async function payRcpt(x,mo0){const{data:r}=await sb.from('payments').select('*').eq('student_id',x.id).eq('month',(mo0||S.pm)+'-01').maybeSingle();if(!r||!r.paid){flash("To'lov topilmadi");return}
 // bir yo'la (bitta tasdiqlash bilan) to'langan oylar — bitta kvitansiyada
 const sib=!r.yearly&&r.received_at?((await sb.from('payments').select('month,amount').eq('student_id',x.id).eq('received_at',r.received_at).eq('paid',true).order('month')).data||[]):[];if(sib.length>1)r.amount=sib.some(z=>z.amount!=null)?sib.reduce((q,z)=>q+(+z.amount||0),0):null;
 const c=CL.find(k=>k.id==x.c)||{},sy=syMonths().sy,mo=r.yearly?`Yillik to'lov: Sentyabr ${sy} – Iyun ${sy+1} (10 oy)`:sib.length>1?sib.map(z=>MON[+String(z.month).slice(5,7)-1]+' '+String(z.month).slice(0,4)).join(', ')+` (${sib.length} oy)`:MON[+String(r.month).slice(5,7)-1]+' '+String(r.month).slice(0,4),
  sm=r.amount!=null?Number(r.amount).toLocaleString('ru-RU').replace(/,/g,' ')+" so'm":'—',d=fd2(r.paid_on||today),who=r.received_name||'—';
 const stamp=`<div style="position:relative;display:inline-block;margin:6px 34px 10px 0;transform:rotate(-12deg);border:4px double #1c4fd8;border-radius:14px;padding:10px 20px;color:#1c4fd8;text-align:center;font-weight:800;letter-spacing:.5px;opacity:.9"><div style="font-size:11px">${esc(String(M.nomi||'').toUpperCase())}</div><div style="font-size:19px;margin:3px 0">TO'LOV AMALGA OSHIRILDI</div><div style="font-size:12px">${d} · № ${r.rec_no||'—'}</div></div>`;
 printDoc(`To'lov kvitansiyasi № ${r.rec_no||''} — ${x.n}`,`<p class="m">${esc(M.nomi)} · To'lov kvitansiyasi <b>№ ${r.rec_no||'—'}</b></p>
 <table><tr><th style="width:38%">O'quvchi</th><td>${esc(x.n)}</td></tr><tr><th>Sinf</th><td>${esc(clsLbl(c))}</td></tr><tr><th>To'lov davri</th><td>${mo}</td></tr><tr><th>Summa</th><td>${sm}</td></tr>
 <tr><th>To'lov usuli</th><td>${r.method=='naqd'?'Naqd pul':r.method=='karta'?'Karta orqali':'—'}</td></tr><tr><th>To'lov sanasi</th><td>${d}</td></tr><tr><th>Qabul qildi (asos)</th><td><b>${esc(who)}</b></td></tr></table>
 <div style="display:flex;justify-content:space-between;align-items:center;margin-top:18px;gap:20px"><div>Qabul qildi: <b>${esc(who)}</b><br><br>Imzo: ____________________</div>${stamp}</div>`)}
// ===== Buxgalter profili: bosh sahifa, to'lov qabul qilish, hisobotlar =====
const fmtN=v=>{const t=String(v),ng=t[0]=='-',[i,f]=t.replace('-','').split('.');return(ng?'−':'')+i.replace(/\B(?=(\d{3})+(?!\d))/g,' ')+(f!=null?'.'+f:'')};
async function buxHtml(dl){const tab=S.bt||'home',P=S.pay||[],nm=(ME.full_name||'').trim().split(/\s+/),first=nm.length>1?nm[1]:nm[0]||'',t=nowT();
 const{data:T}=await sb.rpc('pay_report',{p_from:today,p_to:today}).then(r=>r,()=>({data:[]}));const TD=T||[],sm=m=>TD.filter(r=>!m||r.method==m).reduce((q,r)=>q+(+r.amount||0),0);
 const pd=P.filter(x=>x.paid).length,pc=P.length?Math.round(pd/P.length*100):0,mo=MON[+S.pm.slice(5)-1]+' '+S.pm.slice(0,4);
 const hero=`<div class="bxhero"><div><span class="bxbadge">${ic('card')} Buxgalter</span><h2>Assalomu alaykum, ${esc(first)}!</h2><p class="sub">${t.wd}, ${t.lbl} · To'lovlar boshqaruvi</p></div>
 <div class="bxsum"><small>Bugungi tushum</small><b>${fmtN(sm())} <span>so'm</span></b><div class="bxchips"><span>💵 Naqd: ${fmtN(sm('naqd'))}</span><span>💳 Karta: ${fmtN(sm('karta'))}</span><span>🧾 ${TD.length} ta to'lov</span></div></div></div>`;
 const tabs=`<div class="bxtabs">${[['home','home','Bosh sahifa'],['pay','card',"To'lov qabul qilish"],['exp','minus','Xarajatlar'],['rep','chart','Hisobotlar']].map(([k,i,n])=>`<button class="bxtb ${tab==k?'on':''}" data-bt="${k}">${ic(i)}${n}</button>`).join('')}</div>`;
 let body='';
 if(tab=='home'){const g=k=>{const L=P.filter(x=>grpOf(CL.find(c=>c.id==x.c)||{})==k),p=L.filter(x=>x.paid).length;return L.length?Math.round(p/L.length*100):0};
  const by={};P.forEach(x=>{const b=by[x.c]=by[x.c]||[0,0];b[0]++;if(x.paid)b[1]++});const low=CL.filter(c=>by[c.id]).sort((a,b)=>by[a.id][1]/by[a.id][0]-by[b.id][1]/by[b.id][0]).slice(0,8);
  const rec=TD.slice().sort((a,b)=>String(b.received_at||'').localeCompare(String(a.received_at||''))).slice(0,7),col=['#1971c2','#0b7285','#5f3dc4','#c2255c','#e8590c','#2f9e44','#862e9c'];
  body=`<div class="bxk"><div style="--c:#2f9e44"><small>${mo}: to'lov darajasi</small><div class="bxring"><span class="ring" style="--p:${pc}"><i>${pc}%</i></span><span><b>${pd}</b> / ${P.length} o'quvchi</span></div></div>
  <div style="--c:#e03131"><small>To'lamaganlar</small><b>${P.length-pd}</b><span class="mut">o'quvchi · ${mo}</span></div>
  <div style="--c:#1971c2"><small>Boshlang'ich sinflar (1–4)</small><b>${g(1)}%</b><span class="mut">to'lagan</span></div>
  <div style="--c:#7048e8"><small>Yuqori sinflar (${YQ})</small><b>${g(2)}%</b><span class="mut">to'lagan</span></div></div>
  <div class="bxqa"><button data-bt="pay" data-pf="unpaid"><span class="pti" style="--c:#2f9e44">${ic('card')}</span><span><b>To'lov qabul qilish</b><small>To'lamaganlar ro'yxati</small></span></button>
  <button data-bt="rep" data-rk="kun"><span class="pti" style="--c:#1971c2">${ic('chart')}</span><span><b>Kunlik hisobot</b><small>Naqd, karta, jami · PDF</small></span></button>
  <button data-bt="rep" data-rk="oy"><span class="pti" style="--c:#7048e8">${ic('cal')}</span><span><b>Oylik hisobot</b><small>Kunlar bo'yicha</small></span></button>
  <button data-bt="pay" data-pf="paid"><span class="pti" style="--c:#e8590c">${ic('check')}</span><span><b>To'laganlar</b><small>Sinflar kesimida · PDF</small></span></button><button data-bt="exp"><span class="pti" style="--c:#e03131">${ic('minus')}</span><span><b>Xarajat kiritish</b><small>Kunlik xarajatlar · kassa qoldig'i</small></span></button></div>
  <div class="bx2"><div class="card"><b>${ic('clock')}Bugungi so'nggi to'lovlar</b>${rec.length?rec.map((r,i)=>`<div class="bxr"><span class="bxav" style="--c:${col[i%col.length]}">${esc((r.full_name||'?').trim()[0]||'?')}</span><span><b>${esc(r.full_name)}</b><small>${esc(r.class_name||'')} · ${r.yearly?'Yillik':MON[+String(r.month).slice(5,7)-1]} · ${r.received_at?new Date(r.received_at).toLocaleTimeString('uz-UZ',{timeZone:TZ,hour:'2-digit',minute:'2-digit'}):''}</small></span><span class="am">${r.amount!=null?fmtN(r.amount):'—'}<small><span class="mchip ${r.method=='karta'?'k':'n'}">${r.method=='karta'?'💳 Karta':'💵 Naqd'}</span></small></span></div>`).join(''):`<p class="mut">Bugun hali to'lov qabul qilinmagan.</p>`}</div>
  <div class="card"><b>${ic('target')}E'tibor talab sinflar</b><p class="mut" style="margin:4px 0 6px">${mo} · eng kam to'langan sinflar</p><div class="pst">${low.map(c=>{const[n,p]=by[c.id],v=Math.round(p/n*100);return`<div class="psr"><span>${esc(clsLbl(c))}</span><i><b style="width:${v}%;background:${v>=80?'var(--ok)':v>=50?'#f59f00':'var(--bad)'}"></b></i><span>${p}/${n} · ${v}%</span></div>`}).join('')}</div></div></div>`}
 else if(tab=='exp')body=await expHtml().catch(e=>`<div class="card"><p class="mut">${esc(netMsg(e))}</p></div>`);
 else if(tab=='pay')body=`<div class="card"><div class="top"><b>${ic('card')}To'lovlar — sinflar kesimida</b><span style="margin-left:auto"><b>Oy:</b> <input type="month" id="pm" value="${S.pm}"></span></div><div id="payBox">${payHtml()}</div></div>`;
 else body=`<div class="card"><div class="top"><b>${ic('chart')}To'lovlar hisoboti</b><span class="pfl" style="margin:0 0 0 auto"><button class="tab rkb ${S.rk=='kun'?'on':''}" data-k="kun">Kunlik</button><button class="tab rkb ${S.rk=='oy'?'on':''}" data-k="oy">Oylik</button></span>${S.rk=='kun'?`<input type="date" id="pdd" value="${S.pdd}" max="${today}">`:`<input type="month" id="rmo" value="${S.rmo}" max="${today.slice(0,7)}">`}</div><div id="pdBox">${dl}</div></div>`;
 return `<div class="bxw">${hero}${tabs}${body}</div>`}
// Kunlik xarajatlar (buxgalter va admin): kiritish, kunlik/oylik jami, tushum bilan solishtirish, kassa qoldig'i, PDF
const EXC=["Xodimlarga (ish haqi / avans)","Oziq-ovqat","Kommunal to'lovlar","Xo'jalik mollari","Ta'mirlash","Transport","O'quv qurollari","Boshqa"];
async function expHtml(){const k=S.xk||'kun',d=S.xd||today,m=S.xm||today.slice(0,7),[a,b]=k=='kun'?[d,d]:[m+'-01',mr(m).b],ttl=k=='kun'?fd2(d):MON[+m.slice(5)-1]+' '+m.slice(0,4);
 const[{data:E,error},{data:I}]=await Promise.all([sb.from('expenses').select('*').gte('day',a).lte('day',b).order('day').order('created_at'),sb.rpc('pay_report',{p_from:a,p_to:b}).then(r=>r,()=>({data:[]}))]);
 if(error)return `<div class="card"><p class="mut">${/expenses/.test(error.message||'')?"Xarajatlar bo'limi uchun Supabase'da <b>yangilanish-67</b> ni ishga tushiring.":esc(netMsg(error))}</p></div>`;
 const L=E||[],IN=I||[],sm=(X,m,f='amount')=>X.filter(r=>!m||r.method==m).reduce((q,r)=>q+(+r[f]||0),0),inC=sm(IN,'naqd'),inK=sm(IN,'karta'),exC=sm(L,'naqd'),exK=sm(L,'karta');
 const C={};L.forEach(r=>{const c=C[r.category]=C[r.category]||[0,0];c[0]++;c[1]+=+r.amount});const cats=Object.entries(C).map(([k,[n,v]])=>[k,n,v]).sort((x,y)=>y[2]-x[2]);S.exP={ttl,L,inC,inK,exC,exK,cats};
 const can=(ME.role=='admin'&&!YOBS())||YBUX(),tm=r=>k=='kun'?new Date(r.created_at).toLocaleTimeString('uz-UZ',{timeZone:TZ,hour:'2-digit',minute:'2-digit'}):fd2(r.day);S.exm=S.exm||'naqd';
 return `<div class="card"><div class="top"><b>${ic('minus')}Kunlik xarajatlar</b><span class="pfl" style="margin:0 0 0 auto"><button class="tab xkb ${k=='kun'?'on':''}" data-k="kun">Kunlik</button><button class="tab xkb ${k=='oy'?'on':''}" data-k="oy">Oylik</button></span>${k=='kun'?`<input type="date" id="xd" value="${d}" max="${today}">`:`<input type="month" id="xm" value="${m}" max="${today.slice(0,7)}">`}</div>
 <div class="bxk" style="margin:10px 0 0"><div style="--c:#2f9e44"><small>Tushum</small><b>${fmtN(inC+inK)}</b><span class="mut">💵 ${fmtN(inC)} · 💳 ${fmtN(inK)}</span></div><div style="--c:#e03131"><small>Xarajat</small><b>${fmtN(exC+exK)}</b><span class="mut">💵 ${fmtN(exC)} · 💳 ${fmtN(exK)}</span></div><div style="--c:#1971c2"><small>Kassa qoldig'i (naqd)</small><b>${fmtN(inC-exC)}</b><span class="mut">naqd tushum − naqd xarajat</span></div></div></div>
 ${can&&k=='kun'?`<div class="card exf"><b>${ic('edit')}Yangi xarajat — ${fd2(d)}</b><div class="exg"><label>Turi<select class="fld" id="exCat"><option value="">— tanlang —</option>${EXC.map(c=>`<option>${esc(c)}</option>`).join('')}</select></label>
  <label>Kimga / nimaga<input class="fld" id="exWho" maxlength="120" placeholder="masalan, Farrosh — avans"></label><label>Summa (so'm)<input class="fld" id="exAmt" type="number" inputmode="numeric" min="0" step="1000" placeholder="masalan, 500000"></label>
  <label>Izoh <span class="mut">(ixtiyoriy)</span><input class="fld" id="exNote" maxlength="200" placeholder="qo'shimcha ma'lumot"></label></div>
  <div class="top"><span class="wq" style="margin:0"><button class="tab exm ${S.exm=='naqd'?'on':''}" data-m="naqd">💵 Naqd</button><button class="tab exm ${S.exm=='karta'?'on':''}" data-m="karta">💳 Karta</button></span><button class="btn" id="exAdd" style="margin:0 0 0 auto">${ic('check')}Xarajatni qo'shish</button></div></div>`:''}
 <div class="card"><div class="top"><b>${ic('clip')}${ttl} — xarajatlar (${L.length})</b>${L.length?`<button class="tab" id="exPdf" style="margin-left:auto">${ic('printer')}PDF</button>`:''}</div>
 ${cats.length?`<div class="gpm" style="margin:6px 0 10px">${cats.map(([c,n,v])=>`<span class="exc">${esc(c)}: <b>${fmtN(v)}</b></span>`).join('')}</div>`:''}
 ${L.length?`<div class="wrap"><table style="min-width:0"><tr><th>${k=='kun'?'Vaqt':'Sana'}</th><th class="l">Turi</th><th class="l">Kimga / nimaga</th><th>Summa</th><th>Usul</th><th class="l">Kiritdi</th><th></th></tr>${L.slice().reverse().map(r=>`<tr><td>${tm(r)}</td><td class="l">${esc(r.category)}</td><td class="l">${esc(r.recipient||'—')}${r.note?`<br><small class="mut">${esc(r.note)}</small>`:''}</td><td><b>${fmtN(r.amount)}</b></td><td>${r.method=='karta'?'💳 Karta':'💵 Naqd'}</td><td class="l">${esc(r.created_name||'')}</td><td>${(ME.role=='admin'&&!YOBS())||(YBUX()&&r.created_by==ME.id)?`<button class="tab exDel" data-id="${r.id}" title="O'chirish">${ic('trash')}</button>`:''}</td></tr>`).join('')}
 <tr><td></td><td class="l"><b>Jami</b></td><td></td><td><b>${fmtN(exC+exK)}</b></td><td colspan="3" class="l">naqd ${fmtN(exC)} · karta ${fmtN(exK)}</td></tr></table></div>`:`<p class="mut">Bu davrda xarajat kiritilmagan.</p>`}</div>`}
// Kalkulyator (buxgalter oynasining burchagida): tugmalar va klaviatura; natijani to'lov oynasidagi «Summa»ga qo'yish
function calcEval(ex){const s=ex.replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/[*\/+\-.]+$/,'');if(!s)return null;let i=0;
 const num=()=>{const m=s.slice(i).match(/^\d+(\.\d+)?/);if(!m)throw 0;i+=m[0].length;let v=+m[0];if(s[i]=='%'){v/=100;i++}return v},
  fac=()=>{if(s[i]=='-'){i++;return -fac()}return num()},
  term=()=>{let v=fac();while(s[i]=='*'||s[i]=='/'){const o=s[i++],w=fac();v=o=='*'?v*w:v/w}return v},
  expr=()=>{let v=term();while(s[i]=='+'||s[i]=='-'){const o=s[i++],w=term();v=o=='+'?v+w:v-w}return v};
 try{const v=expr();if(i!==s.length||!isFinite(v))return null;return Math.round(v*100)/100}catch(e){return null}}
function calcMount(){if($('calc'))return;const d=document.createElement('div');d.id='calc';
 d.innerHTML=`<div id="calcBox" role="dialog" aria-label="Kalkulyator"><div class="chead"><span>🧮 Kalkulyator</span><button data-cx="close" aria-label="Yopish">✕</button></div><div class="cdisp"><div class="cexp" id="cexp"></div><div class="cres" id="cres">0</div></div>
 <div class="ckeys">${['C','⌫','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','000','0','.','='].map(k=>`<button data-ck="${k}" class="${k=='='?'eq':/[÷×−+%]/.test(k)?'op':/C|⌫/.test(k)?'cl':''}">${k}</button>`).join('')}</div>
 <div class="cact"><button data-cx="copy">📋 Nusxa</button><button data-cx="put">↳ Summaga qo'yish</button></div></div><button id="calcFab" title="Kalkulyator" aria-label="Kalkulyator">🧮</button>`;
 document.body.append(d);let ex='';
 const sh=()=>{$('cexp').textContent=ex.replace(/\d+(\.\d+)?/g,m=>fmtN(m));const v=calcEval(ex);$('cres').textContent=v==null?(ex?'…':'0'):fmtN(v)},
  press=k=>{if(k=='C')ex='';else if(k=='⌫')ex=ex.slice(0,-1);else if(k=='='){const v=calcEval(ex);if(v!=null)ex=String(v).replace('-','−')}else{if(/[÷×+%]/.test(k)&&!ex)return;if(/[÷×−+]/.test(k)&&/[÷×−+]$/.test(ex))ex=ex.slice(0,-1);if(k=='.'&&/\.\d*$/.test(ex))return;if(ex.length<64)ex+=k}sh()};
 d.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();if(b.id=='calcFab'){d.classList.toggle('open');return}if(b.dataset.ck){press(b.dataset.ck);return}
  const v=calcEval(ex);if(b.dataset.cx=='close')d.classList.remove('open');
  else if(b.dataset.cx=='copy'){if(v!=null&&navigator.clipboard)navigator.clipboard.writeText(String(v)).then(()=>flash('📋 Nusxa olindi: '+fmtN(v)),()=>{})}
  else if(b.dataset.cx=='put'){const i=document.querySelector('.mwhy input[type=number]')||$('exAmt');if(v==null)return;if(i){i.value=Math.round(v);d.classList.remove('open');i.focus();flash("✅ Summa katagiga qo'yildi: "+fmtN(Math.round(v)))}else flash("Avval «To'lanmagan» tugmasini bosib, to'lov oynasini oching")}});
 document.addEventListener('keydown',e=>{if(!d.isConnected||!d.classList.contains('open'))return;const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName))return;
  const m={'*':'×','/':'÷','-':'−','+':'+','Enter':'=','=':'=','Backspace':'⌫','Escape':'C','Delete':'C','%':'%','.':'.',',':'.'},k=/^\d$/.test(e.key)?e.key:m[e.key];if(k){e.preventDefault();press(k)}});sh()}
// Admin: «Baho qo'yilmaganlar» — sinflar kesimida, kunlar bo'yicha, mas'ul o'qituvchi bilan (yangilanish-63)
function gapRange(){const t=nowT().d,d=new Date(t+'T00:00:00Z'),wd=(d.getUTCDay()+6)%7,mon=new Date(d.getTime()-wd*864e5),iso=x=>x.toISOString().slice(0,10),k=S.gpk||'week';
 if(k=='today')return[t,t];if(k=='last')return[iso(new Date(mon.getTime()-7*864e5)),iso(new Date(mon.getTime()-3*864e5))];if(k=='custom')return[S.gpa||t,S.gpb||t];return[iso(mon),iso(new Date(mon.getTime()+4*864e5))]}
async function gapView(){clearTimeout(S.gapTm);if((S.gm||'tch')=='tch')return gapTch();const[a,b]=gapRange(),k=S.gpk||'week',{data,error}=await sb.rpc('grade_gaps',{p_from:a,p_to:b});
 const bar=gapMode()+`<div class="card"><div class="top"><b>${ic('school')}Sinflar bo'yicha</b><span class="pfl" style="margin:0 0 0 auto">${[['today','Bugun'],['week','Shu hafta'],['last',"O'tgan hafta"],['custom','Sana bo\'yicha']].map(([x,n])=>`<button class="tab gpk ${k==x?'on':''}" data-k="${x}">${n}</button>`).join('')}</span></div>
 ${k=='custom'?`<div class="top"><b>Dan:</b><input type="date" id="gpa" value="${a}" max="${today}"><b>Gacha:</b><input type="date" id="gpb" value="${b}" max="${today}"></div>`:''}
 <p class="mut">${fd2(a)}${a!=b?' – '+fd2(b):''} · Asosiy sinflarda dushanba–juma kunlari baholari <b>juma soat 20:00 gacha</b> qo'yilishi kerak; guruhlarda — dars bo'lgan kunlar. «To'liq» — davomat va barcha mezonlar qo'yilgan.</p></div>`;
 if(error)return bar+`<div class="card"><p class="mut">${/grade_gaps/.test(error.message||'')?"Bo'limni ochish uchun Supabase'da <b>yangilanish-63</b> ni ishga tushiring.":esc(netMsg(error))}</p></div>`;
 const R0=data||[],by={};R0.forEach(r=>(by[r.class_id]=by[r.class_id]||[]).push(r));
 const C=Object.keys(by).map(id=>{const L=by[id].sort((x,y)=>x.day<y.day?1:-1),c=CL.find(x=>x.id==id)||{name:L[0].class_name};return{c,L,miss:L.reduce((q,r)=>q+(r.n-r.done),0),bad:L.filter(r=>r.done<r.n).length,t:L[0].teachers||''}});
 const G=C.filter(x=>x.miss>0).sort((x,y)=>y.miss-x.miss||clsCmp(x.c,y.c)),OK=C.filter(x=>!x.miss).sort((x,y)=>clsCmp(x.c,y.c));
 const tot=R0.length,full=R0.filter(r=>r.done>=r.n).length,ms=R0.reduce((q,r)=>q+(r.n-r.done),0);S.gapP={a,b,G};
 const dd=d=>{const x=String(d);return x.slice(8,10)+'.'+x.slice(5,7)},wdn=d=>DN[new Date(d+'T00:00:00Z').getUTCDay()].slice(0,3);
 return bar+`<div class="card"><div class="kpi"><div><b>${G.length}</b>⚠️ sinf/guruhda baho to'liq emas</div><div><b>${ms}</b>baho qo'yilmagan o'quvchi-kun</div><div><b>${full} / ${tot}</b>to'liq baholangan sinf-kun</div></div>
 ${G.length?`<div class="top" style="margin-top:8px"><button class="tab" id="gapPdf">${ic('printer')}PDF</button><span class="mut">Sinf nomini bosing — kunlar va o'quvchilar ro'yxati ochiladi.</span></div>`:''}</div>
 ${G.length?G.map(x=>`<details class="card fold gapc"><summary><span class="gpn"><b>${esc(clsLbl(x.c))}</b><small>${esc(x.t||"o'qituvchi biriktirilmagan")}</small></span><span class="bdg r" style="margin-left:auto">${x.bad} kun · ${x.miss} ta baho yo'q</span><span class="chev"></span></summary><div class="fbd">
  ${x.L.filter(r=>r.done<r.n).map(r=>`<div class="gpd"><div class="top"><b>${dd(r.day)} · ${wdn(r.day)}</b><span class="mut">${r.done} / ${r.n} baholangan</span><i class="gpbar"><b style="width:${Math.round(r.done/r.n*100)}%"></b></i></div><div class="gpm">${(r.missing||[]).map(n=>`<span>${esc(n)}</span>`).join('')}</div></div>`).join('')}</div></details>`).join('')
  :`<div class="card"><p>✅ Bu davrda barcha sinflarda baholar to'liq qo'yilgan.</p></div>`}
 ${OK.length?`<details class="card fold"><summary><b>✅ To'liq baholangan sinflar (${OK.length})</b><span class="chev"></span></summary><div class="fbd"><div class="gpm ok">${OK.map(x=>`<span>${esc(clsLbl(x.c))}</span>`).join('')}</div></div></details>`:''}`}
const gapMode=()=>`<div class="bxtabs">${[['tch','users',"O'qituvchilar bo'yicha (kunlik, jonli)"],['cls','school',"Sinflar bo'yicha (davr)"]].map(([k,i,n])=>`<button class="gpm2 ${(S.gm||'tch')==k?'on':''}" data-m="${k}">${ic(i)}${n}</button>`).join('')}</div>`;
// O'qituvchilar bo'yicha — bir kun, har 1 daqiqada yangilanadi
async function gapTch(){const d=S.tgd||today,{data,error}=await sb.rpc('teacher_gaps',{p_day:d});
 const top=gapMode()+`<div class="card"><div class="top"><b>${ic('users')}Baho qo'ymagan o'qituvchilar</b><span style="margin-left:auto"><b>Sana:</b> <input type="date" id="tgd" value="${d}" max="${today}"></span></div>
 <p class="mut">${d==today?`🟢 Jonli · ${nowT().hms.slice(0,5)} holati · har 1 daqiqada yangilanadi. `:''}Sinf rahbari — har ish kuni kunlik vazifalar; guruh, repetitor va fan o'qituvchilari — <b>dars jadvalidagi kunlar</b> (O'qituvchilar bo'limida «Dars kunlari»). Kunlik vazifalar muddati — juma 20:00.</p></div>`;
 if(error)return top+`<div class="card"><p class="mut">${/teacher_gaps/.test(error.message||'')?"Bo'limni ochish uchun Supabase'da <b>yangilanish-64</b> ni ishga tushiring.":esc(netMsg(error))}</p></div>`;
 const by={};(data||[]).forEach(r=>{const c=CL.find(x=>x.id==r.class_id)||{name:r.class_name};(by[r.user_id]=by[r.user_id]||{n:r.teacher,ph:r.phone,L:[]}).L.push({...r,cl:clsLbl(c)})});
 const A=Object.values(by).map(x=>({...x,miss:x.L.reduce((q,r)=>q+(r.n-r.done),0)})),T=A.filter(x=>x.miss>0).sort((x,y)=>y.miss-x.miss),OK=A.filter(x=>!x.miss).sort((x,y)=>String(x.n).localeCompare(y.n));
 const ns=(data||[]).filter(r=>!r.sched&&!(r.role=='rahbar'&&!(CL.find(c=>c.id==r.class_id)||{}).grp)).length;S.tgP={d,T};
 if(d==today)S.gapTm=setTimeout(()=>{if(S.as=='gap'&&(S.gm||'tch')=='tch'&&!document.querySelector('.mwhy'))render()},60000);
 return top+`<div class="card"><div class="kpi"><div><b>${T.length}</b>⚠️ baho qo'ymagan o'qituvchi</div><div><b>${T.reduce((q,x)=>q+x.miss,0)}</b>baho qo'yilmagan o'quvchi</div><div><b>${OK.length}</b>✅ to'liq qo'ygan o'qituvchi</div></div>
 ${ns?`<p class="wkn lt">⚠️ ${ns} ta guruh/fan biriktirishida dars kunlari kiritilmagan — ular faqat baho qo'yilgan kunlari tekshiriladi. «O'qituvchilar» bo'limida «Dars kunlari»ni belgilang.</p>`:''}
 ${T.length?`<div class="top" style="margin-top:8px"><button class="tab" id="tgPdf">${ic('printer')}PDF</button></div>`:''}</div>
 ${T.length?T.map(x=>`<div class="card tgc"><div class="top"><span class="bxav" style="--c:#d6336c">${esc((x.n||'?').trim()[0]||'?')}</span><span class="gpn"><b>${esc(x.n)}</b><small>${esc(x.ph||'')}</small></span><span class="bdg r" style="margin-left:auto">${x.miss} ta o'quvchiga baho yo'q</span></div>
  ${x.L.map(r=>`<div class="gpd"><div class="top"><b>${esc(r.cl)}</b><span class="mut">${r.role=='rahbar'?'sinf rahbari · kunlik vazifalar':esc(r.subject||'dars')}${r.sched||r.role=='rahbar'?'':' · dars kunlari kiritilmagan'}</span><span class="mut" style="margin-left:auto">${r.done} / ${r.n}</span><i class="gpbar"><b style="width:${r.n?Math.round(r.done/r.n*100):0}%;${r.done>=r.n?'background:var(--ok)':''}"></b></i></div>${r.done<r.n?`<div class="gpm">${(r.missing||[]).map(n=>`<span>${esc(n)}</span>`).join('')}</div>`:''}</div>`).join('')}</div>`).join('')
  :`<div class="card"><p>✅ ${d==today?'Hozircha':'Bu kuni'} barcha o'qituvchilar baholarni to'liq qo'ygan${(data||[]).length?'':' (yoki bu kuni dars yo\'q)'}.</p></div>`}
 ${OK.length?`<details class="card fold"><summary><b>✅ To'liq qo'ygan o'qituvchilar (${OK.length})</b><span class="chev"></span></summary><div class="fbd"><div class="gpm ok">${OK.map(x=>`<span>${esc(x.n)}</span>`).join('')}</div></div></details>`:''}`}
// To'lovlar hisoboti: kunlik / oylik — sinflar kesimida, naqd va karta alohida, yopish (muhrlash) va PDF
const rPer=()=>S.rk=='kun'?[S.pdd,S.pdd]:[S.rmo+'-01',mr(S.rmo).b],fN=v=>Number(v||0).toLocaleString('ru-RU').replace(/,/g,' ');
function repBody(R,cl,pdf){const mo=r=>r.yearly?"Yillik (sentyabr–iyun)":MON[+String(r.month).slice(5,7)-1]+' '+String(r.month).slice(0,4),
 sum=(L,m)=>L.filter(r=>!m||r.method==m).reduce((q,r)=>q+(+r.amount||0),0),cash=cl?+cl.cash:sum(R,'naqd'),card=cl?+cl.card:sum(R,'karta'),tot=cl?+cl.total:sum(R),na=R.filter(r=>r.amount==null).length,by={};
 R.forEach(r=>(by[r.class_name||'—']=by[r.class_name||'—']||[]).push(r));const K=Object.keys(by).sort((a,b)=>a.localeCompare(b,'uz',{numeric:true}));
 const tm=r=>S.rk=='kun'?(r.received_at?new Date(r.received_at).toLocaleTimeString('uz-UZ',{timeZone:TZ,hour:'2-digit',minute:'2-digit'}):'—'):fd2(r.paid_on);
 const kp=pdf?`<table><tr><th>To'lovlar soni</th><th>Naqd pul</th><th>Plastik karta</th><th>Umumiy summa</th></tr><tr><td>${R.length} ta</td><td>${fN(cash)} so'm</td><td>${fN(card)} so'm</td><td><b>${fN(tot)} so'm</b></td></tr></table>`
  :`<div class="kpi"><div><b>${R.length}</b>to'lov</div><div><b>${fN(cash)}</b>💵 naqd (so'm)</div><div><b>${fN(card)}</b>💳 karta (so'm)</div><div><b>${fN(tot)}</b>jami (so'm)</div></div>`;
 const days=S.rk=='oy'&&R.length?(()=>{const D={};R.forEach(r=>{const d=D[r.paid_on]=D[r.paid_on]||[0,0,0,0];d[0]++;if(r.method=='naqd')d[1]+=+r.amount||0;if(r.method=='karta')d[2]+=+r.amount||0;d[3]+=+r.amount||0});
  return `<${pdf?'h2':'p'} style="margin:14px 0 6px"><b>Kunlar bo'yicha</b></${pdf?'h2':'p'}><${pdf?'table':'div class="wrap"><table style="min-width:0"'}><tr><th>Sana</th><th>Soni</th><th>Naqd</th><th>Karta</th><th>Jami</th></tr>${Object.keys(D).sort().map(d=>`<tr><td>${fd2(d)}</td><td>${D[d][0]}</td><td>${fN(D[d][1])}</td><td>${fN(D[d][2])}</td><td><b>${fN(D[d][3])}</b></td></tr>`).join('')}</table>${pdf?'':'</div>'}`})():'';
 return kp+(na?`<p class="${pdf?'':'mut '}wkn lt">⚠️ ${na} ta to'lovda summa kiritilmagan — jami summaga qo'shilmagan.</p>`:'')+days+
  (R.length?K.map(k=>{const L=by[k];return `<${pdf?'h2':'p'} style="margin:14px 0 6px"><b>${esc(k)}</b> — ${L.length} ta · ${fN(sum(L))} so'm</${pdf?'h2':'p'}>${pdf?'<table>':'<div class="wrap"><table style="min-width:0">'}<tr><th>№</th><th${pdf?'':' class="l"'}>O'quvchi</th><th>Qaysi oy uchun</th><th>Summa</th><th>Turi</th><th>${S.rk=='kun'?'Vaqt':'Sana'}</th><th${pdf?'':' class="l"'}>Qabul qildi</th></tr>
  ${L.map((r,i)=>`<tr><td${pdf?' class="n"':''}>${i+1}</td><td${pdf?'':' class="l"'}>${esc(r.full_name)}</td><td>${mo(r)}</td><td>${r.amount!=null?fN(r.amount):'—'}</td><td>${r.method=='naqd'?'Naqd':r.method=='karta'?'Karta':'—'}</td><td>${tm(r)}</td><td${pdf?'':' class="l"'}>${esc(r.received_name||'—')}</td></tr>`).join('')}
  <tr><td></td><td${pdf?'':' class="l"'}><b>Jami</b></td><td></td><td><b>${fN(sum(L))}</b></td><td colspan="3">naqd ${fN(sum(L,'naqd'))} · karta ${fN(sum(L,'karta'))}</td></tr></table>${pdf?'':'</div>'}`}).join(''):`<p class="mut">Bu davrda to'lov qayd etilmagan.</p>`)}
async function repHtml(){const[a,b]=rPer(),per=a.slice(0,S.rk=='kun'?10:7);
 const[{data:cl,error:e1},{data:R,error:e2}]=await Promise.all([sb.from('pay_reports').select('*').eq('kind',S.rk).eq('period',a).maybeSingle(),sb.rpc('pay_report',{p_from:a,p_to:b})]);
 if(e2)return `<p class="mut">${/pay_report/.test(e2.message||'')?"Hisobot uchun Supabase'da yangilanish-60 ni ishga tushiring.":esc(netMsg(e2))}</p>`;
 const rows=cl?cl.rows:R||[];S.rep={rows,cl};const ttl=S.rk=='kun'?fd2(a)+' kungi':MON[+a.slice(5,7)-1]+' '+a.slice(0,4)+' oylik',done=b<=today;
 const st=cl?`<div class="wkn" style="background:#ebfbee;border-color:#8ce99a;color:#2b8a3e">🔒 <span>Hisobot <b>yopilgan</b>: ${esc(cl.closed_name||'')} · ${new Date(cl.closed_at).toLocaleString('uz-UZ',{timeZone:TZ,day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})}. Bu davr to'lovlarini o'zgartirib bo'lmaydi.</span></div>`:'';
 return `<p class="mut">${ttl} hisobot · to'langan sana bo'yicha · yillik to'lov bir marta hisoblanadi.</p>${st}${repBody(rows,cl,false)}
 <div class="top" style="margin-top:12px"><button class="tab" id="repPdf">${ic('printer')}PDF</button>${!cl&&((ME.role=='admin'&&!YOBS())||YBUX())?`<button class="btn" id="repClose"${done?'':' disabled title="Davr hali tugamagan"'}>🔒 Hisobotni yopish</button>`:''}${cl&&ME.role=='admin'&&!YOBS()?`<button class="tab" id="repOpen" data-id="${cl.id}">↩ Qayta ochish</button>`:''}</div>`}
// To'lov statistikasi (admin va buxgalter)
function payStats(){const P=S.pay||[];if(!P.length)return '';const pd=P.filter(x=>x.paid).length,pc=Math.round(pd/P.length*100),by={};P.forEach(x=>{const b=by[x.c]=by[x.c]||[0,0];b[0]++;if(x.paid)b[1]++});
 const grp=g=>{const L=P.filter(x=>grpOf(CL.find(c=>c.id==x.c)||{})==g),p=L.filter(x=>x.paid).length;return L.length?`<div><b>${Math.round(p/L.length*100)}%</b>${g==1?"Boshlang'ich (1–4)":'Yuqori ('+YQ+')'}: ${p}/${L.length}</div>`:''};
 const cls=CL.filter(c=>by[c.id]).sort((a,b)=>by[a.id][1]/by[a.id][0]-by[b.id][1]/by[b.id][0]||clsCmp(a,b));
 const tdy=P.filter(x=>x.paid&&x.on==today).length,mo=MON[+S.pm.slice(5)-1]+' '+S.pm.slice(0,4);
 return `<div class="card"><b>${ic('chart')}To'lov statistikasi — ${mo}</b><div class="kpi"><div><b>${pc}%</b>to'lov darajasi</div><div><b>${pd}</b>✅ to'lagan</div><div><b>${P.length-pd}</b>❌ to'lamagan</div><div><b>${tdy}</b>bugun to'laganlar</div>${grp(1)}${grp(2)}</div>
 <details class="fold"><summary class="mut">Sinflar bo'yicha (eng kam to'langanidan)</summary><div class="pst">${cls.map(c=>{const[n,p]=by[c.id],v=Math.round(p/n*100);return`<div class="psr"><span>${esc(clsLbl(c))}</span><i><b style="width:${v}%;background:${v>=80?'var(--ok)':v>=50?'#f59f00':'var(--bad)'}"></b></i><span>${p}/${n} · ${v}%</span></div>`}).join('')}</div></details></div>`}
// Kunlik to'lovlar ro'yxati: tanlangan kunda to'lov qilganlar (qaysi oy uchun bo'lishidan qat'i nazar)
async function payDaily(d){let{data,error}=await sb.from('payments').select('student_id,month,paid_on,yearly').eq('paid',true).eq('paid_on',d);if(error)({data,error}=await sb.from('payments').select('student_id,month,paid_on').eq('paid',true).eq('paid_on',d));if(error)return `<p class="mut">${esc(netMsg(error))}</p>`;
 const N={},yy=new Set();(S.pay||[]).forEach(x=>N[x.id]=x);data=(data||[]).filter(r=>{if(!r.yearly)return true;if(yy.has(r.student_id))return false;yy.add(r.student_id);r.yl=1;return true});const L=data.map(r=>{const x=N[r.student_id]||{},c=CL.find(k=>k.id==x.c)||{};return{n:x.n||'—',c:clsLbl(c)||'—',m:r.yl?"Yillik to'lov (10 oy)":MON[+String(r.month).slice(5,7)-1]+' '+String(r.month).slice(0,4)}}).sort((a,b)=>a.c.localeCompare(b.c,'uz',{numeric:true})||a.n.localeCompare(b.n));
 S.pdL=L;return L.length?`<p class="mut">${fd2(d)} kuni <b>${L.length}</b> ta o'quvchi uchun to'lov qabul qilingan.</p><div class="wrap"><table style="min-width:0"><tr><th>№</th><th class="l">O'quvchi</th><th class="l">Sinf</th><th>Qaysi oy uchun</th></tr>${L.map((x,i)=>`<tr><td>${i+1}</td><td class="l">${esc(x.n)}</td><td class="l">${esc(x.c)}</td><td>${x.m}</td></tr>`).join('')}</table></div>`:`<p class="mut">${fd2(d)} kuni to'lov qayd etilmagan.</p>`}
async function payView(){S.pm=S.pm||today.slice(0,7);const m=S.pm+'-01',reg=CL.filter(c=>[1,2].includes(grpOf(c))).map(c=>c.id);
 const bx=YBUX(),[st,pr,sq,cf,bp,yr,pa]=await Promise.all([reg.length?all(()=>sb.from('students').select(bx?'id,class_id,slot,full_name':'id,class_id,slot,full_name,student_private(parent_phone)').in('class_id',reg).neq('full_name','').order('class_id').order('slot')):[],
  all(()=>sb.from('payments').select('*').eq('month',m).order('student_id')),
  Promise.resolve([]),
  {data:null,error:1},bx?sb.rpc('bux_phones').then(r=>r.data||[],()=>[]):[],sb.from('payments').select('student_id').eq('yearly',true).gte('month',syMonths().sy+'-09-01').then(r=>r.data||[],()=>[]),all(()=>sb.from('payments').select('student_id,month').eq('paid',true).gte('month',syMonths().sy+'-09-01').lte('month',(syMonths().sy+1)+'-06-01').order('student_id')).catch(()=>[])]);
 const pd={},sm={},bph={},pms={},yrs=new Set(yr.map(x=>String(x.student_id)));pa.forEach(r=>(pms[r.student_id]=pms[r.student_id]||new Set()).add(String(r.month).slice(0,7)));bp.forEach(x=>bph[x.student_id]=x.parent_phone);if(bx)st.forEach(s=>s.student_private={parent_phone:bph[s.id]||''});pr.forEach(r=>pd[r.student_id]=r);sq.forEach(r=>sm[r.student_id]=r);
 S.pay=st.filter(s=>s.full_name.trim()&&reg.includes(s.class_id)).map(s=>{const p=Array.isArray(s.student_private)?s.student_private[0]:s.student_private,t0=(p&&p.parent_phone)||'';
  return{id:s.id,c:s.class_id,n:s.full_name,phone:t0,ph:!!PE(t0),yr:yrs.has(String(s.id)),pm:pms[s.id]||new Set(),rec:pd[s.id]||null,paid:!!(pd[s.id]&&pd[s.id].paid),on:(pd[s.id]&&pd[s.id].paid_on)||'',sms:sm[s.id]}});
 S.pTot={all:S.pay.length,paid:S.pay.filter(x=>x.paid).length};S.smsCfg=cf.error?null:cf.data;
 S.pdd=S.pdd||today;S.rk=S.rk||'kun';S.rmo=S.rmo||today.slice(0,7);const dl=await repHtml().catch(e=>`<p class="mut">${esc(netMsg(e))}</p>`);
 if(bx)return buxHtml(dl);
 const exh=await expHtml().catch(()=>'');
 return payStats()+exh+`<div class="card"><div class="top"><b>${ic('chart')}To'lovlar hisoboti</b><span class="pfl" style="margin:0 0 0 auto"><button class="tab rkb ${S.rk=='kun'?'on':''}" data-k="kun">Kunlik</button><button class="tab rkb ${S.rk=='oy'?'on':''}" data-k="oy">Oylik</button></span>${S.rk=='kun'?`<input type="date" id="pdd" value="${S.pdd}" max="${today}">`:`<input type="month" id="rmo" value="${S.rmo}" max="${today.slice(0,7)}">`}</div><div id="pdBox">${dl}</div></div>`+`<div class="card"><div class="top"><b>${ic('card')}To'lovlar — sinflar kesimida</b><span style="margin-left:auto"><b>Oy:</b> <input type="month" id="pm" value="${S.pm}"></span></div><div id="payBox">${payHtml()}</div></div>`}
async function rkFill(){const box=$('rkbox');if(!box)return;
 const{data:d,error}=await sb.rpc('parent_ranks',{p_sid:ME.student_id});
 if(error){box.innerHTML=`<div class="card"><p class="mut">${/parent_ranks/.test(error.message||'')?"Bu bo'lim uchun Supabase'da <b>yangilanish-83</b> ni ishga tushiring.":esc(netMsg(error))}</p></div>`;return}
 if(!d){box.innerHTML='<div class="card"><p class="mut">Ma\'lumot topilmadi.</p></div>';return}
 box.innerHTML=rkHtml(d)}
const MED=['','🥇','🥈','🥉'];
function rkTr(x){if(x==null||x===0)return '<span class="rtr eq">=</span>';return x>0?`<span class="rtr up">▲${x}</span>`:`<span class="rtr dn">▼${-x}</span>`}
function rkTile(ic,v,sz,lbl,dl){return `<div class="rtile"><div class="ric">${ic}</div><div class="rbig">${v}<small>/${sz}</small></div><div class="rlbl">${esc(lbl)}</div>${rkTr(dl)}</div>`}
function rkHtml(d){const c=d.class||{},sc=d.school||{},subs=d.subjects||[];
 const sub=s=>{const med=s.medal?`<span class="rmed">${MED[s.medal]}</span>`:'',plc=s.medal?'pl'+s.medal:'';
  return `<div class="rsu"><div class="rsi">${subIcon(s.name)}${med}</div>
   <div class="rsm"><div class="rsn">${esc(s.name)} <span class="rtg">${s.kind=='repetitor'?'repetitor':'guruh'}</span></div>
   <div class="rst">${esc(s.teacher||s.group_name||'')}</div></div>
   <div class="rsr"><div class="rpl ${plc}">${s.rank}<small>/${s.size}</small></div>${s.avg!=null?`<div class="rab">⭐ ${s.avg}</div>`:''}${rkTr(s.delta)}</div></div>`};
 return `<div class="rkwrap">
  <div class="rranks">${rkTile('🏆',c.rank??'—',c.size??'—',"Sinfda o'rni",c.delta)}${rkTile('🎖️',sc.rank??'—',sc.size??'—',"Maktabda o'rni",sc.delta)}</div>
  ${subs.length?`<div class="rsh"><b>Fanlar va guruhlar bo'yicha</b><span>o'rin / jami</span></div><div class="rsubs">${subs.map(sub).join('')}</div>`
    :`<div class="card"><p class="mut">Farzandingiz hali guruh yoki repetitor fanlariga biriktirilmagan, yoki guruhda baho qo'yilmagan.</p></div>`}
  <div class="rfoot">🥇🥈🥉 — guruhda birinchi uchlik · ▲▼ — o'tgan haftaga nisbatan<br>O'rinlar har kuni soat 21:00 da yangilanadi · o'quv yili boshidan hisoblanadi</div>
 </div>`}
function subIcon(n){n=(n||'').toLowerCase();if(/matem/.test(n))return '📐';if(/ingliz|english|ielts/.test(n))return '🇬🇧';if(/arab/.test(n))return '🕌';if(/koreys/.test(n))return '🇰🇷';if(/rus/.test(n))return '🇷🇺';if(/ona til|adabiyot/.test(n))return '📖';if(/fizika/.test(n))return '🔬';if(/kimyo/.test(n))return '🧪';if(/biolog/.test(n))return '🧬';if(/informat|dastur/.test(n))return '💻';if(/tarix/.test(n))return '🏛️';if(/geograf/.test(n))return '🗺️';return '📘'}
async function pgrCard(){const t=today,{data,error}=await sb.rpc('parent_grades',{p_from:t,p_to:t});if(error)return '';const L=(data||[]).filter(x=>x.student_id==ME.student_id).sort((a,b)=>String(b.at||'').localeCompare(String(a.at||'')));
 const tm=x=>x.at?new Date(x.at).toLocaleTimeString('uz-UZ',{timeZone:TZ,hour:'2-digit',minute:'2-digit'}):'';
 return `<div class="card pgr" id="pgr"><div class="top"><span class="pti" style="--c:#1c7ed6">${ic('layers')}</span><div><b>Bugungi baholar</b><br><span class="mut">🟢 Jonli · fan va guruh o'qituvchilari qo'ygan baholar</span></div><button class="tab" data-pv="fan" style="margin-left:auto">Barchasi →</button></div>
 ${L.length?L.map(x=>`<div class="pgri"><span class="pgs"><b>${esc(x.subject)}</b><small>${esc(x.teacher||'')}${tm(x)?' · '+tm(x):''}</small></span><span class="pgv">${attIc(x)}${x.hw!=null?`<span class="pgc">UV ${x.hw}</span>`:''}${x.activity!=null?`<span class="pgc">F ${x.activity}</span>`:''}${x.src=='guruh'&&x.behavior!=null?`<span class="pgc">T ${x.behavior}</span>`:''}${x.grade!=null?`<span class="pgc pgb ${x.grade<=2?'bd':x.grade==5?'ok':''}">${x.src=='rep'?'Topshiriq':'Baho'} ${x.grade}</span>`:''}</span></div>`).join('')
  :`<p class="mut" style="margin:8px 0 0">Bugun hali baho qo'yilmagan. O'qituvchi baho qo'yishi bilan shu yerda ko'rinadi.</p>`}
 <p class="mut" style="font-size:11.5px;margin:6px 0 0">UV — uyga vazifa, F — faollik, T — tartib-intizom (1–5).</p></div>`}
function pgrTick(){clearTimeout(S.pgrTm);S.pgrTm=setTimeout(async()=>{const el=$('pgr');if(el&&ME&&ME.role=='parent'&&!S.pv){const h=await pgrCard().catch(()=>null);if(h&&$('pgr'))$('pgr').outerHTML=h;pgrTick()}},60000)}

// ================= Yurt platformasiga ulash =================
(function(){if(!ON('yuksalish_imkon'))return;
const st=document.createElement('link');st.rel='stylesheet';st.href='../platforma/modullar/yuksalish-imkon.css';document.head.append(st);
Object.assign(IC,{minus:IC.minus||'<path d="M5 12h14"/>',printer:IC.printer||'<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>'});

// --- Kirish: buxgalter va kuzatuvchi akkauntlari ---
const _lm=loadMe;
loadMe=async function(uid){let p=null;try{const r=await sb.from('profiles').select('role,obs,bux').eq('id',uid).maybeSingle();p=r.data}catch(e){}
 if(!p||p.role!='teacher'||!(p.obs||p.bux))return _lm.apply(this,arguments);
 try{ME=await q(sb.from('profiles').select('*').eq('id',uid).single());CL=await q(sb.from('classes').select('id,name,kind,grp,grade,subject,teacher_name').order('id'))}catch(e){retryView(e);return}
 $('out').style.display='';document.body.classList.add('in');flash('');
 if(ME.obs){ME.role='admin';ME._obs=1;window.ADM_SKIP=['tolov','zaxira'];obsMode();await loadLogos().catch(()=>{});S.tab=0;S.ah=true;S.as=null;render();return}
 ME._bux=1;ME.roles={};ME.subj={};ME.cls=[];S.bt=S.bt||'home';render()};

// --- Admin bo'limlari ---
window.ADM_SKIP=['tolov'];
window.ADMX=()=>[
 [1,'gap',"Baho qo'yilmaganlar","O'qituvchilar va sinflar bo'yicha — jonli, PDF",'edit','#d6336c',gapView],
 [1,'davomat',"Davomat to'liq emas","Bugun davomati to'liq belgilanmagan sinflar",'clip','#e8590c',async()=>{const t=nowT(),M=CL.filter(mainCls);return (await attGapHtml(t,M))||`<div class="card"><p class="mut">Sinflar yo'q.</p></div>`}],
 [4,'tolov',"To'lovlar","Naqd/karta, yillik to'lov, kvitansiya, statistika",'card','#c2255c',payView,'tolov'],
 [4,'xarajat','Xarajatlar',"Kunlik xarajatlar va kassa qoldig'i",'minus','#e03131',async()=>expHtml(),'tolov']];

// --- Render: buxgalter sahifasi, o'qituvchi va ota-ona qo'shimchalari ---
const _r=render;
render=async function(){
 if(ME&&YBUX()){flush();const tk=++S.rt;$('chips').innerHTML='';$('side').innerHTML='';document.body.classList.remove('hs-side');$('view').innerHTML='<div class="ld"><i class="spin"></i>Yuklanmoqda…</div>';let h='';
  try{h=await payView()}catch(e){h='<div class="card">Ma\'lumotni o\'qib bo\'lmadi. Sahifani yangilang.</div>'}
  if(tk==S.rt){$('view').innerHTML=h;calcMount()}return}
 const cc=$('calc');if(cc&&!YBUX())cc.remove();
 const r=await _r.apply(this,arguments);
 try{await after()}catch(e){}
 return r};
async function after(){if(!ME)return;const v=$('view');if(!v)return;
 // Ota-ona bosh sahifasi: Bugungi baholar va Reyting
 if(ME.role=='parent'&&!S.pv){if(v.querySelector('#pgr'))return;const h=await pgrCard().catch(()=>'');if(S.pv||v.querySelector('#pgr'))return;
  const blk=h+`<div class="psec">Reyting va o'rinlar</div><div id="rkbox"><div class="ld"><i class="spin"></i>Yuklanmoqda…</div></div>`;
  const at=v.querySelector('.psec');if(at)at.insertAdjacentHTML('beforebegin',blk);else v.insertAdjacentHTML('beforeend',blk);rkFill();pgrTick();return}
 // O'qituvchi sinf oynasi: dars kunlari, baholanmaganlar, ota-ona bilan aloqa
 if(ME.role=='teacher'&&!YBUX()&&!S.as){const top=v.querySelector('.card .tabs');if(!top||top.querySelector('[data-yt]'))return;const c0=CL.find(x=>x.id==S.cls)||{};
  const T=[];if([1,2].includes(grpOf(c0))&&ME.roles&&ME.roles[c0.id]=='rahbar')T.push(['gap','userx','Baholanmaganlar']);
  if(c0.grp&&(ME.cls||[]).includes(c0.id))T.push(['tel','phone','Ota-ona bilan aloqa']);
  T.forEach(([k,i,t])=>top.insertAdjacentHTML('beforeend',`<button class="tab ${S.yt==k?'on':''}" data-yt="${k}">${ic(i)}${t}</button>`));
  const ex=(await myDaysCard(c0).catch(()=>''))+(await myGapCard().catch(()=>''));const card=v.querySelector('.card');if(ex&&card&&!v.querySelector('.yx-ex'))card.insertAdjacentHTML('afterend',`<div class="yx-ex">${ex}</div>`);
  if(S.yt&&T.some(x=>x[0]==S.yt)){top.querySelectorAll('[data-t]').forEach(b=>b.classList.remove('on'));await ytShow()}return}
 // Admin: O'qituvchilar bo'limida buxgalter va kuzatuvchi belgilari
 if(ME.role=='admin'&&!YOBS()&&S.as=='oqit'){const L=[...v.querySelectorAll('.tch[id^="tch"]')];if(!L.length||v.querySelector('.yxrl'))return;
  const{data}=await sb.from('profiles').select('id,bux,obs').eq('role','teacher');const P={};(data||[]).forEach(x=>P[x.id]=x);
  L.forEach(el=>{const u=el.id.slice(3),p=P[u]||{};const t=el.querySelector('.top');if(t)t.insertAdjacentHTML('afterend',`<div class="top yxrl"><label class="ck"><input type="checkbox" class="bxs" data-u="${u}"${p.bux?' checked':''}>💰 Buxgalter</label><label class="ck"><input type="checkbox" class="obss" data-u="${u}"${p.obs?' checked':''}>👁 Kuzatuvchi</label><span class="mut">Buxgalter — faqat to'lov va xarajatlar; kuzatuvchi — hamma narsani ko'radi, o'zgartira olmaydi.</span></div>`)})}}
async function ytShow(){const v=$('view'),card=v.querySelector('.card');if(!card)return;let h='';
 try{h=S.yt=='gap'?await clsGapView():await groupPhoneView()}catch(e){h=`<div class="card"><p class="mut">${esc(netMsg(e))}</p></div>`}
 let n=card.nextElementSibling;while(n&&n.classList.contains('yx-ex'))n=n.nextElementSibling;const at=n?n.previousElementSibling:v.lastElementChild;while(at.nextSibling)at.nextSibling.remove();at.insertAdjacentHTML('afterend',h)}

// --- Ota-ona: «Fan baholari» — barcha baholar (fan, guruh, repetitor) ---
subjCard=async function(a,b){const{data,error}=await sb.rpc('parent_grades',{p_from:a,p_to:b});if(error)return '';const r=(data||[]).filter(x=>x.student_id==ME.student_id).sort((x,y)=>(y.day+(y.at||'')).localeCompare(x.day+(x.at||'')));if(!r.length)return '';
 const g=r.filter(x=>x.grade!=null),av=g.length?Math.round(g.reduce((q,x)=>q+ +x.grade,0)/g.length*10)/10:null,tm=x=>x.at?new Date(x.at).toLocaleTimeString('uz-UZ',{timeZone:TZ,hour:'2-digit',minute:'2-digit'}):'';
 return `<div class="card"><b>${ic('layers')}Barcha baholar — fan, guruh va repetitor</b>${av!=null?`<p class="mut">O'rtacha baho: <b>${av}</b> (${g.length} ta baho)</p>`:''}<div class="wrap"><table><tr><th>Sana</th><th class="l">Fan / guruh</th><th class="l">O'qituvchi</th><th>Davomat</th><th>Uyga vazifa</th><th>Faollik</th><th>Tartib</th><th>Baho</th></tr>
 ${r.map(x=>`<tr><td>${x.day.slice(8)}.${x.day.slice(5,7)}${tm(x)?`<br><small class="mut">${tm(x)}</small>`:''}</td><td class="l">${esc(x.subject)}</td><td class="l">${esc(x.teacher||'')}</td><td>${attIc(x)}</td><td>${x.hw??'—'}</td><td>${x.activity??'—'}</td><td>${x.src=='guruh'&&x.behavior!=null?x.behavior:'—'}</td><td class="tot">${x.grade!=null?`<b class="${x.grade<=2?'bdx':x.grade==5?'okx':''}">${x.grade}</b>`:'—'}</td></tr>`).join('')}</table></div></div>`};

// --- Tugmalar ---
document.addEventListener('click',e=>{if(e.target.closest('[data-t]'))S.yt=null},true);
document.addEventListener('click',async e=>{const t=e.target.closest('button,[data-dvc],.pmk,[data-yt]');if(!t||!ME)return;
 if(YOBS()&&t.matches('.pmk,.ypay,.pyr,.exm,#exAdd,.exDel,#repClose,#repOpen,.mday')){e.stopImmediatePropagation();roNote();return}
 if(t.dataset.yt){S.yt=t.dataset.yt;t.parentNode.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b==t));await ytShow();return}
 if(t.dataset.dvc){S.ah=false;S.as=null;S.cls=+t.dataset.dvc;S.tab=0;S.date=nowT().d;scrollTo(0,0);render();return}
 if(t.classList.contains('rkb')){S.rk=t.dataset.k;render();return}
 if(t.classList.contains('pmk')){const x=(S.pay||[]).find(r=>r.id==t.dataset.id);if(x)await payAccept(x,t.dataset.m);return}
 if(t.classList.contains('xkb')){S.xk=t.dataset.k;render();return}
 if(t.classList.contains('exm')){S.exm=t.dataset.m;document.querySelectorAll('.exm').forEach(b=>b.classList.toggle('on',b==t));return}
 if(t.id=='exAdd'){const cat=$('exCat').value,am=Math.round(+$('exAmt').value||0),who=($('exWho').value||'').trim(),nt=($('exNote').value||'').trim();if(!cat||am<=0){flash("Xarajat turi va summani kiriting");return}
  t.disabled=true;const{error}=await sb.from('expenses').insert({day:S.xd||today,category:cat,recipient:who||null,amount:am,method:S.exm||'naqd',note:nt||null});t.disabled=false;
  if(error){flash(/expenses/.test(error.message||'')?"Avval Supabase'da yurt/sql/16-yuksalish-imkoniyatlari.sql ni ishga tushiring":netMsg(error));return}flash("✅ Xarajat qo'shildi: "+fmtN(am)+" so'm");render();return}
 if(t.classList.contains('exDel')){if(!confirm("Bu xarajat o'chirilsinmi?"))return;const{error}=await sb.from('expenses').delete().eq('id',+t.dataset.id);if(error){flash(netMsg(error));return}flash("Xarajat o'chirildi");render();return}
 if(t.id=='exPdf'&&S.exP){const P=S.exP;printDoc((S.xk=='oy'?'Oylik':'Kunlik')+' xarajatlar — '+P.ttl,`<p><b>Davr:</b> ${P.ttl}<br><b>Tayyorladi:</b> ${esc(ME.full_name||'')}</p>
  <table><tr><th>Tushum (naqd)</th><th>Tushum (karta)</th><th>Xarajat (naqd)</th><th>Xarajat (karta)</th><th>Kassa qoldig'i (naqd)</th></tr><tr><td>${fmtN(P.inC)}</td><td>${fmtN(P.inK)}</td><td>${fmtN(P.exC)}</td><td>${fmtN(P.exK)}</td><td><b>${fmtN(P.inC-P.exC)}</b></td></tr></table>
  <table><tr><th>Sana</th><th>Turi</th><th>Kimga / nimaga</th><th>Summa</th><th>Usul</th><th>Kiritdi</th></tr>${P.L.map(r=>`<tr><td>${fd2(r.day)}</td><td>${esc(r.category)}</td><td>${esc(r.recipient||'')}${r.note?' — '+esc(r.note):''}</td><td>${fmtN(r.amount)}</td><td>${r.method=='karta'?'Karta':'Naqd'}</td><td>${esc(r.created_name||'')}</td></tr>`).join('')}</table>`);return}
 if(t.classList.contains('gpk')){S.gpk=t.dataset.k;render();return}
 if(t.classList.contains('gpm2')){S.gm=t.dataset.m;render();return}
 if(t.classList.contains('mday')){const on=t.classList.toggle('on');const days=[...document.querySelectorAll('.mday.on')].map(x=>+x.dataset.d).sort();
  const{error}=await sb.rpc('set_my_days',{p_class:S.cls,p_days:days});if(error){t.classList.toggle('on');flash(netMsg(error));return}flash('✅ Dars kunlari saqlandi');return}
 if(t.id=='tgPdf'&&S.tgP){const P=S.tgP;printDoc("Baho qo'ymagan o'qituvchilar — "+fd2(P.d),`<p><b>Sana:</b> ${fd2(P.d)} · ${P.T.length} ta o'qituvchi</p>${P.T.map(x=>`<h2>${esc(x.n)}${x.ph?' · '+esc(x.ph):''}</h2><table><tr><th>Sinf / guruh</th><th style="width:90px">Baholangan</th><th>Baho qo'yilmagan o'quvchilar</th></tr>${x.L.filter(r=>r.done<r.n).map(r=>`<tr><td>${esc(r.cl)}${r.subject?' · '+esc(r.subject):''}</td><td>${r.done} / ${r.n}</td><td>${(r.missing||[]).map(esc).join(', ')}</td></tr>`).join('')}</table>`).join('')}`);return}
 if(t.id=='gapPdf'&&S.gapP){const P=S.gapP,dd=d=>fd2(String(d));printDoc("Baho qo'yilmaganlar — "+dd(P.a)+(P.a!=P.b?' – '+dd(P.b):''),`<p><b>Davr:</b> ${dd(P.a)}${P.a!=P.b?' – '+dd(P.b):''}<br><b>Baho to'liq qo'yilmagan sinf/guruhlar:</b> ${P.G.length} ta</p>${P.G.map(x=>`<h2>${esc(clsLbl(x.c))} — ${esc(x.t||"o'qituvchi biriktirilmagan")}</h2><table><tr><th style="width:90px">Sana</th><th style="width:90px">Baholangan</th><th>Baho qo'yilmagan o'quvchilar</th></tr>${x.L.filter(r=>r.done<r.n).map(r=>`<tr><td>${dd(r.day)}</td><td>${r.done} / ${r.n}</td><td>${(r.missing||[]).map(esc).join(', ')}</td></tr>`).join('')}</table>`).join('')}`);return}
 if(t.dataset&&t.dataset.bt){S.bt=t.dataset.bt;if(t.dataset.pf)S.pf=t.dataset.pf;if(t.dataset.rk)S.rk=t.dataset.rk;render();scrollTo({top:0,behavior:'smooth'});return}
 if(t.id=='repPdf'&&S.rep){const[a]=rPer(),cl=S.rep.cl,ttl=S.rk=='kun'?"Kunlik to'lov hisoboti — "+fd2(a):"Oylik to'lov hisoboti — "+MON[+a.slice(5,7)-1]+' '+a.slice(0,4);
  printDoc(ttl,`<p><b>Davr:</b> ${S.rk=='kun'?fd2(a):MON[+a.slice(5,7)-1]+' '+a.slice(0,4)}<br><b>Holati:</b> ${cl?`yopilgan — ${esc(cl.closed_name||'')}, ${new Date(cl.closed_at).toLocaleString('uz-UZ',{timeZone:TZ})}`:'yopilmagan (joriy holat)'}<br><b>Tayyorladi:</b> ${esc(ME.full_name||'')}</p>${repBody(S.rep.rows,cl,true)}<p style="margin-top:24px">Buxgalter: <b>${esc((cl&&cl.closed_name)||ME.full_name||'')}</b> &nbsp;&nbsp; Imzo: ____________________</p>`);return}
 if(t.id=='repClose'){const[a]=rPer();if(!confirm(`${S.rk=='kun'?fd2(a)+' kungi':'Shu oylik'} hisobot yopilsinmi? Yopilgandan keyin bu davr to'lovlarini o'zgartirib bo'lmaydi.`))return;
  t.disabled=true;const{error}=await sb.rpc('close_pay_report',{p_kind:S.rk,p_period:a});if(error){t.disabled=false;flash(netMsg(error));return}flash("🔒 Hisobot yopildi");$('pdBox').innerHTML=await repHtml();return}
 if(t.id=='repOpen'){if(!confirm("Hisobot qayta ochilsinmi? Shundan keyin bu davr to'lovlarini o'zgartirish mumkin bo'ladi."))return;const{error}=await sb.rpc('reopen_pay_report',{p_id:+t.dataset.id});if(error){flash(netMsg(error));return}flash("Hisobot qayta ochildi");$('pdBox').innerHTML=await repHtml();return}
 if(t.classList.contains('pfb')){S.pf=t.dataset.f;$('payBox').innerHTML=payHtml();return}
 if(t.classList.contains('pinf')){const x=(S.pay||[]).find(r=>r.id==t.dataset.id);if(x)await payInfoBox(x);return}
 if(t.id=='paidPdf'){const P=(S.pay||[]).filter(x=>x.paid),mo=MON[+S.pm.slice(5)-1]+' '+S.pm.slice(0,4),by={};P.forEach(x=>(by[x.c]=by[x.c]||[]).push(x));
  const cls=CL.filter(c=>by[c.id]).sort((a,b)=>(grpOf(a)-grpOf(b))||clsCmp(a,b));
  printDoc("To'laganlar — "+mo,`<p><b>Oy:</b> ${mo}<br><b>To'lagan o'quvchilar:</b> ${P.length} ta</p>${cls.map(c=>`<h2>${esc(clsLbl(c))} — ${by[c.id].length} ta</h2><table><tr><th style="width:32px">№</th><th>O'quvchi</th><th>Summa</th><th>Usul</th><th>Sana</th><th>Qabul qildi</th></tr>${by[c.id].map((x,i)=>{const r=x.rec||{};return`<tr><td class="n">${i+1}</td><td>${esc(x.n)}${x.yr?' (yillik)':''}</td><td>${fSum(r.amount)}</td><td>${r.method=='naqd'?'Naqd':r.method=='karta'?'Karta':'—'}</td><td>${x.on?fd2(x.on):'—'}</td><td>${esc(r.received_name||'—')}</td></tr>`}).join('')}</table>`).join('')}`);return}
 if(t.classList.contains('prc')){const x=(S.pay||[]).find(r=>r.id==t.dataset.id);if(x)await payRcpt(x);return}
 if(t.classList.contains('pyr')){const x=(S.pay||[]).find(r=>r.id==t.dataset.id);if(!x)return;const on=!x.yr;
  if(!on&&!confirm(`${x.n}: yillik to'lov belgisi olib tashlansinmi? Yillik belgisi bilan to'langan oylar bekor qilinadi.`))return;
  let v=null;if(on){v=await askPay(`${esc(x.n)} · Yillik to'lov (10 oy)`);if(!v)return}
  t.disabled=true;const{error}=await sb.rpc('set_yearly',on?{p_sid:String(x.id),p_on:on,p_method:v.method,p_amount:v.amount}:{p_sid:String(x.id),p_on:on});
  if(error){t.disabled=false;flash(netMsg(error));return}flash(on?"✅ Yillik to'lov belgilandi":"Yillik to'lov belgisi olib tashlandi");render();return}
 if(t.classList.contains('ypay')){const x=(S.pay||[]).find(r=>r.id==t.dataset.id);if(!x)return;e.stopImmediatePropagation();
  if(!x.paid){await payAccept(x,S.pm);return}if(!confirm(`${x.n}: to'lov bekor qilinsinmi?`))return;
  const{error}=await sb.from('payments').upsert({student_id:x.id,month:S.pm+'-01',paid:false,paid_on:null},{onConflict:'student_id,month'});
  if(error){flash(netMsg(error));return}x.paid=false;x.on='';S.pTot.paid--;x.pm.delete(S.pm);x.rec=null;$('payBox').innerHTML=payHtml()}},true);
document.addEventListener('change',async e=>{const t=e.target;if(!ME)return;
 if(t.classList.contains('ypdt')&&t.value){e.stopImmediatePropagation();const x=(S.pay||[]).find(r=>r.id==t.dataset.id);const{error}=await sb.from('payments').upsert({student_id:x.id,month:S.pm+'-01',paid:true,paid_on:t.value},{onConflict:'student_id,month'});if(error){flash(netMsg(error));return}x.on=t.value;flash("✅ To'lov sanasi saqlandi");return}
 if(t.classList.contains('gpin')){const sid=t.dataset.s,v=t.value.trim();t.disabled=true;const{data,error}=await sb.rpc('set_group_phone',{p_sid:String(sid),p_phone:v});t.disabled=false;
  if(error){flash(netMsg(error));return}t.value=data||'';const row=t.closest('.gphr'),call=row&&row.querySelector('.gpcall'),tel=gpTel(data);
  if(call){if(tel){call.href='tel:'+tel;call.classList.remove('off');call.removeAttribute('aria-disabled')}else{call.removeAttribute('href');call.classList.add('off');call.setAttribute('aria-disabled','true')}}flash("✅ Telefon saqlandi");return}
 if(t.classList.contains('bxs')&&ME.role=='admin'&&!YOBS()){const on=t.checked;if(!confirm(on?"Shu o'qituvchi buxgalter bo'lsinmi? U kirganda faqat to'lov va xarajatlar bo'limi ochiladi.":"Buxgalterlik olib tashlansinmi?")){t.checked=!on;return}
  const{error}=await sb.rpc('set_bux',{p_id:t.dataset.u,p_on:on});if(error){t.checked=!on;flash(netMsg(error));return}flash(on?"✅ Buxgalter belgilandi — u qayta kirganda buxgalter sahifasi ochiladi":"Buxgalterlik olib tashlandi");return}
 if(t.classList.contains('obss')&&ME.role=='admin'&&!YOBS()){const on=t.checked;if(!confirm(on?"Shu akkaunt «Kuzatuvchi» bo'lsinmi?\n\nU butun platformani ko'radi, lekin hech narsani o'zgartira olmaydi. Unga biriktirilgan sinflar olib tashlanadi.":"Kuzatuvchilik olib tashlansinmi?")){t.checked=!on;return}
  const{error}=await sb.rpc('set_obs',{p_id:t.dataset.u,p_on:on});if(error){t.checked=!on;flash(netMsg(error));return}flash(on?"✅ Kuzatuvchi belgilandi — u qayta kirganda ko'rish rejimidagi boshqaruv paneli ochiladi":"Kuzatuvchilik olib tashlandi");return}
 if(t.id=='pdd'&&t.value){S.pdd=t.value;$('pdBox').innerHTML=await repHtml();return}
 if(t.id=='rmo'&&t.value){S.rmo=t.value;$('pdBox').innerHTML=await repHtml();return}
 if((t.id=='gpa'||t.id=='gpb')&&t.value){S[t.id]=t.value;render();return}
 if(t.id=='tgd'&&t.value){S.tgd=t.value;render();return}
 if(t.id=='xd'&&t.value){S.xd=t.value;render();return}
 if(t.id=='xm'&&t.value){S.xm=t.value;render();return}},true);
document.addEventListener('toggle',e=>{const d=e.target;if(d.classList&&d.classList.contains('pcl'))(S.payOpen=S.payOpen||{})[d.dataset.pc]=d.open},true);
})();
