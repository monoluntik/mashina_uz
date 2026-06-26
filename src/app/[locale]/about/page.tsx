import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ShieldCheck, Users, Star, TrendingUp, MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";

const STATS = [
  { value: "10 000+", label: "объявлений на сайте" },
  { value: "15", label: "городов Узбекистана" },
  { value: "25+", label: "марок автомобилей" },
  { value: "2024", label: "год основания" },
];

const TEAM = [
  { name: "Акрам Юсупов", role: "Основатель & CEO", emoji: "👨‍💼" },
  { name: "Сарвар Рахимов", role: "Технический директор", emoji: "👨‍💻" },
  { name: "Малика Исмаилова", role: "Руководитель отдела проверок", emoji: "👩‍🔧" },
  { name: "Бобур Хасанов", role: "Менеджер по работе с клиентами", emoji: "👨‍💼" },
];

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isRu = locale === "ru";

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
                ? "Ведущая платформа для покупки и продажи автомобилей в Узбекистане. Мы делаем автомобильный рынок прозрачным и безопасным."
                : "O'zbekistonda avtomobil sotib olish va sotishning yetakchi platformasi. Biz avtomobil bozorini shaffof va xavfsiz qilamiz."}
            </p>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white border-b border-gray-100 py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {STATS.map((s) => (
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
                  ? "Mashina.uz создана для того, чтобы покупка и продажа автомобилей в Узбекистане была простой, безопасной и прозрачной. Мы объединяем продавцов и покупателей на одной платформе."
                  : "Mashina.uz O'zbekistonda avtomobil sotib olish va sotishni oddiy, xavfsiz va shaffof qilish uchun yaratilgan."}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {isRu
                  ? "Уникальная услуга профессиональной проверки в нашем салоне даёт покупателям уверенность, а продавцам — возможность продать авто быстрее и дороже."
                  : "Salonimizda professional tekshiruv xizmati xaridorlarga ishonch, sotuvchilarga esa tezroq va yuqori narxda sotish imkoniyatini beradi."}
              </p>
            </div>
            <div className="space-y-4">
              {[
                { icon: ShieldCheck, title: isRu ? "Проверенные объявления" : "Tekshirilgan e'lonlar", desc: isRu ? "Каждое объявление проходит модерацию перед публикацией" : "Har bir e'lon nashr etilishdan oldin moderatsiyadan o'tadi" },
                { icon: Users, title: isRu ? "Без посредников" : "Vositachilarsiz", desc: isRu ? "Прямой контакт между продавцом и покупателем" : "Sotuvchi va xaridor o'rtasida bevosita aloqa" },
                { icon: Star, title: isRu ? "Бесплатно для всех" : "Hammaga bepul", desc: isRu ? "Размещение объявления абсолютно бесплатно" : "E'lon joylash mutlaqo bepul" },
                { icon: TrendingUp, title: isRu ? "Растём вместе с рынком" : "Bozor bilan o'sish", desc: isRu ? "Постоянно улучшаем платформу по отзывам пользователей" : "Foydalanuvchi fikrlariga asoslanib platformani takomillashtirish" },
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

        {/* Team */}
        <section className="bg-white py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
              {isRu ? "Наша команда" : "Bizning jamoa"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {TEAM.map((member) => (
                <div key={member.name} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-3xl mx-auto mb-3">
                    {member.emoji}
                  </div>
                  <div className="font-semibold text-gray-900 text-sm">{member.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{member.role}</div>
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
