"use client";

import { Phone, MessageCircle } from "lucide-react";

export default function MobileContactBar({
  phone,
  title,
  locale,
}: {
  phone: string;
  title: string;
  locale: string;
}) {
  const isRu = locale === "ru";
  const waText = encodeURIComponent(isRu ? `Здравствуйте, я по объявлению: ${title}` : `Salom, e'lon bo'yicha: ${title}`);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3 flex gap-3 shadow-lg">
      <a
        href={`tel:${phone}`}
        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 active:bg-blue-800 transition-colors"
      >
        <Phone className="w-5 h-5" />
        {isRu ? "Позвонить" : "Qo'ng'iroq"}
      </a>
      <a
        href={`https://wa.me/${phone.replace(/\D/g, "")}?text=${waText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white py-3 rounded-xl font-semibold hover:bg-[#20BD5A] active:bg-[#1DA851] transition-colors"
      >
        <MessageCircle className="w-5 h-5" />
        WhatsApp
      </a>
    </div>
  );
}
