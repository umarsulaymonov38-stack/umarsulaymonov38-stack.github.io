// Modul: "Ota-onaga yaxshilik" — haftalik so'rovnoma (sozlama: modullar.haftalik_yaxshilik).
// Har hafta juma kuni (shanba va yakshanba ham ochiq) ota-ona profilida so'rovnoma chiqadi. Javobdan oldin
// "vijdonan belgilayapsizmi?" tasdig'i so'raladi. Ball shu haftaning maktabga kelgan kunlariga yoziladi;
// koordinator bu ustunni endi to'ldirmaydi (faqat ko'radi). Baza: yurt/sql/10-baholash-qoidalari.sql
(function(){if(!ON('haftalik_yaxshilik'))return;
const JV=[[10,'😊','Juda xursand qildi','Ko\'p yaxshilik qildi, quvontirdi'],[8,'🙂','Xursand qildi','Yaxshilik qildi'],[6,'😐','Odatdagidek','Alohida yaxshilik bo\'lmadi'],[4,'😕','Kam e\'tibor berdi','Ba\'zan ranjitdi'],[2,'😟','Ranjitdi','Ko\'p ranjitdi']];
const YX=["Uy ishlariga yordam berdi","Ukasi/singlisiga qaradi","Hurmat ko'rsatdi, gapga kirdi","Duo qildi, minnatdorlik bildirdi","Xizmatimni qildi","Darslarini o'zi tayyorladi"];
const st=document.createElement('style');st.textContent=`
.hy{border:1.5px solid color-mix(in srgb,#d6336c 30%,var(--ln));background:linear-gradient(135deg,color-mix(in srgb,#d6336c 7%,var(--card)),var(--card) 60%)}
.hy-k{font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase;color:#d6336c}
.hy h3{margin:4px 0 2px;font-size:19px}.hy-q{margin:16px 0 8px;font-weight:700}
.hy-ch{display:flex;flex-wrap:wrap;gap:8px}.hy-ch button{border:1.5px solid var(--ln);background:var(--card);color:var(--ink);border-radius:999px;padding:8px 14px;font:inherit;font-size:14px;cursor:pointer}
.hy-ch button.on{border-color:#d6336c;background:color-mix(in srgb,#d6336c 12%,var(--card));color:#a61e4d;font-weight:700}
.hy-sc{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.hy-sc button{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 6px;border:1.5px solid var(--ln);border-radius:14px;background:var(--card);color:var(--ink);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}
.hy-sc button span{font-size:26px}.hy-sc button small{font-weight:500;color:var(--mut);font-size:11px;text-align:center}
.hy-sc button.on{border-color:#d6336c;background:color-mix(in srgb,#d6336c 12%,var(--card))}
.hy textarea{width:100%;box-sizing:border-box;min-height:64px;margin-top:8px;padding:10px 12px;border:1.5px solid var(--ln);border-radius:12px;background:var(--zb);color:var(--ink);font:inherit}
.hy .btn{margin-top:14px;background:linear-gradient(135deg,#e64980,#c2255c)}
.hy-ok{display:flex;gap:12px;align-items:center;margin-top:12px;padding:12px 14px;border-radius:12px;background:color-mix(in srgb,var(--ok) 12%,var(--card))}
.hy-ok span{font-size:30px}
.hy-ov{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:16px;background:rgba(15,23,42,.55)}
.hy-m{width:min(440px,100%);padding:24px;border-radius:20px;background:var(--card);color:var(--ink);text-align:center;box-shadow:0 30px 60px -20px rgba(0,0,0,.5)}
.hy-m .w{width:64px;height:64px;margin:0 auto 10px;border-radius:50%;display:grid;place-items:center;font-size:32px;background:#fff4dc}
.hy-m h3{margin:0 0 8px;font-size:20px}.hy-m p{margin:0 0 14px;color:var(--mut)}
.hy-m label{display:flex;gap:10px;align-items:flex-start;text-align:left;padding:12px;border-radius:12px;background:var(--zb);font-weight:600;cursor:pointer}
.hy-m label input{width:20px;height:20px;flex:none;accent-color:#d6336c}
.hy-m .ft{display:flex;gap:8px;justify-content:center;margin-top:16px}.hy-m .btn[disabled]{opacity:.5;cursor:not-allowed}
@media (max-width:560px){.hy-sc{grid-template-columns:repeat(3,1fr)}}`;document.head.append(st);
const today=()=>{const t=nowT().d,d=new Date(Date.UTC(+t.slice(0,4),+t.slice(5,7)-1,+t.slice(8,10))),w=(d.getUTCDay()+6)%7;return{w,mon:new Date(d-w*864e5).toISOString().slice(0,10)}};
// Juma, shanba va yakshanba kunlari ochiq (#juma — sinab ko'rish uchun)
const open=()=>today().w>=4||/juma/.test(location.hash);
let A={};
// Koordinator: "Ota-onaga yaxshilik" ustuni faqat ko'rish uchun
function lockCol(){document.querySelectorAll('input.sc[data-k="kindness"]').forEach(i=>{i.readOnly=true;i.tabIndex=-1;i.title="Ota-ona har juma kuni haftalik so'rovnomada belgilaydi";i.placeholder='👪';i.style.background='color-mix(in srgb,#d6336c 8%,transparent)'})}
async function load(){const{data,error}=await sb.from('weekly_kindness').select('score,answer,note').eq('student_id',ME.student_id).eq('week_start',today().mon).maybeSingle();return error?null:data}
function card(w){const s=A.s??(w&&w.score),done=w&&!A.edit;
 return`<section class="card hy"><div class="top"><span class="pk-ic" style="--k:#d6336c">${ic('heart')}</span><div><span class="hy-k">Haftalik so'rovnoma · juma</span><h3>Ota-onaga yaxshilik</h3><span class="mut">Javobingiz farzandingizning «Ota-onaga yaxshilik» baliga yoziladi.</span></div></div>
 ${done?`<div class="hy-ok"><span>${(JV.find(x=>x[0]==w.score)||JV[2])[1]}</span><div><b>Rahmat! Bu hafta: ${esc(w.answer||'')} (${w.score} ball)</b>${w.note?`<br><span class="mut">${esc(w.note)}</span>`:''}</div><button class="tab" data-hy="edit" style="margin-left:auto">O'zgartirish</button></div>`
 :`<div class="hy-q">1. Shu hafta davomida farzandingiz sizga qanday yaxshilik qildi?</div><div class="hy-ch">${YX.map(x=>`<button type="button" data-hy="yx" class="${(A.yx||[]).includes(x)?'on':''}">${x}</button>`).join('')}</div>
  <textarea id="hyN" maxlength="400" placeholder="O'zingiz yozing (ixtiyoriy)…">${esc(A.n??(w&&w.note)??'')}</textarea>
  <div class="hy-q">2. Farzandingiz sizni xursand qildimi yoki ranjitdimi?</div><div class="hy-sc">${JV.map(([v,e,t,d])=>`<button type="button" data-hy="sc" data-v="${v}" class="${s==v?'on':''}"><span>${e}</span>${t}<small>${d}</small></button>`).join('')}</div>
  <button class="btn" data-hy="send">${ic('check')}Javobni yuborish</button>`}</section>`}
function confirmBox(){return new Promise(res=>{const o=document.createElement('div');o.className='hy-ov';
 o.innerHTML=`<div class="hy-m" role="dialog" aria-modal="true"><div class="w">⚠️</div><h3>Haqiqatan ham vijdonan belgilayapsizmi?</h3><p>Bu javob farzandingizning «Ota-onaga yaxshilik» baliga yoziladi va sinf reytingiga ta'sir qiladi. Iltimos, haqqoniy belgilang.</p>
 <label><input type="checkbox" id="hyC"> Ha, farzandimning shu haftadagi xatti-harakatini vijdonan va haqqoniy belgiladim</label>
 <div class="ft"><button class="tab" data-x="0">Qayta ko'rib chiqaman</button><button class="btn" data-x="1" disabled>Tasdiqlash va yuborish</button></div></div>`;document.body.append(o);
 o.querySelector('#hyC').addEventListener('change',e=>o.querySelector('[data-x="1"]').disabled=!e.target.checked);
 o.addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(!b||b.disabled)return;o.remove();res(b.dataset.x=='1')})})}
async function inject(){if(!ME)return;if(ME.role!='parent'){lockCol();return}
 const v=$('view');if(!v||S.pv||!open()||!ME.student_id||v.querySelector('.hy'))return;
 const w=await load();if(S.pv||v.querySelector('.hy'))return;A.w=w;
 const at=v.querySelector('.psec');if(at)at.insertAdjacentHTML('beforebegin',card(w));else v.insertAdjacentHTML('afterbegin',card(w))}
function repaint(){const c=$('view').querySelector('.hy');if(c)c.outerHTML=card(A.w)}
document.addEventListener('click',async e=>{const b=e.target.closest('[data-hy]');if(!b||!ME||ME.role!='parent')return;const k=b.dataset.hy,n=$('hyN');if(n)A.n=n.value;
 if(k=='edit'){A.edit=true;A.s=A.w&&A.w.score;repaint();return}
 if(k=='yx'){const L=A.yx=A.yx||[];const i=L.indexOf(b.textContent);if(i<0)L.push(b.textContent);else L.splice(i,1);repaint();return}
 if(k=='sc'){A.s=+b.dataset.v;repaint();return}
 if(k=='send'){if(A.s==null){flash("Iltimos, 2-savolga javob bering: xursand qildimi yoki ranjitdimi?");return}
  if(!await confirmBox())return;const j=JV.find(x=>x[0]==A.s),note=[...(A.yx||[]),(A.n||'').trim()].filter(Boolean).join('; ');
  b.disabled=true;const{error}=await sb.rpc('parent_kindness',{p_student:ME.student_id,p_score:A.s,p_answer:j[2],p_note:note,p_honest:true});b.disabled=false;
  if(error){flash(error.code=='PGRST202'?"Avval Supabase'da yurt/sql/10-baholash-qoidalari.sql ni ishga tushiring":'Xato: '+(error.message||error));return}
  A={w:{score:j[0],answer:j[2],note}};repaint();flash("✅ Rahmat! Javobingiz qabul qilindi")}});
const _r=render;render=function(){const p=_r.apply(this,arguments);Promise.resolve(p).then(()=>inject().catch(()=>{}));return p};
})();
