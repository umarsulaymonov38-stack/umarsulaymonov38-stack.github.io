if(!window.supabase){document.getElementById('view').innerHTML='<div class="card"><b>Sahifa to\'liq yuklanmadi.</b><p class="mut">Internet aloqasini tekshirib, sahifani yangilang.</p><button class="btn" onclick="location.reload()">🔄 Yangilash</button></div>';throw new Error('supabase-js yuklanmadi')}
// Har maktabning o'z sozlamasi (masalan, yurt/sozlama.js): nomi, bazasi, modullari
const M=window.MAKTAB||{},API=(M.baza||{}).url||'',KEY=(M.baza||{}).kalit||'',P=(M.kod||'maktab')+'_';
const ON=m=>!M.modullar||M.modullar[m]!==false;
// Yuklama yuqori bo'lganda: har so'rovga muddat (timeout) va takrorlansa zarari yo'q so'rovlarni 3 martagacha qayta yuborish
let PEND=0;const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function nf(url,o={}){const u=String(url),m=(o.method||'GET').toUpperCase(),au=u.includes('/auth/v1/'),h=o.headers||{},pf=(h instanceof Headers?h.get('Prefer'):h.Prefer||h.prefer)||'';
 const safe=!au&&(m=='GET'||m=='HEAD'||m=='PATCH'||m=='DELETE'||(m=='POST'&&(/merge-duplicates/.test(pf)||(u.includes('/rpc/')&&!/register_parent|switch_kid/.test(u))))),w=!au&&m!='GET'&&m!='HEAD';
 if(w)PEND++;
 try{for(let i=0;;i++){const ac=new AbortController(),tt=setTimeout(()=>ac.abort(),au?30000:u.includes('/storage/v1/')?900000:20000);if(o.signal){if(o.signal.aborted)ac.abort();else o.signal.addEventListener('abort',()=>ac.abort())}
  try{const r=await fetch(url,{...o,signal:ac.signal});if(safe&&i<3&&(r.status==429||r.status>=500)){flash("⏳ Server band, qayta urinilmoqda…");await wait(800*2**i+Math.random()*1200);continue}if(i)flash('');return r}
  catch(e){if(!safe||i>=3||(o.signal&&o.signal.aborted))throw e;flash("⏳ Aloqa sust, qayta urinilmoqda…");await wait(800*2**i+Math.random()*1200)}
  finally{clearTimeout(tt)}}}
 finally{if(w)PEND--}}
const sb=API?supabase.createClient(API,KEY,{global:{fetch:nf}}):null;
const $=id=>document.getElementById(id),tm={};
const IC={"edit": "<path d=\"M12 20h9\"/><path d=\"M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z\"/>", "trophy": "<path d=\"M6 9H4.5a2.5 2.5 0 0 1 0-5H6\"/><path d=\"M18 9h1.5a2.5 2.5 0 0 0 0-5H18\"/><path d=\"M4 22h16\"/><path d=\"M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22\"/><path d=\"M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22\"/><path d=\"M18 2H6v7a6 6 0 0 0 12 0V2Z\"/>", "school": "<path d=\"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z\"/><path d=\"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2\"/><path d=\"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2\"/><path d=\"M10 6h4M10 10h4M10 14h4M10 18h4\"/>", "userx": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"m17 8 5 5M22 8l-5 5\"/>", "user": "<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/>", "users": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75\"/>", "card": "<rect x=\"2\" y=\"5\" width=\"20\" height=\"14\" rx=\"2\"/><path d=\"M2 10h20\"/>", "sliders": "<path d=\"M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6\"/>", "food": "<path d=\"M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2\"/><path d=\"M7 2v20\"/><path d=\"M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7\"/>", "chart": "<path d=\"M3 3v18h18\"/><path d=\"M18 17V9M13 17V5M8 17v-3\"/>", "books": "<path d=\"M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z\"/><path d=\"M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z\"/>", "award": "<circle cx=\"12\" cy=\"8\" r=\"6\"/><path d=\"M15.48 12.89 17 22l-5-3-5 3 1.52-9.11\"/>", "cal": "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M16 2v4M8 2v4M3 10h18\"/><path d=\"m9 16 2 2 4-4\"/>", "book": "<path d=\"M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20\"/>", "run": "<path d=\"M22 12h-4l-3 9L9 3l-3 9H2\"/>", "heart": "<path d=\"M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z\"/>", "cap": "<path d=\"M22 10 12 5 2 10l10 5 10-5Z\"/><path d=\"M6 12v5c3 3 9 3 12 0v-5\"/>", "clip": "<rect x=\"8\" y=\"2\" width=\"8\" height=\"4\" rx=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/><path d=\"m9 14 2 2 4-4\"/>", "flask": "<path d=\"M9 3h6M10 3v7.4L4.6 19a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 10.4V3\"/><path d=\"M7 16h10\"/>", "star": "<path d=\"m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z\"/>", "shield": "<path d=\"M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z\"/><path d=\"m9 12 2 2 4-4\"/>", "zap": "<path d=\"M13 2 3 14h9l-1 8 10-12h-9z\"/>", "logout": "<path d=\"M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4\"/><path d=\"m16 17 5-5-5-5M21 12H9\"/>", "printer": "<path d=\"M6 9V2h12v7\"/><path d=\"M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2\"/><rect x=\"6\" y=\"14\" width=\"12\" height=\"8\"/>", "target": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><circle cx=\"12\" cy=\"12\" r=\"6\"/><circle cx=\"12\" cy=\"12\" r=\"2\"/>", "layers": "<path d=\"m12 2 10 5-10 5L2 7z\"/><path d=\"m2 17 10 5 10-5M2 12l10 5 10-5\"/>", "bag": "<path d=\"M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z\"/><path d=\"M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M8 21v-5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v5M8 10h8\"/>", "upload": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><path d=\"m17 8-5-5-5 5M12 3v12\"/>", "pdf": "<path d=\"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z\"/><path d=\"M14 2v6h6\"/><path d=\"M8 13h2a1.5 1.5 0 0 1 0 3H8v-3Zm0 3v2M14 13v5M14 13h2M14 15.5h1.5\"/>", "doc": "<path d=\"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z\"/><path d=\"M14 2v6h6\"/><path d=\"M8 13h8M8 17h8M8 9h2\"/>", "file": "<path d=\"M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5Z\"/><path d=\"M14 2v6h6\"/>", "trash": "<path d=\"M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2\"/>", "key": "<circle cx=\"7.5\" cy=\"15.5\" r=\"5.5\"/><path d=\"m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3\"/>", "wifi": "<path d=\"M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01\"/>", "image": "<rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21\"/>", "msg": "<path d=\"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z\"/>", "phone": "<path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z\"/>", "check": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m9 12 2 2 4-4\"/>", "xc": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m15 9-6 6M9 9l6 6\"/>", "minus": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M8 12h8\"/>", "down": "<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><path d=\"m7 10 5 5 5-5M12 15V3\"/>", "globe": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>"};
Object.assign(IC,{mail:'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>',info:'<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
 eye:'<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',eyeoff:'<path d="M9.9 4.2A10 10 0 0 1 12 4c6.5 0 10 8 10 8a17 17 0 0 1-2.2 3.3M6.6 6.6A17 17 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/><path d="m2 2 20 20"/>',back:'<path d="m15 18-6-6 6-6"/>'});
const ic=n=>`<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n]||''}</svg>`;
const MON=['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'],TZ='Asia/Tashkent',DN=['Yakshanba','Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba'];
function nowT(){const p={};new Intl.DateTimeFormat('en-GB',{timeZone:TZ,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date()).forEach(x=>p[x.type]=x.value);
 return{d:`${p.year}-${p.month}-${p.day}`,h:+p.hour,m:+p.minute,s:+p.second,hms:`${p.hour}:${p.minute}:${p.second}`,wd:DN[new Date(Date.UTC(+p.year,+p.month-1,+p.day)).getUTCDay()],lbl:`${+p.day}-${MON[+p.month-1]} ${p.year}`}}
const today=nowT().d;
let CR=[{c:'att',k:'Davomat',i:'cal',m:1},{c:'book',k:"Kitob o'qish",i:'book',m:10},{c:'sport',k:'Sport',i:'run',m:10},{c:'behavior',k:'Kunlik odoblar',i:'users',m:10},{c:'kindness',k:'Ota-onaga yaxshilik',i:'heart',m:10},{c:'activity',k:'Fanlardagi faollik',i:'cap',m:10}];
let MAXD=51;const AT={'':'—','1':'✅','0':'❌'},MD=['🥇','🥈','🥉'];
const CR51=CR.slice(),CRG=[{c:'att',k:'Davomat',i:'cal',m:1},{c:'hw',k:'Uyga vazifa',i:'clip',m:5},{c:'activity',k:'Sinfdagi faollik',i:'zap',m:5},{c:'behavior',k:'Tartib-intizom',i:'shield',m:5}];
// 1-sinflarda «Kitob o'qish» yo'q: qolgan 4 mezon (0–10) yig'indisi ×1.25 — kunlik maksimal 51 bo'lib qoladi
const CR1=CR51.filter(x=>x.c!='book'),isG1=c=>!!c&&c.kind!='rep'&&!c.grp&&!isLang(c)&&gradeOf(c)==1,crOf=c=>isG1(c)?CR1:CR51;
function setMode(c){const g=c&&c.grp&&c.kind!='rep';CR=g?CRG:crOf(c);MAXD=g?16:51}
const PE=v=>{const d=String(v||'').replace(/\D/g,'').slice(-9);return d.length==9?d:''},EM=(r,p)=>r+p+'@'+(M.email_domen||'ota.maktab.app');
const sum=r=>sumBy(r,CR);
// Davomat: — belgilanmagan → ✅ keldi → ❌ kelmadi (sababsiz) → <i class=exd></i> sababli (kasal yoki uzrli sabab) → —
// Sababli belgisi — CSS doira (eski Windows/Android'da 🟡 emoji ko'rinmaydi)
const attIc=r=>r&&+r.att===0&&r.att!==null&&r.excused?'<i class=exd></i>':AT[String((r||{}).att??'')];
const attNext=r=>r.att==null?{att:1,excused:false}:+r.att==1?{att:0,excused:false}:!r.excused?{att:0,excused:true}:{att:null,excused:false};
async function attSave(tb,sid,day,v){let{error}=await sb.from(tb).upsert({student_id:sid,day,...v},{onConflict:'student_id,day'});
 if(error&&/excused/i.test(error.message)){({error}=await sb.from(tb).upsert({student_id:sid,day,att:v.att},{onConflict:'student_id,day'}));if(!error&&v.excused)flash("«Sababli» belgisi saqlanishi uchun admin sql/yangilanish-6.sql faylini ishga tushirishi kerak")}
 if(error)flash(netMsg(error))}
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const S={tab:0,cls:1,date:today,month:today.slice(0,7),rt:0,peek:false,open:{}};
let ME=null,CL=[];
const netMsg=e=>/fetch|network|abort|timeout|load failed/i.test(String(e&&(e.message||e)))?"⚠️ Internet aloqasi yo'q yoki juda sust. Birozdan so'ng qayta urinib ko'ring.":'Xato: '+((e&&e.message)||e);
const authBad=e=>e.status==429||/rate limit|too many/i.test(e.message||'')?"Juda ko'p urinish bo'ldi. 1–2 daqiqadan so'ng qayta urinib ko'ring.":(!e.status||e.status>=500)?netMsg(e):null;
const errTxt=e=>authBad(e)||(e.code=='invalid_credentials'||/invalid login/i.test(e.message)?"Email yoki parol noto'g'ri":'Xato: '+e.message)+' ['+(e.status||0)+' '+(e.code||e.name||'')+']';
const flash=t=>{$('msg').textContent=t||''};
const q=async p=>{const{data,error}=await p;if(error){flash(netMsg(error));throw error}return data};
// 1000 qatordan ko'p bo'lishi mumkin bo'lgan ro'yxatlarni bo'lib-bo'lib o'qish (Supabase bir so'rovda 1000 tagacha beradi)
const all=async mk=>{let out=[];for(let f=0;;f+=1000){const d=await q(mk().range(f,f+999));out=out.concat(d);if(d.length<1000)return out}};
const dbn=(k,fn,ms=400)=>{if(tm[k])clearTimeout(tm[k].t);const go=()=>{delete tm[k];fn().catch(()=>{})};tm[k]={t:setTimeout(go,ms),go}};
const flush=()=>Object.values(tm).forEach(x=>{clearTimeout(x.t);x.go()});
const empty=(t,d,x)=>`<div class="card empty"><span class="cl ph">${ic('school')}</span><div><b>${t}</b><p class="mut">${d}</p>${x||''}</div></div>`;
const retryView=e=>{$('view').innerHTML=empty("Server bilan ulanib bo'lmadi.",esc(netMsg(e)),'<button class="btn" id="rty">Qayta urinish</button>')};
const th=()=>CR.map(x=>`<th title="${x.k}"><span class="ic">${ic(x.i)}</span>${x.k}</th>`).join('');
const cname=id=>(CL.find(c=>c.id==id)||{}).name||'';
// Kirish oynasi: chapda maktab rasmi (barcha rollar uchun bitta fon), o'ngda rol tanlash va forma.
// S.lt: 0 — ota-ona kirishi, 1 — ota-ona ro'yxatdan o'tishi, 2 — admin, 3 — o'qituvchi
function loginView(){$('out').style.display='none';document.body.classList.remove('in');$('chips').innerHTML='';$('side').innerHTML='';document.body.classList.remove('hs-side');
 const K=M.kirish||{},OT=ON('ota_ona'),L=!OT&&S.lt<2?3:S.lt||0,tab=L==1?0:L;
 const F=(id,lb,ty,icn,ph,ac)=>`<label class="kr-f"><span>${lb}</span>${ic(icn)}<input id="${id}" type="${ty}" placeholder="${ph}" autocomplete="${ac}"${ty=='tel'?' inputmode="tel"':''}>${ty=='password'?`<button type="button" class="kr-eye" data-eye="${id}" aria-label="Parolni ko'rsatish">${ic('eye')}</button>`:''}</label>`;
 const R=[[0,'users','Ota-ona'],[3,'cap',"O'qituvchi"],[2,'shield','Admin']].filter(r=>OT||r[0]);
 const tel='+998 90 123 45 67',go=t=>`<button class="btn kr-btn" id="${t[0]}">${t[1]}</button>`;
 const body=L==1?`<div class="kr-hint">${ic('info')}<span>Faqat birinchi marta. Telefon raqamingiz farzandingiz ma'lumotiga maktabda yozilgan bo'lishi kerak. Parolni o'zingiz o'ylab topasiz.</span></div>${F('rn','Ism familiya','text','user','Masalan: Aliyev Vali','name')}${F('rph','Telefon raqam','tel','phone',tel,'username')}${F('rpw','Yangi parol','password','key','Kamida 6 belgi','new-password')}${go(['rgo',"Ro'yxatdan o'tish"])}<p class="kr-alt">Akkauntingiz bormi? <button type="button" class="kr-lnk" data-lt="0">Kirish</button></p>`
  :L==2?`${F('em','Email','email','mail','admin@maktab.uz','username')}${F('pw','Parol','password','key','Parolingiz','current-password')}${go(['tgo','Admin sifatida kirish'])}`
  :`${F('lph','Telefon raqam','tel','phone',tel,'username')}${F('lpw','Parol','password','key','Parolingiz','current-password')}${go(['lgo','Kirish'])}`+(L==3?`<p class="kr-alt">Login va parolni maktab ma'muriyati beradi.</p>`:`<p class="kr-alt">Birinchi marta kiryapsizmi? <button type="button" class="kr-lnk" data-lt="1">Ro'yxatdan o'tish</button></p>`);
 const ios=/iPhone|iPad|iPod/.test(navigator.userAgent)&&!standalone()?`<div class="ios"><b>📲 Ilova qilib o'rnatish (iPhone):</b><br>1) Pastdagi <b>«•••»</b> tugmasini bosing (eski iPhone'larda — <b>Ulashish ⬆️</b> tugmasi).<br>2) <b>«Поделиться» / Share</b> ni tanlang.<br>3) Ro'yxatni pastga surib, <b>«На экран «Домой»» / Add to Home Screen</b> → <b>«Добавить» / Add</b>.<br>Shundan keyin platforma telefon ekranidagi <b>${esc(M.qisqa)}</b> belgisidan ochiladi.</div>`:'';
 $('view').innerHTML=`<div class="kr">${K.rasm?`<div class="kr-art"><img src="${esc(K.rasm)}" alt="${esc(K.rasm_izoh||M.nomi)}" width="853" height="1280" fetchpriority="high"></div>`:''}
 <section class="card kr-card"><span class="kr-kick">${esc(K.salom||'Xush kelibsiz')}</span><h2>Tizimga kirish</h2><p class="mut">Rolingizni tanlang va ma'lumotlaringizni kiriting.</p>
 <div class="kr-roles" role="tablist">${R.map(([n,i,t])=>`<button class="kr-role" role="tab" data-lt="${n}" aria-selected="${tab==n}">${ic(i)}${t}</button>`).join('')}</div>
 <div class="kr-form">${body}</div>${ios}
 <div class="kr-foot">${M.portal?`<a class="tab" href="${esc(M.portal)}">${ic('back')}Maktabni almashtirish</a>`:''}<button class="tab" id="net">${ic('wifi')}Ulanishni tekshirish</button></div></section></div>`}
// Parolni ko'rsatish (ko'z belgisi) va telefon raqamni +998 XX XXX XX XX ko'rinishiga keltirish
document.addEventListener('click',e=>{const k=e.target.closest('[data-eye]');if(!k)return;const i=$(k.dataset.eye),s=i.type=='password';i.type=s?'text':'password';k.innerHTML=ic(s?'eyeoff':'eye')});
document.addEventListener('input',e=>{const t=e.target;if(!['lph','rph'].includes(t.id)||/[a-z@]/i.test(t.value))return;let d=t.value.replace(/\D/g,'');if(d.startsWith('998'))d=d.slice(3);d=d.slice(0,9);
 t.value=d?'+998 '+[d.slice(0,2),d.slice(2,5),d.slice(5,7),d.slice(7,9)].filter(Boolean).join(' '):''});
// Sinf logolari kamdan-kam o'zgaradi: bir marta yuklab, brauzerda 7 kun saqlanadi (har kirishda qayta yuklanmaydi)
const LK=P+'logo',logoGet=()=>{try{const c=JSON.parse(localStorage.getItem(LK)||'{}');return c._t&&Date.now()-c._t<7*864e5?c:{_t:Date.now()}}catch(e){return {_t:Date.now()}}},logoPut=c=>{try{localStorage.setItem(LK,JSON.stringify(c))}catch(e){}};
async function loadLogos(){const c=logoGet(),need=CL.filter(x=>x.logo===undefined&&!(x.id in c)).map(x=>x.id);
 if(need.length){const{data}=await sb.from('classes').select('id,logo').in('id',need);(data||[]).forEach(x=>c[x.id]=x.logo||'')}
 CL.forEach(x=>{if(x.logo===undefined)x.logo=c[x.id]||null;else c[x.id]=x.logo||''});logoPut(c)}
async function boot(){if(!sb){loginView();return}try{const{data:{session}}=await sb.auth.getSession();if(!session){loginView();return}await loadMe(session.user.id)}catch(e){retryView(e)}}
async function loadMe(uid){
 try{ME=await q(sb.from('profiles').select('*').eq('id',uid).single());
  const cq=f=>q(sb.from('classes').select(f).order('id'));CL=ME.role=='parent'?await cq('id,name,kind,grp,grade,subject').catch(()=>cq('*')):await cq('id,name,kind,grp,grade,subject,teacher_name').catch(()=>cq('*'));
  if(ME.role!='parent')await loadLogos()}
 catch(e){if(e&&e.code=='PGRST116')loginView();else retryView(e);return}
 $('out').style.display='';document.body.classList.add('in');
 if(ME.role=='pending'){$('view').innerHTML=empty('Hisobingiz hali faollashtirilmagan.',"Ota-ona bo'lsangiz: chiqib, «Ota-ona: ro'yxatdan o'tish» bo'limida shu telefon va parol bilan qayta urining. Aks holda admin bilan bog'laning.");return}
 if(ME.role=='teacher'){try{const tr=await q(sb.from('teacher_classes').select('class_id,role,subject').eq('user_id',uid)).catch(()=>q(sb.from('teacher_classes').select('class_id,role').eq('user_id',uid))).catch(()=>q(sb.from('teacher_classes').select('class_id').eq('user_id',uid)));
  ME.roles={};ME.subj={};tr.forEach(x=>{if(x.role)ME.roles[x.class_id]=x.role;if(x.subject)ME.subj[x.class_id]=x.subject});ME.cls=tr.map(x=>x.class_id).sort((a,b)=>a-b)}catch(e){retryView(e);return}if(!ME.cls.length){$('view').innerHTML=empty('Sizga hali sinf biriktirilmagan.',"Admin bilan bog'laning.");return}S.cls=ME.cls.includes(S.cls)?S.cls:ME.cls[0]}S.tab=0;flash('');render();sideView()}
// Sinf guruhlari: 1 — boshlang'ich (1–4), 2 — yuqori (5–10), 3 — Matematika guruhlari, 4 — Ingliz tili guruhlari (Alfa/Betta/Gamma), 5 — repetitor, 6 — Arab tili va Koreys tili
const gradeOf=c=>+c.grade||parseInt(c.name)||0;
const isLang=c=>/^(arab|koreys)/i.test(c.subject||''),grpOf=c=>c.kind=='rep'?5:isLang(c)?6:c.grp?(/^matem/i.test(c.subject||'')?3:4):gradeOf(c)&&gradeOf(c)<=4?1:2;
const GR=[[1,"1-guruh: Boshlang'ich sinflar (1–4)",'bag'],[2,'2-guruh: Yuqori sinflar (5–10)','cap'],[3,'3-guruh: Matematika','layers'],[4,'4-guruh: Ingliz tili','book'],[5,'5-guruh: Repetitor guruhlar','target'],[6,'6-guruh: Arab tili va Koreys tili','globe']],GRT=g=>(GR.find(x=>x[0]==g)||[])[1]||'';
const cap=s=>s?s[0].toUpperCase()+s.slice(1).toLowerCase():'';
const clsLbl=c=>c.kind=='rep'?(c.subject||c.name):isLang(c)?c.name:c.grp?(gradeOf(c)?gradeOf(c)+'-sinf ':'')+(/\d|ielts/i.test(c.grp)?String(c.grp).toUpperCase():cap(c.grp))+(c.subject?' · '+c.subject:''):c.name;
const clsCmp=(a,b)=>isLang(a)&&isLang(b)?String(a.subject).localeCompare(b.subject,'uz')||(gradeOf(a)-gradeOf(b))||String(a.grp).localeCompare(b.grp):a.kind=='rep'?String(clsLbl(a)).localeCompare(clsLbl(b),'uz'):(gradeOf(a)-gradeOf(b))||String(a.grp||a.name).localeCompare(b.grp||b.name,'uz')||String(a.subject||'').localeCompare(b.subject||'','uz');
// PDF / chop etish: alohida oynada toza hujjat ochiladi, brauzer oynasida «PDF sifatida saqlash» yoki printer tanlanadi
function printDoc(title,body){const html=`<!doctype html><html lang="uz"><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font:12px/1.45 system-ui,Arial,sans-serif;color:#111;margin:22px}h1{font-size:18px;margin:0 0 2px}h2{font-size:14px;margin:16px 0 6px;color:#16213d}.m{color:#555;margin:0 0 12px}table{border-collapse:collapse;width:100%;margin-bottom:6px;page-break-inside:auto}tr{page-break-inside:avoid}th,td{border:1px solid #bbb;padding:5px 7px;text-align:left}th{background:#fff1e0}.exd{display:inline-block;width:11px;height:11px;border-radius:50%;background:#f2b705;vertical-align:-1px;-webkit-print-color-adjust:exact;print-color-adjust:exact}td.n{text-align:right}.hd{border-bottom:3px solid #d9822b;padding-bottom:8px;margin-bottom:12px}@page{size:A4;margin:14mm}</style></head><body><div class="hd"><h1>${esc(M.nomi)}</h1><div class="m">${esc(title)}</div></div>${body}<p class="m">Chop etilgan: ${nowT().lbl}, ${nowT().hms.slice(0,5)}</p></body></html>`;
 const w=window.open('','_blank');if(w){w.document.open();w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),400);return}
 const f=document.createElement('iframe');f.style.cssText='position:fixed;right:0;bottom:0;width:0;height:0;border:0';document.body.appendChild(f);const d=f.contentDocument;d.open();d.write(html);d.close();setTimeout(()=>{f.contentWindow.focus();f.contentWindow.print();setTimeout(()=>f.remove(),3000)},400)}
const fd=d=>d.slice(8)+'.'+d.slice(5,7)+'.'+d.slice(0,4);
async function ratingView(){const r=mr(S.month),A=ME.role=='admin';let d;
 try{d=await q(sb.rpc('teacher_rating',{p_from:r.a,p_to:r.b}))}catch(e){flash('');return `<div class="card"><b>${ic('award')}O'qituvchilar reytingi</b><p class="mut">Bo'limni ochib bo'lmadi. Admin Supabase SQL Editor'da <b>notify pgrst, 'reload schema';</b> buyrug'ini ishga tushirsin (yoki <b>sql/yangilanish-2.sql</b> hali ishga tushirilmagan).</p><p class="mut">Sabab: ${esc((e&&(e.message||e.code))||e)}</p></div>`}
 S.rate={m:S.month,d};const pc=x=>x.class_days?Math.round(x.on_time/x.class_days*100)+'%':'—';
 return `<div class="card"><div class="top"><b>Oy:</b><input type="month" id="mo" value="${S.month}">${d.length?`<button class="btn" id="ratePdf">${ic('printer')}PDF / Chop etish</button>`:''}</div>
 <p class="mut">Har bir biriktirilgan sinf uchun har kuni barcha o'quvchilarga baholar soat <b>21:00</b> gacha to'liq qo'yilishi kerak. Oylik ball 100 dan boshlanadi: kechikib to'ldirilgan har bir sinf-kun uchun <b>−2</b>, to'ldirilmagan sinf-kun uchun <b>−5</b> ball. Asosiy sinflarda maktab ishlagan har bir kun, fan guruhlari (Matematika, Ingliz tili, Arab va Koreys tili) va repetitor guruhlarida dars bo'lgan kunlar hisoblanadi.</p>
 ${d.length?`<div class="wrap"><table><tr><th>O'rin</th><th class="l">O'qituvchi</th><th>Sinf-kunlar</th><th>O'z vaqtida</th><th>Kechikkan</th><th>Bajarilmagan</th><th>Bajarilish</th><th>Reyting bali</th></tr>${d.map((x,j)=>`<tr><td>${A&&x.class_days?(MD[j]||j+1):'—'}</td><td class="l"><b>${esc(x.full_name)}</b><br><span class="mut">${esc(x.classes||'')}</span></td><td>${x.class_days}</td><td class="ok">${x.on_time}</td><td class="lt">${x.late}</td><td class="bd">${x.missed}</td><td>${pc(x)}</td><td class="tot">${x.score}</td></tr>`).join('')}</table></div>`:'<p class="mut">Bu oy uchun ma\'lumot yo\'q.</p>'}</div>`}
// Fan darsliklari bo'limi vaqtincha o'chirilgan (Supabase bepul tarifida trafik limiti tufayli). Yoqish uchun: BOOKS=true
const BOOKS=!!(M.modullar&&M.modullar.kitoblar),BK='darsliklar',bUrl=p=>sb.storage.from(BK).getPublicUrl(p).data.publicUrl,fsz=b=>b>=1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB';
const bItem=(b,del)=>{const pdf=/\.pdf$/i.test(b.path);return `<div class="bk">${ic(pdf?'pdf':'doc')}<div class="bt"><a href="${esc(bUrl(b.path))}" target="_blank" rel="noopener">${esc(b.title)}</a><span class="mut">${pdf?'PDF':'Word'}${b.size?' · '+fsz(b.size):''} · ${fd(b.created_at.slice(0,10))}</span></div><a class="tab" href="${esc(bUrl(b.path))}?download=" title="Yuklab olish">${ic('down')}</a>${del?`<button class="tab bdel" data-id="${b.id}" data-p="${esc(b.path)}" title="O'chirish">${ic('trash')}</button>`:''}</div>`};
async function booksView(){const c0=CL.find(x=>x.id==S.cls)||{},g=grpOf(c0),A=ME.role=='admin',cs=CL.filter(c=>grpOf(c)==g&&(A||(ME.cls||[]).includes(c.id))).sort(clsCmp);let rows;
 try{rows=await q(sb.from('books').select('*').eq('grp',g).order('created_at',{ascending:false}))}catch(e){flash('');return `<div class="card"><b>${ic('books')}Fan darsliklari</b><p class="mut">Bo'limni ochib bo'lmadi. Admin Supabase SQL Editor'da <b>notify pgrst, 'reload schema';</b> buyrug'ini ishga tushirsin (yoki <b>sql/yangilanish-2.sql</b> hali ishga tushirilmagan).</p><p class="mut">Sabab: ${esc((e&&(e.message||e.code))||e)}</p></div>`}
 const sec=(t,a,on)=>`<details class="gd" ${on?'open':''}><summary>${t} <span class="mut">(${a.length})</span></summary>${a.length?a.map(b=>bItem(b,A||b.uploaded_by==ME.id)).join(''):'<p class="mut">Hali kitob yo\'q.</p>'}</details>`;
 return `<div class="card"><b>${ic('upload')}Kitob yuklash</b><p class="mut">PDF yoki Word (.doc, .docx) fayl, 50 MB gacha. Kitob butun guruhga yoki bitta sinfga biriktiriladi; o'quvchilar ota-onalari ham ko'radi.</p>
 <input class="fld" id="bkt" placeholder="Kitob nomi (masalan: Matematika, 5-sinf darsligi)"><select class="fld" id="bkc"><option value="">Butun guruh uchun — ${esc(GRT(g))}</option>${cs.map(c=>`<option value="${c.id}" ${c.id==S.cls?'selected':''}>${esc(clsLbl(c))}</option>`).join('')}</select>
 <div class="top"><button class="tab" id="bkb">${ic('file')}Fayl tanlash</button><input type="file" id="bkf" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden><span class="mut" id="bkn">${S.bkf?esc(S.bkf.name):''}</span></div><button class="btn" id="bku">${ic('upload')}Yuklash</button></div>
 <div class="card"><b>${ic(GR[g-1][2])}${esc(GRT(g))}</b>${sec('Butun guruh uchun',rows.filter(b=>!b.class_id),true)}${CL.filter(c=>grpOf(c)==g).sort(clsCmp).map(c=>sec(esc(clsLbl(c)),rows.filter(b=>b.class_id==c.id),c.id==S.cls)).join('')}</div>`}
async function parentBooks(){const c=S.kc;if(!c||!c.id)return '';const{data,error}=await sb.from('books').select('*').eq('grp',grpOf(c)).or(`class_id.is.null,class_id.eq.${c.id}`).order('created_at',{ascending:false});
 return error||!data||!data.length?'':`<div class="card"><b>${ic('books')}Fan darsliklari</b>${data.map(b=>bItem(b,false)).join('')}</div>`}
// Fikr-mulohazalar: ota-ona yozadi, admin sinflar kesimida ko'radi va PDF qiladi
const LATE='08:30',TK_UNTIL='09:30',TK_LEAVE='16:40';  // shu vaqtdan keyin kelganlar to'q sariq rangda ko'rsatiladi
const FBC=['Umumiy',"Ta'lim sifati","O'qituvchilar",'Ovqatlanish','Xavfsizlik va tartib','Taklif'];
const fdt=t=>new Date(t).toLocaleString('en-GB',{timeZone:TZ,day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}).replace(/\//g,'.');
// To'lovlar: o'quv yili sentabrdan; har oy to'lovi shu oyning PAY_DUE-sanasigacha. Iyun–avgust hisoblanmaydi.
const PAY_DUE=5,PAY_MONTHS=[9,10,11,12,1,2,3,4,5];
async function payInfo(){const c=S.kc||{};if(!ON('tolov')||!c.id||c.kind=='rep'||!ME.student_id)return {b:'',t:''};
 const t=nowT(),y=+t.d.slice(0,4),mo=+t.d.slice(5,7),sy=mo>=9?y:y-1,from=sy+'-09-01';
 const[{data:pays,error},{data:fd}]=await Promise.all([sb.from('payments').select('month,paid,paid_on').eq('student_id',ME.student_id).gte('month',from).order('month'),
  sb.from('daily_scores').select('day').eq('student_id',ME.student_id).gte('day',from).order('day').limit(1)]);
 if(error)return {b:'',t:''};
 const pm={};(pays||[]).forEach(p=>pm[p.month.slice(0,7)]=p);
 // o'quvchi o'qishni boshlagan oy: birinchi baho yoki to'lov oyidan (o'quv yili o'rtasida kelganlar uchun)
 const firsts=[(fd&&fd[0]&&fd[0].day.slice(0,7)),...(pays||[]).filter(p=>p.paid).map(p=>p.month.slice(0,7))].filter(Boolean).sort();
 const start=firsts[0]||t.d.slice(0,7);
 const months=[];for(let k=0;k<12;k++){const mm=((8+k)%12)+1,yy=mm>=9?sy:sy+1,key=yy+'-'+String(mm).padStart(2,'0');if(!PAY_MONTHS.includes(mm)||key>t.d.slice(0,7))continue;if(key>=start||pm[key])months.push(key)}
 const lbl=k=>MON[+k.slice(5)-1]+' '+k.slice(0,4),day=s=>Date.UTC(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10)),today=day(t.d);
 const late=months.filter(k=>!(pm[k]&&pm[k].paid)).map(k=>({k,d:Math.floor((today-day(k+'-'+String(PAY_DUE).padStart(2,'0')))/864e5)})).filter(x=>x.d>=0);
 const kid=esc(S.kn||'');
 S.payH={kid:S.kn||'',cls:clsLbl(c),rows:months.map(k=>({m:lbl(k),paid:!!(pm[k]&&pm[k].paid),on:(pm[k]&&pm[k].paid_on)||''}))};
 const b=late.length?`<div class="card payw"><b>${ic('card')}To'lov eslatmasi</b><p>Hurmatli ota-ona! <b>${kid}</b> uchun quyidagi oylar to'lovi hali qayd etilmagan:</p>
  <ul>${late.map(x=>`<li><b>${lbl(x.k)}</b> — ${x.d?`<span class="lt">${x.d} kun kechikmoqda</span>`:"bugun to'lov kuni"}</li>`).join('')}</ul>
  <p class="mut">To'lov har oyning ${PAY_DUE}-sanasigacha amalga oshiriladi. To'lagan bo'lsangiz, maktab ma'muriyati qayd etgach, eslatma o'zi yo'qoladi.</p></div>`:'';
 S.payKids=[{full_name:S.kn||'',cls:clsLbl(c),rows:S.payH.rows}];const tb=payTable(S.payH.rows,0,`To'lovlar tarixi (${sy}–${sy+1} o'quv yili)`);
 return {b,t:tb}}
const fd2=d=>d.slice(8,10)+'.'+d.slice(5,7)+'.'+d.slice(0,4);
// O'quv yili oylari, to'lanmagan oylar va kechikish kunlari (bitta farzand uchun)
function payCalc(pays,firstDay,sy){const t=nowT(),pm={};(pays||[]).forEach(p=>pm[String(p.month).slice(0,7)]=p);
 const firsts=[firstDay&&String(firstDay).slice(0,7),...(pays||[]).filter(p=>p.paid).map(p=>String(p.month).slice(0,7))].filter(Boolean).sort(),start=firsts[0]||t.d.slice(0,7);
 const months=[];for(let k=0;k<12;k++){const mm=((8+k)%12)+1,yy=mm>=9?sy:sy+1,key=yy+'-'+String(mm).padStart(2,'0');if(!PAY_MONTHS.includes(mm)||key>t.d.slice(0,7))continue;if(key>=start||pm[key])months.push(key)}
 const day=s=>Date.UTC(+s.slice(0,4),+s.slice(5,7)-1,+s.slice(8,10)),today=day(t.d),lbl=k=>MON[+k.slice(5)-1]+' '+k.slice(0,4);
 return {rows:months.map(k=>({m:lbl(k),paid:!!(pm[k]&&pm[k].paid),on:(pm[k]&&pm[k].paid_on)||''})),
  late:months.filter(k=>!(pm[k]&&pm[k].paid)).map(k=>({m:lbl(k),d:Math.floor((today-day(k+'-'+String(PAY_DUE).padStart(2,'0')))/864e5)})).filter(x=>x.d>=0)}}
const lateLi=x=>`<li><b>${x.m}</b> — ${x.d?`<span class="lt">${x.d} kun kechikmoqda</span>`:"bugun to'lov kuni"}</li>`;
const payTable=(rows,i,title,sel='')=>`<div class="card"><div class="top"><b>${ic('card')}${title}</b>${sel}<button class="tab payPdf" data-k="${i}" style="margin-left:auto">${ic('printer')}PDF / Chop etish</button></div>
 <div class="wrap"><table style="min-width:0"><tr><th class="l">Oy</th><th>Holati</th><th>To'langan sana</th></tr>${rows.map(r=>`<tr><td class="l">${r.m}</td><td>${r.paid?"✅ To'langan":"❌ To'lanmagan"}</td><td>${r.on?fd2(r.on):'—'}</td></tr>`).join('')||'<tr><td colspan="3" class="mut">Hali ma\'lumot yo\'q</td></tr>'}</table></div></div>`;
// Barcha farzandlar bir oynada: har bir farzandning sinfi, fan guruhlari va repetitorlari, bugungi davomat,
// so'nggi 3 kundagi past/yuqori baholar, to'lov eslatmasi va farzand tanlab ko'riladigan to'lovlar tarixi
const nkey=s=>String(s||'').toLowerCase().replace(/[^\p{L}\p{N} ]/gu,'').split(/\s+/).filter(Boolean).sort().join(' ');
function sumBy(r,cr){r=r||{};const a=+r.att==1?1:0,o=cr.reduce((q,x)=>q+(x.c=='att'?0:(+r[x.c]||0)),0);return a+(cr===CR1?Math.round(o*1.25):o)}
const enTyp=e=>e.main?'Sinf':e.rep?'Repetitor':isLang(e.c)?"Til to'garagi":'Fan guruhi';
function enAtt(e){const r=e.today;if(!r||r.att==null)return e.main?{i:'⏳',t:'hali belgilanmagan',k:''}:null;
 if(r.att==1)return{i:'✅',t:e.main?'maktabga keldi'+(r.arrived_at?' — '+fdt(r.arrived_at).slice(-5):''):'darsda qatnashdi',k:'g'};
 return r.excused?{i:'<i class=exd></i>',t:e.main?'sababli kelmadi':'darsga sababli kelmadi',k:'y'}:{i:'❌',t:e.main?'maktabga kelmadi':'darsga kelmadi',k:'r'}}
// Past baho: 5 ballik mezonda 2 va undan past, repetitor bahosi 10 dan 4 va past, test 40% dan past, kunlik vazifalar bali 50% dan past.
// Yuqori: 5 ballikda 5, repetitor bahosi 9–10, test 90% va yuqori, kunlik vazifalar 90% va yuqori.
function enMarks(e){const out=[];
 (e.recent||[]).forEach(r=>{const bad=[],good=[];
  if(e.rep){if(r.grade!=null){(+r.grade<=4?bad:+r.grade>=9?good:[]).push(`baho ${+r.grade}/10`)}if(r.test!=null){(+r.test<40?bad:+r.test>=90?good:[]).push(`kunlik test ${+r.test}%`)}}
  else if(e.c.grp){CRG.slice(1).forEach(x=>{if(r[x.c]==null)return;(+r[x.c]<=2?bad:+r[x.c]>=5?good:[]).push(`${x.k}: ${+r[x.c]}/5`)})}
  else if(crOf(e.c).slice(1).some(x=>r[x.c]!=null)){const t=sumBy(r,crOf(e.c)),m=51;(t<m*.5?bad:t>=m*.9?good:[]).push(`kunlik vazifalar bali ${t}/${m}`)}
  if(bad.length)out.push({b:1,d:r.day,t:bad.join(', ')});if(good.length)out.push({b:0,d:r.day,t:good.join(', ')})});
 (e.subj||[]).forEach(r=>{if(r.grade!=null&&+r.grade<=2)out.push({b:1,d:r.day,t:`${r.subject}: baho ${r.grade}`});else if(+r.grade==5)out.push({b:0,d:r.day,t:`${r.subject}: baho 5`});
  if(r.hw!=null&&+r.hw<=2)out.push({b:1,d:r.day,t:`${r.subject}: uyga vazifa ${r.hw}/5`})});
 return out}
async function parentAll(){const t=nowT(),y=+t.d.slice(0,4),mo=+t.d.slice(5,7),sy=mo>=9?y:y-1;
 const{data,error}=await sb.rpc('parent_overview',{p_from:sy+'-09-01'});if(error||!data||!data.length)return null;
 const E=data.map(k=>{const c=CL.find(x=>x.id==k.class_id)||{},rep=c.kind=='rep',main=!rep&&!c.grp&&!isLang(c),
   today=k.today!==undefined?k.today:(k.att!=null?{att:k.att,excused:k.excused,arrived_at:k.arrived_at}:null),
   pc=main||(k.pays&&k.pays.length)?payCalc(k.pays,k.first_day,sy):{rows:[],late:[]};if(!main)pc.late=[];
   return{...k,c,rep,main,today,...pc,cls:clsLbl(c)}});
 // Bir farzand bir nechta sinf/guruhda alohida yozilgan bo'ladi — ism-familiya bo'yicha birlashtiramiz
 const G=[];E.forEach(e=>{const key=nkey(e.full_name);let g=G.find(x=>x.key==key);if(!g)G.push(g={key,name:e.full_name,en:[]});g.en.push(e);if(e.main)g.name=e.full_name});
 G.forEach(g=>g.en.sort((a,b)=>(b.main-a.main)||(a.rep-b.rep)||clsCmp(a.c,b.c)));
 // Fan o'qituvchilari qo'ygan so'nggi 3 kunlik baholar
 const d3=new Date(Date.UTC(+t.d.slice(0,4),+t.d.slice(5,7)-1,+t.d.slice(8,10)-2)).toISOString().slice(0,10),
  {data:sbj}=await sb.rpc('parent_subjects',{p_from:d3,p_to:t.d});(sbj||[]).forEach(r=>{const e=E.find(x=>x.id==r.student_id);if(e)(e.subj=e.subj||[]).push(r)});
 S.payKids=E.filter(e=>e.rows.length);const K=S.payKids;
 const dt=d=>d==t.d?'bugun':fd2(d).slice(0,5);
 // 1. Bugungi davomat belgisi
 const td=`<div class="card"><b>${ic('cal')}Bugun — ${t.lbl}</b>${G.map(g=>{const L=g.en.map(e=>({e,a:enAtt(e)})).filter(x=>x.a);
  return `<div class="al ${(L.find(x=>x.e.main)||L[0]||{a:{}}).a.k||''}"><b>${esc(g.name)}</b>${L.length?L.map(x=>`<div>${x.a.i} ${x.e.main?'':`<span class="mut">${esc(x.e.cls)}:</span> `}${x.a.t}</div>`).join(''):'<div class="mut">Bugun hali belgilanmagan</div>'}</div>`}).join('')}</div>`;
 // 2. Baholar bo'yicha ogohlantirish va maqtov
 const M=[];G.forEach(g=>g.en.forEach(e=>enMarks(e).forEach(m=>M.push({...m,n:g.name,cls:e.cls}))));M.sort((a,b)=>b.b-a.b||(a.d<b.d?1:-1));
 const ml=m=>`<li><b>${esc(m.n)}</b> <span class="mut">(${esc(m.cls)}, ${dt(m.d)})</span> — ${esc(m.t)}</li>`,bad=M.filter(m=>m.b),good=M.filter(m=>!m.b);
 const mk=(bad.length?`<div class="card payw"><b>${ic('shield')}Diqqat: past baholar</b><p>Hurmatli ota-ona! So'nggi kunlarda quyidagi past natijalar qayd etildi:</p><ul>${bad.map(ml).join('')}</ul><p class="mut">Farzandingiz bilan suhbatlashing yoki o'qituvchisi bilan bog'laning.</p></div>`:'')
  +(good.length?`<div class="card goodw"><b>${ic('star')}Tabriklaymiz: yaxshi natijalar</b><ul>${good.map(ml).join('')}</ul></div>`:'');
 // 3. To'lov eslatmasi (asosiy sinf uchun, har bir farzandga alohida)
 const late=ON('tolov')?E.filter(e=>e.late.length):[];
 const nl=late.reduce((a,k)=>a+k.late.length,0),pr=late.length?fold(`${ic('card')}To'lov eslatmasi`,`<span class="bdg r">❌ ${nl} oy to'lanmagan</span>`,`<p>Hurmatli ota-ona! Quyidagi to'lovlar hali qayd etilmagan:</p>
  ${late.map(k=>`<p style="margin:8px 0 2px"><b>${esc(k.full_name)}</b> <span class="mut">(${esc(k.cls)})</span></p><ul>${k.late.map(lateLi).join('')}</ul>`).join('')}
  <p class="mut">To'lov har oyning ${PAY_DUE}-sanasigacha, har bir farzand uchun alohida amalga oshiriladi. To'lagan bo'lsangiz, maktab qayd etgach, eslatma o'zi yo'qoladi.</p>`,'payw'):'';
 // 4. Farzandlarim: har birining sinfi, fan guruhlari, to'garaklari va repetitorlari
 const ov=fold(`${ic('users')}Farzandlarim`,`<span class="bdg">${G.length} ta</span>`,G.map(g=>`<div class="kidc"><b class="cn2">${esc(g.name)}</b><div class="wrap"><table style="min-width:0"><tr><th class="l">Sinf / guruh</th><th>Turi</th><th>Bugun</th><th></th></tr>
  ${g.en.map(e=>{const a=enAtt(e);return`<tr${e.id==ME.student_id?' class="cur"':''}><td class="l">${esc(e.cls)}</td><td><span class="rl">${enTyp(e)}</span></td><td>${a?a.i+' '+a.t:'<span class="mut">—</span>'}</td>
  <td>${e.id==ME.student_id?'<span class="mut">ko\'rilmoqda</span>':`<button class="tab kidgo" data-id="${e.id}">Batafsil</button>`}</td></tr>`}).join('')}</table></div></div>`).join(''));
 // 5. To'lovlar tarixi: farzandni tanlab ko'riladi
 const pi=Math.max(0,K.findIndex(k=>k.late.length)),ph=ON('tolov')&&K.length?fold(`${ic('card')}To'lovlar tarixi`,`<span class="bdg">${K.length>1?K.length+' ta farzand':esc(K[0].full_name)}</span>`,`<div id="phw">${payHist(pi)}</div>`):'';
 return {b:td+mk+pr+ov,t:ph}}
const fold=(title,badge,body,cls='')=>`<details class="card fold ${cls}"><summary><b>${title}</b>${badge}<span class="chev"></span></summary><div class="fbd">${body}</div></details>`;
const payHist=i=>{const K=S.payKids,k=K[i],t=nowT(),y=+t.d.slice(0,4),sy=+t.d.slice(5,7)>=9?y:y-1;
 return payTable(k.rows,i,`To'lovlar tarixi (${sy}–${sy+1} o'quv yili)`,K.length>1?`<select class="fld" id="phk" style="width:auto">${K.map((x,j)=>`<option value="${j}"${j==i?' selected':''}>${esc(x.full_name)} — ${esc(x.cls)}</option>`).join('')}</select>`:`<span class="mut">${esc(k.full_name)} — ${esc(k.cls)}</span>`)};
async function fbParent(){const{data,error}=await sb.from('feedback').select('id,category,body,created_at').order('created_at',{ascending:false}).limit(10);if(error)return '';
 return `<div class="card"><b>${ic('msg')}Fikr-mulohazalar</b><p class="mut">Maktab haqidagi fikr, taklif yoki e'tirozingizni yozing. Xabaringizni maktab ma'muriyati o'qiydi.</p>
 <select class="fld" id="fbk">${FBC.map(x=>`<option>${x}</option>`).join('')}</select><textarea class="fld" id="fbt" rows="4" maxlength="2000" placeholder="Fikringizni yozing…"></textarea>
 <label class="ck"><input type="checkbox" id="fba">Ismim ko'rsatilmasin</label><br><button class="btn" id="fbs">${ic('msg')}Yuborish</button>
 ${data.length?`<p style="margin:16px 0 0"><b>Siz yuborgan xabarlar</b></p>${data.map(f=>`<div class="fb"><div class="fbh"><span class="rl">${esc(f.category)}</span><span class="mut">${fdt(f.created_at)}</span></div><div class="fbb">${esc(f.body)}</div></div>`).join('')}`:''}</div>`}
async function fbView(){const r=mr(S.month);let d;
 try{d=await all(()=>sb.from('feedback').select('*').gte('created_at',r.a+'T00:00:00+05:00').lte('created_at',r.b+'T23:59:59+05:00').order('created_at',{ascending:false}))}
 catch(e){flash('');return `<div class="card"><b>${ic('msg')}Fikr-mulohazalar</b><p class="mut">Bo'limni ochib bo'lmadi: admin Supabase'da <b>sql/yangilanish-3.sql</b> faylini ishga tushirishi kerak.</p><p class="mut">Sabab: ${esc((e&&(e.message||e.code))||e)}</p></div>`}
 const by=new Map();d.forEach(f=>{const k=f.class_id||0;if(!by.has(k))by.set(k,[]);by.get(k).push(f)});
 const G=[...by.keys()].map(k=>({k,c:CL.find(x=>x.id==k)})).sort((a,b)=>!a.c?1:!b.c?-1:(grpOf(a.c)-grpOf(b.c))||clsCmp(a.c,b.c)),nm=x=>x.c?clsLbl(x.c):"Sinf ko'rsatilmagan";
 S.fbP={m:S.month,g:G.map(x=>({n:nm(x),r:by.get(x.k)}))};const cat={};d.forEach(f=>cat[f.category]=(cat[f.category]||0)+1);
 const who=f=>(f.parent_name?esc(f.parent_name):"Ism ko'rsatilmagan")+(f.phone?' · '+esc(f.phone):'')+(f.student_name?" · O'quvchi: "+esc(f.student_name):'');
 return `<div class="card"><div class="top"><b>Oy:</b><input type="month" id="mo" value="${S.month}">${d.length?`<button class="btn" id="fbPdf">${ic('printer')}PDF / Chop etish</button>`:''}</div>
 <div class="kpi"><div><b>${d.length}</b>jami fikr</div><div><b>${G.length}</b>sinfdan</div>${Object.entries(cat).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k,v])=>`<div><b>${v}</b>${esc(k)}</div>`).join('')}</div>
 <p class="mut">${d.length?"PDF olish uchun ochilgan oynada «PDF sifatida saqlash» (Save as PDF) ni tanlang.":"Bu oyda fikr-mulohaza yo'q."}</p></div>`+
 G.map(x=>`<div class="card"><div class="top"><b class="cn2">${esc(nm(x))}</b><span class="code" style="margin-left:auto">${by.get(x.k).length}</span></div>${by.get(x.k).map(f=>`<div class="fb"><div class="fbh"><span class="rl">${esc(f.category)}</span><span class="mut">${fdt(f.created_at)}</span><button class="tab fdel" data-id="${f.id}" title="O'chirish">${ic('trash')}</button></div><div class="fbb">${esc(f.body)}</div><div class="mut">${who(f)}</div></div>`).join('')}</div>`).join('')}
async function tkLast(){const{data,error}=await sb.from('turnstile_events').select('ts').order('ts',{ascending:false}).limit(1);if(error||!data)return '';
 if(!data.length)return `<p class="mut">${ic('wifi')}Turniket: hali ma'lumot kelmagan</p>`;const m=(Date.now()-new Date(data[0].ts))/6e4;
 return `<p class="mut">${ic('wifi')}Turniket: oxirgi o'tish ${fdt(data[0].ts).slice(-5)}${m>120&&nowT().h>=7&&nowT().h<19?' <b style="color:var(--bad)">— ko\'prik ishlayaptimi?</b>':''}</p>`}
async function sideView(){const el=$('side');if(!ME||ME.role!='admin'){el.innerHTML='';document.body.classList.remove('hs-side');return}
 document.body.classList.add('hs-side');const t=nowT(),hd=`<b>${ic('school')}Bugun maktabga kelganlar</b>`;
 if(t.h<9){el.innerHTML=`<div class="card sd">${hd}<div class="big" id="scd">—</div><p class="mut">Natija soat <b>9:00</b> da chiqadi.</p></div>`;tick();return}
 const M=CL.filter(c=>c.kind!='rep'&&!c.grp),ids=g=>M.filter(c=>!g||grpOf(c)==g).map(c=>c.id);
 const cnt=async(ci,att)=>{if(!ci.length)return 0;const{count,error}=await sb.from('daily_scores').select('student_id,students!inner(class_id)',{count:'exact',head:true}).eq('day',t.d).eq('att',att).in('students.class_id',ci);if(error)throw error;return count||0};
 const tot=async ci=>{if(!ci.length)return 0;const{count,error}=await sb.from('students').select('id',{count:'exact',head:true}).in('class_id',ci).neq('full_name','');if(error)throw error;return count||0};
 try{const[p,a,n,p1,p2]=await Promise.all([cnt(ids(),1),cnt(ids(),0),tot(ids()),cnt(ids(1),1),cnt(ids(2),1)]);
  const ci=ids(),{count:ec}=ci.length?await sb.from('daily_scores').select('student_id,students!inner(class_id)',{count:'exact',head:true}).eq('day',t.d).eq('att',0).eq('excused',true).in('students.class_id',ci):{count:0},e=ec||0;
  el.innerHTML=`<div class="card sd">${hd}<span class="mut">${t.lbl} · ${t.hms.slice(0,5)} holati</span><div class="big">${p}</div><div class="mut">jami ${n} o'quvchidan${n?' ('+Math.round(p/n*100)+'%)':''}</div><div class="bar"><i style="width:${n?Math.min(100,p/n*100):0}%"></i></div>
  <ul class="sl"><li><span>${ic('bag')}Boshlang'ich (1–4)</span><b>${p1}</b></li><li><span>${ic('cap')}Yuqori (5–10)</span><b>${p2}</b></li><li><span>${ic('xc')}Kelmagan (sababsiz)</span><b>${a-e}</b></li><li><span><i class=exd></i> Sababli</span><b>${e}</b></li><li><span>${ic('minus')}Belgilanmagan</span><b>${Math.max(0,n-p-a)}</b></li></ul><p class="mut">Har 5 daqiqada yangilanadi.</p>${ON('turniket')?await tkLast():''}</div>`}
 catch(e){el.innerHTML=`<div class="card sd">${hd}<p class="mut">Ma'lumotni o'qib bo'lmadi. Birozdan so'ng qayta urinadi.</p></div>`}}
function chips(){
 const el=$('chips'),A=ME.role=='admin',L=A?CL:CL.filter(c=>(ME.cls||[]).includes(c.id));
 if(!A&&L.length<2){el.className='';el.innerHTML='';return}
 el.className='grp';
 const rb=c=>ME.roles&&ME.roles[c.id]=='rahbar'?' ★':'',btn=c=>`<button class="chip ${c.id==S.cls?'on':''}" data-c="${c.id}" ${rb(c)?'title="Sinf rahbari"':''}>${esc(clsLbl(c))+rb(c)}</button>`;
 el.innerHTML=GR.map(([g,t,i])=>{const a=L.filter(c=>grpOf(c)==g).sort(clsCmp);return a.length?`<div class="cg"><span class="hl">${ic(i)}${t}</span><div class="cgr">${a.map(btn).join('')}</div></div>`:''}).join('');
 const on=el.querySelector('.chip.on');if(on)on.scrollIntoView({block:'nearest',inline:'nearest'})}
async function render(){
 flush();const tk=++S.rt;if(!ME)return;
 if(ME.role=='parent'){$('view').innerHTML='<div class="ld"><i class="spin"></i>Yuklanmoqda…</div>';const h=await parentView().catch(()=>'<div class="card">Ma\'lumotni o\'qib bo\'lmadi.</div>'),hb=BOOKS?await parentBooks().catch(()=>''):'',hf=ON('fikr')?await fbParent().catch(()=>''):'',pi=await parentAll().catch(()=>null)||await payInfo().catch(()=>({b:'',t:''}));if(tk==S.rt)$('view').innerHTML=pi.b+h+pi.t+hb+hf;return}
 const A=ME.role=='admin',c0=CL.find(x=>x.id==S.cls)||{},rp=c0.kind=='rep';setMode(c0);
 // Admin bo'limlari: modul o'chirilgan bo'lsa, bo'lim ko'rinmaydi
 const AV=[['userx','Kelmaganlar',absView],['clock','Kech kelganlar',lateView,'turniket'],['logout','Ketish davomati',leaveView,'turniket'],['card',"To'lov",payView,'tolov'],['sliders','Sozlamalar',setView],['food','Taomnoma',menuView,'taomnoma'],['msg','Fikr-mulohazalar',fbView,'fikr']].filter(x=>!x[3]||ON(x[3]));const T=(i,t)=>ic(i)+t,tabs=rp?[T('edit','Kunlik jadval'),T('trophy',"O'quvchilar reytingi"),T('target','Guruhlar reytingi'),T('user',"O'qituvchi")]:[T('edit','Baholash'),T('trophy',"O'quvchilar reytingi"),T('school','Sinflar reytingi')].concat(A?AV.map(x=>T(x[0],x[1])):[]);
 const V=rp?[repDaily,repRank,repGroups,repTeacher]:[bahoView,rateView,clsView].concat(A?AV.map(x=>x[2]):[]);
 if(!rp&&ON('infografika')&&[1,2].includes(grpOf(c0))){tabs.splice(2,0,T('chart','Oylik infografika'));V.splice(2,0,infoView)}
 // Oddiy sinfda (1–2-guruh): sinf rahbari kunlik vazifalarni, fan o'qituvchisi faqat o'z fanidan baho qo'yadi
 const reg=!rp&&[1,2].includes(grpOf(c0)),fan=reg&&!canPh(c0);
 if(fan){tabs[0]=T('edit','Fan baholari');V[0]=subjView}else if(reg){tabs.splice(1,0,T('layers','Fan baholari'));V.splice(1,0,subjView)}
 if(A){const k=tabs.indexOf(T('sliders','Sozlamalar'));tabs.splice(k+1,0,T('users',"O'qituvchilar"));V.splice(k+1,0,tView)}
 if(!A){tabs.push(T('chart',"O'quvchilar va statistika"));V.push(tchView)}
 if(BOOKS){tabs.push(T('books','Fan darsliklari'));V.push(booksView)}
 if(ON('oqituvchi_reyting')){tabs.push(T('award',"O'qituvchilar reytingi"));V.push(ratingView)}
 if(S.tab>=tabs.length)S.tab=0;
 chips();const c=CL.find(x=>x.id==S.cls)||{};
 const top=`<div class="card"><div class="top">${c.logo?`<img class="cl" src="${c.logo}">`:`<span class="cl ph">${ic('school')}</span>`}<b class="cn2">${esc(clsLbl(c))}</b><span class="mut">${esc(c.teacher_name||'')}</span>${ME.roles&&ME.roles[c.id]?`<span class="rl">${ME.roles[c.id]=='rahbar'?'Sinf rahbari':"Fan o'qituvchisi"}</span>`:''}</div><div class="tabs">${tabs.map((t,i)=>`<button class="tab ${i==S.tab?'on':''}" data-t="${i}">${t}</button>`).join('')}</div></div>`;
 $('view').innerHTML=top+'<div class="ld"><i class="spin"></i>Yuklanmoqda…</div>';let h='';
 try{h=V[S.tab]?await V[S.tab]():''}catch(e){h='<div class="card">Ma\'lumotni o\'qib bo\'lmadi. Sahifani yangilang.</div>'}
 if(tk==S.rt)$('view').innerHTML=top+h}
async function loadCls(){const st=await q(sb.from('students').select('id,slot,full_name').eq('class_id',S.cls).order('slot'));
 const sc=await q(sb.from('daily_scores').select('*').eq('day',S.date).in('student_id',st.map(x=>x.id)));
 S.st=st;S.sc={};sc.forEach(r=>S.sc[r.student_id]=r)}
// Baholash jadvalida ota-ona telefoni (faqat sinf rahbari va admin uchun, tahrirlanadi)
// Fan guruhlarida (3-, 4-, 6-guruh) ota-ona telefoni ko'rsatilmaydi — u asosiy sinfda yuritiladi
const noPh=c=>[3,4,6].includes(grpOf(c||{}));
async function phLoad(st){if(!canPh({id:S.cls})||!st.length||noPh(CL.find(x=>x.id==S.cls)))return null;const m={};
 (await q(sb.from('student_private').select('student_id,parent_phone').in('student_id',st.map(x=>x.id))).catch(()=>[])).forEach(x=>m[x.student_id]=x.parent_phone||'');return m}
const phTd=(m,id)=>m?`<td><input class="nm" type="tel" inputmode="tel" style="min-width:150px" data-p="${id}" value="${esc(m[id]||'')}" placeholder="+998..."></td>`:'';
const stAdd=()=>!canPh({id:S.cls})?'<p class="mut" style="margin:10px 0 0">O\'quvchi ism-familiyasini sinf rahbari kiritadi.</p>':`<div class="top" style="margin-top:10px"><button class="tab" id="stadd">${ic('users')}+ O'quvchi qo'shish</button><span class="mut">Ism-familiyani bo'sh katakka yozing — o'zi saqlanadi. Joy yetmasa, shu tugma bilan qo'shing.</span></div>`;
const dtBar=extra=>`<div class="top"><b>Sana:</b><input type="date" id="dt" value="${S.date}">${extra||''}</div>`;
async function bahoView(){await loadCls();const php=await phLoad(S.st);
 return `<div class="card">${dtBar('<span class="mut">Davomat: bosib tanlang — ✅ keldi (1 ball), ❌ kelmadi, <i class=exd></i> sababli (kasal yoki uzrli sabab). Qolganlari 0–'+CR[1].m+' ball.'+(CR===CR1?" 1-sinf: to'rt mezon yig'indisi ×1.25 (kuniga ko'pi bilan 51).":'')+'</span>')}<div class="wrap"><table><tr><th>№</th><th class="l">F.I.Sh</th>${php?`<th>${ic('phone')}Ota-ona telefoni</th>`:''}${th()}<th>Jami<br>/${MAXD}</th></tr>${S.st.map((s,i)=>{const r=S.sc[s.id]||{};return`<tr><td>${i+1}</td><td class="l"><input class="nm" data-n="${s.id}" value="${esc(s.full_name)}" placeholder="Ism familiya"${canPh({id:S.cls})?'':' readonly title="Ismni sinf rahbari kiritadi"'}></td>${phTd(php,s.id)}${CR.map(x=>x.c=='att'?`<td><button class="att" data-i="${s.id}">${attIc(r)}</button>${r.arrived_at?`<div class="arr ${fdt(r.arrived_at).slice(-5)>LATE?'late':''}" title="Turniketdan o'tgan vaqti">${fdt(r.arrived_at).slice(-5)}</div>`:''}</td>`:`<td><input class="sc" type="number" min="0" max="${x.m}" inputmode="numeric" data-i="${s.id}" data-k="${x.c}" value="${r[x.c]??''}"></td>`).join('')}<td class="tot" id="t${s.id}">${sum(r)}</td></tr>`}).join('')}</table></div>${stAdd()}</div>`}
async function rateView(){await loadCls();const rows=S.st.filter(s=>s.full_name.trim()).map(s=>({n:s.full_name,t:sum(S.sc[s.id])})).sort((a,b)=>b.t-a.t);
 return `<div class="card">${dtBar()}${rows.length?`<div class="wrap"><table><tr><th>O'rin</th><th class="l">F.I.Sh</th><th>Ball</th><th>Foiz</th><th></th></tr>${rows.map((r,j)=>`<tr><td>${MD[j]||j+1}</td><td class="l">${esc(r.n)}</td><td class="tot">${r.t}/${MAXD}</td><td>${Math.round(r.t/MAXD*100)}%</td><td><div class="bar"><i style="width:${Math.min(100,r.t/MAXD*100)}%"></i></div></td></tr>`).join('')}</table></div>`:'<p class="mut">Avval «Baholash» bo\'limida ismlarni yozing.</p>'}</div>`}
// Sinflar reytingi uch toifada: har bir sinf o'z maksimaliga nisbatan foizda solishtiriladi
const RT=[['A',"A-reyting: 1- va 2-guruh (sinflar)",[1,2]],['B',"B-reyting: 3-, 4- va 6-guruh (Matematika, Ingliz tili, Arab va Koreys tili)",[3,4,6]],['C',"C-reyting: 5-guruh (Repetitor)",[5]]];
async function clsView(){const{data,error}=await sb.rpc('class_ranking2',{p_day:S.date});
 if(error){if(error.code!='PGRST202')throw error;const r=await q(sb.rpc('class_ranking',{p_day:S.date}));
  return `<div class="card">${dtBar()}<p class="mut">A/B/C reyting uchun admin Supabase'da yangilanish-21.sql ni ishga tushirishi kerak.</p><div class="wrap"><table><tr><th>O'rin</th><th class="l">Sinf</th><th>Jami ball</th><th>O'rtacha foiz</th></tr>${r.map((x,j)=>`<tr><td>${x.has?(MD[j]||j+1):'—'}</td><td class="l">${esc(x.name)}</td><td class="tot">${x.has?x.total:'—'}</td><td class="tot">${x.has?x.pct+'%':'baholanmagan'}</td></tr>`).join('')}</table></div></div>`}
 const by={};data.forEach(x=>by[x.class_id]=x);
 const part=([k,t,gs])=>{const L=CL.filter(c=>gs.includes(grpOf(c))).map(c=>({c,x:by[c.id]||{}})).sort((a,b)=>(b.x.pct??-1)-(a.x.pct??-1)||clsCmp(a.c,b.c));if(!L.length)return '';
  return `<div class="card"><b>${ic(k=='A'?'school':k=='B'?'layers':'target')}${t}</b><div class="wrap"><table><tr><th>O'rin</th><th class="l">Sinf / guruh</th><th>Baholangan</th>${k=='C'?'':'<th>Jami ball</th>'}<th>Foiz</th><th></th></tr>
  ${L.map(({c,x},j)=>{const h=x.pct!=null;return`<tr${c.id==S.cls?' class="cur"':''}><td>${h?(MD[j]||j+1):'—'}</td><td class="l">${c.logo?`<img class="cl" style="height:26px;width:26px;vertical-align:middle;margin-right:6px" src="${c.logo}">`:''}${esc(clsLbl(c))}</td><td>${x.marked||0}${x.students?' / '+x.students:''}</td>${k=='C'?'':`<td class="tot">${h?x.total:'—'}</td>`}<td class="tot">${h?x.pct+'%':'<span class="mut">baholanmagan</span>'}</td><td><div class="bar"><i style="width:${h?Math.min(100,x.pct):0}%"></i></div></td></tr>`}).join('')}</table></div></div>`};
 return `<div class="card">${dtBar()}<p class="mut">Foiz — sinfning shu kundagi bali uning maksimaliga nisbatan: sinflarda o'quvchi boshiga 51 ball, 3-, 4- va 6-guruhda 16 ball; repetitorda davomat, uyga vazifa va test foizlari o'rtachasi. Har bir toifa alohida solishtiriladi.</p></div>${RT.map(part).join('')}`}
async function absView(){const t=nowT();let h=`<div class="card">${dtBar("<span class=\"mut\">Kelmaganlar ro'yxati har kuni soat 10:00 da shakllanadi.</span>")}`;
 if(S.date==t.d&&t.h<10&&!S.peek)return h+`<p>⏳ Bugungi ro'yxat <b>10:00</b> da shakllanadi. Qolgan vaqt: <b id="cd"></b></p><button class="tab" id="pk">${ic('clock')}Hozirgi holatni ko'rish</button></div>`;
 const[rows,sts]=await Promise.all([all(()=>sb.from('daily_scores').select('*').eq('day',S.date).order('student_id')),all(()=>sb.from('students').select('id,class_id,slot,full_name').order('id'))]);
 const a={};const ex={};rows.forEach(r=>{if(r.att!=null)a[r.student_id]=r.att;if(r.att===0&&r.excused)ex[r.student_id]=1});let n=0,no=[];
 const per=[];CL.filter(c=>c.kind!='rep').sort((x,y)=>(grpOf(x)-grpOf(y))||clsCmp(x,y)).forEach(c=>{const ss=sts.filter(s=>s.class_id==c.id).sort((x,y)=>x.slot-y.slot);if(!ss.some(s=>s.id in a)){no.push(clsLbl(c));return}
  const ab=ss.filter(s=>s.full_name.trim()&&a[s.id]===0);if(!ab.length)return;n+=ab.length;per.push({c,ab})});
 const ids=per.flatMap(x=>x.ab.map(s=>s.id)),pp={};
 for(let i=0;i<ids.length;i+=150)(await q(sb.from('student_private').select('student_id,parent_phone').in('student_id',ids.slice(i,i+150)))).forEach(r=>pp[r.student_id]=r.parent_phone||'');
 S.absP={d:S.date,per:per.map(({c,ab})=>({n:clsLbl(c),t:c.teacher_name||'',r:ab.map(s=>({n:s.full_name,p:pp[s.id]||'',e:!!ex[s.id]}))}))};const ne=ids.filter(i=>ex[i]).length;
 const cards=per.map(({c,ab})=>`<div class="card ab"><div class="top">${c.logo?`<img class="cl" src="${c.logo}">`:`<span class="cl ph">${ic('school')}</span>`}<div><b style="font-size:18px">${esc(clsLbl(c))}</b><br><span class="mut">${esc(c.teacher_name)||"O'qituvchi kiritilmagan"}</span></div><span class="code" style="margin-left:auto">${ab.length}</span></div>
  <div class="wrap"><table><tr><th>№</th><th class="l">F.I.Sh</th><th>Holati</th><th>Ota-ona telefoni</th></tr>${ab.map((s,i)=>`<tr><td>${i+1}</td><td class="l">${esc(s.full_name)}</td><td>${ex[s.id]?"<i class=exd></i> sababli":"❌ sababsiz"}</td><td>${pp[s.id]?`<a class="tab" href="tel:${esc(ph(pp[s.id]))}">${ic('phone')}${esc(pp[s.id])}</a>`:'—'}</td></tr>`).join('')}</table></div></div>`).join('');
 return h+`<div class="top" style="margin-top:10px"><span>Jami kelmaganlar: <b>${n}</b>${n?` <span class="mut">(❌ sababsiz ${n-ne}, <i class=exd></i> sababli ${ne})</span>`:''}</span>${n?`<button class="btn" id="absPdf">${ic('printer')}PDF / Chop etish</button>`:''}</div>${n?'<p class="mut">PDF olish uchun ochilgan oynada «PDF sifatida saqlash» (Save as PDF) ni tanlang.</p>':''}${no.length?`<p class="mut">Davomat kiritilmagan sinflar: ${no.map(esc).join(', ')}</p>`:''}</div>`+cards}
// Turniket: kech kelganlar (08:30 dan keyin, 09:30 gacha) va maktabdan ketish (16:40 dan keyin). 1–2-sinflar turniketsiz binoda.
const tkCls=c=>c.kind!='rep'&&!c.grp&&!isLang(c)&&![1,2].includes(gradeOf(c)),hm=t=>fdt(t).slice(-5),mins=(a,b)=>(+a.slice(0,2)*60+ +a.slice(3))-(+b.slice(0,2)*60+ +b.slice(3));
async function tkLoad(){const[rows,sts]=await Promise.all([all(()=>sb.from('daily_scores').select('student_id,att,excused,arrived_at,left_at').eq('day',S.date).order('student_id')),all(()=>sb.from('students').select('id,class_id,slot,full_name').order('id'))]);
 const R={};rows.forEach(r=>R[r.student_id]=r);return{R,sts}}
async function lateView(){const{R,sts}=await tkLoad(),per=[];let n=0;
 CL.filter(tkCls).sort(clsCmp).forEach(c=>{const L=sts.filter(s=>s.class_id==c.id&&s.full_name.trim()&&R[s.id]&&R[s.id].arrived_at&&hm(R[s.id].arrived_at)>LATE).map(s=>({n:s.full_name,t:hm(R[s.id].arrived_at)})).sort((a,b)=>a.t.localeCompare(b.t));if(L.length){n+=L.length;per.push({c,L})}});
 S.lateP={d:S.date,per:per.map(({c,L})=>({n:clsLbl(c),t:c.teacher_name||'',L}))};
 return `<div class="card">${dtBar(`<span class="mut">Turniketdan <b>${LATE}</b> dan keyin (${TK_UNTIL} gacha) o'tgan o'quvchilar. 1–2-sinflar turniketsiz binoda — hisobga olinmaydi.</span>`)}
 <div class="top" style="margin-top:10px"><span>Jami kech kelganlar: <b>${n}</b></span>${n?`<button class="btn" id="latePdf">${ic('printer')}PDF / Chop etish</button>`:''}</div></div>
 ${per.map(({c,L})=>`<div class="card"><div class="top"><b style="font-size:18px">${esc(clsLbl(c))}</b><span class="mut">${esc(c.teacher_name||'')}</span><span class="code" style="margin-left:auto">${L.length}</span></div><div class="wrap"><table style="min-width:0"><tr><th>№</th><th class="l">F.I.Sh</th><th>Kelgan vaqti</th><th>Kechikish</th></tr>${L.map((x,i)=>`<tr><td>${i+1}</td><td class="l">${esc(x.n)}</td><td class="tot">${x.t}</td><td>${mins(x.t,LATE)} daqiqa</td></tr>`).join('')}</table></div></div>`).join('')||'<div class="card"><p class="mut">Bu kunda kech kelgan o\'quvchi yo\'q (yoki turniket ma\'lumoti hali kelmagan).</p></div>'}`}
async function leaveView(){const t=nowT();if(S.date==t.d&&`${String(t.h).padStart(2,'0')}:${String(t.m).padStart(2,'0')}`<TK_LEAVE&&!S.peek)
  return `<div class="card">${dtBar()}<p>⏳ Maktabdan ketish davomati har kuni <b>${TK_LEAVE}</b> dan keyin shakllanadi. Kun davomida binolar orasidagi o'tishlar hisobga olinmaydi.</p><button class="tab" id="pk">${ic('clock')}Hozirgi holatni ko'rish</button></div>`;
 const{R,sts}=await tkLoad(),per=[];let came=0,left=0;
 CL.filter(tkCls).sort(clsCmp).forEach(c=>{const ss=sts.filter(s=>s.class_id==c.id&&s.full_name.trim()&&R[s.id]&&(+R[s.id].att==1||R[s.id].arrived_at));if(!ss.length)return;
  const L=ss.map(s=>({n:s.full_name,a:R[s.id].arrived_at?hm(R[s.id].arrived_at):'—',l:R[s.id].left_at?hm(R[s.id].left_at):''})).sort((a,b)=>(!!a.l-!!b.l)||a.n.localeCompare(b.n,'uz'));
  came+=L.length;left+=L.filter(x=>x.l).length;per.push({c,L})});
 S.leaveP={d:S.date,per:per.map(({c,L})=>({n:clsLbl(c),t:c.teacher_name||'',L}))};
 return `<div class="card">${dtBar(`<span class="mut">Ketish — turniketdan <b>${TK_LEAVE}</b> dan keyingi oxirgi o'tish. 1–2-sinflar hisobga olinmaydi.</span>`)}
 <div class="kpi"><div><b>${came}</b>maktabga kelgan</div><div><b>${left}</b>${ic('logout')}${TK_LEAVE} dan keyin ketgan</div><div><b>${came-left}</b>ketishi qayd etilmagan</div></div>
 ${came?`<button class="btn" id="leavePdf">${ic('printer')}PDF / Chop etish</button>`:''}</div>
 ${per.map(({c,L})=>{const nl=L.filter(x=>!x.l).length;return`<div class="card"><div class="top"><b style="font-size:18px">${esc(clsLbl(c))}</b><span class="mut">${esc(c.teacher_name||'')}</span><span class="rl" style="margin-left:auto">ketgan ${L.length-nl} / ${L.length}</span></div><div class="wrap"><table style="min-width:0"><tr><th>№</th><th class="l">F.I.Sh</th><th>Kelgan</th><th>Ketgan</th></tr>${L.map((x,i)=>`<tr><td>${i+1}</td><td class="l">${esc(x.n)}</td><td>${x.a}</td><td>${x.l?`<b>${x.l}</b>`:'<span class="lt">qayd etilmagan</span>'}</td></tr>`).join('')}</table></div></div>`}).join('')||'<div class="card"><p class="mut">Bu kunda turniket ma\'lumoti yo\'q.</p></div>'}`}
const SMS0=M.sms_matn||"Hurmatli ota-ona! {ism} uchun {oy} oyi to'lovini amalga oshirishingizni so'raymiz. "+M.nomi+".";
const smsTxt=()=>S.tpl||(()=>{try{return localStorage.getItem(P+'sms')||SMS0}catch(e){return SMS0}})();
const ph=p=>String(p||'').replace(/[^\d+]/g,'');
function payHtml(){const t=nowT(),cm=t.d.slice(0,7),can=S.pm<cm||(S.pm==cm&&+t.d.slice(8)>=5),ios=/iPhone|iPad|iPod/.test(navigator.userAgent),mn=MON[+S.pm.slice(5)-1]+' '+S.pm.slice(0,4);
 const pd=S.pay.filter(x=>x.paid).length;
 if(!S.pay.length)return '<p class="mut">Bu sinfda hali o\'quvchi ismi yozilmagan. «Baholash» bo\'limida ismlarni kiriting.</p>';
 return `<p><b>${esc(cname(S.cls))}:</b> to'lagan <b>${pd}</b>, to'lamagan <b>${S.pay.length-pd}</b>. Butun maktab: <b>${S.pTot.paid}/${S.pTot.all}</b> to'lagan.</p>${can?'':`<p class="mut">⏳ SMS tugmasi har oyning 5-sanasidan boshlab chiqadi.</p>`}<div class="wrap"><table><tr><th>№</th><th class="l">F.I.Sh</th><th>Ota-ona telefoni</th><th>To'lov</th><th>To'langan sana</th><th>SMS</th></tr>${S.pay.map((x,i)=>`<tr><td>${i+1}</td><td class="l">${esc(x.n)}</td><td>${esc(x.phone)||'—'}</td><td><button class="pay ${x.paid?'on':''}" data-id="${x.id}">${x.paid?"✅ To'langan":"❌ To'lanmagan"}</button></td><td>${x.paid?`<input type="date" class="pdt" data-id="${x.id}" value="${x.on}" max="${nowT().d}" title="To'lov qilingan sana (o'zgartirish mumkin)">`:'—'}</td><td>${!x.paid&&can&&ph(x.phone)?`<a class="tab" href="sms:${ph(x.phone)}${ios?'&':'?'}body=${encodeURIComponent(smsTxt().replace('{ism}',x.n).replace('{oy}',mn))}">${ic('msg')}SMS</a>`:'—'}</td></tr>`).join('')}</table></div>`}
async function payView(){S.pm=S.pm||today.slice(0,7);const m=S.pm+'-01';
 const st=await q(sb.from('students').select('id,slot,full_name,student_private(parent_phone)').eq('class_id',S.cls).order('slot')),named=st.filter(s=>s.full_name.trim());
 const pr=named.length?await q(sb.from('payments').select('student_id,paid,paid_on').eq('month',m).in('student_id',named.map(s=>s.id))):[],pd={};pr.forEach(r=>pd[r.student_id]=r);
 S.pay=named.map(s=>{const p=Array.isArray(s.student_private)?s.student_private[0]:s.student_private;return{id:s.id,n:s.full_name,phone:(p&&p.parent_phone)||'',paid:!!(pd[s.id]&&pd[s.id].paid),on:(pd[s.id]&&pd[s.id].paid_on)||''}});
 const[a,b]=await Promise.all([sb.from('students').select('id',{count:'exact',head:true}).neq('full_name',''),sb.from('payments').select('student_id',{count:'exact',head:true}).eq('month',m).eq('paid',true)]);S.pTot={all:a.count||0,paid:b.count||0};
 const{data:cfg}=await sb.from('sms_settings').select('*').eq('id',1).maybeSingle();S.cfg=cfg||null;if(cfg&&cfg.template)S.tpl=cfg.template;
 const sn=cfg?await sb.from('sms_log').select('id',{count:'exact',head:true}).eq('month',m).eq('status','sent'):{count:0};
 const au=S.cfg?`<div class="card"><b>${ic('msg')}Avtomatik SMS</b><div class="top"><button class="tab ${S.cfg.enabled?'on':''}" id="smsauto">${S.cfg.enabled?"✅ Yoqilgan":"⛔ O'chirilgan"}</button><span class="mut">Har kuni 09:00 da tekshiriladi. Yuborish kunlari: ${S.cfg.days.join(', ')}-sana. To'laganlarga va telefon raqami yo'qlarga SMS ketmaydi.</span></div><p class="mut">Shu oy uchun yuborilgan SMS: <b>${sn.count||0}</b></p></div>`:`<div class="card"><b>${ic('msg')}Avtomatik SMS</b><p class="mut">Hali sozlanmagan. Sozlash qo'llanmasiga qarang (2-sms-sozlash.sql).</p></div>`;
 return (ON('sms')?au:'')+`<div class="card"><div class="top"><b>Oy:</b><input type="month" id="pm" value="${S.pm}"></div><p class="mut">SMS matni (qo'lda ham, avtomatik ham shu matn ketadi). {ism} va {oy} o'rniga o'quvchi ismi va oy yoziladi:</p><textarea class="fld" id="smst" rows="3">${esc(smsTxt())}</textarea><div id="payBox">${payHtml()}</div></div>`}
const RD={hw:{m:10},test:{m:100}},loadSt=()=>q(sb.from('students').select('id,slot,full_name').eq('class_id',S.cls).order('slot'));
const mr=mm=>{const y=+mm.slice(0,4),m=+mm.slice(5);return{a:mm+'-01',b:mm+'-'+String(new Date(Date.UTC(y,m,0)).getUTCDate()).padStart(2,'0')}};
const avg=a=>a.length?a.reduce((p,v)=>p+v,0)/a.length:null,fp=v=>v==null?'—':v.toFixed(0)+'%';
async function repDaily(){const st=await loadSt(),rs=await q(sb.from('rep_daily').select('*').eq('day',S.date).in('student_id',st.map(x=>x.id)));S.rd={};rs.forEach(r=>S.rd[r.student_id]=r);
 const php=await phLoad(st);
 const inp=(s,f,m)=>`<td><input class="sc" type="number" min="0" max="${m}" step="any" inputmode="decimal" data-rd="${f}" data-rid="${s.id}" value="${(S.rd[s.id]||{})[f]??''}"></td>`;
 return `<div class="card">${dtBar("<span class=\"mut\">Davomat: ✅ keldi, ❌ kelmadi, <i class=exd></i> sababli. Uyga vazifa 0–10, kunlik test 0–100.</span>")}<div class="wrap"><table><tr><th>№</th><th class="l">F.I.Sh</th>${php?`<th>${ic('phone')}Ota-ona telefoni</th>`:''}<th><span class="ic">${ic('cal')}</span>Davomat</th><th><span class="ic">${ic('clip')}</span>Uyga vazifa</th><th><span class="ic">${ic('flask')}</span>Kunlik test</th></tr>${st.map((s,i)=>`<tr><td>${i+1}</td><td class="l"><input class="nm" data-n="${s.id}" value="${esc(s.full_name)}" placeholder="Ism familiya"${canPh({id:S.cls})?'':' readonly title="Ismni sinf rahbari kiritadi"'}></td>${phTd(php,s.id)}<td><button class="ratt" data-rid="${s.id}">${attIc(S.rd[s.id])}</button></td>${inp(s,'hw',10)}${inp(s,'test',100)}</tr>`).join('')}</table></div>${stAdd()}</div>`}
async function repRank(){const st=(await loadSt()).filter(s=>s.full_name.trim()),r=mr(S.month);
 const rs=st.length?await q(sb.from('rep_daily').select('*').gte('day',r.a).lte('day',r.b).in('student_id',st.map(x=>x.id))):[];
 const rows=st.map(s=>{const d=rs.filter(x=>x.student_id==s.id),a=avg(d.filter(x=>x.att!=null).map(x=>x.att*100)),h=avg(d.filter(x=>x.hw!=null).map(x=>x.hw*10)),t=avg(d.filter(x=>x.test!=null).map(x=>+x.test)),p=avg([a,h,t].filter(v=>v!=null));return{n:s.full_name,a,h,t,p}}).sort((x,y)=>(y.p??-1)-(x.p??-1));
 return `<div class="card"><div class="top"><b>Oy:</b><input type="month" id="mo" value="${S.month}"></div>${rows.length?`<div class="wrap"><table><tr><th>O'rin</th><th class="l">F.I.Sh</th><th>Davomat</th><th>Vazifa</th><th>Kunlik test</th><th>Umumiy</th></tr>${rows.map((x,j)=>`<tr><td>${x.p==null?'—':(MD[j]||j+1)}</td><td class="l">${esc(x.n)}</td><td>${fp(x.a)}</td><td>${fp(x.h)}</td><td>${fp(x.t)}</td><td class="tot">${fp(x.p)}</td></tr>`).join('')}</table></div><p class="mut">Umumiy foiz = to'ldirilgan ko'rsatkichlarning o'rtachasi (davomat, uyga vazifa, kunlik test).</p>`:'<p class="mut">Avval «Kunlik jadval» bo\'limida ismlarni yozing.</p>'}</div>`}
async function repGroups(){const r=mr(S.month),d=await q(sb.rpc('rep_group_ranking',{p_from:r.a,p_to:r.b}));
 return `<div class="card"><div class="top"><b>Oy:</b><input type="month" id="mo" value="${S.month}"></div><div class="wrap"><table><tr><th>O'rin</th><th class="l">Guruh</th><th>O'quvchilar</th><th>O'rtacha foiz</th><th></th></tr>${d.map((x,j)=>`<tr><td>${x.has?(MD[j]||j+1):'—'}</td><td class="l">${esc(x.subject)}</td><td>${x.students}</td><td class="tot">${x.has?x.pct+'%':'ma\'lumot yo\'q'}</td><td><div class="bar"><i style="width:${x.has?Math.min(100,x.pct):0}%"></i></div></td></tr>`).join('')}</table></div><p class="mut">Reyting faqat Repetitor guruhlari orasida.</p></div>`}
async function repTeacher(){const c=CL.find(x=>x.id==S.cls),A=ME.role=='admin';
 const[cc,im]=await Promise.all([A?q(sb.from('class_codes').select('code').eq('class_id',S.cls).maybeSingle()):Promise.resolve(null),q(sb.from('class_images').select('id,caption,img,created_at').eq('class_id',S.cls).order('created_at',{ascending:false}).limit(12))]);
 return `<div class="card"><b>O'qituvchi</b><div class="top">${A?`<input class="cname" id="tn" style="width:min(100%,320px)" placeholder="O'qituvchi F.I.Sh" value="${esc(c.teacher_name)}">`:`<span class="cn2">${esc(c.teacher_name)||'Kiritilmagan'}</span>`}</div>${A?`<div class="top"><span class="mut">O'qituvchi kodi:</span><span class="code">${cc?esc(cc.code):'—'}</span><button class="tab" id="gc">${ic('key')}Yangi kod</button></div>`:''}</div>${A?await tCard():''}
 <div class="card"><b>${ic('image')}O'qituvchining natijalari (rasm)</b><div class="top"><input class="cname" id="icap" style="width:min(100%,260px)" placeholder="Izoh (ixtiyoriy)"><button class="tab" id="imb">${ic('upload')}Rasm yuklash</button><input type="file" id="imf" accept="image/*" hidden></div>${im.length?im.map(x=>`<p><img class="gimg" src="${x.img}" alt=""><br><span class="mut">${esc(x.caption)} ${x.created_at.slice(0,10)}</span> <button class="tab imdel" data-id="${x.id}">${ic('trash')}</button></p>`).join(''):'<p class="mut">Hali rasm yuklanmagan.</p>'}</div>`}
// O'qituvchilarni sinf/guruhga biriktirish (admin): sinflar va repetitor guruhlari uchun umumiy
async function tCard(){const tl=await q(sb.from('teacher_classes').select('user_id,role,profiles(full_name,phone)').eq('class_id',S.cls)).catch(()=>q(sb.from('teacher_classes').select('user_id,profiles(full_name,phone)').eq('class_id',S.cls)));
 const opts=CL.filter(c=>c.id!=S.cls).map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');
 const rp=(CL.find(x=>x.id==S.cls)||{}).kind=='rep',RS=(cls,v,u)=>`<select class="fld ${cls}" style="width:auto" ${u?`data-u="${u}"`:'id="trl"'}>${u?'':`<option value="" selected disabled>— vazifasini tanlang —</option>`}<option value="rahbar" ${u&&v=='rahbar'?'selected':''}>${rp?'Guruh rahbari (asosiy)':'Sinf rahbari'}</option><option value="fan" ${u&&v!='rahbar'?'selected':''}>${rp?"Yordamchi o'qituvchi":"Fan o'qituvchisi"}</option></select>`;
 return `<div class="card"><b>${ic('users')}O'qituvchi akkaunti</b><p class="mut">Bir o'qituvchi sinf rahbari ham, bir nechta sinfda fan o'qituvchisi ham bo'lishi mumkin. Biriktirilgan barcha sinflar unga bitta login va parol bilan ko'rinadi.</p>${tl.length?tl.map(x=>`<div class="top"><span><b>${esc((x.profiles||{}).full_name)}</b> (${esc((x.profiles||{}).phone)})</span>${RS('trole',x.role,x.user_id)}<select class="fld" style="width:auto" id="ts${x.user_id}"><option value="">+ sinf qo'shish…</option>${opts}</select><button class="tab tadd" data-u="${x.user_id}">Qo'shish</button><button class="tab trem" data-u="${x.user_id}">✖ Bu sinfdan olish</button></div>`).join(''):'<p class="mut">Bu sinfga o\'qituvchi biriktirilmagan.</p>'}
 <p><b>Yangi o'qituvchi</b></p><input class="fld" id="tn2" placeholder="Ism familiya"><input class="fld" id="tph" type="tel" placeholder="Telefon: +998 90 123 45 67"><input class="fld" id="tpw" type="text" placeholder="Parol (siz berasiz, kamida 6 belgi)"><div class="top"><span class="mut">Shu sinfdagi vazifasi:</span>${RS('')}</div><details class="gd"><summary>Boshqa sinflarga ham biriktirish (fan o'qituvchisi sifatida)</summary>${GR.map(([g,t])=>{const a=CL.filter(c=>c.id!=S.cls&&grpOf(c)==g).sort(clsCmp);return a.length?`<div class="gr"><div class="mut">${t}</div>${a.map(c=>`<label class="ck"><input type="checkbox" class="tcx" value="${c.id}">${esc(clsLbl(c))}</label>`).join('')}</div>`:''}).join('')}</details><button class="btn" id="mkt">Akkaunt yaratish</button></div>`;}
async function tView(){const[ps,tc]=await Promise.all([q(sb.from('profiles').select('id,full_name,phone').eq('role','teacher').order('full_name')),
  q(sb.from('teacher_classes').select('user_id,class_id,role,subject')).catch(()=>q(sb.from('teacher_classes').select('user_id,class_id,role')))]);
 S.tAll=tc;const opt=`<option value="">+ sinf yoki guruh tanlang…</option>${GR.map(([g,t])=>{const a=CL.filter(c=>grpOf(c)==g).sort(clsCmp);return a.length?`<optgroup label="${esc(t)}">${a.map(c=>`<option value="${c.id}">${esc(clsLbl(c))}</option>`).join('')}</optgroup>`:''}).join('')}`;
 const RL=(v,u,c)=>`<select class="fld tcr" style="width:auto" data-u="${u}"${c!=null?` data-c="${c}"`:''}><option value="fan" ${v!='rahbar'?'selected':''}>Fan o'qituvchisi</option><option value="rahbar" ${v=='rahbar'?'selected':''}>Sinf rahbari</option></select>`;
 return `<div class="card"><b>${ic('users')}O'qituvchilar va ularning sinflari</b><p class="mut">Har bir o'qituvchiga istalgancha sinf qo'shing va har biri uchun vazifasini tanlang: <b>Sinf rahbari</b> — o'quvchilar ismi, ota-ona telefoni va kunlik vazifalar; <b>Fan o'qituvchisi</b> — o'z fanidan davomat, uyga vazifa, darsdagi faollik va baho. Repetitor va guruhlarda o'quvchilarni kirituvchi o'qituvchini «Sinf rahbari» qiling. Yangi o'qituvchi akkaunti sinfning «Sozlamalar» bo'limida yaratiladi.</p>
 <input class="fld" id="tq" placeholder="🔎 O'qituvchini qidirish (ism)" value="${esc(S.tq||'')}"><p class="mut" style="margin:6px 0 0">✏️ O'qituvchi ismini tahrirlash uchun kartochkadagi ism ustiga bosing.</p></div>
 ${ps.map(p=>{const my=tc.filter(x=>x.user_id==p.id).map(x=>({...x,c:CL.find(c=>c.id==x.class_id)||{name:'?'}})).sort((a,b)=>(b.role=='rahbar')-(a.role=='rahbar')||clsCmp(a.c,b.c));
  const hid=S.tq&&!(p.full_name||'').toLowerCase().includes(S.tq);
  return `<div class="card tch" id="tch${p.id}" data-n="${esc((p.full_name||'').toLowerCase())}"${hid?' style="display:none"':''}><div class="top"><input class="cname tnm" data-u="${p.id}" value="${esc(p.full_name)}" title="Ism-familiyani tahrirlash — o'zi saqlanadi" style="font-size:18px;font-weight:700;width:min(100%,340px)"><span class="mut">${esc(p.phone||'')}</span><span class="rl" style="margin-left:auto">${my.length} ta sinf</span></div>
  <div class="top"><span class="mut">${ic('key')}Parol:</span><span class="mut">•••••• (shifrlangan, ko'rinmaydi)</span><input class="fld" id="tpw${p.id}" type="text" autocomplete="off" placeholder="Yangi parol (kamida 6 belgi)" style="width:auto;max-width:220px"><button class="tab tpwb" data-u="${p.id}">${ic('key')}Parolni o'zgartirish</button><span class="tpwr" id="tpr${p.id}"></span></div>
  ${my.length?`<div class="wrap"><table style="min-width:0"><tr><th class="l">Sinf / guruh</th><th>Vazifasi</th><th>Fani</th><th></th></tr>${my.map(x=>`<tr><td class="l">${esc(clsLbl(x.c))}</td><td>${RL(x.role,p.id,x.class_id)}</td><td><input class="nm tcs" data-u="${p.id}" data-c="${x.class_id}" value="${esc(x.subject||'')}" placeholder="masalan, Matematika" style="min-width:130px"></td><td><button class="tab tcd" data-u="${p.id}" data-c="${x.class_id}" title="Bu sinfdan olish">${ic('trash')}</button></td></tr>`).join('')}</table></div>`:'<p class="mut">Hali sinf biriktirilmagan.</p>'}
  <div class="top" style="margin-top:8px"><select class="fld" id="tcn${p.id}" style="width:auto;max-width:100%">${opt}</select>${RL('fan',p.id)}<input class="fld" id="tcf${p.id}" placeholder="Fani (ixtiyoriy)" style="width:auto;max-width:180px"><button class="tab tcadd" data-u="${p.id}">${ic('users')}Qo'shish</button></div></div>`}).join('')||'<div class="card"><p class="mut">Hali o\'qituvchi akkauntlari yo\'q.</p></div>'}`}
// Sinf rahbari bitta bo'ladi: boshqasini rahbar qilsangiz, avvalgisi fan o'qituvchisiga o'tadi (tasdiqlab)
// Ro'yxat yangilangach, o'sha o'qituvchi kartochkasida qolamiz (boshiga qaytib ketmaydi)
async function tBack(u){const el=document.getElementById('tch'+u),off=el?el.getBoundingClientRect().top:null;flush();await render();const n=document.getElementById('tch'+u);
 if(n){if(off!=null)scrollTo(0,scrollY+n.getBoundingClientRect().top-off);else n.scrollIntoView({block:'start'});n.classList.add('hl');setTimeout(()=>n.classList.remove('hl'),1500)}}
async function tRole(u,c,role){if(role=='rahbar'){const o=(S.tAll||[]).find(x=>x.class_id==c&&x.role=='rahbar'&&x.user_id!=u);
  if(o){if(!confirm("Bu sinfda boshqa sinf rahbari bor. Uning o'rniga shu o'qituvchi qo'yilsinmi? (avvalgisi fan o'qituvchisi bo'ladi)"))return false;
   const{error}=await sb.from('teacher_classes').update({role:'fan'}).eq('user_id',o.user_id).eq('class_id',c);if(error){flash(netMsg(error));return false}o.role='fan'}}
 const{error}=await sb.from('teacher_classes').update({role}).eq('user_id',u).eq('class_id',c);if(error){flash(netMsg(error));return false}
 const x=(S.tAll||[]).find(x=>x.user_id==u&&x.class_id==c);if(x)x.role=role;return true}
// Zaxira nusxa (admin): asosiy jadvallarni bitta JSON faylga yuklab olish. Har 1000 qatordan sahifalab o'qiladi.
const BKT=[['classes','*',['id']],['students','*',['id']],['student_private','*',['student_id']],['profiles','*',['id']],['teacher_classes','*',['user_id','class_id']],
 ['daily_scores','*',['student_id','day']],['rep_daily','*',['student_id','day']],['subject_scores','*',['id']],['payments','*',['student_id','month']],
 ['feedback','*',['id']],['class_codes','*',['class_id']],['menu','id,day,meal,name',['id']],['turnstile_events','*',['id']]];
async function backup(btn){const out={ilova:M.nomi,sana:new Date().toISOString(),jadvallar:{}},tot={};btn.disabled=true;const t0=btn.innerHTML;
 try{for(const[t,f,o]of BKT){let all=[],i=0;for(;;){let qy=sb.from(t).select(f);o.forEach(c=>qy=qy.order(c));const{data,error}=await qy.range(i,i+999);
   if(error){out.jadvallar[t]={xato:error.message};break}all=all.concat(data);btn.textContent=`${t}: ${all.length}…`;if(data.length<1000)break;i+=1000}
   if(!out.jadvallar[t])out.jadvallar[t]=all;tot[t]=Array.isArray(out.jadvallar[t])?out.jadvallar[t].length:'xato'}
  const b=new Blob([JSON.stringify(out)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=`${M.kod}-zaxira-${nowT().d}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),5000);
  try{localStorage.setItem(P+'bk',nowT().d+' '+nowT().hms.slice(0,5))}catch(e){}
  flash(`✅ Zaxira nusxa yuklab olindi (${(b.size/1048576).toFixed(1)} MB): `+Object.entries(tot).map(([k,v])=>k+' '+v).join(', '))}
 catch(e){flash(netMsg(e))}finally{btn.disabled=false;btn.innerHTML=t0}}
const bkCard=()=>{let l='';try{l=localStorage.getItem(P+'bk')||''}catch(e){}return`<div class="card"><b>${ic('down')}Zaxira nusxa</b><p class="mut">Barcha o'quvchilar, ota-ona telefonlari, o'qituvchilar, ballar, baholar va to'lovlarni bitta faylga yuklab oladi. Haftada bir marta yuklab, kompyuter va fleshkada saqlang. Fayl maxfiy — hech kimga bermang.</p><div class="top"><button class="tab" id="bkp">${ic('down')}Zaxira nusxani yuklab olish</button><span class="mut">${l?'Oxirgi marta (shu qurilmada): '+esc(l):'Bu qurilmada hali yuklab olinmagan'}</span></div></div>`};
async function setView(){const tcard=bkCard()+await tCard();
 const c=CL.find(x=>x.id==S.cls),cc=await q(sb.from('class_codes').select('code').eq('class_id',S.cls).maybeSingle());
 const spq=f=>q(sb.from('student_private').select('student_id,code,parent_phone,claimed_by,students!inner('+f+')').eq('students.class_id',S.cls)),sp=await spq('full_name,slot,class_id,ext_id').catch(()=>spq('full_name,slot,class_id')),tk=sp.some(r=>'ext_id' in r.students);sp.sort((a,b)=>a.students.slot-b.students.slot);
 return `<div class="card"><b>Sinf sozlamalari</b><div class="top"><input class="cname" id="cn" value="${esc(c.name)}" maxlength="24"><input class="cname" id="tn" style="width:min(100%,280px)" placeholder="O'qituvchi F.I.Sh" value="${esc(c.teacher_name)}"><button class="tab" id="lgb">${ic('image')}Logotip</button><input type="file" id="lg" accept="image/*" hidden></div><div class="top"><span class="mut">O'qituvchi kodi:</span><span class="code">${cc?esc(cc.code):'—'}</span><button class="tab" id="gc">${ic('key')}Yangi kod</button></div></div>
 ${tcard}<div class="card"><b>Ota-onalar telefonlari</b><p class="mut">Ota-ona shu telefon raqami bilan ro'yxatdan o'tadi (kod kerak emas).</p><div class="wrap"><table><tr><th>№</th><th class="l">O'quvchi</th><th>Ota-ona telefoni</th>${tk?'<th title="Hikvision turniketidagi Employee No.">Turniket ID</th>':''}<th>Kod</th><th>Holat</th></tr>${sp.map(r=>`<tr><td>${r.students.slot}</td><td class="l">${esc(r.students.full_name)||'—'}</td><td><input class="nm" style="min-width:140px" data-p="${r.student_id}" value="${esc(r.parent_phone)}" placeholder="+998..."></td>${tk?`<td><input class="nm" style="min-width:90px" data-x="${r.student_id}" value="${esc(r.students.ext_id||'')}" placeholder="—"></td>`:''}<td><span class="code" style="font-size:15px">${r.code}</span></td><td>${r.claimed_by?'✅ ulangan':'—'}</td></tr>`).join('')}</table></div></div>`}
async function parentView(){const mm=S.month.split('-'),a=S.month+'-01',b=S.month+'-'+String(new Date(Date.UTC(+mm[0],+mm[1],0)).getUTCDate()).padStart(2,'0');
 const[me,kids]=await Promise.all([q(sb.from('students').select('full_name,class_id').eq('id',ME.student_id).single()),q(sb.rpc('my_kids'))]);
 const c=CL.find(x=>x.id==me.class_id)||{},kind=c.kind=='rep'?'r':(c.grp||(c.grade||0)>7)?'u':'p';setMode(c);S.kc=c;S.kn=me.full_name;
 const head=`<div class="card"><div class="top"><b class="cn2">${esc(me.full_name)}</b><span class="mut">${esc(c.name||'')}${c.kind=='rep'?' (Repetitor)':''}</span></div>${kids.length>1?`<div class="top"><b>Farzand:</b><select class="fld" id="kid" style="width:auto">${kids.map(k=>`<option value="${k.id}" ${k.id==ME.student_id?'selected':''}>${esc(k.full_name)} — ${esc(cname(k.class_id))}</option>`).join('')}</select></div>`:''}<div class="top"><b>Oy:</b><input type="month" id="mo" value="${S.month}"></div>`;
 const dd=x=>x.day.slice(8)+'.'+x.day.slice(5,7);
 if(kind=='r'){
  const[rk,rows]=await Promise.all([q(sb.rpc('rep_my_rank',{p_from:a,p_to:b})),q(sb.from('rep_daily').select('*').eq('student_id',ME.student_id).gte('day',a).lte('day',b).order('day'))]);const r=rk&&rk[0];
  const crc=critCard(c,rows);
  return head+`<div class="kpi"><div><b>${r?r.present+'/'+r.days:'—'}</b>${ic('cal')}davomat</div><div><b>${r&&r.avg_hw!=null?r.avg_hw:'—'}</b>${ic('clip')}uyga vazifa</div><div><b>${r&&r.avg_test!=null?r.avg_test:'—'}</b>${ic('flask')}test</div><div><b>${r?r.rank+'/'+r.size:'—'}</b>${ic('trophy')}guruhda o'rin</div></div></div>${crc}
  <div class="card"><b>Kunlik davomat, uyga vazifa va test</b><div class="wrap"><table><tr><th>Sana</th><th>Davomat</th><th>Uyga vazifa</th><th>Test</th></tr>${rows.length?rows.map(x=>`<tr><td>${dd(x)}</td><td>${attIc(x)}</td><td>${x.hw??'—'}</td><td class="tot">${x.test??'—'}</td></tr>`).join(''):'<tr><td colspan="4" class="mut">Bu oy ma\'lumot yo\'q</td></tr>'}</table></div></div>`}
 const[rk,rows]=await Promise.all([q(sb.rpc('my_task_rank',{p_from:a,p_to:b})),q(sb.from('daily_scores').select('*').eq('student_id',ME.student_id).gte('day',a).lte('day',b).order('day'))]);const r=rk&&rk[0];
 const kpi=`<div class="kpi"><div><b>${r?r.total:0}</b>jami ball</div><div><b>${r?r.class_rank+'/'+r.class_size:'—'}</b>${ic('school')}sinfda o'rin</div><div><b>${r?r.school_rank+'/'+r.school_size:'—'}</b>${ic('trophy')}${kind=='p'?"1–7-sinflar orasida":"reytingda"} o'rin</div></div>`;
 const sub=await sb.rpc('parent_subjects',{p_from:a,p_to:b}).then(r=>(r.data||[]).filter(x=>x.student_id==ME.student_id)).catch(()=>[]);
 const cc=critCard(c,rows,sub)+(!c.grp?await coinCard(rows,a,b).catch(()=>'')+await kidMonths().catch(()=>''):'')+await subjCard(a,b).catch(()=>'');
 if(kind=='p'){
  const t=nowT().d,menu=ON('taomnoma')?await q(sb.from('menu').select('id,day,meal,name').gte('day',t).order('day').order('id').limit(30)):[];await menuPh(menu);const days={};menu.forEach(m=>(days[m.day]=days[m.day]||[]).push(m));
  return head+kpi+`</div>${cc}<div class="card"><b>Kunlik vazifalar</b><div class="wrap"><table><tr><th>Sana</th>${th()}<th>Jami</th></tr>${rows.length?rows.map(x=>`<tr><td>${dd(x)}</td>${CR.map(k=>`<td>${k.c=='att'?attIc(x):(x[k.c]??'—')}</td>`).join('')}<td class="tot">${sum(x)}</td></tr>`).join(''):'<tr><td colspan="8" class="mut">Bu oy ma\'lumot yo\'q</td></tr>'}</table></div></div>
  ${ON('taomnoma')?`<div class="card"><b>${ic('food')}Kunlik taomlanish (retsept)</b>${Object.keys(days).length?Object.keys(days).map(d=>`<p><b>${d.slice(8)}.${d.slice(5,7)}</b></p>${days[d].map(m=>`<div class="top">${m.photo?`<img class="cl" style="height:64px;width:64px;object-fit:cover;border-radius:10px" src="${m.photo}">`:''}<div><b>${esc(m.meal)}</b><br><span style="white-space:pre-line">${esc(m.name)}</span></div></div>`).join('')}`).join(''):'<p class="mut">Taomnoma hali kiritilmagan.</p>'}</div>`:''}`}
 const g=!!c.grp;
 return head+kpi+`</div>${cc}<div class="card"><b>Davomat${g?' va baholar':''}</b><div class="wrap"><table><tr><th>Sana</th><th>Davomat</th>${g?'<th>Uyga vazifa</th><th>Sinfdagi faollik</th><th>Tartib-intizom</th>':''}</tr>${rows.length?rows.map(x=>`<tr><td>${dd(x)}</td><td>${attIc(x)}</td>${g?`<td>${x.hw??'—'}</td><td>${x.activity??'—'}</td><td>${x.behavior??'—'}</td>`:''}</tr>`).join(''):'<tr><td colspan="5" class="mut">Bu oy ma\'lumot yo\'q</td></tr>'}</table></div></div>`}
// Ota-ona uchun: har bir ko'rsatkich bo'yicha oy davomida qancha yaxshi va qancha past baho olgani
// Chegara: 10 ballikda 9–10 yaxshi, 0–4 past; 5 ballikda 5 yaxshi, 0–2 past; test 90%+ yaxshi, 40% dan past — past
function critDefs(c){if(c.kind=='rep')return[['hw','Uyga vazifa',10],['test','Kunlik test',100]];
 if(c.grp)return CRG.slice(1).map(x=>[x.c,x.k,5]);return crOf(c).slice(1).map(x=>[x.c,x.k,10])}
const gb=(v,m)=>m==100?(v>=90?1:v<40?-1:0):m==5?(v>=5?1:v<=2?-1:0):(v>=9?1:v<=4?-1:0);
function critCard(c,rows,sub){try{return critHtml(c,rows,sub)}catch(e){return ''}}
function critHtml(c,rows,sub){const dd=x=>{const d=String(x.d||x.day||'');return d.slice(8)+'.'+d.slice(5,7)},L=[];
 critDefs(c).forEach(([k,t,m])=>{const v=rows.filter(r=>r[k]!=null).map(r=>({d:r.day,v:+r[k]}));if(v.length)L.push({t,m,v})});
 const sg={};(sub||[]).forEach(r=>[['grade','baho',5],['hw','uyga vazifa',5],['activity','faollik',5]].forEach(([k,t,m])=>{if(r[k]==null)return;const key=r.subject+': '+t;(sg[key]=sg[key]||{t:key,m,v:[]}).v.push({d:r.day,v:+r[k]})}));
 Object.values(sg).sort((a,b)=>a.t.localeCompare(b.t,'uz')).forEach(x=>L.push(x));if(!L.length)return '';
 const R=L.map(x=>{const g=x.v.filter(y=>gb(y.v,x.m)>0),b=x.v.filter(y=>gb(y.v,x.m)<0),av=Math.round(x.v.reduce((q,y)=>q+y.v,0)/x.v.length*10)/10;return{...x,g,b,av}});
 const bad=R.filter(x=>x.b.length).sort((a,b)=>b.b.length-a.b.length),best=R.filter(x=>x.g.length).sort((a,b)=>b.g.length-a.g.length);
 return `<div class="card"><b>${ic('chart')}Ko'rsatkichlar bo'yicha — ${MON[+S.month.slice(5)-1]}</b><p class="mut">Har bir ko'rsatkich bo'yicha shu oyda nechta yaxshi va nechta past baho olingani.</p>
 ${best.length?`<p style="margin:8px 0 4px"><b style="color:var(--ok)">👍 Yaxshi natijalar:</b> ${best.slice(0,4).map(x=>`<b>${esc(x.t)}</b> (${x.g.length} marta)`).join(', ')}</p>`:''}
 ${bad.length?`<p style="margin:4px 0 8px"><b style="color:var(--bad)">⚠️ E'tibor bering:</b> ${bad.slice(0,4).map(x=>`<b>${esc(x.t)}</b> (${x.b.length} marta past: ${x.b.slice(-4).map(y=>dd(y)+' — '+y.v).join(', ')})`).join('; ')}</p>`:'<p style="margin:4px 0 8px;color:var(--ok)">✅ Shu oyda past baho yo\'q.</p>'}
 <div class="wrap"><table style="min-width:0"><tr><th class="l">Ko'rsatkich</th><th>O'rtacha</th><th>👍 Yaxshi</th><th>⚠️ Past</th></tr>${R.map(x=>`<tr><td class="l">${esc(x.t)} <span class="mut">(0–${x.m})</span></td><td class="tot">${x.av}</td><td>${x.g.length?`<b style="color:var(--ok)">${x.g.length}</b>`:'—'}</td><td>${x.b.length?`<b style="color:var(--bad)">${x.b.length}</b>`:'—'}</td></tr>`).join('')}</table></div></div>`}
// Ota-ona uchun: farzandning oylar bo'yicha ballari (har oy alohida, o'tgan oylar saqlanadi)
async function kidMonths(){const{sy,out}=syMonths(),cur=nowT().d.slice(0,7),{data,error}=await sb.rpc('my_month_totals',{p_from:sy+'-09-01'});if(error||!data||!data.length)return '';
 const m={};data.forEach(r=>m[String(r.month).slice(0,7)]=+r.total);
 return `<div class="card"><b>${ic('cal')}Oylar bo'yicha natijalar — ${sy}–${sy+1} o'quv yili</b><div class="wrap"><table style="min-width:0"><tr><th class="l">Oy</th><th>Ball</th><th>Foiz</th><th>Tanga</th></tr>${out.map(k=>{const v=m[k],p=v!=null?v/OY_MAX*100:null,c=p!=null&&k<cur?coinOf(p):null;return`<tr><td class="l">${MON[+k.slice(5)-1]} ${k.slice(0,4)}${k==cur?' <span class="mut">(davom etmoqda)</span>':''}</td><td class="tot">${v??'—'}${v!=null?` / ${OY_MAX}`:''}</td><td>${p!=null?Math.round(p*10)/10+'%':'—'}</td><td>${c?coinI(c,24)+' '+c[0]:'—'}</td></tr>`}).join('')}</table></div></div>`}
// Ota-ona uchun: fan o'qituvchilari qo'ygan davomat va baholar (oy bo'yicha)
async function subjCard(a,b){const{data}=await sb.rpc('parent_subjects',{p_from:a,p_to:b});const r=(data||[]).filter(x=>x.student_id==ME.student_id);if(!r.length)return '';
 const dd=x=>x.day.slice(8)+'.'+x.day.slice(5,7),g=r.filter(x=>x.grade!=null),av=g.length?Math.round(g.reduce((q,x)=>q+ +x.grade,0)/g.length*10)/10:null;
 return `<div class="card"><b>${ic('layers')}Fanlar bo'yicha baholar</b>${av!=null?`<p class="mut">O'rtacha baho: <b>${av}</b> (${g.length} ta baho)</p>`:''}<div class="wrap"><table><tr><th>Sana</th><th class="l">Fan</th><th>Davomat</th><th>Uyga vazifa</th><th>Faollik</th><th>Baho</th></tr>${r.map(x=>`<tr><td>${dd(x)}</td><td class="l">${esc(x.subject)}</td><td>${attIc(x)}</td><td>${x.hw??'—'}</td><td>${x.activity??'—'}</td><td class="tot">${x.grade!=null?`<b class="${x.grade<=2?'bdx':x.grade==5?'okx':''}">${x.grade}</b>`:'—'}</td></tr>`).join('')}</table></div></div>`}
// Ota-ona uchun: farzandning tangalar bo'yicha imkoniyati va mezonlar bo'yicha sinfdagi o'rni
async function coinCard(rows,a,b){const{data:ms}=await sb.rpc('my_month_stats',{p_from:a,p_to:b});
 const cr=crOf(S.kc),t=ms&&ms.total!=null?+ms.total:rows.reduce((q,x)=>q+sumBy(x,cr),0),days=new Set(rows.filter(x=>x.att!=null||cr.slice(1).some(c=>x[c.c]!=null)).map(x=>x.day)).size,cs=coinState(t,days);
 const tiles=COINS.slice().reverse().map(k=>{const need=k[1]*OY_MAX/100,pr=Math.min(100,Math.round(t/need*100));return`<div class="tp3" style="text-align:center">${coinI(k,44)}<b style="justify-content:center">${k[0]} tanga</b><span class="mut" style="font-size:12px">${need} ball (${k[1]}%)</span><div class="cbar"><i style="width:${pr}%;background:${pr>=100?'#2f9e44':'#1c7ed6'}"></i></div>${pr>=100?'<b style="color:var(--ok);justify-content:center">✅ Yutildi</b>':`<span>${pr}% bajarildi · yana <b>${Math.ceil(need-t)}</b> ball</span>`}</div>`}).join('');
 const lead=ms&&ms.r?cr.filter(k=>ms.r[k.c]<=3&&(ms.v[k.c]||0)>0).map(k=>`<li>${MD3[ms.r[k.c]-1]} <b>${k.k}</b>: ${ms.v[k.c]} / ${crMax(k)} ball — sinfda <b>${ms.r[k.c]}-o'rin</b></li>`).join(''):'';
 return `<div class="card"><b>${ic('award')}Tangalar — ${MON[+a.slice(5,7)-1]}</b><p class="mut">Oy davomida to'plangan ${OY_MAX} ballik natijaga qarab oltin, kumush yoki bronza tanga beriladi. Hozir: <b>${t}</b> ball (${Math.round(cs.p*10)/10}%).</p>
 <div class="tops">${tiles}</div>${days&&!cs.won?`<p style="margin:12px 0 0">📈 Shu sur'atda davom etsa, oy oxirida taxminan <b>${cs.proj}</b> ball — ${cs.pc?`<b>${cs.pc[0]} tanga</b> olish imkoniyati bor`:"tanga uchun ko'proq harakat kerak"}.</p>`:''}
 ${lead?`<p style="margin:12px 0 4px"><b>${ic('trophy')}Mezonlar bo'yicha sinfdagi eng yaxshilar qatorida:</b></p><ul style="margin:0;padding-left:20px">${lead}</ul>`:''}</div>`}
// Taom rasmlari o'zgarmaydi: bir marta yuklab, telefonda saqlab qo'yamiz (har safar qayta yuklanmaydi)
async function menuPh(rows){let c={};try{c=JSON.parse(localStorage.getItem(P+'mph')||'{}')}catch(e){}
 const need=rows.filter(m=>!(m.id in c)).map(m=>m.id);
 if(need.length)(await q(sb.from('menu').select('id,photo').in('id',need)).catch(()=>[])).forEach(x=>c[x.id]=x.photo||'');
 const k={};rows.forEach(m=>{m.photo=c[m.id]||null;if(m.id in c)k[m.id]=c[m.id]});try{localStorage.setItem(P+'mph',JSON.stringify(k))}catch(e){}}
async function menuView(){const t=nowT().d,rows=await q(sb.from('menu').select('*').gte('day',t.slice(0,8)+'01').order('day').order('id'));
 return `<div class="card"><b>${ic('food')}Taomnoma qo'shish</b><p class="mut">1–7-sinf ota-onalari ko'radi.</p><div class="top"><input type="date" id="mnd" value="${S.date}"><select class="fld" id="mnm" style="width:auto"><option>Nonushta</option><option>Tushlik</option><option>Poldnik</option></select></div><textarea class="fld" id="mnt" rows="4" placeholder="Taom nomi va retsepti (masalan: Palov — guruch, go'sht, sabzi, piyoz…)"></textarea><div class="top"><button class="tab" id="mnb">${ic('image')}Rasm tanlash</button><input type="file" id="mnf" accept="image/*" hidden><span class="mut" id="mnp"></span></div><button class="btn" id="mna">Qo'shish</button></div>
 <div class="card"><b>Shu oydagi taomnoma</b>${rows.length?`<div class="wrap"><table><tr><th>Sana</th><th>Vaqt</th><th class="l">Taom</th><th></th></tr>${rows.map(m=>`<tr><td>${m.day.slice(8)}.${m.day.slice(5,7)}</td><td>${esc(m.meal)}</td><td class="l">${m.photo?'🖼️ ':''}${esc(m.name)}</td><td><button class="tab mdel" data-id="${m.id}">${ic('trash')}</button></td></tr>`).join('')}</table></div>`:'<p class="mut">Hali kiritilmagan.</p>'}</div>`}
// O'quvchi ismi va ota-ona telefonini kiritish: admin yoki shu sinfning sinf rahbari (fan o'qituvchisi faqat ko'radi)
const canPh=c=>ME.role=='admin'||(ME.roles&&ME.roles[c.id]=='rahbar')||(ME.roles&&!ME.roles[c.id]&&ME.class_id==c.id);
const setPh=async(id,v)=>{const{error}=await sb.rpc('set_parent_phone',{p_id:String(id),p_phone:v});if(!error)return true;if(error.code=='PGRST202')return upd('student_private',{parent_phone:v},'student_id',id).then(()=>true);flash(netMsg(error));return false};
// O'quv yili oylari (sentyabr – joriy oy) va oyma-oy ballar: har oy 0 dan boshlanadi, o'tgan oylar natijasi saqlanib turadi
function syMonths(){const t=nowT().d,y=+t.slice(0,4),m=+t.slice(5,7),sy=m>=9?y:y-1,out=[];for(let k=0;k<10;k++){const mm=((8+k)%12)+1,yy=mm>=9?sy:sy+1,key=yy+'-'+String(mm).padStart(2,'0');if(key>t.slice(0,7))break;out.push(key)}return{sy,out}}
async function monthsCard(){const{sy,out}=syMonths(),cur=nowT().d.slice(0,7);
 const{data,error}=await sb.rpc('class_month_totals',{p_class:S.cls,p_from:sy+'-09-01'});
 if(error)return `<div class="card"><b>${ic('cal')}Oylar kesimida ballar</b><p class="mut">${error.code=='PGRST202'?"Ko'rish uchun admin Supabase'da yangilanish-19.sql ni ishga tushirishi kerak.":esc(netMsg(error))}</p></div>`;
 const st=(await q(sb.from('students').select('id,full_name').eq('class_id',S.cls).order('slot'))).filter(x=>x.full_name.trim()),M={};
 (data||[]).forEach(r=>(M[r.student_id]=M[r.student_id]||{})[String(r.month).slice(0,7)]=+r.total);
 const rows=st.map(x=>({n:x.full_name,m:M[x.id]||{},y:out.reduce((a,k)=>a+((M[x.id]||{})[k]||0),0)})).sort((a,b)=>b.y-a.y||a.n.localeCompare(b.n,'uz'));
 const cell=(v,k)=>{if(v==null)return '<span class="mut">—</span>';const p=v/OY_MAX*100,c=k<cur?coinOf(p):null;return`<span style="display:inline-flex;align-items:center;gap:4px"><i style="width:8px;height:8px;border-radius:2px;background:${bandOf(p)[1]};display:inline-block"></i>${v}${c?coinI(c,18):''}</span>`};
 S.mon={out,rows,cur};
 return `<div class="card"><b>${ic('cal')}Oylar kesimida ballar — ${sy}–${sy+1} o'quv yili</b><p class="mut">Har oy ${OY_MAX} balldan hisoblanadi va yangi oy 0 dan boshlanadi; o'tgan oylar natijasi saqlanib turadi. Joriy oy — davom etmoqda.</p>
 <div class="wrap"><table><tr><th>№</th><th class="l">F.I.Sh</th>${out.map(k=>`<th>${MON[+k.slice(5)-1].slice(0,3)}${k==cur?'*':''}</th>`).join('')}<th>Jami</th></tr>
 ${rows.map((r,i)=>`<tr><td>${i+1}</td><td class="l">${esc(r.n)}</td>${out.map(k=>`<td>${cell(r.m[k],k)}</td>`).join('')}<td class="tot">${r.y}</td></tr>`).join('')||'<tr><td colspan="12" class="mut">O\'quvchilar kiritilmagan</td></tr>'}</table></div><p class="mut">* — joriy oy. Tanga belgisi tugagan oylar uchun ko'rsatiladi.</p></div>`}
// Oylik infografika: 1–2-guruh sinflarida o'quvchi bir oyda ko'pi bilan 1020 ball oladi
// (kuniga davomat 1 + 5 mezon × 10 = 51 ball × 20 o'quv kuni). Rang — to'plangan foizga qarab.
const OY_MAX=1020,BANDS=[[30,'#e03131','Qizil','30% va undan past'],[50,'#d29a00','Sariq','30–50%'],[70,'#1c7ed6',"Ko'k",'50–70%'],[1e9,'#2f9e44','Yashil','70–100%']];
const bandOf=p=>BANDS.find(b=>p<=b[0]);
// Tangalar: oylik foizga qarab. Mezon bo'yicha oylik maksimal: davomat 20, qolganlari 10 × 20 = 200
const COINS=[['Oltin',90,'g'],['Kumush',80,'s'],['Bronza',70,'b']],OY_KUN=20,coinOf=p=>COINS.find(c=>p>=c[1]);
const coinI=(c,sz)=>`<span class="coin ${c[2]}" style="${sz?`width:${sz}px;height:${sz}px;font-size:${Math.round(sz*.45)}px`:''}" title="${c[0]} tanga">${c[0][0]}</span>`;
const crMax=k=>k.c=='att'?OY_KUN:k.m*OY_KUN,MD3=['🥇','🥈','🥉'];
// O'quvchining tangalar bo'yicha holati: yutgani, keyingi tangagacha foiz, shu sur'atda oy oxiriga taxminiy natija
function coinState(t,days){const p=t/OY_MAX*100,won=coinOf(p),nx=won?COINS[COINS.indexOf(won)-1]:COINS[COINS.length-1],
 proj=days?Math.min(OY_MAX,Math.round(t/days*OY_KUN)):0;
 return{p,won,nx,need:nx?Math.max(0,Math.ceil(nx[1]*OY_MAX/100-t)):0,prog:nx?Math.min(100,Math.round(t/(nx[1]*OY_MAX/100)*100)):100,proj,pc:coinOf(proj/OY_MAX*100)}}
function infoHtml(I){const leg=BANDS.map(b=>`<span style="display:inline-flex;align-items:center;gap:6px;margin:0 14px 6px 0"><i style="width:14px;height:14px;border-radius:4px;background:${b[1]};display:inline-block;-webkit-print-color-adjust:exact;print-color-adjust:exact"></i><b>${b[2]}</b> ${b[3]} — ${I.rows.filter(r=>bandOf(r.p)==b).length} ta</span>`).join('');
 const bars=I.rows.map((r,i)=>{const b=bandOf(r.p);return`<div class="ib" title="${esc(r.n)}: ${r.t} ball (${r.p}%) — ${b[2]}"><span class="in"><span class="mut">${i+1}.</span> ${esc(r.n)}</span><span class="it"><i style="width:${Math.max(1,Math.min(100,r.p))}%;background:${b[1]};-webkit-print-color-adjust:exact;print-color-adjust:exact"></i></span><span class="iv"><b>${r.t}</b> / ${OY_MAX} · <b>${r.p}%</b></span><span class="icn">${r.cs?r.cs.won?coinI(r.cs.won,26):r.cs.nx?`<span class="mut" style="font-size:12px">${r.cs.nx[0]}: ${r.cs.prog}%</span>`:'':''}</span></div>`}).join('');
 return `<div style="margin:6px 0 12px">${leg}</div>${bars||'<p class="mut">Bu oy hali ball qo\'yilmagan yoki o\'quvchilar kiritilmagan.</p>'}`}
async function infoView(){const r=mr(S.month),c=CL.find(x=>x.id==S.cls)||{};
 const st=(await q(sb.from('students').select('id,full_name').eq('class_id',S.cls).order('slot'))).filter(x=>x.full_name.trim()),ids=st.map(x=>x.id);
 const ds=ids.length?await q(sb.from('daily_scores').select('*').gte('day',r.a).lte('day',r.b).in('student_id',ids)):[],T={},K={},D={};
 const cr=crOf(c);ds.forEach(x=>{T[x.student_id]=(T[x.student_id]||0)+sumBy(x,cr);const k=K[x.student_id]=K[x.student_id]||{};cr.forEach(c=>k[c.c]=(k[c.c]||0)+(c.c=='att'?(+x.att==1?1:0):(+x[c.c]||0)));if(cr.slice(1).some(c=>x[c.c]!=null)||x.att!=null)(D[x.student_id]=D[x.student_id]||new Set).add(x.day)});
 const rows=st.map(x=>{const t=T[x.id]||0;return{n:x.full_name,t,p:Math.round(t/OY_MAX*1000)/10,k:K[x.id]||{},cs:coinState(t,(D[x.id]||new Set).size)}}).sort((a,b)=>b.t-a.t||a.n.localeCompare(b.n,'uz'));
 // Har bir mezon bo'yicha eng yaxshi 3 o'quvchi (0 ball olganlar kirmaydi)
 const top=cr.map(c=>({c,l:rows.filter(x=>(x.k[c.c]||0)>0).sort((a,b)=>(b.k[c.c]||0)-(a.k[c.c]||0)||b.t-a.t).slice(0,3)}));
 const avg=rows.length?Math.round(rows.reduce((a,x)=>a+x.p,0)/rows.length*10)/10:0;
 S.inf={c:clsLbl(c),m:MON[+S.month.slice(5)-1]+' '+S.month.slice(0,4),rows,avg,top};
 const cn=COINS.map(k=>[k,rows.filter(x=>x.cs.won==k).length]);
 return `<div class="card"><div class="top"><b>Oy:</b><input type="month" id="mo" value="${S.month}"><button class="tab" id="infPdf" style="margin-left:auto">${ic('printer')}PDF / Chop etish</button></div>
 <p class="mut">Har bir o'quvchi bir oyda <b>${cr.map(x=>x.k).join(', ')}</b>${cr===CR1?" (1-sinfda kitob o'qish yo'q: qolgan to'rt mezon bali ×1.25 hisoblanadi)":''} bo'yicha ko'pi bilan <b>${OY_MAX} ball</b> to'playdi. Sinf o'rtachasi: <b>${avg}%</b>.</p>
 <div class="kpi">${BANDS.map(b=>`<div><b>${rows.filter(x=>bandOf(x.p)==b).length}</b><span style="display:inline-flex;align-items:center;gap:5px"><i style="width:10px;height:10px;border-radius:3px;background:${b[1]};display:inline-block"></i>${b[2]} (${b[3]})</span></div>`).join('')}</div></div>
 <div class="card"><b>${ic('award')}Tangalar — ${S.inf.m}</b><p class="mut">Oy yakunida: <b>Oltin</b> — ${COINS[0][1]}% (${COINS[0][1]*OY_MAX/100} ball) va yuqori, <b>Kumush</b> — ${COINS[1][1]}%, <b>Bronza</b> — ${COINS[2][1]}%. Tanga olmaganlar uchun keyingi tangagacha bajarilgan foiz ko'rsatiladi.</p><div class="kpi">${cn.map(([k,n])=>`<div>${coinI(k,40)}<b>${n}</b>${k[0]} tanga</div>`).join('')}</div></div>
 <div class="card"><b>${ic('chart')}${esc(S.inf.c)} — ${S.inf.m}: o'quvchilar ballari</b>${infoHtml(S.inf)}</div>
 <div class="card"><b>${ic('trophy')}Mezonlar bo'yicha eng yaxshi 3 o'quvchi — ${S.inf.m}</b>${topHtml(top)}</div>${await monthsCard().catch(()=>'')}`}
const topHtml=top=>`<div class="tops">${top.map(x=>`<div class="tp3"><b>${ic(x.c.i)}${x.c.k}</b><span class="mut" style="font-size:12px">maks. ${crMax(x.c)} ball</span>${x.l.length?x.l.map((r,i)=>`<div class="tr"><span>${MD3[i]} ${esc(r.n)}</span><b>${r.k[x.c.c]}</b></div>`).join(''):'<div class="mut">Hali ball yo\'q</div>'}</div>`).join('')}</div>`;
// Sinf rahbari uchun: o'quvchilarning ota-ona telefon raqamlarini kiritish
async function phView(){const st=(await q(sb.from('students').select('id,slot,full_name').eq('class_id',S.cls).order('slot'))).filter(x=>x.full_name.trim()),ids=st.map(x=>x.id);
 const sp=ids.length?await q(sb.from('student_private').select('student_id,parent_phone,claimed_by').in('student_id',ids)):[],ph={};sp.forEach(x=>ph[x.student_id]=x);
 const n=st.filter(x=>(ph[x.id]||{}).parent_phone).length,cl=st.filter(x=>(ph[x.id]||{}).claimed_by).length;
 return `<div class="card"><b>${ic('phone')}Ota-onalar telefon raqamlari</b><p class="mut">Har bir o'quvchi qatoriga ota-onasining telefon raqamini yozing (masalan, <b>+998 90 123 45 67</b>) — o'zi saqlanadi. Ota-ona shu raqam bilan platformada <b>«Ota-ona: ro'yxatdan o'tish»</b> orqali kiradi.</p>
 <div class="kpi"><div><b>${st.length}</b>o'quvchi</div><div><b>${n}</b>${ic('phone')}raqam kiritilgan</div><div><b>${cl}</b>${ic('users')}ota-ona ulangan</div></div>
 <div class="wrap"><table><tr><th>№</th><th class="l">O'quvchi</th><th>Ota-ona telefoni</th><th></th><th>Holat</th></tr>${st.map((x,i)=>`<tr><td>${i+1}</td><td class="l">${esc(x.full_name)}</td><td><input class="nm" type="tel" inputmode="tel" style="min-width:150px" data-p="${x.id}" value="${esc((ph[x.id]||{}).parent_phone)}" placeholder="+998..."></td><td><button class="tab pdel" data-id="${x.id}" title="Telefonni o'chirish">${ic('trash')}</button></td><td>${(ph[x.id]||{}).claimed_by?'✅ ulangan':'—'}</td></tr>`).join('')||'<tr><td colspan="5" class="mut">Avval «Baholash» bo\'limida o\'quvchilar ism-familiyasini kiriting.</td></tr>'}</table></div></div>`}
// Fan baholari: fan o'qituvchisi o'z fanidan davomat, uyga vazifa (0–5), darsdagi faollik (0–5) va baho (1–5) qo'yadi.
// Sinf rahbari va admin shu sinfdagi barcha fanlar bo'yicha baholarni ko'radi.
const SSK=[['hw','Uyga vazifa',5,'clip'],['activity','Darsdagi faollik',5,'zap'],['grade','Baho',5,'star']];
const mySubj=()=>(ME.subj&&ME.subj[S.cls])||ME.full_name||'Fan';
async function subjView(){const c=CL.find(x=>x.id==S.cls)||{},ed=!canPh(c)&&ME.role!='admin';
 const st=(await q(sb.from('students').select('id,slot,full_name').eq('class_id',S.cls).order('slot'))).filter(x=>x.full_name.trim()),ids=st.map(x=>x.id);
 const rows=ids.length?await q(sb.from('subject_scores').select('*').eq('day',S.date).in('student_id',ids)).catch(e=>{if(/subject_scores/.test(e.message||''))throw new Error('sql');throw e}):[];
 if(ed){S.ss={};rows.filter(r=>r.teacher_id==ME.id).forEach(r=>S.ss[r.student_id]=r);
  return `<div class="card">${dtBar(`<span class="mut">Fan: <b>${esc(mySubj())}</b>. Davomat: bosib tanlang — ✅ keldi, ❌ kelmadi, <i class=exd></i> sababli. Uyga vazifa va faollik 0–5, baho 1–5.</span>`)}
  <div class="wrap"><table><tr><th>№</th><th class="l">F.I.Sh</th><th><span class="ic">${ic('cal')}</span>Davomat</th>${SSK.map(k=>`<th><span class="ic">${ic(k[3])}</span>${k[1]}</th>`).join('')}</tr>
  ${st.map((x,i)=>{const r=S.ss[x.id]||{};return`<tr><td>${i+1}</td><td class="l">${esc(x.full_name)}</td><td><button class="att satt" data-s="${x.id}">${attIc(r)}</button></td>${SSK.map(k=>`<td><input class="sc ssc" type="number" min="${k[0]=='grade'?1:0}" max="${k[2]}" inputmode="numeric" data-s="${x.id}" data-k="${k[0]}" value="${r[k[0]]??''}"></td>`).join('')}</tr>`}).join('')||'<tr><td colspan="6" class="mut">Sinf rahbari hali o\'quvchilarni kiritmagan.</td></tr>'}</table></div></div>`}
 const subs=[...new Set(rows.map(r=>r.subject||'Fan'))].sort(),M={};rows.forEach(r=>(M[r.student_id]=M[r.student_id]||{})[r.subject||'Fan']=r);
 const cell=r=>r?`<span title="Uyga vazifa: ${r.hw??'—'}, faollik: ${r.activity??'—'}, baho: ${r.grade??'—'}">${attIc(r)}${r.grade!=null?` <b class="${r.grade<=2?'bdx':r.grade==5?'okx':''}">${r.grade}</b>`:''}</span>`:'<span class="mut">—</span>';
 return `<div class="card">${dtBar('<span class="mut">Fan o\'qituvchilari qo\'ygan davomat va baholar (katak ustiga borsangiz — uyga vazifa va faollik).</span>')}
 ${subs.length?`<div class="wrap"><table><tr><th>№</th><th class="l">F.I.Sh</th>${subs.map(x=>`<th>${esc(x)}</th>`).join('')}</tr>${st.map((x,i)=>`<tr><td>${i+1}</td><td class="l">${esc(x.full_name)}</td>${subs.map(k=>`<td>${cell((M[x.id]||{})[k])}</td>`).join('')}</tr>`).join('')}</table></div>`:'<p class="mut">Bu kunga fan o\'qituvchilari hali baho qo\'ymagan.</p>'}</div>`}
const ssSave=(sid,v)=>sb.from('subject_scores').upsert({student_id:sid,day:S.date,teacher_id:ME.id,subject:mySubj(),...v},{onConflict:'student_id,day,teacher_id'}).then(({error})=>{if(error)flash(/subject_scores/.test(error.message)?"Avval Supabase'da yangilanish-16.sql ni ishga tushiring":netMsg(error))});
async function tchView(){const mm=S.month.split('-'),a=S.month+'-01',b=S.month+'-'+String(new Date(Date.UTC(+mm[0],+mm[1],0)).getUTCDate()).padStart(2,'0'),c=CL.find(x=>x.id==S.cls)||{},rp=c.kind=='rep';
 const st=await q(sb.from('students').select('id,slot,full_name').eq('class_id',S.cls).order('slot')),ids=st.map(x=>x.id);
 const[sp,rows]=await Promise.all([q(sb.from('student_private').select('student_id,parent_phone,claimed_by').in('student_id',ids)),q(sb.from(rp?'rep_daily':'daily_scores').select('*').gte('day',a).lte('day',b).in('student_id',ids))]),ph={};sp.forEach(x=>ph[x.student_id]=x);
 const R=st.filter(x=>x.full_name.trim()).map(x=>{const rr=rows.filter(y=>y.student_id==x.id),days=rr.filter(y=>y.att!=null).length,pr=rr.filter(y=>y.att==1).length;
  const pts=rp?(rr.length?Math.round(rr.reduce((q,y)=>q+(+y.grade||0),0)/rr.length*10)/10:0):rr.reduce((q,y)=>q+sum(y),0);return{x,days,pr,pts}});
 const tot=R.reduce((q,r)=>q+r.days,0),pr=R.reduce((q,r)=>q+r.pr,0),cp=canPh(c),np=noPh(c);
 return `<div class="card"><div class="top"><b>Oy:</b><input type="month" id="mo" value="${S.month}"></div><div class="kpi"><div><b>${R.length}</b>o'quvchilar</div><div><b>${tot?Math.round(pr/tot*100)+'%':'—'}</b>${ic('cal')}davomat</div><div><b>${R.length?Math.round(R.reduce((q,r)=>q+r.pts,0)/R.length*10)/10:0}</b>${rp?'o\'rtacha baho':'o\'rtacha ball'}</div></div></div>
 <div class="card"><b>${ic(np?'users':'phone')}O'quvchilar${np?'':' va ota-ona telefonlari'}</b><p class="mut">${np?'':cp?"Ota-ona telefon raqamini yozing (+998 90 123 45 67) — o'zi saqlanadi. Ota-ona shu raqam bilan platformada ro'yxatdan o'tadi.":"Telefon raqamlarni sinf rahbari kiritadi."}</p><div class="wrap"><table><tr><th>№</th><th class="l">F.I.Sh</th>${np?'':'<th>Ota-ona telefoni</th><th></th>'}<th>Davomat</th><th>${rp?'O\'rtacha baho':'Oylik ball'}</th></tr>${R.map(r=>`<tr><td>${r.x.slot}</td><td class="l">${esc(r.x.full_name)}</td>${np?'':cp?`<td><input class="nm" type="tel" inputmode="tel" style="min-width:140px" data-p="${r.x.id}" value="${esc((ph[r.x.id]||{}).parent_phone)}" placeholder="+998..."></td><td><button class="tab pdel" data-id="${r.x.id}" title="Telefonni o'chirish">${ic('trash')}</button></td>`:`<td>${esc((ph[r.x.id]||{}).parent_phone)||'—'}</td><td>${(ph[r.x.id]||{}).claimed_by?'✅':''}</td>`}<td>${r.days?r.pr+'/'+r.days:'—'}</td><td class="tot">${r.pts}</td></tr>`).join('')||'<tr><td colspan="6" class="mut">O\'quvchilar kiritilmagan</td></tr>'}</table></div></div>`}
function rs(f,cb,mx){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,(mx||110)/Math.max(im.width,im.height)),v=document.createElement('canvas');v.width=Math.round(im.width*k);v.height=Math.round(im.height*k);const x=v.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,v.width,v.height);x.drawImage(im,0,0,v.width,v.height);cb(v.toDataURL('image/jpeg',.82))};im.src=r.result};r.readAsDataURL(f)}
const upd=async(tb,v,k,id)=>{const{error}=await sb.from(tb).update(v).eq(k,id);if(error)flash(netMsg(error))};
async function signOut(){await sb.auth.signOut();ME=null;flash('');loginView()}
document.addEventListener('click',async e=>{const t=e.target.closest('[data-c],[data-t],[data-lt],.att,.ratt,.pay,#imb,.imdel,.gimg,#smsauto,#net,#out,#pk,#gc,#lgb,#tgo,#lgo,#rgo,#mkt,#mna,#mnb,.mdel,.tadd,.trem,.pdel,#rty,#absPdf,#latePdf,#leavePdf,#ratePdf,#bkb,#bku,.bdel,#fbs,.fdel,#fbPdf,#payPdf,.payPdf,.kidgo,#stadd,#infPdf,.satt,.tcd,.tcadd,.tpwb,#bkp');if(!t)return;
 if(!sb&&t.matches('#tgo,#lgo,#rgo,#net')){flash("Platforma tayyorlanmoqda — tez orada ishga tushadi.");return}
 const G=t.matches('#tgo,#lgo,#rgo,#mkt,#mna,#gc,#smsauto,#net,.pay,.imdel,.mdel,.tadd,.trem,.pdel,#bku,.bdel,#fbs,.fdel');if(G){if(t.disabled)return;t.disabled=true}try{
 if(t.id=='latePdf'&&S.lateP){const P=S.lateP;printDoc("Kech kelgan o'quvchilar — "+fd(P.d),`<p class="m">Turniketdan ${LATE} dan keyin o'tganlar (1–2-sinflar hisobga olinmaydi)</p>`+P.per.map(x=>`<h2>${esc(x.n)} — ${x.L.length} nafar${x.t?' <span style="font-weight:400;color:#555">('+esc(x.t)+')</span>':''}</h2><table><tr><th style="width:32px">№</th><th>F.I.Sh</th><th style="width:110px">Kelgan vaqti</th><th style="width:110px">Kechikish</th></tr>${x.L.map((r,i)=>`<tr><td class="n">${i+1}</td><td>${esc(r.n)}</td><td>${r.t}</td><td>${mins(r.t,LATE)} daqiqa</td></tr>`).join('')}</table>`).join('')+`<p><b>Jami: ${P.per.reduce((a,x)=>a+x.L.length,0)} nafar</b></p>`);return}
 if(t.id=='leavePdf'&&S.leaveP){const P=S.leaveP;printDoc("Maktabdan ketish davomati — "+fd(P.d),`<p class="m">Ketgan vaqt — turniketdan ${TK_LEAVE} dan keyingi oxirgi o'tish</p>`+P.per.map(x=>`<h2>${esc(x.n)} — ketgan ${x.L.filter(r=>r.l).length} / ${x.L.length}${x.t?' <span style="font-weight:400;color:#555">('+esc(x.t)+')</span>':''}</h2><table><tr><th style="width:32px">№</th><th>F.I.Sh</th><th style="width:90px">Kelgan</th><th style="width:130px">Ketgan</th></tr>${x.L.map((r,i)=>`<tr><td class="n">${i+1}</td><td>${esc(r.n)}</td><td>${r.a}</td><td>${r.l||'qayd etilmagan'}</td></tr>`).join('')}</table>`).join(''));return}
 if(t.id=='absPdf'&&S.absP){const P=S.absP;printDoc("Maktabga kelmagan o'quvchilar — "+fd(P.d),P.per.map(x=>`<h2>${esc(x.n)} — ${x.r.length} nafar${x.t?' <span style="font-weight:400;color:#555">('+esc(x.t)+')</span>':''}</h2><table><tr><th style="width:32px">№</th><th>F.I.Sh</th><th style="width:90px">Holati</th><th style="width:170px">Ota-ona telefoni</th></tr>${x.r.map((r,i)=>`<tr><td class="n">${i+1}</td><td>${esc(r.n)}</td><td>${r.e?'Sababli':'Sababsiz'}</td><td>${esc(r.p)||'—'}</td></tr>`).join('')}</table>`).join('')+`<p><b>Jami: ${P.per.reduce((a,x)=>a+x.r.length,0)} nafar</b></p>`);return}
 if(t.id=='ratePdf'&&S.rate){const[y,m]=S.rate.m.split('-');printDoc("O'qituvchilar reytingi — "+MON[+m-1]+' '+y,`<table><tr><th>O'rin</th><th>O'qituvchi</th><th>Sinflar</th><th>Sinf-kunlar</th><th>O'z vaqtida</th><th>Kechikkan</th><th>Bajarilmagan</th><th>Bajarilish</th><th>Ball</th></tr>${S.rate.d.map((x,j)=>`<tr><td class="n">${j+1}</td><td>${esc(x.full_name)}</td><td>${esc(x.classes||'')}</td><td class="n">${x.class_days}</td><td class="n">${x.on_time}</td><td class="n">${x.late}</td><td class="n">${x.missed}</td><td class="n">${x.class_days?Math.round(x.on_time/x.class_days*100)+'%':'—'}</td><td class="n"><b>${x.score}</b></td></tr>`).join('')}</table><p class="m">Baholar har kuni soat 21:00 gacha to'liq qo'yilishi kerak. Ball: 100 − 2 × kechikkan − 5 × bajarilmagan sinf-kunlar.</p>`);return}
 if(t.id=='fbs'){const b=$('fbt').value.trim();if(b.length<3){flash('Fikringizni yozing');return}const c=S.kc||{},an=$('fba').checked;
  const{error}=await sb.from('feedback').insert({student_id:ME.student_id||null,student_name:S.kn||null,class_id:c.id||null,parent_name:an?null:(ME.full_name||null),phone:an?null:(ME.phone||null),category:$('fbk').value,body:b});
  if(error){flash(/row-level|policy/i.test(error.message)?"Bugun yuborish chegarasiga yetdingiz (kuniga 5 ta). Ertaga yana yozishingiz mumkin.":netMsg(error));return}flash('✅ Rahmat! Fikringiz maktab ma\'muriyatiga yuborildi.');render();return}
 if(t.classList.contains('fdel')){if(!confirm("Fikr o'chirilsinmi?"))return;const{error}=await sb.from('feedback').delete().eq('id',t.dataset.id);if(error){flash(netMsg(error));return}render();return}
 if(t.id=='fbPdf'&&S.fbP){const[y,m]=S.fbP.m.split('-');printDoc("Ota-onalar fikr-mulohazalari — "+MON[+m-1]+' '+y,S.fbP.g.map(x=>`<h2>${esc(x.n)} — ${x.r.length} ta</h2><table><tr><th style="width:28px">№</th><th style="width:105px">Sana</th><th style="width:95px">Turi</th><th>Fikr-mulohaza</th><th style="width:150px">Ota-ona / o'quvchi</th></tr>${x.r.map((f,i)=>`<tr><td class="n">${i+1}</td><td>${fdt(f.created_at)}</td><td>${esc(f.category)}</td><td style="white-space:pre-wrap">${esc(f.body)}</td><td>${f.parent_name?esc(f.parent_name):"Ism ko'rsatilmagan"}${f.phone?'<br>'+esc(f.phone):''}${f.student_name?'<br>'+esc(f.student_name):''}</td></tr>`).join('')}</table>`).join('')+`<p><b>Jami: ${S.fbP.g.reduce((a,x)=>a+x.r.length,0)} ta</b></p>`);return}
 if(t.classList.contains('payPdf')&&S.payKids){const k=S.payKids[+t.dataset.k];if(k)S.payH={kid:k.full_name,cls:k.cls,rows:k.rows}}
 if((t.id=='payPdf'||t.classList.contains('payPdf'))&&S.payH){const P=S.payH,pd=P.rows.filter(r=>r.paid).length;printDoc("To'lovlar tarixi — "+P.kid,`<p><b>O'quvchi:</b> ${esc(P.kid)}<br><b>Sinf:</b> ${esc(P.cls)}</p><table><tr><th style="width:32px">№</th><th>Oy</th><th>Holati</th><th>To'langan sana</th></tr>${P.rows.map((r,i)=>`<tr><td class="n">${i+1}</td><td>${r.m}</td><td>${r.paid?"To'langan":"To'lanmagan"}</td><td>${r.on?fd2(r.on):'—'}</td></tr>`).join('')}</table><p><b>To'langan oylar: ${pd} ta, to'lanmagan: ${P.rows.length-pd} ta</b></p>`);return}
 if(t.id=='stadd'){t.disabled=true;flush();const{error}=await sb.rpc('add_student',{p_class:S.cls});if(error){t.disabled=false;flash(error.code=='PGRST202'?"Avval Supabase'da yangilanish-10.sql ni ishga tushiring":netMsg(error));return}await render();const n=[...document.querySelectorAll('.nm[data-n]')].pop();if(n){n.focus();n.scrollIntoView({block:'center'})}return}
 if(t.id=='infPdf'&&S.inf){const I=S.inf;printDoc(`Oylik ballar — ${I.c}, ${I.m}`,`<style>.ib{display:flex;align-items:center;gap:10px;margin:5px 0}.in{width:190px;flex:none}.it{flex:1;height:14px;background:#eef0f4;border-radius:4px;overflow:hidden;display:block}.it i{display:block;height:100%;border-radius:0 4px 4px 0}.iv{width:150px;flex:none;text-align:right}.icn{width:80px;flex:none;text-align:center}.coin{display:inline-grid;place-items:center;width:26px;height:26px;border-radius:50%;font-weight:800;color:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}.coin.g{background:#d4a017}.coin.s{background:#aeb6bf;color:#2b3440}.coin.b{background:#b8733a}.mut{color:#777}</style><p class="m">Maksimal ball: ${OY_MAX} · Sinf o'rtachasi: ${I.avg}%</p>${infoHtml(I)}<h2>Mezonlar bo'yicha eng yaxshi 3 o'quvchi</h2><table><tr><th>Mezon</th><th>🥇 1-o'rin</th><th>🥈 2-o'rin</th><th>🥉 3-o'rin</th></tr>${I.top.map(x=>`<tr><td><b>${x.c.k}</b> (maks. ${crMax(x.c)})</td>${[0,1,2].map(i=>`<td>${x.l[i]?esc(x.l[i].n)+' — <b>'+x.l[i].k[x.c.c]+'</b>':'—'}</td>`).join('')}</tr>`).join('')}</table>${S.mon?`<h2>Oylar kesimida ballar</h2><table><tr><th>№</th><th>F.I.Sh</th>${S.mon.out.map(k=>`<th>${MON[+k.slice(5)-1].slice(0,3)}</th>`).join('')}<th>Jami</th></tr>${S.mon.rows.map((r,i)=>`<tr><td class="n">${i+1}</td><td>${esc(r.n)}</td>${S.mon.out.map(k=>`<td class="n">${r.m[k]??'—'}</td>`).join('')}<td class="n"><b>${r.y}</b></td></tr>`).join('')}</table>`:''}`);return}
 if(t.classList.contains('satt')){const sid=t.dataset.s,r=S.ss[sid]||(S.ss[sid]={}),v=attNext(r);Object.assign(r,v);t.innerHTML=attIc(r);await ssSave(sid,v);return}
 if(t.id=='bkp'){await backup(t);render();return}
 if(t.classList.contains('tpwb')){const u=t.dataset.u,i=$('tpw'+u),pw=i.value.trim();if(pw.length<6){flash("Parol kamida 6 belgidan iborat bo'lsin");i.focus();return}
  const nm=(t.closest('.tch').querySelector('.tnm')||{}).value||'';if(!confirm(`${nm} uchun yangi parol: ${pw}\nSaqlansinmi? Eski parol bilan endi kira olmaydi.`))return;
  t.disabled=true;const{error}=await sb.rpc('admin_set_password',{p_id:u,p_pw:pw});t.disabled=false;
  if(error){flash(error.code=='PGRST202'?"Avval Supabase'da yangilanish-18.sql ni ishga tushiring":netMsg(error));return}
  i.value='';$('tpr'+u).innerHTML=`✅ Yangi parol: <b class="code" style="font-size:15px">${esc(pw)}</b> <span class="mut">— o'qituvchiga ayting (bu yozuv sahifa yangilanguncha turadi)</span>`;flash("✅ Parol o'zgartirildi");return}
 if(t.classList.contains('tcadd')){const u=t.dataset.u,c=+$('tcn'+u).value,role=t.parentNode.querySelector('.tcr').value,sub=$('tcf'+u).value.trim();if(!c){flash("Sinf yoki guruhni tanlang");return}
  if((S.tAll||[]).some(x=>x.user_id==u&&x.class_id==c)){flash("Bu sinf allaqachon biriktirilgan");return}
  let{error}=await sb.from('teacher_classes').insert({user_id:u,class_id:c,role:'fan',...(sub?{subject:sub}:{})});if(error&&/subject/.test(error.message))({error}=await sb.from('teacher_classes').insert({user_id:u,class_id:c,role:'fan'}));if(error){flash(netMsg(error));return}
  (S.tAll=S.tAll||[]).push({user_id:u,class_id:c,role:'fan'});if(role=='rahbar')await tRole(u,c,'rahbar');await tBack(u);flash("✅ Sinf qo'shildi");return}
 if(t.classList.contains('tcd')){if(!confirm("O'qituvchi bu sinfdan olib tashlansinmi?"))return;const{error}=await sb.from('teacher_classes').delete().eq('user_id',t.dataset.u).eq('class_id',t.dataset.c);if(error)flash(netMsg(error));else await tBack(t.dataset.u);return}
 if(t.classList.contains('kidgo')){const{error}=await sb.rpc('switch_kid',{p_id:t.dataset.id});if(error){flash(netMsg(error));return}await loadMe(ME.id);scrollTo(0,0);return}
 if(t.id=='bkb'){$('bkf').click();return}
 if(t.id=='bku'){const f=S.bkf,ti=$('bkt').value.trim();if(!f){flash('Avval faylni tanlang');return}if(!ti){flash('Kitob nomini yozing');return}
  const ext=((f.name.match(/\.(pdf|docx?)$/i)||[])[1]||'').toLowerCase();if(!ext){flash('Faqat PDF yoki Word (.doc, .docx) fayl yuklash mumkin');return}if(f.size>50*1048576){flash("Fayl hajmi 50 MB dan oshmasligi kerak");return}
  const g=grpOf(CL.find(x=>x.id==S.cls)||{}),cid=$('bkc').value?+$('bkc').value:null,ct={pdf:'application/pdf',doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document'}[ext],path=`${g}/${cid||'guruh'}/${Date.now()}.${ext}`;
  flash('⏳ Kitob yuklanmoqda ('+fsz(f.size)+')… Sahifani yopmang.');const{error}=await sb.storage.from(BK).upload(path,f,{contentType:ct,upsert:false});if(error){flash(netMsg(error));return}
  const{error:e2}=await sb.from('books').insert({grp:g,class_id:cid,title:ti,path,size:f.size,mime:ct});if(e2){await sb.storage.from(BK).remove([path]);flash(netMsg(e2));return}
  S.bkf=null;flash('✅ Kitob yuklandi: '+ti);render();return}
 if(t.classList.contains('bdel')){if(!confirm("Kitob o'chirilsinmi?"))return;const{error}=await sb.from('books').delete().eq('id',t.dataset.id);if(error){flash(netMsg(error));return}await sb.storage.from(BK).remove([t.dataset.p]);flash("Kitob o'chirildi");render();return}
 if(t.id=='rty'){$('view').innerHTML='<div class="ld"><i class="spin"></i>Yuklanmoqda…</div>';flash('');boot()}
 else if(t.dataset.lt!=null){S.lt=+t.dataset.lt;loginView()}else if(t.dataset.c){const nc=CL.find(c=>c.id==+t.dataset.c),oc=CL.find(c=>c.id==S.cls);if((nc&&nc.kind)!=(oc&&oc.kind))S.tab=0;S.cls=+t.dataset.c;render()}else if(t.dataset.t!=null){S.tab=+t.dataset.t;render()}
 else if(t.id=='out')signOut();else if(t.id=='pk'){S.peek=true;render()}else if(t.id=='lgb')$('lg').click();
 else if(t.id=='imb')$('imf').click();
 else if(t.classList.contains('gimg'))t.classList.toggle('big');
 else if(t.classList.contains('imdel')){const{error}=await sb.from('class_images').delete().eq('id',t.dataset.id);if(error)flash(netMsg(error));else render()}
 else if(t.id=='net'){try{const r=await fetch(API+'/auth/v1/health',{headers:{apikey:KEY}});flash('Ulanish bor: '+r.status+' '+(await r.text()).slice(0,60))}catch(e){flash('Ulanish yo\'q: '+e.message)}}
 else if(t.id=='gc'){const a=new Uint32Array(6);crypto.getRandomValues(a);const code=[...a].map(v=>'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[v%31]).join('');const{error}=await sb.from('class_codes').upsert({class_id:S.cls,code});if(error)flash(netMsg(error));else render()}
 else if(t.id=='smsauto'){if(!S.cfg)return;const n=!S.cfg.enabled,{error}=await sb.from('sms_settings').update({enabled:n}).eq('id',1);if(error){flash(netMsg(error));return}S.cfg.enabled=n;t.textContent=n?"✅ Yoqilgan":"⛔ O'chirilgan";t.classList.toggle('on',n)}
 else if(t.classList.contains('pay')){const x=S.pay.find(r=>r.id==t.dataset.id),n=!x.paid;
  const{error}=await sb.from('payments').upsert({student_id:x.id,month:S.pm+'-01',paid:n,paid_on:n?nowT().d:null},{onConflict:'student_id,month'});
  if(error){flash(netMsg(error));return}x.paid=n;x.on=n?nowT().d:'';S.pTot.paid+=n?1:-1;$('payBox').innerHTML=payHtml()}
 else if(t.classList.contains('ratt')){const sid=t.dataset.rid,r=S.rd[sid]||(S.rd[sid]={}),v=attNext(r);Object.assign(r,v);t.innerHTML=attIc(r);
  await attSave('rep_daily',sid,S.date,v)}
 else if(t.classList.contains('att')){const id=t.dataset.i,r=S.sc[id]||(S.sc[id]={student_id:id,day:S.date}),v=attNext(r);Object.assign(r,v);t.innerHTML=attIc(r);$('t'+id).textContent=sum(r);await attSave('daily_scores',id,S.date,v)}
 else if(t.id=='tgo'){const email=$('em').value.trim(),password=$('pw').value;if(!email||!password){flash("Email va parolni kiriting");return}
  const{data,error}=await sb.auth.signInWithPassword({email,password});if(error){flash(errTxt(error));return}await loadMe(data.user.id)}
 else if(t.id=='lgo'){const raw=$('lph').value.trim(),password=$('lpw').value;
  if(raw.includes('@')){const{data,error}=await sb.auth.signInWithPassword({email:raw,password});if(error){flash(errTxt(error));return}await loadMe(data.user.id);return}
  const p=PE(raw);if(!p||!password){flash("Telefon raqam (9 raqam) va parolni kiriting");return}
  let k1='o';try{k1=localStorage.getItem(P+'pf'+p)||'o'}catch(e){}const k2=k1=='o'?'p':'o';
  let r=await sb.auth.signInWithPassword({email:EM(k1,p),password}),k=k1;if(r.error&&!authBad(r.error)){r=await sb.auth.signInWithPassword({email:EM(k2,p),password});k=k2}
  if(r.error){flash(authBad(r.error)||"Telefon yoki parol noto'g'ri. Birinchi marta bo'lsangiz, «Ota-ona: ro'yxatdan o'tish» ni bosing");return}try{localStorage.setItem(P+'pf'+p,k)}catch(e){}await loadMe(r.data.user.id)}
 else if(t.id=='rgo'){const p=PE($('rph').value),password=$('rpw').value,name=$('rn').value.trim();if(!name||!p||password.length<6){flash("Ism familiya, telefon (9 raqam) va kamida 6 belgili parolni kiriting");return}
  const{data:st,error:e0}=await sb.rpc('phone_status',{p_phone:p});if(e0){flash("Baza yangilanmagan (6-SQL ishga tushirilmagan): "+e0.message);return}
  if(st=='none'){flash("Bu telefon raqam maktab ro'yxatida yo'q. Sinf rahbari raqamni o'quvchi ma'lumotiga yozishi kerak");return}
  let r=await sb.auth.signUp({email:EM('p',p),password});
  if(r.error&&/registered|exists/i.test(r.error.message)){r=await sb.auth.signInWithPassword({email:EM('p',p),password});if(r.error){flash(authBad(r.error)||"Bu raqam oldin ro'yxatdan o'tgan, parol boshqacha. «Kirish» bo'limidan kiring");return}}
  else if(r.error){flash(errTxt(r.error));return}
  if(!r.data.session){flash("Admin Supabase'da «Confirm email» ni o'chirishi kerak");return}
  const{error:e2}=await sb.rpc('register_parent',{p_name:name,p_phone:p});if(e2){flash(netMsg(e2));return}await loadMe(r.data.user.id)}
 else if(t.id=='mkt'){const n=$('tn2').value.trim(),p=PE($('tph').value),pw=$('tpw').value;if(!n||!p||pw.length<6){flash("Ism, telefon va kamida 6 belgili parol kiriting");return}if(!$('trl').value){flash("Shu sinfdagi vazifasini tanlang: Sinf rahbari yoki Fan o'qituvchisi");return}
  const tmp=supabase.createClient(API,KEY,{auth:{persistSession:false,autoRefreshToken:false,storageKey:'tmp-signup'}});
  const{data,error}=await tmp.auth.signUp({email:EM('o',p),password:pw});if(error){flash(/registered|exists/i.test(error.message)?"Bu telefon bilan akkaunt allaqachon bor":error.message);return}
  const{error:e2}=await sb.from('profiles').upsert({id:data.user.id,role:'teacher',class_id:S.cls,full_name:n,phone:p});if(e2){flash(netMsg(e2));return}
  const cs=[S.cls].concat([...document.querySelectorAll('.tcx:checked')].map(x=>+x.value)),rl=$('trl').value;if(!rl){flash("Shu sinfdagi vazifasini tanlang: Sinf rahbari yoki Fan o'qituvchisi");return}let{error:e3}=await sb.from('teacher_classes').upsert(cs.map(c=>({user_id:data.user.id,class_id:c,role:c==S.cls?rl:'fan'})));
  if(e3&&/role/i.test(e3.message))({error:e3}=await sb.from('teacher_classes').upsert(cs.map(c=>({user_id:data.user.id,class_id:c}))));if(e3){flash(netMsg(e3));return}flash("✅ O'qituvchi akkaunti yaratildi: "+n);render()}
 else if(t.classList.contains('tadd')){const v=$('ts'+t.dataset.u).value;if(!v){flash('Qo\'shiladigan sinfni tanlang');return}let{error}=await sb.from('teacher_classes').upsert({user_id:t.dataset.u,class_id:+v,role:'fan'},{onConflict:'user_id,class_id',ignoreDuplicates:true});if(error&&/role|conflict/i.test(error.message))({error}=await sb.from('teacher_classes').upsert({user_id:t.dataset.u,class_id:+v}));if(error)flash(netMsg(error));else{flash("✅ Sinf qo'shildi");render()}}
 else if(t.classList.contains('trem')){const{error}=await sb.from('teacher_classes').delete().eq('user_id',t.dataset.u).eq('class_id',S.cls);if(error)flash(netMsg(error));else render()}
 else if(t.classList.contains('pdel')){if(!confirm("Telefon raqam o'chirilsin? Ota-onaning kirishi ham bekor bo'ladi."))return;if(await setPh(t.dataset.id,''))render()}
 else if(t.id=='mnb')$('mnf').click();
 else if(t.id=='mna'){const nm=$('mnt').value.trim();if(!nm){flash("Taom nomi/retseptini yozing");return}
  const{error}=await sb.from('menu').insert({day:$('mnd').value,meal:$('mnm').value,name:nm,photo:S.mph||null});S.mph=null;if(error)flash(netMsg(error));else render()}
 else if(t.classList.contains('mdel')){const{error}=await sb.from('menu').delete().eq('id',t.dataset.id);if(error)flash(netMsg(error));else render()}}finally{if(G)t.disabled=false}});
document.addEventListener('change',async e=>{const t=e.target;
 if(t.classList.contains('tcr')&&t.dataset.c){const ok=await tRole(t.dataset.u,+t.dataset.c,t.value);if(ok){await tBack(t.dataset.u);flash("✅ Vazifa saqlandi")}else t.value=t.value=='rahbar'?'fan':'rahbar';return}
 if(t.classList.contains('trole')){const{error}=await sb.from('teacher_classes').upsert({user_id:t.dataset.u,class_id:S.cls,role:t.value},{onConflict:'user_id,class_id'});flash(error?netMsg(error):"✅ Vazifa saqlandi");return}
 if(t.classList.contains('pdt')&&t.value){const x=S.pay.find(r=>r.id==t.dataset.id);const{error}=await sb.from('payments').upsert({student_id:x.id,month:S.pm+'-01',paid:true,paid_on:t.value},{onConflict:'student_id,month'});if(error){flash(netMsg(error));return}x.on=t.value;flash("✅ To'lov sanasi saqlandi");return}
 if(t.id=='bkf'){S.bkf=t.files[0]||null;$('bkn').textContent=S.bkf?S.bkf.name+' · '+fsz(S.bkf.size):'';return}
 if(t.id=='sp')['pw','lpw','rpw','tpw'].forEach(i=>{const x=$(i);if(x)x.type=t.checked?'text':'password'});
 if(t.id=='dt'&&t.value){S.date=t.value;S.month=t.value.slice(0,7);render()}
 if(t.id=='phk'){$('phw').innerHTML=payHist(+t.value);return}
 if(t.id=='kid'){const{error}=await sb.rpc('switch_kid',{p_id:t.value});if(error)flash(netMsg(error));else await loadMe(ME.id);return}
 if(t.id=='mnf'&&t.files[0])rs(t.files[0],u=>{S.mph=u;$('mnp').textContent='✅ rasm tanlandi'},240);
 if(t.id=='mo'&&t.value){S.month=t.value;render()}
 if(t.id=='pm'&&t.value){S.pm=t.value;render()}
 if(t.id=='imf'&&t.files[0])rs(t.files[0],async u=>{const{error}=await sb.from('class_images').insert({class_id:S.cls,caption:($('icap')||{}).value||'',img:u});if(error)flash(netMsg(error));else render()},1000);
 if(t.id=='lg'&&t.files[0])rs(t.files[0],async u=>{await upd('classes',{logo:u},'id',S.cls);CL.find(c=>c.id==S.cls).logo=u;const lc=logoGet();lc[S.cls]=u;logoPut(lc);render()})});
document.addEventListener('input',e=>{const t=e.target,d=t.dataset;
 if(t.classList.contains('ssc')){const k=SSK.find(x=>x[0]==d.k),n=+t.value;if(t.value!==''&&n>k[2])t.value=k[2];if(t.value!==''&&n<(d.k=='grade'?1:0))t.value=d.k=='grade'?1:0;
  const sid=d.s,val=t.value===''?null:+t.value;(S.ss[sid]=S.ss[sid]||{})[d.k]=val;dbn('ss'+sid+d.k,()=>ssSave(sid,{[d.k]:val}),350);return}
 if(t.classList.contains('tnm')){const u=d.u,v=t.value.trim();if(!v)return;dbn('tnm'+u,async()=>{let{error}=await sb.rpc('set_teacher_name',{p_id:u,p_name:v});
  if(error&&error.code=='PGRST202')({error}=await sb.from('profiles').update({full_name:v}).eq('id',u));if(error)flash(netMsg(error));else{const c=t.closest('.tch');if(c)c.dataset.n=v.toLowerCase();flash("✅ Ism saqlandi")}},700);return}
 if(t.classList.contains('tcs')){dbn('tcs'+d.u+d.c,async()=>{const{error}=await sb.from('teacher_classes').update({subject:t.value.trim()||null}).eq('user_id',d.u).eq('class_id',d.c);if(error)flash(/subject/.test(error.message)?"Avval Supabase'da yangilanish-16.sql ni ishga tushiring":netMsg(error))},500);return}
 if(t.id=='tq'){const v=S.tq=t.value.trim().toLowerCase();document.querySelectorAll('.tch').forEach(x=>x.style.display=!v||x.dataset.n.includes(v)?'':'none');return}
 if(d.rd){const m=RD[d.rd].m,n=+t.value;if(t.value!==''&&n>m)t.value=m;if(t.value!==''&&n<0)t.value=0;
  const sid=d.rid,f=d.rd,day=S.date,val=t.value===''?null:+t.value;
  dbn('rd'+sid+f,async()=>{const{error}=await sb.from('rep_daily').upsert({student_id:sid,day,[f]:val},{onConflict:'student_id,day'});if(error)flash(netMsg(error))},350);return}
 if(t.id=='smst'){try{localStorage.setItem(P+'sms',t.value)}catch(x){}S.tpl=t.value;if(S.cfg)dbn('tpl',()=>upd('sms_settings',{template:t.value},'id',1));if($('payBox')&&S.pay)$('payBox').innerHTML=payHtml();return}
 if(t.id=='cn'||t.id=='tn'){const f=t.id=='cn'?'name':'teacher_name';CL.find(c=>c.id==S.cls)[f]=t.value;dbn(t.id,()=>upd('classes',{[f]:t.value},'id',S.cls));if(f=='name')chips();return}
 if(d.n){dbn('n'+d.n,async()=>{const{error}=await sb.rpc('set_student_name',{p_id:String(d.n),p_name:t.value});if(error)error.code=='PGRST202'?upd('students',{full_name:t.value},'id',d.n):flash(netMsg(error))});return}
 if(d.p){dbn('p'+d.p,()=>setPh(d.p,t.value.trim()));return}
 if(d.x){dbn('x'+d.x,()=>upd('students',{ext_id:t.value.trim()||null},'id',d.x));return}
 if(d.i&&d.k){const day=S.date;let v=t.value,m=CR.find(x=>x.c==d.k).m;if(v!==''){v=Math.max(0,Math.min(m,Math.round(+v)));if(String(v)!==t.value)t.value=v}const val=v===''?null:+v,r=S.sc[d.i]||(S.sc[d.i]={});r[d.k]=val;$('t'+d.i).textContent=sum(r);
  dbn('s'+d.i+d.k,async()=>{const{error}=await sb.from('daily_scores').upsert({student_id:d.i,day,[d.k]:val},{onConflict:'student_id,day'});if(error)flash(netMsg(error))},350)}});
document.addEventListener('toggle',e=>{const d=e.target;if(d.dataset&&d.dataset.g)S.open[d.dataset.g]=d.open},true);
let lastD=today;
function tick(){const t=nowT();$('clk').innerHTML=`<b>${t.hms}</b><span>${t.wd}, ${t.lbl} · Toshkent vaqti</span>`;
 if(t.d!==lastD){if(S.date==lastD){S.date=t.d;S.month=t.d.slice(0,7)}lastD=t.d;if(ME){render();sideView()}}
 if(ME&&ME.role=='admin'&&t.s==0&&t.h>=9&&(t.m%5==0||(t.h==9&&t.m==0)))sideView();
 const sc=$('scd');if(sc){const r=32400-(t.h*3600+t.m*60+t.s);if(r<=0){sc.removeAttribute('id');sideView()}else sc.textContent=[r/3600|0,(r%3600)/60|0,r%60].map(v=>String(v).padStart(2,'0')).join(':')}
 const cd=$('cd');if(cd){const r=36000-(t.h*3600+t.m*60+t.s);if(r<=0){cd.removeAttribute('id');render()}else cd.textContent=[r/3600|0,(r%3600)/60|0,r%60].map(v=>String(v).padStart(2,'0')).join(':')}}
addEventListener('unhandledrejection',e=>flash(netMsg(e.reason)));
addEventListener('offline',()=>flash("⚠️ Internet uzildi. Ulanmaguncha kiritilgan ma'lumotlar saqlanmaydi."));addEventListener('online',()=>flash("✅ Internet qayta ulandi"));
document.addEventListener('visibilitychange',()=>{if(document.hidden)flush()});
addEventListener('beforeunload',e=>{flush();if(PEND){e.preventDefault();e.returnValue=''}});
// Veb-ilova (PWA): o'rnatish tugmasi va yangilanishlarni avtomatik olish
let IP=null;const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();IP=e;$('inst').style.display=''});
addEventListener('appinstalled',()=>{IP=null;$('inst').style.display='none';flash("✅ Ilova o'rnatildi. Endi telefon ekranidagi "+M.qisqa+" belgisidan oching.")});
document.addEventListener('click',async e=>{if(!e.target.closest('#inst')||!IP)return;IP.prompt();const r=await IP.userChoice;if(r.outcome=='accepted')$('inst').style.display='none';IP=null});
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));
setInterval(tick,1000);tick();boot();
