"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CAR_BRANDS, UZBEKISTAN_CITIES, BODY_TYPES, FUEL_TYPES, TRANSMISSIONS, DRIVE_TYPES, COLORS } from "@/types";
import { Loader2, ShieldCheck, ImagePlus, X } from "lucide-react";

const YEARS = Array.from({ length: 35 }, (_, i) => 2024 - i);
const ENGINE_VOLUMES = ["0.8", "1.0", "1.2", "1.4", "1.5", "1.6", "1.8", "2.0", "2.2", "2.4", "2.5", "3.0", "3.5", "4.0"];

export default function AdminListingForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    brand: "", model: "", year: "", price: "", mileage: "", city: "",
    bodyType: "", fuelType: "", transmission: "", color: "", engineVolume: "",
    driveType: "", condition: "used", description: "", sellerName: "", sellerPhone: "",
    isVerified: true,
  });

  const set = (key: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleImageFiles = async (files: FileList | null) => {
    if (!files || images.length + files.length > 10) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) setImages((prev) => [...prev, data.url]);
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, images }),
      });
      const data = await res.json();
      if (res.ok) router.push(`/admin/listings/${data.id}`);
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
      <input
        required
        type={type}
        value={form[key as keyof typeof form] as string}
        onChange={(e) => set(key, e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const select = (label: string, key: string, options: string[]) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
      <select
        required
        value={form[key as keyof typeof form] as string}
        onChange={(e) => set(key, e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">—</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
      {/* Main */}
      <div className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Основное</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {select("Марка", "brand", CAR_BRANDS)}
          {field("Модель", "model", "text", "Cobalt, Camry...")}
          {select("Год", "year", YEARS.map(String))}
          {field("Цена (сум)", "price", "number", "145000000")}
          {field("Пробег (км)", "mileage", "number", "45000")}
          {select("Город", "city", UZBEKISTAN_CITIES)}
        </div>
      </div>

      {/* Details */}
      <div className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Характеристики</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {select("Кузов", "bodyType", BODY_TYPES)}
          {select("Топливо", "fuelType", FUEL_TYPES)}
          {select("КПП", "transmission", TRANSMISSIONS)}
          {select("Цвет", "color", COLORS)}
          {select("Объём двигателя", "engineVolume", ENGINE_VOLUMES)}
          {select("Привод", "driveType", DRIVE_TYPES)}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Состояние</label>
            <div className="flex gap-3">
              {["used", "new"].map((c) => (
                <button key={c} type="button" onClick={() => set("condition", c)}
                  className={`flex-1 py-2.5 rounded-lg font-medium border transition-colors ${
                    form.condition === c ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-400"
                  }`}>
                  {c === "new" ? "Новый" : "Б/у"}
                </button>
              ))}
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Фотографии</h2>
        <p className="text-sm text-gray-500 mb-4">До 10 фото. Первое — главное на карточке.</p>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {images.map((url, idx) => (
            <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
              {idx === 0 && (
                <span className="absolute top-1 left-1 z-10 bg-blue-600 text-white text-[9px] px-1 py-0.5 rounded font-medium">Главное</span>
              )}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => setImages((p) => p.filter((_, i) => i !== idx))}
                className="absolute top-1 right-1 w-5 h-5 bg-black/60 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {images.length < 10 && (
            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 flex flex-col items-center justify-center cursor-pointer transition-colors bg-gray-50 hover:bg-blue-50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); handleImageFiles(e.dataTransfer.files); }}>
              {uploading ? <Loader2 className="w-5 h-5 text-blue-500 animate-spin" /> : (
                <>
                  <ImagePlus className="w-5 h-5 text-gray-400 mb-1" />
                  <span className="text-[10px] text-gray-500">Добавить</span>
                </>
              )}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only"
                onChange={(e) => handleImageFiles(e.target.files)} disabled={uploading} />
            </label>
          )}
        </div>
      </div>

      {/* Contact */}
      <div className="p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Контакт продавца</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("Имя", "sellerName", "text", "Имя продавца")}
          {field("Телефон", "sellerPhone", "tel", "+998 90 000 00 00")}
        </div>
      </div>

      {/* Verified toggle */}
      <div className="p-6">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => set("isVerified", !form.isVerified)}
            className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${form.isVerified ? "bg-blue-600" : "bg-gray-200"}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${form.isVerified ? "translate-x-6" : ""}`} />
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-5 h-5 ${form.isVerified ? "text-blue-600" : "text-gray-400"}`} />
            <span className="font-medium text-gray-700">Отметить «Проверено сайтом»</span>
          </div>
        </label>
        <p className="text-xs text-gray-400 mt-1 ml-15">
          На объявлении появится синий бейдж с галочкой
        </p>
      </div>

      <div className="p-6">
        <button type="submit" disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-60">
          {loading && <Loader2 className="w-5 h-5 animate-spin" />}
          Опубликовать объявление
        </button>
      </div>
    </form>
  );
}
