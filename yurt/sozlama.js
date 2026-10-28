// Yurt School sozlamalari. Umumiy kod (platforma/) shu fayldan o'qiydi.
// Yangi maktab qo'shish: shu papkani nusxalab, quyidagi qiymatlarni o'zgartirish kifoya.
window.MAKTAB = {
  kod: 'yurt',                          // qisqa lotin nomi: brauzer xotirasi va zaxira fayl nomi uchun
  nomi: 'Yurt School',
  qisqa: 'Yurt School',                 // telefon ekranidagi ilova belgisi nomi
  portal: '../',                        // "Maktabni almashtirish" tugmasi manzili

  // Maktabning o'z Supabase bazasi (Project Settings → API). Bo'sh bo'lsa, kirish oynasi "tayyorlanmoqda" deydi.
  baza: { url: 'https://qthlpzkcxdvgpsnjgdrx.supabase.co', kalit: 'sb_publishable_UHGTE41rMK7YedzgJlIzaw_ItIQqImj' },
  email_domen: 'ota.yurtschool.app',    // ota-ona va o'qituvchi akkauntlari ichki emaili (telefon@shu domen)

  kirish: {
    rasm: 'img/fon.jpg',                // admin, ota-ona va o'qituvchi uchun bitta fon
    rasm_izoh: 'Yurt School — Barchaning muvaffaqiyati uchun birga!',
    salom: 'Xush kelibsiz'
  },

  // Modullar: false — o'chirilgan (bo'lim ko'rinmaydi). Yozilmagani — yoqilgan.
  modullar: {
    ota_ona: true,            // Ota-ona kabineti va ro'yxatdan o'tish
    tolov: true,              // To'lovlar va to'lov eslatmalari
    sms: true,                // Avtomatik SMS
    taomnoma: true,           // Kunlik taomnoma
    turniket: false,          // Turniket: kech kelganlar va ketish davomati
    fikr: true,               // Fikr-mulohazalar
    oqituvchi_reyting: true,  // O'qituvchilar reytingi
    infografika: true,        // Oylik infografika va tangalar
    kitoblar: false           // Fan darsliklari (fayl yuklash)
  }
};
