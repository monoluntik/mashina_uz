import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export async function generateMetadata() {
  return { title: "Политика конфиденциальности" };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRu = locale === "ru";

  const sections = isRu
    ? [
        {
          title: "1. Какие данные мы собираем",
          body: "Имя, номер телефона и/или email при регистрации. IP-адрес и тип браузера при посещении сайта. Данные об объявлениях, избранном и истории просмотров.",
        },
        {
          title: "2. Как мы используем данные",
          body: "Для обеспечения работы аккаунта и персонализации сайта. Для связи с вами по поводу объявлений. Для улучшения качества платформы и выявления мошеннических действий.",
        },
        {
          title: "3. Передача данных третьим лицам",
          body: "Мы не продаём и не передаём ваши данные третьим лицам без вашего согласия, за исключением случаев, предусмотренных законодательством Республики Узбекистан.",
        },
        {
          title: "4. Куки (Cookies)",
          body: "Сайт использует куки для хранения сессии авторизации и настроек. Вы можете отключить куки в настройках браузера, однако это может нарушить работу сайта.",
        },
        {
          title: "5. Безопасность данных",
          body: "Пароли хранятся в зашифрованном виде (bcrypt). Сессии защищены httpOnly-куками. Мы регулярно обновляем защитные меры.",
        },
        {
          title: "6. Ваши права",
          body: "Вы вправе запросить удаление своего аккаунта и всех связанных данных. Для этого обратитесь к нам через страницу контактов.",
        },
        {
          title: "7. Контакт",
          body: "По вопросам конфиденциальности: privacy@mashina.uz",
        },
      ]
    : [
        {
          title: "1. Biz qanday ma'lumotlar to'playmiz",
          body: "Ro'yxatdan o'tishda ism, telefon raqami va/yoki email. Saytga tashrif buyurganda IP-manzil va brauzer turi.",
        },
        {
          title: "2. Ma'lumotlardan foydalanish",
          body: "Hisob ishlashi va saytni shaxsiylashtirish uchun. E'lonlar bo'yicha siz bilan bog'lanish uchun.",
        },
        {
          title: "3. Uchinchi tomonlarga ma'lumot uzatish",
          body: "Sizning roziligingizсиз ma'lumotlaringizni uchinchi tomonlarga sotmaymiz yoki bermaymiz.",
        },
        {
          title: "4. Cookie fayllari",
          body: "Sayt avtorizatsiya sessiyasini saqlash uchun cookie fayllaridan foydalanadi.",
        },
        {
          title: "5. Xavfsizlik",
          body: "Parollar shifrlangan holda saqlanadi. Sessiyalar httpOnly cookie'lar bilan himoyalangan.",
        },
        {
          title: "6. Sizning huquqlaringiz",
          body: "Hisobingiz va barcha ma'lumotlaringizni o'chirishni so'rashingiz mumkin.",
        },
      ];

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isRu ? "Политика конфиденциальности" : "Maxfiylik siyosati"}
            </h1>
            <p className="text-gray-500 text-sm">
              {isRu ? "Последнее обновление: 1 января 2025 г." : "Oxirgi yangilanish: 2025-yil 1-yanvar"}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {sections.map((s) => (
              <div key={s.title} className="p-6">
                <h2 className="font-semibold text-gray-900 mb-2">{s.title}</h2>
                <p className="text-gray-600 leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-8">
            {isRu ? "Вопросы? " : "Savollar? "}
            <Link href={`/${locale}/contact`} className="text-blue-600 hover:underline">
              {isRu ? "Свяжитесь с нами" : "Biz bilan bog'laning"}
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
