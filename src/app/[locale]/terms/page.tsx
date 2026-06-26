import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export async function generateMetadata() {
  return { title: "Условия использования" };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isRu = locale === "ru";

  const sections = isRu
    ? [
        {
          title: "1. Общие положения",
          body: `Настоящие Условия использования регулируют отношения между платформой Mashina.uz (далее — «Платформа») и пользователями сайта. Используя сайт, вы соглашаетесь с настоящими условиями.`,
        },
        {
          title: "2. Регистрация и аккаунт",
          body: `Для размещения объявлений требуется регистрация. Вы несёте ответственность за сохранность данных своего аккаунта. Запрещено создавать несколько аккаунтов с целью обхода ограничений.`,
        },
        {
          title: "3. Размещение объявлений",
          body: `Объявления должны соответствовать действительности. Запрещено размещать: заведомо ложную информацию, объявления на автомобили без права продажи, дублирующие объявления на один автомобиль. Объявления проходят модерацию перед публикацией.`,
        },
        {
          title: "4. Фотографии",
          body: `Размещаемые фотографии должны принадлежать вам или быть сделаны с разрешения правообладателя. Запрещено использовать фото с водяными знаками других сервисов.`,
        },
        {
          title: "5. Сделки и платежи",
          body: `Платформа является информационным посредником и не несёт ответственности за сделки между покупателями и продавцами. Все сделки совершаются на усмотрение сторон.`,
        },
        {
          title: "6. Блокировка аккаунта",
          body: `Мы оставляем за собой право заблокировать аккаунт при нарушении настоящих условий, размещении мошеннических объявлений или получении обоснованных жалоб от других пользователей.`,
        },
        {
          title: "7. Изменение условий",
          body: `Платформа вправе изменять настоящие условия. Актуальная версия всегда доступна по данному адресу. Продолжение использования сайта означает согласие с обновлёнными условиями.`,
        },
      ]
    : [
        {
          title: "1. Umumiy qoidalar",
          body: `Ushbu Foydalanish shartlari Mashina.uz platformasi va foydalanuvchilar o'rtasidagi munosabatlarni tartibga soladi. Saytdan foydalanish orqali siz ushbu shartlarga rozisizni bildirасиз.`,
        },
        {
          title: "2. Ro'yxatdan o'tish",
          body: `E'lon joylashtirish uchun ro'yxatdan o'tish talab etiladi. Hisobingiz xavfsizligi uchun siz javobgarsiz.`,
        },
        {
          title: "3. E'lon joylashtirish",
          body: `E'lonlar haqiqatga mos kelishi kerak. Noto'g'ri ma'lumot, sotish huquqi bo'lmagan avtomobillar uchun e'lon joylashtirish taqiqlanadi.`,
        },
        {
          title: "4. Rasmlar",
          body: `Joylashtirilgan rasmlar sizga tegishli bo'lishi yoki mualliflik huquqi egasining ruxsati bilan olingan bo'lishi kerak.`,
        },
        {
          title: "5. Bitimlar",
          body: `Platforma axborot vositachisi bo'lib, xaridor va sotuvchi o'rtasidagi bitimlar uchun javobgar emas.`,
        },
      ];

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {isRu ? "Условия использования" : "Foydalanish shartlari"}
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
            {isRu ? "Есть вопросы? " : "Savollaringiz bormi? "}
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
