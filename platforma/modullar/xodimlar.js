// Modul: ota-ona parolini tiklash va xodimlar ruxsatlari (sozlama: modullar.xodimlar). Baza: yurt/sql/19-parol-va-xodimlar.sql
//  * Kirish oynasida «Parolni unutdingizmi?»: ota-ona so'rov yuboradi, maktabdan 6 xonali kod oladi va o'zi yangi parol qo'yadi.
//  * Admin bo'limi «Parolni tiklash»: so'rovlar va kod berish (bosh admin, «parol» ruxsati bor xodim; sinf rahbari — o'z sinfi).
//  * Admin bo'limi «Xodimlar va ruxsatlar» (faqat bosh admin): buxgalter, kuzatuvchi, yordamchi admin profillari,
//    oxirgi kirish, faollik, ism va parolni o'zgartirish, turini almashtirish, qo'shimcha ruxsatlar.
(function(){if(!ON('xodimlar'))return;
const PERMS=[['parol','key',"Ota-onalar parolini tiklash","Parolini unutgan ota-onaga tiklash kodi beradi"],
 ['telefon','phone',"O'quvchilar va ota-ona telefonlari","Barcha sinflarda o'quvchi ismi, ota-ona telefoni, yangi o'quvchi qo'shish"],
 ['baho','edit',"Baholar va davomat","Barcha sinflarda baho va davomatni tahrirlash"],
 ['tolov','card',"To'lovlar va xarajatlar","To'lov qabul qilish, kvitansiya, xarajat yozish"],
 ['taom','food','Taomnoma',"Kunlik ovqatlanish menyusini kiritish"],
 ['fikr','msg','Fikr-mulohazalar',"Ota-onalar murojaatlarini o'qish"],
 ['zaxira','down','Zaxira nusxa',"Ma'lumotlarni faylga yuklab olish"]];
const KIND={admin2:['shield','Yordamchi admin','#7048e8',"Boshqaruv panelini ko'radi, berilgan ruxsatlar bo'yicha o'zgartiradi"],
 obs:['eye','Kuzatuvchi','#0b7285',"Hamma narsani ko'radi; ruxsat berilmasa hech narsani o'zgartirmaydi"],
 bux:['card','Buxgalter','#c2255c',"To'lov va xarajatlar sahifasi; qo'shimcha: parol, taomnoma, fikrlar"]};
const BUXP=['parol','taom','fikr'],MAIN=()=>!!ME&&ME.role=='admin'&&!ME._obs,YP=k=>typeof YPERM=='function'&&YPERM(k);
const fph=p=>{const d=String(p||'').replace(/\D/g,'').slice(-9);return d.length==9?`+998 ${d.slice(0,2)} ${d.slice(2,5)} ${d.slice(5,7)} ${d.slice(7)}`:esc(p||'')};
const dt=v=>v?new Date(v).toLocaleString('ru-RU',{timeZone:TZ,day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'}):'';
const NOSQL="Avval Supabase'da yurt/sql/19-parol-va-xodimlar.sql faylini ishga tushiring",em=e=>e&&e.code=='PGRST202'?NOSQL:netMsg(e);
Object.assign(IC,{eye:IC.eye||'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',copy:IC.copy||'<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'});
const st=document.createElement('style');st.textContent=`
.pw-ov{position:fixed;inset:0;z-index:120;display:grid;place-items:center;padding:16px;background:rgba(15,23,42,.55)}
.pw-m{position:relative;width:min(440px,100%);max-height:calc(100vh - 32px);overflow:auto;padding:24px;border-radius:20px;background:var(--card);color:var(--ink);box-shadow:0 30px 60px -20px rgba(0,0,0,.5)}
.pw-m h3{margin:0 0 6px;font-size:20px;display:flex;align-items:center;gap:10px}.pw-m h3 .i{color:#e8590c}.pw-m p{margin:0 0 12px;color:var(--mut);font-size:14px}
.pw-m label{display:block;margin:10px 0 4px;font-size:13px;font-weight:700}.pw-m .fld{width:100%;box-sizing:border-box}
.pw-m .btn{width:100%;justify-content:center;margin-top:14px}.pw-x{position:absolute;top:12px;right:12px;border:0;background:transparent;color:var(--mut);font-size:22px;cursor:pointer}
.pw-st{display:flex;gap:6px;margin:0 0 14px}.pw-st button{flex:1;padding:9px;border:1.5px solid var(--ln);border-radius:12px;background:var(--card);color:var(--ink);font:inherit;font-size:13px;font-weight:700;cursor:pointer}
.pw-st button.on{border-color:var(--b1,#1a5cff);background:color-mix(in srgb,var(--b1,#1a5cff) 10%,var(--card));color:var(--b1,#1a5cff)}
.pw-ms{margin-top:12px;padding:12px 14px;border-radius:12px;font-size:14px;background:var(--zb)}.pw-ms.ok{background:color-mix(in srgb,#12a150 12%,var(--card))}.pw-ms.er{background:color-mix(in srgb,#e5484d 12%,var(--card))}
.pw-code{font-size:40px;font-weight:800;letter-spacing:8px;text-align:center;padding:14px;margin:10px 0;border-radius:16px;background:color-mix(in srgb,#e8590c 10%,var(--card));color:#c2410c;font-variant-numeric:tabular-nums}
.pw-msg{white-space:pre-wrap;font-size:13px;padding:12px;border-radius:12px;background:var(--zb)}
.pw-ac{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.pw-ac>*{flex:1 1 0;display:flex;align-items:center;justify-content:center;gap:6px;height:44px;padding:0 10px;margin:0!important;box-sizing:border-box;text-decoration:none;width:auto!important;white-space:nowrap}.pw-ac a{border-radius:12px;background:var(--ac2,#eaf1ff);color:var(--b1,#1a5cff);font-weight:700;font-size:14px}
.pw-f{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.pw-f .fld{flex:1;min-width:220px}
.pw-r{display:flex;align-items:center;gap:12px;padding:12px 0;border-top:1px solid var(--ln)}.pw-r>div{flex:1;display:grid;gap:2px;min-width:0}.pw-r small{font-size:12px}
.xs{border-left:5px solid var(--k)}.xs .top{flex-wrap:wrap}
.xs-av{width:48px;height:48px;flex:none;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:800;background:var(--k)}
.xs-h{flex:1;min-width:200px;display:grid;gap:2px}.xs-h .cname{font-size:18px;font-weight:700;width:min(100%,340px)}
.xs-b{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;border-radius:999px;font-size:13px;font-weight:700;color:var(--k);background:color-mix(in srgb,var(--k) 12%,var(--card))}
.xs-st{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}.xs-st span{padding:6px 10px;border-radius:10px;background:var(--zb);font-size:12.5px}.xs-st b{font-weight:700}
.xs-pm{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px;margin:10px 0}
.xs-pm label{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;border:1.5px solid var(--ln);border-radius:12px;cursor:pointer}
.xs-pm label:has(input:checked){border-color:var(--k);background:color-mix(in srgb,var(--k) 7%,var(--card))}
.xs-pm label.off{opacity:.45;cursor:not-allowed}.xs-pm input{width:18px;height:18px;margin-top:2px;flex:none;accent-color:var(--k)}
.xs-pm b{display:flex;gap:6px;align-items:center;font-size:13.5px}.xs-pm small{display:block;color:var(--mut);font-size:12px;margin-top:2px}
.xs-sum{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px}
.xs-sum div{display:flex;align-items:center;gap:12px;padding:14px;border-radius:14px;background:color-mix(in srgb,var(--k) 8%,var(--card));border:1px solid color-mix(in srgb,var(--k) 25%,var(--ln))}
.xs-sum b{font-size:24px}.xs-sum .i{color:var(--k);width:26px;height:26px}
.xs-new{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px;margin-top:10px}
.pw-tc{border:1.5px solid color-mix(in srgb,#e8590c 35%,var(--ln));background:color-mix(in srgb,#e8590c 5%,var(--card))}`;document.head.append(st);

// ===== Ota-ona: «Parolni unutdingizmi?» =====
function modal(h){const o=document.createElement('div');o.className='pw-ov';o.innerHTML=`<div class="pw-m" role="dialog" aria-modal="true"><button class="pw-x" data-pwx aria-label="Yopish">×</button>${h}</div>`;
 document.body.append(o);o.addEventListener('click',e=>{if(e.target==o||e.target.closest('[data-pwx]'))o.remove()});return o}
function forgot(step){const ph=($('lph')||{}).value||'';const o=document.querySelector('.pw-ov');if(o)o.remove();
 const m=modal(`<h3>${ic('key')}Parolni tiklash</h3><div class="pw-st"><button data-ps="req" class="${step!='code'?'on':''}">1. So'rov yuborish</button><button data-ps="code" class="${step=='code'?'on':''}">2. Menda kod bor</button></div><div id="pwb"></div>`);
 const b=m.querySelector('#pwb'),show=s=>{m.querySelectorAll('[data-ps]').forEach(x=>x.classList.toggle('on',x.dataset.ps==s));
  b.innerHTML=s=='req'?`<p>Telefon raqamingizni yozing. So'rov maktabga boradi — sinf rahbari yoki ma'muriyat sizga <b>6 xonali tiklash kodini</b> beradi (qo'ng'iroq, SMS yoki Telegram orqali).</p>
   <label for="pwq">Telefon raqam</label><input class="fld" id="pwq" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 90 123 45 67" value="${esc(ph)}"><button class="btn" data-pwgo="req">${ic('send')}So'rov yuborish</button><div id="pwm"></div>`
  :`<p>Maktabdan olgan 6 xonali kodni va yangi parolni kiriting. Kod 24 soat amal qiladi.</p>
   <label for="pwq">Telefon raqam</label><input class="fld" id="pwq" type="tel" inputmode="tel" autocomplete="tel" placeholder="+998 90 123 45 67" value="${esc(ph)}">
   <label for="pwc">Tiklash kodi</label><input class="fld" id="pwc" inputmode="numeric" autocomplete="one-time-code" maxlength="6" placeholder="123456" style="letter-spacing:4px;font-weight:700">
   <label for="pwn">Yangi parol (kamida 6 belgi)</label><input class="fld" id="pwn" type="password" autocomplete="new-password">
   <label for="pwn2">Yangi parolni takrorlang</label><input class="fld" id="pwn2" type="password" autocomplete="new-password">
   <label style="display:flex;gap:8px;align-items:center;font-weight:500"><input type="checkbox" id="pwsh"> Parolni ko'rsatish</label>
   <button class="btn" data-pwgo="code">${ic('check')}Parolni yangilash va kirish</button><div id="pwm"></div>`;
  const f=b.querySelector('input');if(f)f.focus()};
 m.addEventListener('click',async e=>{const s=e.target.closest('[data-ps]');if(s){show(s.dataset.ps);return}
  const g=e.target.closest('[data-pwgo]');if(!g)return;const out=$('pwm'),say=(t,c)=>out.innerHTML=`<div class="pw-ms ${c||''}">${t}</div>`,p=PE($('pwq').value);
  if(!p){say("Telefon raqamni to'liq yozing (9 ta raqam)",'er');return}
  g.disabled=true;try{
  if(g.dataset.pwgo=='req'){const{data,error}=await sb.rpc('pw_request',{p_phone:p});if(error){say(em(error),'er');return}
   if(data=='ok')say(`✅ So'rovingiz maktabga yuborildi.<br>Sinf rahbari yoki ma'muriyat sizga tiklash kodini beradi. Kodni olgach, <b>«2. Menda kod bor»</b> ni bosing.`,'ok');
   else if(data=='noacc')say("Bu raqam bilan hali ro'yxatdan o'tilmagan. Oynani yoping va «Ro'yxatdan o'tish» ni bosing.",'er');
   else say("Bu telefon raqam maktab ro'yxatida yo'q. Sinf rahbaridan raqamingizni tekshirishni so'rang.",'er');return}
  const c=$('pwc').value.replace(/\D/g,''),n=$('pwn').value,n2=$('pwn2').value;
  if(c.length!=6){say("Kod 6 ta raqamdan iborat",'er');return}if(n.length<6){say("Yangi parol kamida 6 belgidan iborat bo'lsin",'er');return}if(n!=n2){say("Parollar bir xil emas",'er');return}
  const{data,error}=await sb.rpc('pw_reset',{p_phone:p,p_code:c,p_pw:n});if(error){say(em(error),'er');return}if(data!='ok'){say(esc(data),'er');return}
  say("✅ Parol yangilandi. Kirilmoqda…",'ok');let r=await sb.auth.signInWithPassword({email:EM('p',p),password:n});if(r.error)r=await sb.auth.signInWithPassword({email:EM('o',p),password:n});
  if(r.error){say("✅ Parol yangilandi. Endi telefon raqam va yangi parol bilan kiring.",'ok');return}
  try{localStorage.setItem(P+'pf'+p,'p')}catch(e){}m.remove();await loadMe(r.data.user.id)}finally{g.disabled=false}});
 m.addEventListener('change',e=>{if(e.target.id=='pwsh')['pwn','pwn2'].forEach(i=>{const x=$(i);if(x)x.type=e.target.checked?'text':'password'})});
 show(step||'req')}
const _lv=loginView;loginView=function(){const r=_lv.apply(this,arguments);try{const b=$('lgo');if(b&&ON('ota_ona')&&!$('pwf'))b.insertAdjacentHTML('afterend',`<p class="kr-alt" style="margin-top:10px"><button type="button" class="kr-lnk" id="pwf">Parolni unutdingizmi?</button></p>`)}catch(e){}return r};
document.addEventListener('click',e=>{if(e.target.closest('#pwf')){e.preventDefault();forgot('req')}});

// ===== Kod berish (admin, ruxsatli xodim, sinf rahbari) =====
function codeBox(ph,r){const msg=`Assalomu alaykum! ${M.nomi||'Maktab'} platformasi — parolni tiklash kodi: ${r.code}\nKod 24 soat amal qiladi.\nIlovani oching → «Parolni unutdingizmi?» → «2. Menda kod bor» → telefon raqamingiz, shu kod va yangi parolni kiriting.`;
 modal(`<h3>${ic('key')}Tiklash kodi tayyor</h3><p><b>${fph(ph)}</b>${r.kids?` — ${esc(r.kids)}`:''}</p><div class="pw-code">${esc(r.code)}</div>
  <p>Kodni ota-onaga ayting yoki quyidagi xabarni yuboring. Kod faqat hozir ko'rinadi va 24 soat amal qiladi.</p><div class="pw-msg">${esc(msg)}</div>
  <div class="pw-ac"><button class="btn" data-pwcp>${ic('copy')}Nusxalash</button><a href="sms:+998${PE(ph)}?&body=${encodeURIComponent(msg)}">${ic('send')}SMS</a><a href="https://t.me/share/url?url=${encodeURIComponent(location.origin+location.pathname)}&text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">${ic('send')}Telegram</a></div>`)
  .addEventListener('click',async e=>{if(!e.target.closest('[data-pwcp]'))return;try{await navigator.clipboard.writeText(msg);flash('✅ Xabar nusxalandi')}catch(x){flash("Nusxalab bo'lmadi — matnni belgilab nusxalang")}})}
async function issue(ph){const p=PE(ph);if(!p){flash("Telefon raqamni to'liq yozing (9 ta raqam)");return}
 const{data,error}=await sb.rpc('pw_issue_code',{p_phone:p});if(error){flash(em(error));return}const r=(data||[])[0];if(!r){flash('Kod berilmadi');return}
 codeBox(p,r);S.pwT=0;if(S.as=='parol')adminPage(++S.rt,true)}
const reqRow=r=>`<div class="pw-r"><div><b>${fph(r.phone)}</b><span class="mut">${esc(r.kids||'—')}</span><small class="mut">So'rov: ${dt(r.requested_at)}${r.req_n>1?` · ${r.req_n} marta`:''}${r.active?` · kod berilgan: ${esc(r.issued_name||'')} ${dt(r.issued_at)}`:''}</small></div><button class="tab" data-pwk="${esc(r.phone)}">${ic('key')}${r.active?'Yangi kod':'Kod berish'}</button></div>`;
async function pwView(){const{data,error}=await sb.rpc('pw_requests');
 if(error)return `<div class="card"><b>${ic('key')}Parolni tiklash</b><p class="mut">${esc(em(error))}</p></div>`;const L=data||[];
 return `<div class="card"><p class="mut" style="margin:0">Ota-ona parolini unutsa, kirish oynasida «Parolni unutdingizmi?» ni bosib so'rov yuboradi. Siz <b>6 xonali kod</b> berasiz — ota-ona kod bilan o'zi yangi parol qo'yadi (siz uning parolini bilmaysiz). Kod 24 soat amal qiladi, 5 marta xato kiritilsa bekor bo'ladi.</p>
  <div class="pw-f"><input class="fld" id="pwph" type="tel" inputmode="tel" placeholder="Ota-ona telefoni: +998 90 123 45 67"><button class="btn" data-pwk="">${ic('key')}Kod berish</button></div></div>
 <div class="card"><b>${ic('bell')}Kutilayotgan so'rovlar${L.length?` — ${L.length} ta`:''}</b>${L.length?L.map(reqRow).join(''):`<p class="mut">Hozircha so'rov yo'q.</p>`}</div>`}
document.addEventListener('click',e=>{const b=e.target.closest('[data-pwk]');if(!b||!ME)return;e.preventDefault();issue(b.dataset.pwk||($('pwph')||{}).value||'')});

// ===== Xodimlar va ruxsatlar (faqat bosh admin) =====
async function xodimView(){const m0=nowT().d.slice(0,8)+'01';
 const[sl,py,ex]=await Promise.all([sb.rpc('staff_list'),sb.from('payments').select('received_by').gte('received_at',m0+'T00:00:00+05:00').not('received_by','is',null).limit(5000).then(r=>r.data||[],()=>[]),
  sb.from('expenses').select('created_by').gte('day',m0).limit(5000).then(r=>r.data||[],()=>[])]);
 if(sl.error)return `<div class="card"><b>${ic('shield')}Xodimlar va ruxsatlar</b><p class="mut">${esc(em(sl.error))}</p></div>`;
 const L=sl.data||[],X=L.filter(x=>x.kind),T=L.filter(x=>!x.kind),cnt=(a,k,id)=>a.filter(r=>r[k]==id).length;S.xL=L;
 const kopt=(v,blank)=>(blank?`<option value="">— turini tanlang —</option>`:'')+Object.entries(KIND).map(([k,[,n]])=>`<option value="${k}"${v==k?' selected':''}>${n}</option>`).join('')+(blank?'':`<option value="">Oddiy o'qituvchi (xodimlikdan olish)</option>`);
 const pms=(u,k,cur)=>`<div class="xs-pm">${PERMS.map(([p,i,n,d])=>{const off=k=='bux'&&!BUXP.includes(p);return `<label class="${off?'off':''}"><input type="checkbox" class="xpm" data-u="${u}" value="${p}"${(cur||[]).includes(p)&&!off?' checked':''}${off?' disabled':''}><span><b>${ic(i)}${n}</b><small>${off?"Buxgalterga berilmaydi — yordamchi admin qiling":d}</small></span></label>`}).join('')}</div>`;
 const card=x=>{const[i,n,c,d]=KIND[x.kind],ini=String(x.full_name||'?').trim().split(/\s+/).slice(0,2).map(w=>w[0]||'').join('').toUpperCase(),np=cnt(py,'received_by',x.id),ne=cnt(ex,'created_by',x.id);
  return `<div class="card xs" id="xs${x.id}" style="--k:${c}"><div class="top"><span class="xs-av">${esc(ini)}</span><div class="xs-h"><input class="cname xnm" data-u="${x.id}" value="${esc(x.full_name||'')}" title="Ism-familiyani tahrirlash — o'zi saqlanadi"><span class="mut">${ic('phone')} ${fph(x.phone)} (kirish logini)</span></div><span class="xs-b">${ic(i)}${n}</span></div>
   <div class="xs-st"><span>Oxirgi kirish: <b>${x.last_sign_in?dt(x.last_sign_in):'hali kirmagan'}</b></span><span>Akkaunt ochilgan: <b>${dt(x.created_at).slice(0,10)||'—'}</b></span>${x.kind=='bux'||(x.perms||[]).includes('tolov')?`<span>Bu oy: <b>${np}</b> ta to'lov qabul qilgan, <b>${ne}</b> ta xarajat yozgan</span>`:''}<span>Ruxsatlar: <b>${(x.perms||[]).length}</b> ta</span></div>
   <p class="mut" style="margin:0">${d}</p>
   <div class="top" style="margin-top:10px"><label class="mut" for="xk${x.id}">Turi:</label><select class="fld xkd" id="xk${x.id}" data-u="${x.id}" style="width:auto">${kopt(x.kind)}</select></div>
   <b style="display:block;margin-top:12px">Qo'shimcha ruxsatlar</b>${pms(x.id,x.kind,x.perms)}
   <div class="top"><span class="mut">${ic('key')}Parol:</span><input class="fld" id="xpw${x.id}" type="text" autocomplete="off" placeholder="Yangi parol (kamida 6 belgi)" style="width:auto;max-width:220px"><button class="tab xpwb" data-u="${x.id}">${ic('key')}Parolni o'zgartirish</button><span id="xpr${x.id}"></span></div></div>`};
 const sum=Object.entries(KIND).map(([k,[i,n,c]])=>`<div style="--k:${c}">${ic(i)}<span><b>${X.filter(x=>x.kind==k).length}</b><br><span class="mut">${n}</span></span></div>`).join('');
 return `<div class="card"><p class="mut" style="margin:0">Bu yerda buxgalter, kuzatuvchi va yordamchi adminlarning profilini ko'rasiz, ismini va parolini o'zgartirasiz hamda qo'shimcha ruxsatlar berasiz. Ruxsatlar baza darajasida tekshiriladi va xodim qayta kirganda kuchga kiradi.</p><div class="xs-sum" style="margin-top:12px">${sum}</div></div>
 ${X.map(card).join('')||`<div class="card"><p class="mut">Hali xodim yo'q. Quyida yangi xodim qo'shing yoki mavjud o'qituvchini xodim qiling.</p></div>`}
 <div class="card" style="--k:#1a5cff"><b>${ic('users')}Yangi xodim qo'shish</b><p class="mut">Xodim telefon raqami va shu parol bilan kiradi.</p>
  <div class="xs-new"><input class="fld" id="xnn" placeholder="Ism familiya"><input class="fld" id="xnp" type="tel" inputmode="tel" placeholder="Telefon: +998 90 123 45 67"><input class="fld" id="xnw" type="text" autocomplete="off" placeholder="Parol (kamida 6 belgi)"><select class="fld xkd" id="xnk">${kopt('',1)}</select></div>
  ${pms('new','',[])}<button class="btn" id="xnew">${ic('check')}Xodim qo'shish</button></div>
 ${T.length?`<div class="card"><b>${ic('users')}Mavjud o'qituvchini xodim qilish</b><p class="mut">Kuzatuvchi yoki yordamchi admin qilinsa, u sinflardan ajratiladi (baho qo'ymaydi).</p><div class="pw-f"><select class="fld" id="xpt">${T.map(x=>`<option value="${x.id}">${esc(x.full_name||'')} — ${fph(x.phone)}${x.classes?` (${x.classes} ta sinf)`:''}</option>`).join('')}</select><select class="fld" id="xptk" style="width:auto">${kopt('',1)}</select><button class="tab" id="xpro">${ic('shield')}Belgilash</button></div></div>`:''}`}
const permsOf=u=>[...document.querySelectorAll(`.xpm[data-u="${u}"]:checked`)].map(x=>x.value);
async function saveStaff(u,kind,perms,msg){const{error}=await sb.rpc('set_staff',{p_id:u,p_kind:kind,p_perms:perms});if(error){flash(em(error));return false}flash(msg||"✅ Saqlandi — xodim qayta kirganda kuchga kiradi");return true}
document.addEventListener('change',async e=>{const t=e.target;if(!MAIN()||S.as!='xodim')return;
 if(t.id=='xnk'){document.querySelectorAll('.xpm[data-u="new"]').forEach(c=>{const off=t.value=='bux'&&!BUXP.includes(c.value);c.disabled=off;if(off)c.checked=false;c.closest('label').classList.toggle('off',off)});return}
 if(t.classList.contains('xpm')&&t.dataset.u!='new'){const u=t.dataset.u,x=(S.xL||[]).find(r=>r.id==u);if(!x)return;await saveStaff(u,x.kind,permsOf(u));x.perms=permsOf(u);return}
 if(t.classList.contains('xkd')&&t.dataset.u){const u=t.dataset.u,x=(S.xL||[]).find(r=>r.id==u),k=t.value;if(!x)return;
  const q=k?`${x.full_name} — «${KIND[k][1]}» bo'lsinmi?${(k=='obs'||k=='admin2')&&x.classes?`\n\nU ${x.classes} ta sinfdan ajratiladi.`:''}`:`${x.full_name} xodimlikdan olinsinmi? Barcha qo'shimcha ruxsatlari ham olib tashlanadi.`;
  if(!confirm(q)){t.value=x.kind;return}if(await saveStaff(u,k,k?permsOf(u):[]))adminPage(++S.rt,true);else t.value=x.kind;return}
 if(t.classList.contains('xnm')){const v=t.value.trim();if(!v)return;const{error}=await sb.rpc('set_teacher_name',{p_id:t.dataset.u,p_name:v});flash(error?em(error):'✅ Ism saqlandi')}});
document.addEventListener('click',async e=>{const t=e.target.closest('button');if(!t||!MAIN()||S.as!='xodim')return;
 if(t.classList.contains('xpwb')){const u=t.dataset.u,i=$('xpw'+u),pw=i.value.trim();if(pw.length<6){flash("Parol kamida 6 belgidan iborat bo'lsin");i.focus();return}
  if(!confirm(`Yangi parol: ${pw}\nSaqlansinmi? Eski parol bilan endi kira olmaydi.`))return;t.disabled=true;const{error}=await sb.rpc('admin_set_password',{p_id:u,p_pw:pw});t.disabled=false;
  if(error){flash(em(error));return}i.value='';$('xpr'+u).innerHTML=`✅ Yangi parol: <b class="code">${esc(pw)}</b>`;flash("✅ Parol o'zgartirildi");return}
 if(t.id=='xpro'){const u=$('xpt').value,k=$('xptk').value;if(!k){flash('Xodim turini tanlang');return}const x=(S.xL||[]).find(r=>r.id==u)||{};
  if(!confirm(`${x.full_name||''} — «${KIND[k][1]}» bo'lsinmi?${k!='bux'&&x.classes?`\n\nU ${x.classes} ta sinfdan ajratiladi.`:''}`))return;if(await saveStaff(u,k,[]))adminPage(++S.rt,true);return}
 if(t.id=='xnew'){const n=$('xnn').value.trim(),p=PE($('xnp').value),pw=$('xnw').value.trim(),k=$('xnk').value;
  if(!n||!p||pw.length<6){flash("Ism, telefon (9 raqam) va kamida 6 belgili parolni kiriting");return}if(!k){flash('Xodim turini tanlang');return}
  t.disabled=true;try{const tmp=supabase.createClient(API,KEY,{auth:{persistSession:false,autoRefreshToken:false,storageKey:'tmp-xodim'}});
   const{data,error}=await tmp.auth.signUp({email:EM('o',p),password:pw});if(error){flash(/registered|exists/i.test(error.message)?"Bu telefon bilan akkaunt allaqachon bor — uni «Mavjud o'qituvchini xodim qilish» orqali belgilang":error.message);return}
   const{error:e2}=await sb.from('profiles').upsert({id:data.user.id,role:'teacher',full_name:n,phone:p});if(e2){flash(netMsg(e2));return}
   if(await saveStaff(data.user.id,k,permsOf('new'),`✅ Xodim qo'shildi: ${n}. Kirish: ${fph(p)} va parol ${pw}`))adminPage(++S.rt,true)}finally{t.disabled=false}}});

// ===== Bo'limlar ro'yxatiga qo'shish =====
const _ax=window.ADMX;window.ADMX=()=>(_ax?_ax():[]).concat(MAIN()||YP('parol')?[[2,'parol','Parolni tiklash',"Parolini unutgan ota-onaga tiklash kodi berish",'key','#e8590c',pwView]]:[])
 .concat(MAIN()?[[3,'xodim','Xodimlar va ruxsatlar',"Buxgalter, kuzatuvchi, yordamchi admin: profil va ruxsatlar",'shield','#7048e8',xodimView]]:[]);

// ===== Sinf rahbari: o'z sinfi ota-onalaridan kelgan so'rovlar; buxgalter: qo'shimcha ruxsatlar =====
async function after(){if(!ME)return;const v=$('view');if(!v)return;
 if(ME._bux){const ex=BUXP.filter(k=>(ME.perms||[]).includes(k)),tb=v.querySelector('.bxtabs');if(!ex.length||!tb||tb.querySelector('[data-bt^="x:"]'))return;
  const N={parol:['key','Parolni tiklash'],taom:['food','Taomnoma'],fikr:['msg','Fikr-mulohazalar']};
  tb.insertAdjacentHTML('beforeend',ex.map(k=>`<button class="bxtb ${S.bt=='x:'+k?'on':''}" data-bt="x:${k}">${ic(N[k][0])}${N[k][1]}</button>`).join(''));
  if(String(S.bt||'').startsWith('x:')){const k=S.bt.slice(2);let h='';try{h=k=='parol'?await pwView():k=='taom'?await menuView():await fbView()}catch(e){h=`<div class="card"><p class="mut">${esc(netMsg(e))}</p></div>`}
   while(tb.nextSibling)tb.nextSibling.remove();tb.insertAdjacentHTML('afterend',h)}return}
 if(ME.role!='teacher'||ME._obs||S.pv)return;if(!Object.values(ME.roles||{}).includes('rahbar')||v.querySelector('.pw-tc'))return;
 if(!S.pwL||Date.now()-(S.pwT||0)>60000){const{data,error}=await sb.rpc('pw_requests');S.pwL=error?[]:data||[];S.pwT=Date.now()}
 const L=S.pwL.filter(r=>!r.active);if(!L.length)return;const c=v.querySelector('.card');
 const h=`<div class="card pw-tc"><b>${ic('key')}Parolni tiklash so'rovlari — ${L.length} ta</b><p class="mut" style="margin:4px 0 0">Sinfingizdagi ota-ona parolini unutgan. «Kod berish» ni bosing va kodni ota-onaga yuboring — u o'zi yangi parol qo'yadi.</p>${L.map(reqRow).join('')}</div>`;
 if(c)c.insertAdjacentHTML('afterend',h);else v.insertAdjacentHTML('afterbegin',h)}
const _r=render;render=function(){const p=_r.apply(this,arguments);Promise.resolve(p).then(()=>after().catch(()=>{}));return p};
})();
