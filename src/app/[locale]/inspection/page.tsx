import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InspectionRequestForm from "@/components/InspectionRequestForm";
import {
  ShieldCheck,
  Wrench,
  ClipboardList,
  BadgeCheck,
  Clock,
  Car,
  CheckCircle2,
} from "lucide-react";

const CHECKS = [
  { icon: "🔧", label: "Двигатель", desc: "Давление масла, компрессия, подтёки, шумы" },
  { icon: "⚙️", label: "Коробка передач", desc: "Переключение, люфты, масло КПП" },
  { icon: "🛞", label: "Ходовая часть", desc: "Амортизаторы, рычаги, шаровые опоры" },
  { icon: "🛑", label: "Тормозная система", desc: "Диски, колодки, тормозная жидкость" },
  { icon: "🔌", label: "Электрика", desc: "Аккумулятор, генератор, проводка" },
  { icon: "🎨", label: "Кузов", desc: "Покраска, вмятины, следы ДТП, ржавчина" },
  { icon: "💺", label: "Салон", desc: "Состояние обивки, панели приборов, запахи" },
  { icon: "🏎️", label: "Шины и диски", desc: "Износ, давление, состояние дисков" },
];

const STEPS = [
  { n: "01", title: "Подайте заявку", desc: "Заполните форму ниже — укажите марку, модель и контакты. Мы перезвоним для записи." },
  { n: "02", title: "Привезите авто в салон", desc: "Адрес: г. Ташкент, ул. Амира Тимура, 107. Приёмка пн–сб с 9:00 до 18:00." },
  { n: "03", title: "Осмотр специалистом", desc: "Диагностика занимает 1–2 часа. Проверяем 40+ параметров по каждому узлу." },
  { n: "04", title: "Отчёт на сайте", desc: "После проверки на объявлении появится подробный отчёт с оценками всех систем." },
];

export default async function InspectionPage({
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
        <section className="bg-gradient-to-br from-slate-800 to-blue-900 text-white py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 px-4 py-2 rounded-full text-blue-200 text-sm font-medium mb-6">
              <ShieldCheck className="w-4 h-4" />
              {isRu ? "Сервис Mashina.uz" : "Mashina.uz xizmati"}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              {isRu ? "Проверка автомобиля\nв нашем салоне" : "Avtomobilingizni\nbizning salonimizda tekshiring"}
            </h1>
            <p className="text-slate-300 text-lg max-w-2xl mx-auto mb-8">
              {isRu
                ? "Профессиональная диагностика перед покупкой или продажей. После проверки на странице объявления появится подробный отчёт о состоянии авто."
                : "Sotib olish yoki sotishdan oldin professional diagnostika. Tekshiruvdan so'ng e'lon sahifasida batafsil holat hisoboti paydo bo'ladi."}
            </p>
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <Clock className="w-4 h-4 text-blue-300" />
                {isRu ? "1–2 часа" : "1–2 soat"}
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <ClipboardList className="w-4 h-4 text-blue-300" />
                {isRu ? "40+ параметров" : "40+ parametr"}
              </div>
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                <BadgeCheck className="w-4 h-4 text-blue-300" />
                {isRu ? "Бейдж «Проверено»" : "'Tekshirilgan' belgisi"}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="bg-white py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
              {isRu ? "Как это работает" : "Bu qanday ishlaydi"}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((s) => (
                <div key={s.n} className="relative">
                  <div className="text-4xl font-black text-blue-100 mb-3 leading-none">{s.n}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* What we check */}
        <section className="bg-gray-50 py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
              {isRu ? "Что проверяем" : "Nimalari tekshiriladi"}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {CHECKS.map((c) => (
                <div key={c.label} className="bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="text-3xl mb-3">{c.icon}</div>
                  <div className="font-semibold text-gray-900 mb-1">{c.label}</div>
                  <div className="text-xs text-gray-500 leading-relaxed">{c.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-white py-14 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {isRu ? "Почему стоит проверить?" : "Nima uchun tekshirish kerak?"}
                </h2>
                <ul className="space-y-4">
                  {(isRu ? [
                    "Объявление получает синий бейдж «Проверено» — больше доверия покупателей",
                    "Покупатели видят подробный отчёт прямо на странице объявления",
                    "Автомобиль продаётся быстрее и по более высокой цене",
                    "Выявляем скрытые дефекты ДО сделки — никаких неприятных сюрпризов",
                    "Независимая оценка состояния от специалистов Mashina.uz",
                  ] : [
                    "E'lon 'Tekshirilgan' ko'k belgisi oladi — xaridorlar ko'proq ishonadi",
                    "Xaridorlar batafsil hisobotni e'lon sahifasida ko'radi",
                    "Avtomobil tezroq va yuqoriroq narxda sotiladi",
                    "Yashirin nuqsonlarni BITIMdan oldin aniqlash",
                    "Mashina.uz mutaxassislaridan mustaqil baho",
                  ]).map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 text-center">
                <ShieldCheck className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <div className="text-5xl font-black text-blue-600 mb-1">
                  {isRu ? "Бесплатно" : "Bepul"}
                </div>
                <div className="text-gray-500 mb-6">
                  {isRu
                    ? "при размещении объявления через Mashina.uz"
                    : "Mashina.uz orqali e'lon joylashtirganda"}
                </div>
                <a href="#request-form" className="inline-block bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                  {isRu ? "Записаться" : "Ro'yxatdan o'tish"}
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Request form */}
        <section id="request-form" className="bg-gray-50 py-14 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
              {isRu ? "Записаться на проверку" : "Tekshiruvga yozilish"}
            </h2>
            <p className="text-center text-gray-500 mb-8">
              {isRu ? "Оставьте заявку — мы свяжемся в течение 2 часов" : "Ariza qoldiring — biz 2 soat ichida bog'lanamiz"}
            </p>
            <InspectionRequestForm locale={locale} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
