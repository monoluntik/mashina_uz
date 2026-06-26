"use client";
import { useState } from "react";
import { CAR_BRANDS } from "@/types";
import { CheckCircle2, Loader2 } from "lucide-react";

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 35 }, (_, i) => CURRENT_YEAR - i);

export default function InspectionRequestForm({ locale }: { locale: string }) {
  const isRu = locale === "ru";
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    carBrand: "",
    carModel: "",
    carYear: String(CURRENT_YEAR - 3),
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.carBrand || !form.carModel) {
      setError(isRu ? "Пожалуйста, заполните обязательные поля" : "Iltimos, majburiy maydonlarni to'ldiring");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/inspection-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Server error");
      setSubmitted(true);
    } catch {
      setError(isRu ? "Произошла ошибка. Попробуйте ещё раз." : "Xato yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-green-200 p-10 text-center">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {isRu ? "Заявка отправлена!" : "Ariza yuborildi!"}
        </h3>
        <p className="text-gray-500">
          {isRu
            ? "Мы свяжемся с вами в течение 2 часов для подтверждения записи."
            : "Biz 2 soat ichida siz bilan bog'lanamiz."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-gray-200 p-8 space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRu ? "Ваше имя" : "Ismingiz"} <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handle}
            placeholder={isRu ? "Иван Иванов" : "Ism Familiya"}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRu ? "Телефон" : "Telefon"} <span className="text-red-500">*</span>
          </label>
          <input
            name="phone"
            value={form.phone}
            onChange={handle}
            placeholder="+998 90 123 45 67"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handle}
          placeholder={isRu ? "email@example.com (необязательно)" : "email@example.com (ixtiyoriy)"}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          {isRu ? "Ваш автомобиль" : "Avtomobilingiz"}
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {isRu ? "Марка" : "Marka"} <span className="text-red-500">*</span>
            </label>
            <select
              name="carBrand"
              value={form.carBrand}
              onChange={handle}
              className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">—</option>
              {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              {isRu ? "Модель" : "Model"} <span className="text-red-500">*</span>
            </label>
            <input
              name="carModel"
              value={form.carModel}
              onChange={handle}
              placeholder={isRu ? "напр. Cobalt" : "mas. Cobalt"}
              className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">{isRu ? "Год" : "Yil"}</label>
            <select
              name="carYear"
              value={form.carYear}
              onChange={handle}
              className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isRu ? "Комментарий (необязательно)" : "Izoh (ixtiyoriy)"}
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handle}
          rows={3}
          placeholder={isRu ? "Опишите состояние авто, удобное время для визита..." : "Avtomobil holati, qulay vaqt..."}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isRu ? "Отправить заявку" : "Ariza yuborish"}
      </button>
    </form>
  );
}
