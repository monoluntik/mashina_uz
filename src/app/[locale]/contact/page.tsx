import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { Mail, Clock, MessageCircle } from "lucide-react";

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
              {isRu ? "Есть вопрос? Напишите нам — ответим в течение дня" : "Savolingiz bormi? Yozing — bir kun ichida javob beramiz"}
            </p>
          </div>
        </section>

        <section className="bg-white py-14 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900">
                {isRu ? "Как с нами связаться" : "Biz bilan qanday bog'lanish"}
              </h2>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">Email</div>
                  <a href="mailto:narbkv07@gmail.com" className="text-sm text-blue-600 hover:underline">
                    narbkv07@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">
                    {isRu ? "Время ответа" : "Javob vaqti"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {isRu ? "Обычно в течение 24 часов" : "Odatda 24 soat ichida"}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="font-semibold text-gray-900 mb-1">
                    {isRu ? "Мессенджеры" : "Messenjerlar"}
                  </div>
                  <div className="text-sm text-gray-600">
                    {isRu ? "Telegram и WhatsApp — уточняется" : "Telegram va WhatsApp — tez orada"}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-blue-800">
                  {isRu
                    ? "По вопросам модерации объявлений, технических ошибок и сотрудничества — пишите на email."
                    : "E'lonlarni moderatsiya qilish, texnik xatolar va hamkorlik bo'yicha — emailga yozing."}
                </p>
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
      </main>
      <Footer />
    </>
  );
}
