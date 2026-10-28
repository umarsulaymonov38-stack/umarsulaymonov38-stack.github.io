# Maktablar platformasi — umumiy kod

Barcha maktablar uchun **bitta umumiy kod**. Har maktabning o'z papkasi, o'z sozlamasi va o'z Supabase bazasi bor.

```
platforma/app.js    ← umumiy kod (Yuksalish reyting platformasi asosida)
platforma/app.css   ← umumiy dizayn
yurt/sozlama.js     ← Yurt School sozlamalari: nomi, bazasi, modullari, kirish rasmi
yurt/index.html     ← Yurt School sahifasi (ranglari shu yerda)
```

## Modullar
`sozlama.js` dagi `modullar` bo'limida yoqiladi (`true`) yoki o'chiriladi (`false`):
`ota_ona`, `tolov`, `sms`, `taomnoma`, `turniket`, `fikr`, `oqituvchi_reyting`, `infografika`, `kitoblar`.

## Yangi maktab qo'shish
1. `yurt/` papkasini yangi nom bilan nusxalang.
2. `sozlama.js` da nomi, `kod`, `baza` (Supabase URL va publishable kalit) ni o'zgartiring.
3. `index.html` da sarlavha, ranglar va logotipni almashtiring.
4. Umumiy kirish (`/index.html`) dagi maktablar ro'yxatiga havolani qo'shing.

Samarqand Yuksalish maktabi hozircha o'zining alohida `reyting` reposida ishlaydi va bu koddan foydalanmaydi.
