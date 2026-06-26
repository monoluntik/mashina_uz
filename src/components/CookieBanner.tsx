"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { Cookie, X } from "lucide-react";

export default function CookieBanner() {
  const locale = useLocale();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie_consent")) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  };

  if (!visible) return null;

  const isRu = locale === "ru";

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="max-w-4xl mx-auto bg-gray-900 text-white rounded-2xl shadow-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Cookie className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5 sm:mt-0" />
        <p className="flex-1 text-sm text-gray-300">
          {isRu
            ? "Мы используем куки для улучшения работы сайта. Продолжая пользоваться сайтом, вы соглашаетесь с нашей "
            : "Sayt ishlashini yaxshilash uchun cookie fayllaridan foydalanamiz. Saytdan foydalanishni davom ettirib, siz bizning "}
          <Link href={`/${locale}/privacy`} className="text-blue-400 hover:underline">
            {isRu ? "политикой конфиденциальности" : "maxfiylik siyosati"}
          </Link>
          {isRu ? "." : "ga rozilik bildirasiz."}
        </p>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={accept}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {isRu ? "Принять" : "Qabul qilish"}
          </button>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-400 hover:text-white p-2 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
