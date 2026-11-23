// Yurt School: havola ochilishi bilan ilovani o'rnatish taklifi (ekran pastida).
// Android Chrome — bitta bosishda o'rnatish oynasi; iPhone Safari — «Ulashish ⬆️ → На экран «Домой»» ko'rsatmasi;
// Telegram/Instagram ichida ochilsa — Chrome'da yoki Safari'da ochish tugmasi. Ilova o'rnatilgan bo'lsa — ko'rinmaydi.
(function(){
if(standalone())return;
const ua=navigator.userAgent,AND=/Android/i.test(ua),IOS=/iPhone|iPad|iPod/.test(ua);if(!AND&&!IOS)return;
const INAPP=/; wv\)|Telegram|Instagram|FBAN|FBAV|Line\/|YaApp/i.test(ua),IOS_BOSHQA=IOS&&/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser/.test(ua);
const K=P+'ornat';try{if(Date.now()-(+localStorage.getItem(K)||0)<3*864e5)return}catch(e){}
const st=document.createElement('style');st.textContent=`
.yo{position:fixed;left:10px;right:10px;bottom:12px;z-index:90;padding:16px 16px 14px;border-radius:22px;background:#fff;color:#14213d;
 box-shadow:0 18px 50px -10px rgba(11,40,120,.55);border:2px solid #1a5cff;font-family:inherit;animation:yo-in .35s ease}
body.in .yo{bottom:84px}
@keyframes yo-in{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
.yo-h{display:flex;align-items:center;gap:12px}.yo-h img{width:48px;height:48px;border-radius:12px;flex:none}
.yo-h b{display:block;font-size:16px}.yo-h small{display:block;color:#6b7794;font-size:13px;line-height:1.3}
.yo-x{margin-left:auto;align-self:flex-start;border:0;background:#eef1f8;color:#6b7794;width:32px;height:32px;border-radius:50%;font-size:18px;line-height:1;cursor:pointer;flex:none}
.yo-b{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;margin-top:12px;padding:14px;border:0;border-radius:14px;font:inherit;font-size:17px;font-weight:800;color:#fff;
 background:linear-gradient(135deg,#3d7bff,#0b47d9);box-shadow:0 10px 22px -10px rgba(26,92,255,.9);cursor:pointer;text-decoration:none}
.yo-s{margin:12px 0 0;padding:10px 12px;border-radius:12px;background:#eef4ff;font-size:14.5px;line-height:1.45}
.yo-s b{color:#0b47d9}
.yo-ar{position:fixed;left:50%;bottom:-6px;z-index:91;transform:translateX(-50%);font-size:46px;animation:yo-ar 1s ease-in-out infinite}
@keyframes yo-ar{50%{transform:translate(-50%,8px)}}`;document.head.append(st);
const el=document.createElement('div');el.className='yo';el.setAttribute('role','dialog');el.setAttribute('aria-label',"Ilovani o'rnatish");
const head=(t,s)=>`<div class="yo-h"><img src="img/icon-192.png" alt=""><div><b>${t}</b><small>${s}</small></div><button class="yo-x" aria-label="Yopish">×</button></div>`;
const url=location.href.split('#')[0];
function show(){let h,ar=false;
 if(AND&&IP)h=head("Yurt School ilovasini o'rnating","Telefon ekraningizda belgi paydo bo'ladi — keyingi safar bir bosishda ochasiz")+`<button class="yo-b" data-yo="ornat">📲 Ilovani o'rnatish</button>`;
 else if(AND&&INAPP)h=head("Chrome brauzerida oching","Ilovani o'rnatish va bildirishnomalar uchun platformani Chrome'da oching")+
  `<a class="yo-b" href="intent://${location.host}${location.pathname}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(url)};end">🌐 Chrome'da ochish</a><p class="yo-s">Tugma ishlamasa: yuqoridagi <b>⋮</b> ni bosing → <b>«Chrome'da ochish» / «Открыть в Chrome»</b>.</p>`;
 else if(AND)h=head("Yurt School ilovasini o'rnating","Chrome'ning o'ng yuqorisidagi menyu orqali")+`<p class="yo-s">Yuqoridagi <b>⋮</b> → <b>«Ilovani o'rnatish»</b> yoki <b>«Bosh ekranga qo'shish»</b> (Установить приложение / Добавить на гл. экран).</p>`;
 else if(INAPP||IOS_BOSHQA)h=head("Safari'da oching","iPhone'da ilovani faqat Safari orqali o'rnatish mumkin")+`<p class="yo-s">Yuqoridagi yoki pastdagi <b>•••</b> belgisini bosing → <b>«Safari'da ochish» / «Открыть в Safari»</b>.</p><button class="yo-b" data-yo="nusxa">📋 Havolani nusxalash</button>`;
 else{ar=true;h=head("Ilovani bosh ekranga qo'shing","Bildirishnomalar faqat shunda ishlaydi")+`<p class="yo-s">1) Pastdagi <b>«Ulashish» ⬆️</b> tugmasini bosing<br>2) <b>«На экран «Домой»»</b> (Bosh ekranga) ni tanlang<br>3) <b>«Добавить»</b> ni bosing</p>`}
 el.innerHTML=h;if(!el.isConnected)document.body.append(el);
 let a=document.querySelector('.yo-ar');if(ar&&!a){a=document.createElement('div');a.className='yo-ar';a.textContent='👇';document.body.append(a)}else if(!ar&&a)a.remove()}
function yop(){el.remove();const a=document.querySelector('.yo-ar');if(a)a.remove();try{localStorage.setItem(K,Date.now())}catch(e){}}
el.addEventListener('click',async e=>{if(e.target.closest('.yo-x')){yop();return}const b=e.target.closest('[data-yo]');if(!b)return;
 if(b.dataset.yo=='ornat'&&IP){IP.prompt();const r=await IP.userChoice.catch(()=>({}));IP=null;if(r.outcome=='accepted')yop();else show()}
 if(b.dataset.yo=='nusxa'){try{await navigator.clipboard.writeText(url);b.textContent="✅ Nusxalandi — Safari'ga qo'ying"}catch(x){prompt("Havolani nusxalang:",url)}}});
// Chrome o'rnatishga tayyor bo'lganda (beforeinstallprompt) — bir bosishda o'rnatish tugmasi chiqadi
addEventListener('beforeinstallprompt',()=>setTimeout(show,0));
addEventListener('appinstalled',()=>{el.remove();const a=document.querySelector('.yo-ar');if(a)a.remove()});
setTimeout(show,AND&&!INAPP?1500:600);
})();
