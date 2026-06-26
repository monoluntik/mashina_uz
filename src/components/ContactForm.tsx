"use client";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function ContactForm({ isRu }: { isRu: boolean }) {
  const [form, setForm] = useState({ name: "", contact: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => { setSent(true); setLoading(false); }, 800);
  };

  if (sent) {
    return (
      <div className="text-center py-10">
        <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <p className="font-semibold text-gray-900">
          {isRu ? "Сообщение отправлено!" : "Xabar yuborildi!"}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {isRu ? "Мы ответим в течение рабочего дня" : "Biz ish kuni ichida javob beramiz"}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isRu ? "Ваше имя" : "Ismingiz"}
        </label>
        <input
          name="name"
          value={form.name}
          onChange={handle}
          type="text"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          placeholder={isRu ? "Имя Фамилия" : "Ism Familiya"}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isRu ? "Контакт (телефон или email)" : "Aloqa (telefon yoki email)"}
        </label>
        <input
          name="contact"
          value={form.contact}
          onChange={handle}
          type="text"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
          placeholder="+998 90 000 00 00"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {isRu ? "Сообщение" : "Xabar"}
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handle}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none bg-white"
          placeholder={isRu ? "Ваш вопрос или сообщение..." : "Savolingiz yoki xabaringiz..."}
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {isRu ? "Отправить" : "Yuborish"}
      </button>
    </form>
  );
}
