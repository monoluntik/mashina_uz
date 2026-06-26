import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { MapPin, Phone, Mail, Clock, MessageCircle } from "lucide-react";

export default async function ContactPage({
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
        <section className="bg-gradient-to-br from-gray-900 to-slate-800 text-white py-14 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">
              {isRu ? "Контакты" : "Aloqa"}
            </h1>
            <p className="text-slate-300 text-lg">
              {isRu ? "Мы рады помочь — напишите или позвоните нам" : "Biz yordam berishdan xursandmiz — yozing yoki qo'ng'iroq qiling"}
            </p>
          </div>
        </section>

        <section className="bg-white py-14 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">
                {isRu ? "Наши контакты" : "Bizning kontaktlar"}
              </h2>

              {[
                {
                  icon: MapPin,
                  title: isRu ? "Адрес салона" : "Salon manzili",
                  lines: ["г. Ташкент, ул. Амира Тимура, 107", "ориентир: ТЦ «Mega Planet»"],
                },
                {
                  icon: Phone,
                  title: isRu ? "Телефоны" : "Telefonlar",
                  lines: ["+998 (71) 200-10-00", "+998 (90) 555-10-00"],
                },
                {
                  icon: Mail,
                  title: "Email",
                  lines: ["info@mashina.uz", "support@mashina.uz"],
                },
                {
                  icon: Clock,
                  title: isRu ? "Режим работы" : "Ish vaqti",
                  lines: [
                    isRu ? "Пн–Пт: 9:00 – 19:00" : "Du–Ju: 9:00 – 19:00",
                    isRu ? "Суббота: 9:00 – 18:00" : "Shanba: 9:00 – 18:00",
                    isRu ? "Воскресенье: выходной" : "Yakshanba: dam olish kuni",
                  ],
                },
              ].map(({ icon: Icon, title, lines }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 mb-1">{title}</div>
                    {lines.map((line, i) => <div key={i} className="text-sm text-gray-600">{line}</div>)}
                  </div>
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <a
                  href="https://t.me/mashinauz"
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Telegram
                </a>
                <a
                  href="https://wa.me/998711001000"
                  className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Contact form */}
            <div className="bg-gray-50 rounded-2xl border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {isRu ? "Написать нам" : "Bizga yozing"}
              </h2>
              <ContactForm isRu={isRu} />
            </div>
          </div>
        </section>

        {/* Map placeholder */}
        <section className="bg-gray-100 h-64 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <MapPin className="w-10 h-10 mx-auto mb-2" />
            <p className="text-sm">{isRu ? "г. Ташкент, ул. Амира Тимура, 107" : "Toshkent sh., Amir Temur ko'chasi, 107"}</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

