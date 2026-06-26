"use client";
import { useState, useEffect } from "react";
import { Copy, Check } from "lucide-react";

export default function ShareButtons({
  title,
  price,
  locale,
}: {
  title: string;
  price: number;
  locale: string;
}) {
  const isRu = locale === "ru";
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const msg = encodeURIComponent(
    `${title} — ${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} сум на Mashina.uz`
  );

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-sm font-medium text-gray-700 mb-3">
        {isRu ? "Поделиться" : "Ulashish"}
      </p>
      <div className="flex gap-2">
        <a
          href={url ? `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${msg}` : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#2AABEE] text-white py-2 rounded-lg text-xs font-medium hover:bg-[#229ED9] transition-colors"
        >
          Telegram
        </a>
        <a
          href={url ? `https://wa.me/?text=${msg}%20${encodeURIComponent(url)}` : "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] text-white py-2 rounded-lg text-xs font-medium hover:bg-[#20BD5A] transition-colors"
        >
          WhatsApp
        </a>
        <button
          onClick={copyLink}
          className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 py-2 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-500" />
              {isRu ? "Скопировано" : "Nusxalandi"}
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              {isRu ? "Копировать" : "Nusxa olish"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
