"use client";

import { useState } from "react";
import { Flag, X, CheckCircle2, Loader2 } from "lucide-react";

const REASONS_RU = [
  { value: "fake",         label: "Мошенничество / фейк" },
  { value: "wrong_price",  label: "Неверная цена" },
  { value: "already_sold", label: "Автомобиль уже продан" },
  { value: "duplicate",    label: "Дублирующее объявление" },
  { value: "spam",         label: "Спам / реклама" },
  { value: "other",        label: "Другое" },
];

const REASONS_UZ = [
  { value: "fake",         label: "Firibgarlik / soxta" },
  { value: "wrong_price",  label: "Noto'g'ri narx" },
  { value: "already_sold", label: "Avtomobil allaqachon sotilgan" },
  { value: "duplicate",    label: "Takroriy e'lon" },
  { value: "spam",         label: "Spam / reklama" },
  { value: "other",        label: "Boshqa" },
];

export default function ReportModal({ listingId, locale }: { listingId: number; locale: string }) {
  const isRu = locale === "ru";
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [contact, setContact] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError("");
    try {
      const res = await fetch(`/api/listings/${listingId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason, details, contact }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setSubmitError(data.error || (isRu ? "Ошибка отправки" : "Yuborishda xatolik"));
        return;
      }
      setDone(true);
    } catch {
      setSubmitError(isRu ? "Ошибка сети" : "Tarmoq xatosi");
    } finally {
      setLoading(false);
    }
  };

  const reasons = isRu ? REASONS_RU : REASONS_UZ;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors"
      >
        <Flag className="w-3.5 h-3.5" />
        {isRu ? "Пожаловаться" : "Shikoyat qilish"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {isRu ? "Пожаловаться на объявление" : "E'longa shikoyat qilish"}
              </h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {done ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="font-medium text-gray-900 mb-1">
                  {isRu ? "Жалоба отправлена" : "Shikoyat yuborildi"}
                </p>
                <p className="text-sm text-gray-500">
                  {isRu ? "Мы рассмотрим её в течение 24 часов." : "24 soat ichida ko'rib chiqamiz."}
                </p>
                <button
                  onClick={() => { setOpen(false); setDone(false); setReason(""); setDetails(""); }}
                  className="mt-5 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 rounded-xl text-sm font-medium"
                >
                  {isRu ? "Закрыть" : "Yopish"}
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isRu ? "Причина*" : "Sabab*"}
                  </label>
                  <div className="space-y-2">
                    {reasons.map((r) => (
                      <label key={r.value} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="reason"
                          value={r.value}
                          checked={reason === r.value}
                          onChange={() => setReason(r.value)}
                          className="accent-blue-600"
                        />
                        <span className="text-sm text-gray-700">{r.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRu ? "Подробности (необязательно)" : "Tafsilotlar (ixtiyoriy)"}
                  </label>
                  <textarea
                    rows={3}
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRu ? "Ваш контакт (необязательно)" : "Sizning kontaktingiz (ixtiyoriy)"}
                  </label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder={isRu ? "Телефон или email" : "Telefon yoki email"}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900"
                  />
                </div>

                {submitError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{submitError}</p>
                )}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
                  >
                    {isRu ? "Отмена" : "Bekor qilish"}
                  </button>
                  <button
                    type="submit"
                    disabled={!reason || loading}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isRu ? "Отправить" : "Yuborish"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
