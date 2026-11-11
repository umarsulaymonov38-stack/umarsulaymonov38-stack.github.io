// Modul: fan bahosini o'zgartirish sababi (sozlama: modullar.baho_izoh).
// O'qituvchi saqlangan bahoni (baho, uyga vazifa, faollik) o'zgartirsa — sabab so'raladi. O'zgarish tarixi
// score_changes jadvalida saqlanadi va ota-onaga ko'rinadi (bosh sahifada eslatma, "Fan baholari" bo'limida ro'yxat).
// Baza: yurt/sql/10-baholash-qoidalari.sql
(function(){if(!ON('baho_izoh'))return;
const FN={grade:'Baho',hw:'Uyga vazifa',activity:'Darsdagi faollik'},B={},key=(s,k)=>S.date+'|'+s+'|'+k;
const st=document.createElement('style');st.textContent=`
.bz-ov{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:16px;background:rgba(15,23,42,.55)}
.bz-m{width:min(460px,100%);padding:22px;border-radius:20px;background:var(--card);color:var(--ink);box-shadow:0 30px 60px -20px rgba(0,0,0,.5)}
.bz-m h3{margin:0 0 6px;font-size:19px}.bz-m p{margin:0 0 12px;color:var(--mut)}
.bz-ch{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}.bz-ch button{border:1px solid var(--ln);background:var(--zb);color:var(--ink);border-radius:999px;padding:6px 12px;font:inherit;font-size:13px;cursor:pointer}
.bz-m textarea{width:100%;min-height:84px;box-sizing:border-box;padding:10px 12px;border:1.5px solid var(--ln);border-radius:12px;background:var(--zb);color:var(--ink);font:inherit;resize:vertical}
.bz-ft{display:flex;justify-content:flex-end;gap:8px;margin-top:14px}
.bz-ed{outline:2px solid #f0a400;outline-offset:1px}
.bz-chg{margin:6px 0;padding:10px 12px;border-radius:12px;background:var(--zb);border-left:4px solid #f0a400}
.bz-chg b.v{font-size:15px}.bz-chg .mut{font-size:13px}`;document.head.append(st);
// Sabab so'rash oynasi: matn (kamida 3 belgi) yoki "Bekor qilish"
function ask(t){return new Promise(res=>{const o=document.createElement('div');o.className='bz-ov';
 o.innerHTML=`<div class="bz-m" role="dialog" aria-modal="true"><h3>${ic('edit')} Baho o'zgartirilmoqda</h3><p><b>${esc(t.n)}</b> — ${esc(t.f)}: <b>${t.o??'—'}</b> → <b>${t.v??'bo\'sh'}</b>.<br>Nima sababdan o'zgartiryapsiz? Izoh ota-onaga ko'rinadi.</p>
 <div class="bz-ch">${["Xato kiritilgan edi","Qayta topshirdi","Qo'shimcha javob berdi","Vazifani keyin olib keldi"].map(x=>`<button type="button">${x}</button>`).join('')}</div>
 <textarea maxlength="500" placeholder="Sababni yozing…"></textarea><div class="bz-ft"><button class="tab" data-x="0">Bekor qilish</button><button class="btn" data-x="1">Saqlash</button></div></div>`;
 document.body.append(o);const ta=o.querySelector('textarea');ta.focus();
 o.addEventListener('click',e=>{const c=e.target.closest('.bz-ch button');if(c){ta.value=c.textContent;ta.focus();return}
  const b=e.target.closest('[data-x]');if(!b)return;if(b.dataset.x=='1'&&ta.value.trim().length<3){ta.focus();ta.style.borderColor='#e5484d';return}
  o.remove();res(b.dataset.x=='1'?ta.value.trim():null)})})}
// Saqlangan qiymat o'zgartirilayotganda avtomatik saqlash to'xtatiladi (umumiy koddagi ishlovchidan oldin ishlaydi)
document.addEventListener('input',e=>{const t=e.target;if(!t.classList||!t.classList.contains('ssc'))return;const d=t.dataset,k=key(d.s,d.k);
 if(!(k in B)){const r=(S.ss||{})[d.s]||{};B[k]=r[d.k]??null}
 if(B[k]!=null){e.stopImmediatePropagation();t.classList.add('bz-ed')}},true);
document.addEventListener('change',async e=>{const t=e.target;if(!t.classList||!t.classList.contains('ssc'))return;const d=t.dataset,k=key(d.s,d.k);
 if(B[k]==null){B[k]=t.value===''?null:+t.value;return}
 let v=t.value===''?null:+t.value;const mx=d.k=='grade'?[1,5]:[0,5];if(v!=null)v=Math.min(mx[1],Math.max(mx[0],v));t.value=v??'';
 if(v===B[k]){t.classList.remove('bz-ed');return}
 const tr=t.closest('tr'),n=tr?(tr.querySelector('td.l')||{}).textContent||'':'',why=await ask({n,f:FN[d.k]||d.k,o:B[k],v});
 if(!why){t.value=B[k];t.classList.remove('bz-ed');return}
 const old=B[k];(S.ss[d.s]=S.ss[d.s]||{})[d.k]=v;await ssSave(d.s,{[d.k]:v});
 const{error}=await sb.from('score_changes').insert({student_id:d.s,day:S.date,subject:mySubj(),field:d.k,old_val:String(old),new_val:v==null?'':String(v),reason:why,teacher_name:ME.full_name||null});
 if(error){flash(/score_changes/.test(error.message)?"Avval Supabase'da yurt/sql/10-baholash-qoidalari.sql ni ishga tushiring":netMsg(error));return}
 B[k]=v;t.classList.remove('bz-ed');flash("✅ Baho o'zgartirildi, sababi ota-onaga ko'rinadi")},true);
// Ota-ona: so'nggi 30 kundagi o'zgarishlar
async function load(){const d=new Date(Date.now()-30*864e5).toISOString().slice(0,10);
 const{data,error}=await sb.from('score_changes').select('student_id,day,subject,field,old_val,new_val,reason,teacher_name,created_at').gte('day',d).order('created_at',{ascending:false}).limit(40);return error?[]:data||[]}
const row=x=>`<div class="bz-chg"><b>${esc(x.subject||'Fan')}</b> · ${esc(FN[x.field]||x.field)} · <span class="mut">${fd(x.day)}</span><br><b class="v">${esc(x.old_val||'—')} → ${esc(x.new_val||'bo\'sh')}</b><br><span class="mut">Sabab: ${esc(x.reason)}${x.teacher_name?' · '+esc(x.teacher_name):''}</span></div>`;
async function inject(){if(!ME||ME.role!='parent')return;const v=$('view');if(!v||v.querySelector('.bz-card'))return;
 const L=(await load()).filter(x=>!ME.student_id||x.student_id==ME.student_id);if(!L.length)return;
 if(S.pv=='fan'){v.insertAdjacentHTML('beforeend',`<div class="card bz-card"><b>${ic('edit')}Baho o'zgartirishlari (so'nggi 30 kun)</b><p class="mut">O'qituvchi bahoni o'zgartirganda sababini yozadi.</p>${L.map(row).join('')}</div>`);return}
 if(!S.pv){const at=v.querySelector('.psec')||null,h=`<div class="card bz-card"><div class="top"><b>${ic('edit')}Baho o'zgartirildi: ${L.length} ta</b><button class="tab" data-pv="fan" style="margin-left:auto">Ko'rish</button></div>${row(L[0])}</div>`;
  if(at)at.insertAdjacentHTML('beforebegin',h);else v.insertAdjacentHTML('beforeend',h)}}
const _r=render;render=function(){const p=_r.apply(this,arguments);Promise.resolve(p).then(()=>inject().catch(()=>{}));return p};
})();
