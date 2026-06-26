"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordForm({ locale }: { locale: string }) {
  const isRu = locale === "ru";
  const [login, setLogin] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) setSent(true);
    else setError(data.error || "Ошибка");
  };

  if (sent) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isRu ? "Ссылка отправлена" : "Havola yuborildi"}
        </h2>
        <p className="text-gray-500 text-sm">
          {isRu
            ? "Если аккаунт с такими данными существует, ссылка для сброса пароля будет отправлена. Проверьте сообщения."
            : "Agar bunday ma'lumotlar bilan hisob mavjud bo'lsa, parolni tiklash havolasi yuboriladi."}
        </p>
        <p className="mt-4 text-xs text-gray-400">
          {isRu ? "В режиме разработки — ссылка в консоли сервера." : "Dev rejimida — havola server konsolida."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Mail className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRu ? "Сброс пароля" : "Parolni tiklash"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isRu
            ? "Введите телефон или email — пришлём ссылку для сброса"
            : "Telefon yoki email kiriting — tiklash havolasini yuboramiz"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRu ? "Телефон или Email" : "Telefon yoki Email"}
          </label>
          <input
            required
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder={isRu ? "+998 90 000 00 00 или email@mail.com" : "+998 90 000 00 00 yoki email@mail.com"}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isRu ? "Отправить ссылку" : "Havola yuborish"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {isRu ? "Вспомнили пароль? " : "Parolni esladingizmi? "}
        <Link href={`/${locale}/login`} className="text-blue-600 hover:underline font-medium">
          {isRu ? "Войти" : "Kirish"}
        </Link>
      </p>
    </div>
  );
}
