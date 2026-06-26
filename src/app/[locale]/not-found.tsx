"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] === "uz" ? "uz" : "ru";
  const isRu = locale === "ru";

  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-24 px-4 bg-gray-50">
        <div className="text-center max-w-lg">
          <div className="relative inline-block mb-6">
            <div className="text-9xl font-black text-blue-100 select-none">404</div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl">🚗</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {isRu ? "Страница не найдена" : "Sahifa topilmadi"}
          </h1>
          <p className="text-gray-500 mb-8 text-lg">
            {isRu
              ? "Объявление удалено, или такой страницы не существует."
              : "E'lon o'chirilgan yoki bunday sahifa mavjud emas."}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link
              href={`/${locale}/listings`}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              {isRu ? "Смотреть объявления" : "E'lonlarni ko'rish"}
            </Link>
            <Link
              href={`/${locale}`}
              className="border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              {isRu ? "На главную" : "Bosh sahifa"}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
