import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShieldCheck, Users, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRu = locale === "ru";

  const [totalListings, totalUsers] = await Promise.all([
    prisma.listing.count({ where: { isActive: true, status: "active" } }),
    prisma.user.count(),
  ]);

  const stats = [
    { value: `${totalListings.toLocaleString()}+`, label: isRu ? "объявлений" : "e'lonlar" },
    { value: "15",                                  label: isRu ? "городов"   : "shaharlar" },
    { value: "25+",                                 label: isRu ? "марок авто" : "avtomobil markalari" },
    { value: `${totalUsers}+`,                      label: isRu ? "пользователей" : "foydalanuvchilar" },
  ];

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 to-slate-800 text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">
              {isRu ? "О Mashina.uz" : "Mashina.uz haqida"}
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
              {isRu
                ? "Платформа для покупки и продажи автомобилей в Узбекистане. Делаем авторынок прозрачным и безопасным."
                : "O'zbekistonda avtomobil sotib olish va sotish platformasi. Avtomobil bozorini shaffof va xavfsiz qilamiz."}
            </p>
          </div>
        </section>

        {/* Live stats from DB */}
        <section className="bg-white border-b border-gray-100 py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-black text-blue-600 mb-1">{s.value}</div>
                  <div className="text-sm text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="bg-gray-50 py-14 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {isRu ? "Наша миссия" : "Bizning missiyamiz"}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {isRu
                  ? "Mashina.uz создана чтобы покупка и продажа автомобилей в Узбекистане была простой, безопасной и прозрачной. Мы объединяем продавцов и покупателей на одной платформе."
                  : "Mashina.uz O'zbekistonda avtomobil sotib olish va sotishni oddiy, xavfsiz va shaffof qilish uchun yaratilgan."}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {isRu
                  ? "Услуга профессиональной проверки автомобиля даёт покупателям уверенность, а продавцам — возможность продать авто быстрее и по лучшей цене."
                  : "Professional tekshiruv xizmati xaridorlarga ishonch, sotuvchilarga esa tezroq va yaxshi narxda sotish imkoniyatini beradi."}
              </p>
            </div>
            <div className="space-y-4">
              {[
                {
                  icon: ShieldCheck,
                  title: isRu ? "Проверенные объявления" : "Tekshirilgan e'lonlar",
                  desc: isRu ? "Каждое объявление проходит модерацию перед публикацией" : "Har bir e'lon nashr etilishdan oldin moderatsiyadan o'tadi",
                },
                {
                  icon: Users,
                  title: isRu ? "Без посредников" : "Vositachilarsiz",
                  desc: isRu ? "Прямой контакт между продавцом и покупателем" : "Sotuvchi va xaridor o'rtasida bevosita aloqa",
                },
                {
                  icon: Star,
                  title: isRu ? "Бесплатно для всех" : "Hammaga bepul",
                  desc: isRu ? "Размещение объявления абсолютно бесплатно" : "E'lon joylash mutlaqo bepul",
                },
                {
                  icon: TrendingUp,
                  title: isRu ? "Постоянное развитие" : "Doimiy rivojlanish",
                  desc: isRu ? "Улучшаем платформу на основе обратной связи" : "Foydalanuvchi fikrlariga asoslanib platformani takomillashtirish",
                },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 bg-white rounded-xl p-4 border border-gray-100">
                  <Icon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 py-14 px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <h2 className="text-2xl font-bold mb-4">
              {isRu ? "Готовы начать?" : "Boshlashga tayyormisiz?"}
            </h2>
            <p className="text-blue-100 mb-6">
              {isRu
                ? "Разместите объявление бесплатно или запишитесь на проверку авто"
                : "Bepul e'lon joylashtiring yoki avtomobil tekshiruviga yoziling"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/${locale}/sell`} className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                {isRu ? "Подать объявление" : "E'lon berish"}
              </Link>
              <Link href={`/${locale}/inspection`} className="bg-blue-500 text-white border border-blue-400 px-6 py-3 rounded-xl font-semibold hover:bg-blue-400 transition-colors">
                {isRu ? "Проверить авто" : "Avtomobilni tekshirish"}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
