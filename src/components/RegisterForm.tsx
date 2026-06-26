"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Car, Eye, EyeOff, Loader2, Phone, Mail } from "lucide-react";
import { useUser } from "@/components/UserProvider";

type Mode = "phone" | "email";

export default function RegisterForm({ locale }: { locale: string }) {
  const isRu = locale === "ru";
  const router = useRouter();
  const { refresh } = useUser();
  const [mode, setMode] = useState<Mode>("phone");
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", confirm: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) { setError(isRu ? "Введите имя" : "Ism kiriting"); return; }
    if (form.password !== form.confirm) {
      setError(isRu ? "Пароли не совпадают" : "Parollar mos kelmaydi");
      return;
    }
    if (form.password.length < 6) {
      setError(isRu ? "Пароль минимум 6 символов" : "Parol kamida 6 ta belgi");
      return;
    }
    setLoading(true);
    setError("");

    const body: Record<string, string> = { name: form.name, password: form.password };
    if (mode === "phone") body.phone = form.phone;
    else body.email = form.email;

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(
        data.error === "phone_taken"
          ? isRu ? "Этот номер уже зарегистрирован" : "Bu raqam allaqachon ro'yxatdan o'tgan"
          : data.error === "email_taken"
          ? isRu ? "Этот email уже зарегистрирован" : "Bu email allaqachon ro'yxatdan o'tgan"
          : isRu ? "Ошибка регистрации" : "Ro'yxatdan o'tish xatosi"
      );
      setLoading(false);
      return;
    }
    refresh();
    router.push(`/${locale}/profile`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-3">
          <Car className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isRu ? "Создать аккаунт" : "Akkaunt yaratish"}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {isRu ? "Бесплатно — займёт меньше минуты" : "Bepul — bir daqiqadan kam vaqt ketadi"}
        </p>
      </div>

      {/* Mode toggle */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-5">
        <button
          type="button"
          onClick={() => setMode("phone")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "phone" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
          }`}
        >
          <Phone className="w-3.5 h-3.5" />
          {isRu ? "Телефон" : "Telefon"}
        </button>
        <button
          type="button"
          onClick={() => setMode("email")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "email" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500"
          }`}
        >
          <Mail className="w-3.5 h-3.5" />
          Email
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRu ? "Ваше имя" : "Ismingiz"}
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handle}
            placeholder={isRu ? "Иван Иванов" : "Ism Familiya"}
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {mode === "phone" ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isRu ? "Номер телефона" : "Telefon raqami"}
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handle}
              placeholder="+998 90 123 45 67"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              placeholder="email@example.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRu ? "Пароль" : "Parol"}
          </label>
          <div className="relative">
            <input
              name="password"
              type={showPw ? "text" : "password"}
              value={form.password}
              onChange={handle}
              placeholder={isRu ? "Минимум 6 символов" : "Kamida 6 ta belgi"}
              autoComplete="new-password"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRu ? "Подтвердите пароль" : "Parolni tasdiqlang"}
          </label>
          <input
            name="confirm"
            type="password"
            value={form.confirm}
            onChange={handle}
            placeholder="••••••••"
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
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
          {isRu ? "Создать аккаунт" : "Akkaunt yaratish"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {isRu ? "Уже есть аккаунт?" : "Akkauntingiz bormi?"}{" "}
        <Link href={`/${locale}/login`} className="text-blue-600 hover:underline font-medium">
          {isRu ? "Войти" : "Kirish"}
        </Link>
      </p>
    </div>
  );
}
