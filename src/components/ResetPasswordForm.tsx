"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Eye, EyeOff, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useUser } from "@/components/UserProvider";

export default function ResetPasswordForm({ locale, token }: { locale: string; token: string }) {
  const isRu = locale === "ru";
  const router = useRouter();
  const { refresh } = useUser();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isRu ? "Недействительная ссылка" : "Havola yaroqsiz"}
        </h2>
        <p className="text-gray-500 text-sm">
          {isRu ? "Ссылка для сброса пароля устарела или уже использована." : "Parolni tiklash havolasi muddati o'tgan yoki allaqachon ishlatilgan."}
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) return setError(isRu ? "Пароли не совпадают" : "Parollar mos kelmaydi");
    if (password.length < 6) return setError(isRu ? "Минимум 6 символов" : "Kamida 6 ta belgi");
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      setDone(true);
      refresh();
      setTimeout(() => router.push(`/${locale}/profile`), 1500);
    } else {
      setError(data.error || "Ошибка");
    }
  };

  if (done) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          {isRu ? "Пароль изменён!" : "Parol o'zgartirildi!"}
        </h2>
        <p className="text-gray-500 text-sm">
          {isRu ? "Перенаправляем в профиль..." : "Profilga yo'naltirilmoqda..."}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <KeyRound className="w-6 h-6 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRu ? "Новый пароль" : "Yangi parol"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRu ? "Новый пароль" : "Yangi parol"}
          </label>
          <div className="relative">
            <input
              required
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isRu ? "Минимум 6 символов" : "Kamida 6 ta belgi"}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRu ? "Повторите пароль" : "Parolni takrorlang"}
          </label>
          <input
            required
            type={show ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={isRu ? "Повторите пароль" : "Parolni takrorlang"}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          />
        </div>

        {error && (
          <p className="flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4" />{error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isRu ? "Сохранить пароль" : "Parolni saqlash"}
        </button>
      </form>
    </div>
  );
}
