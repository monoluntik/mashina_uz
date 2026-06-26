"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useUser } from "@/components/UserProvider";
import {
  CAR_BRANDS,
  UZBEKISTAN_CITIES,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  DRIVE_TYPES,
  COLORS,
} from "@/types";
import { CheckCircle, Loader2, ImagePlus, X, AlertCircle } from "lucide-react";
import { labelFuel, labelTransmission, labelBody, labelDrive, labelColor } from "@/lib/carLabels";

const YEARS = Array.from({ length: 35 }, (_, i) => 2024 - i);
const ENGINE_VOLUMES = ["1.0", "1.2", "1.4", "1.5", "1.6", "1.8", "2.0", "2.2", "2.4", "2.5", "3.0", "3.5", "4.0"];

interface SellFormProps {
  locale: string;
}

export default function SellForm({ locale }: SellFormProps) {
  const t = useTranslations("sell");
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [newId, setNewId] = useState<number | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const [form, setForm] = useState({
    brand: "",
    model: "",
    year: "",
    price: "",
    mileage: "",
    city: "",
    bodyType: "",
    fuelType: "",
    transmission: "",
    color: "",
    engineVolume: "",
    driveType: "",
    condition: "used",
    vin: "",
    description: "",
    sellerName: "",
    sellerPhone: "",
  });

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/${locale}/login?redirect=/${locale}/sell`);
    }
  }, [user, loading]);

  // Pre-fill seller info from user profile
  useEffect(() => {
    if (user) {
      setForm((p) => ({
        ...p,
        sellerName: p.sellerName || user.name,
        sellerPhone: p.sellerPhone || (user.phone || ""),
      }));
    }
  }, [user]);

  const set = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (images.length + files.length > 10) {
      setUploadError(locale === "ru" ? "Максимум 10 фотографий" : "Maksimal 10 ta rasm");
      return;
    }
    const oversized = Array.from(files).find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) {
      setUploadError(locale === "ru" ? `Файл "${oversized.name}" больше 10 МБ` : `"${oversized.name}" fayli 10 MB dan katta`);
      return;
    }
    setUploadError("");
    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) uploaded.push(data.url);
      else setUploadError(data.error || "Ошибка загрузки");
    }
    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Ошибка при публикации");
      setNewId(data.id);
      setSuccess(true);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Ошибка при публикации");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t("success")}</h2>
        <p className="text-gray-500 mb-4">
          {locale === "ru"
            ? "Ваше объявление отправлено на модерацию и появится после проверки."
            : "E'loningiz moderatsiyaga yuborildi va tekshiruvdan so'ng ko'rinadi."}
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={() => router.push(`/${locale}/listings`)}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            {locale === "ru" ? "Смотреть объявления" : "E'lonlarni ko'rish"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100"
    >
      {/* Section 1: Main info */}
      <div className="p-6">
        <h2 className="font-semibold text-gray-900 mb-5">{t("step1")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("brand")} *
            </label>
            <select
              required
              value={form.brand}
              onChange={(e) => set("brand", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">—</option>
              {CAR_BRANDS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("model")} *
            </label>
            <input
              required
              type="text"
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
              placeholder="Cobalt, Spark, Camry..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("year")} *
            </label>
            <select
              required
              value={form.year}
              onChange={(e) => set("year", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">—</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("price")} *
            </label>
            <input
              required
              type="number"
              min="0"
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              placeholder="12 000 000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("mileage")} *
            </label>
            <input
              required
              type="number"
              min="0"
              value={form.mileage}
              onChange={(e) => set("mileage", e.target.value)}
              placeholder="45000"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("city")} *
            </label>
            <select
              required
              value={form.city}
              onChange={(e) => set("city", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">—</option>
              {UZBEKISTAN_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section 2: Details */}
      <div className="p-6">
        <h2 className="font-semibold text-gray-900 mb-5">{t("step2")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("bodyType")} *
            </label>
            <select
              required
              value={form.bodyType}
              onChange={(e) => set("bodyType", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">—</option>
              {BODY_TYPES.map((b) => (
                <option key={b} value={b}>{labelBody(b, locale)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("fuelType")} *
            </label>
            <select
              required
              value={form.fuelType}
              onChange={(e) => set("fuelType", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">—</option>
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>{labelFuel(f, locale)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("transmission")} *
            </label>
            <select
              required
              value={form.transmission}
              onChange={(e) => set("transmission", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">—</option>
              {TRANSMISSIONS.map((tr) => (
                <option key={tr} value={tr}>{labelTransmission(tr, locale)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("color")} *
            </label>
            <select
              required
              value={form.color}
              onChange={(e) => set("color", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">—</option>
              {COLORS.map((c) => (
                <option key={c} value={c}>{labelColor(c, locale)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("engineVolume")} *
            </label>
            <select
              required
              value={form.engineVolume}
              onChange={(e) => set("engineVolume", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">—</option>
              {ENGINE_VOLUMES.map((v) => (
                <option key={v} value={v}>
                  {v} л
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("driveType")} *
            </label>
            <select
              required
              value={form.driveType}
              onChange={(e) => set("driveType", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">—</option>
              {DRIVE_TYPES.map((d) => (
                <option key={d} value={d}>{labelDrive(d, locale)}</option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("condition")}
            </label>
            <div className="flex gap-3">
              {["used", "new"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("condition", c)}
                  className={`flex-1 py-2.5 rounded-lg font-medium border transition-colors ${
                    form.condition === c
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-200 text-gray-600 hover:border-blue-400"
                  }`}
                >
                  {c === "new"
                    ? locale === "ru"
                      ? "Новый"
                      : "Yangi"
                    : locale === "ru"
                    ? "Б/у"
                    : "B/u"}
                </button>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              VIN {locale === "ru" ? "(необязательно)" : "(ixtiyoriy)"}
            </label>
            <input
              type="text"
              value={form.vin}
              onChange={(e) => set("vin", e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, ""))}
              maxLength={17}
              placeholder="например: WBAJB9C51JB012345"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {form.vin && form.vin.length > 0 && form.vin.length !== 17 && (
              <p className="text-xs text-amber-600 mt-1">
                {locale === "ru" ? `VIN должен быть 17 символов (сейчас: ${form.vin.length})` : `VIN 17 belgidan iborat bo'lishi kerak (hozir: ${form.vin.length})`}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("description")}
            </label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder={
                locale === "ru"
                  ? "Опишите состояние автомобиля, историю обслуживания, особенности..."
                  : "Avtomobil holati, texnik xizmat tarixi, xususiyatlarini tasvirlab bering..."
              }
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Photos */}
      <div className="p-6">
        <h2 className="font-semibold text-gray-900 mb-1">
          {locale === "ru" ? "Фотографии" : "Rasmlar"}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {locale === "ru"
            ? "До 10 фото. Первое фото — главное. JPG, PNG, WEBP до 10 МБ."
            : "10 tagacha rasm. Birinchi rasm asosiy. JPG, PNG, WEBP, 10 MB gacha."}
        </p>

        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {images.map((url, idx) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
              {idx === 0 && (
                <span className="absolute top-1 left-1 z-10 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                  {locale === "ru" ? "Главное" : "Asosiy"}
                </span>
              )}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {images.length < 10 && (
            <label
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleImageFiles(e.dataTransfer.files); }}
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              ) : (
                <>
                  <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500 text-center px-1">
                    {locale === "ru" ? "Добавить фото" : "Rasm qo'shish"}
                  </span>
                </>
              )}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={(e) => handleImageFiles(e.target.files)}
                disabled={uploading}
              />
            </label>
          )}
        </div>

        {uploadError && (
          <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {uploadError}
          </div>
        )}
      </div>

      {/* Section 5: Contact */}
      <div className="p-6">
        <h2 className="font-semibold text-gray-900 mb-5">{t("step3")}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("sellerName")} *
            </label>
            <input
              required
              type="text"
              value={form.sellerName}
              onChange={(e) => set("sellerName", e.target.value)}
              placeholder={locale === "ru" ? "Ваше имя" : "Ismingiz"}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("sellerPhone")} *
            </label>
            <input
              required
              type="tel"
              value={form.sellerPhone}
              onChange={(e) => set("sellerPhone", e.target.value)}
              placeholder="+998 90 123 45 67"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="p-6">
        <button
          type="submit"
          disabled={loading || uploading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          {t("submit")}
        </button>
      </div>
    </form>
  );
}
