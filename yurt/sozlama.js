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

  yuqori_sinflar: '5–9',              // maktabda 9-sinfgacha o'qitiladi

  kirish: {
    rasm: 'img/kirish.jpg',             // admin, ota-ona va o'qituvchi uchun bitta fon
    en: 1200, boy: 1280,                // rasm o'lchami (piksel)
    joy: '38% 40%',                     // rasmning qaysi qismi markazda turadi (kichik ekranda)
    rasm_izoh: "Yurt School o'quvchisi maktab binosi oldida",
    // Rasm ustidagi yozuv va imkoniyatlar (kerak bo'lmasa, ustki: null)
    ustki: {
      sarlavha: 'Assalomu alaykum!',
      matn: "Yurt School boshqaruv platformasiga xush kelibsiz.",
      imkoniyatlar: [['chart', 'Kunlik ball va reyting'], ['cal', 'Davomat nazorati'], ['card', "To'lovlar holati"], ['food', 'Kunlik taomnoma']]
    },
    salom: 'Xush kelibsiz'
  },

  // Modullar: false — o'chirilgan (bo'lim ko'rinmaydi). Yozilmagani — yoqilgan.
  modullar: {
    ota_ona: true,            // Ota-ona kabineti va ro'yxatdan o'tish
    suhbat: true,             // Ota-onaga kunlik savol: farzand bilan suhbat (sql/02-ota-ona-suhbat.sql)
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
