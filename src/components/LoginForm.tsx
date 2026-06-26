"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Car, Eye, EyeOff, Loader2 } from "lucide-react";
import { useUser } from "@/components/UserProvider";
import { useFavorites } from "@/hooks/useFavorites";

export default function LoginForm({ locale }: { locale: string }) {
  const isRu = locale === "ru";
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useUser();
  const { ids } = useFavorites();
  const [form, setForm] = useState({ login: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(
        data.error === "not_found"
          ? isRu ? "Пользователь не найден" : "Foydalanuvchi topilmadi"
          : data.error === "wrong_password"
          ? isRu ? "Неверный пароль" : "Noto'g'ri parol"
          : isRu ? "Ошибка входа" : "Kirish xatosi"
      );
      setLoading(false);
      return;
    }

    // Sync localStorage favorites to account
    if (ids.length > 0) {
      await fetch("/api/user/favorites", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids }),
      });
    }

    refresh();
    const redirectTo = searchParams.get("redirect") || `/${locale}/profile`;
    router.push(redirectTo);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-3">
          <Car className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRu ? "Вход в аккаунт" : "Akkauntga kirish"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isRu ? "Войдите через телефон или email" : "Telefon yoki email orqali kiring"}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRu ? "Телефон или Email" : "Telefon yoki Email"}
          </label>
          <input
            name="login"
            value={form.login}
            onChange={handle}
            autoComplete="username"
            placeholder="+998 90 123 45 67 или email@example.com"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700">
              {isRu ? "Пароль" : "Parol"}
            </label>
            <Link href={`/${locale}/forgot-password`} className="text-xs text-blue-600 hover:underline">
              {isRu ? "Забыли пароль?" : "Parolni unutdingizmi?"}
            </Link>
          </div>
          <div className="relative">
            <input
              name="password"
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={handle}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-11 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading && <Loader2 className="w-4 h-4 animate-spin" />}
          {isRu ? "Войти" : "Kirish"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {isRu ? "Нет аккаунта?" : "Akkauntingiz yo'qmi?"}{" "}
        <Link href={`/${locale}/register`} className="text-blue-600 hover:underline font-medium">
          {isRu ? "Зарегистрироваться" : "Ro'yxatdan o'tish"}
        </Link>
      </p>
    </div>
  );
}
