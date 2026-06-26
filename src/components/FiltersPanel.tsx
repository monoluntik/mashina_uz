"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import {
  CAR_BRANDS,
  UZBEKISTAN_CITIES,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  DRIVE_TYPES,
  COLORS,
} from "@/types";
import { labelFuel, labelTransmission, labelBody, labelDrive, labelColor } from "@/lib/carLabels";

interface FiltersPanelProps {
  currentFilters: Record<string, string | undefined>;
  locale: string;
  onApply?: () => void;
}

const YEARS = Array.from({ length: 35 }, (_, i) => 2025 - i);

const ENGINE_VOLUMES = ["1.0", "1.2", "1.4", "1.5", "1.6", "1.8", "2.0", "2.4", "2.5", "3.0", "3.5", "4.0", "5.0", "6.0+"];

const MILEAGE_STEPS = [
  { value: "10000",  ru: "до 10 000 км",  uz: "10 000 kmgacha" },
  { value: "30000",  ru: "до 30 000 км",  uz: "30 000 kmgacha" },
  { value: "50000",  ru: "до 50 000 км",  uz: "50 000 kmgacha" },
  { value: "100000", ru: "до 100 000 км", uz: "100 000 kmgacha" },
  { value: "150000", ru: "до 150 000 км", uz: "150 000 kmgacha" },
  { value: "200000", ru: "до 200 000 км", uz: "200 000 kmgacha" },
  { value: "300000", ru: "до 300 000 км", uz: "300 000 kmgacha" },
];


const isRu = (locale: string) => locale === "ru";

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-medium text-gray-500 mb-1.5">{children}</label>;
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
    >
      {children}
    </select>
  );
}

export default function FiltersPanel({ currentFilters, locale, onApply }: FiltersPanelProps) {
  const router = useRouter();
  const ru = isRu(locale);

  const [f, setF] = useState({
    brand:         currentFilters.brand         || "",
    model:         currentFilters.model         || "",
    yearFrom:      currentFilters.yearFrom      || "",
    yearTo:        currentFilters.yearTo        || "",
    priceFrom:     currentFilters.priceFrom     || "",
    priceTo:       currentFilters.priceTo       || "",
    mileageTo:     currentFilters.mileageTo     || "",
    mileageFrom:   currentFilters.mileageFrom   || "",
    city:          currentFilters.city          || "",
    bodyType:      currentFilters.bodyType      || "",
    fuelType:      currentFilters.fuelType      || "",
    transmission:  currentFilters.transmission  || "",
    driveType:     currentFilters.driveType     || "",
    engineFrom:    currentFilters.engineFrom    || "",
    engineTo:      currentFilters.engineTo      || "",
    color:         currentFilters.color         || "",
    condition:     currentFilters.condition     || "",
    isVerified:    currentFilters.isVerified    || "",
  });

  const set = (key: keyof typeof f) => (value: string) => setF((prev) => ({ ...prev, [key]: value }));

  const apply = () => {
    const params = new URLSearchParams();
    Object.entries(f).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/${locale}/listings?${params.toString()}`);
    onApply?.();
  };

  const reset = () => {
    const blank = Object.fromEntries(Object.keys(f).map((k) => [k, ""])) as typeof f;
    setF(blank);
    router.push(`/${locale}/listings`);
    onApply?.();
  };

  const activeCount = Object.values(f).filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">
          {ru ? "Фильтры" : "Filtrlar"}
          {activeCount > 0 && (
            <span className="ml-2 text-xs font-medium bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </h2>
        {activeCount > 0 && (
          <button onClick={reset} className="text-sm text-blue-600 hover:underline">
            {ru ? "Сбросить" : "Tozalash"}
          </button>
        )}
      </div>

      {/* Brand */}
      <div>
        <Label>{ru ? "Марка" : "Marka"}</Label>
        <Select value={f.brand} onChange={set("brand")}>
          <option value="">—</option>
          {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
        </Select>
      </div>

      {/* Model */}
      <div>
        <Label>{ru ? "Модель" : "Model"}</Label>
        <input
          type="text"
          value={f.model}
          onChange={(e) => set("model")(e.target.value)}
          placeholder={ru ? "Например: Camry, Nexia..." : "Masalan: Camry, Nexia..."}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Condition */}
      <div>
        <Label>{ru ? "Состояние" : "Holat"}</Label>
        <div className="flex gap-2">
          {(["", "new", "used"] as const).map((c) => (
            <button
              key={c}
              onClick={() => set("condition")(c)}
              className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                f.condition === c
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-200 text-gray-600 hover:border-blue-400"
              }`}
            >
              {c === "" ? "—" : c === "new" ? (ru ? "Новый" : "Yangi") : ru ? "Б/у" : "B/u"}
            </button>
          ))}
        </div>
      </div>

      {/* Year */}
      <div>
        <Label>{ru ? "Год выпуска" : "Ishlab chiqarilgan yili"}</Label>
        <div className="flex gap-2">
          <Select value={f.yearFrom} onChange={set("yearFrom")}>
            <option value="">{ru ? "от" : "dan"}</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
          <Select value={f.yearTo} onChange={set("yearTo")}>
            <option value="">{ru ? "до" : "gacha"}</option>
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </Select>
        </div>
        {f.yearFrom && f.yearTo && parseInt(f.yearFrom) > parseInt(f.yearTo) && (
          <p className="text-xs text-red-500 mt-1">{ru ? "Год «от» больше года «до»" : "«dan» yili «gacha» yilidan katta"}</p>
        )}
      </div>

      {/* Price */}
      <div>
        <Label>{ru ? "Цена, сум" : "Narx, so'm"}</Label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={ru ? "от" : "dan"}
            value={f.priceFrom}
            onChange={(e) => set("priceFrom")(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            placeholder={ru ? "до" : "gacha"}
            value={f.priceTo}
            onChange={(e) => set("priceTo")(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {f.priceFrom && f.priceTo && parseInt(f.priceFrom) > parseInt(f.priceTo) && (
          <p className="text-xs text-red-500 mt-1">{ru ? "Цена «от» больше цены «до»" : "«dan» narx «gacha» narxdan katta"}</p>
        )}
      </div>

      {/* Mileage */}
      <div>
        <Label>{ru ? "Пробег, км" : "Yurish, km"}</Label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={ru ? "от" : "dan"}
            value={f.mileageFrom}
            onChange={(e) => set("mileageFrom")(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-2 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Select value={f.mileageTo} onChange={set("mileageTo")}>
            <option value="">{ru ? "до" : "gacha"}</option>
            {MILEAGE_STEPS.map((m) => <option key={m.value} value={m.value}>{ru ? m.ru : m.uz}</option>)}
          </Select>
        </div>
      </div>

      {/* City */}
      <div>
        <Label>{ru ? "Город" : "Shahar"}</Label>
        <Select value={f.city} onChange={set("city")}>
          <option value="">—</option>
          {UZBEKISTAN_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </Select>
      </div>

      {/* Body type */}
      <div>
        <Label>{ru ? "Тип кузова" : "Kuzov turi"}</Label>
        <Select value={f.bodyType} onChange={set("bodyType")}>
          <option value="">—</option>
          {BODY_TYPES.map((b) => <option key={b} value={b}>{labelBody(b, locale)}</option>)}
        </Select>
      </div>

      {/* Fuel type */}
      <div>
        <Label>{ru ? "Тип топлива" : "Yoqilg'i turi"}</Label>
        <Select value={f.fuelType} onChange={set("fuelType")}>
          <option value="">—</option>
          {FUEL_TYPES.map((ft) => <option key={ft} value={ft}>{labelFuel(ft, locale)}</option>)}
        </Select>
      </div>

      {/* Transmission */}
      <div>
        <Label>{ru ? "Коробка передач" : "Uzatmalar qutisi"}</Label>
        <Select value={f.transmission} onChange={set("transmission")}>
          <option value="">—</option>
          {TRANSMISSIONS.map((tr) => <option key={tr} value={tr}>{labelTransmission(tr, locale)}</option>)}
        </Select>
      </div>

      {/* Drive type */}
      <div>
        <Label>{ru ? "Привод" : "Yurish turi"}</Label>
        <div className="flex gap-2 flex-wrap">
          {(["", ...DRIVE_TYPES] as string[]).map((d) => (
            <button
              key={d}
              onClick={() => set("driveType")(d)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                f.driveType === d
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-200 text-gray-600 hover:border-blue-400"
              }`}
            >
              {d === "" ? (ru ? "Любой" : "Har qanday") : labelDrive(d, locale)}
            </button>
          ))}
        </div>
      </div>

      {/* Engine volume */}
      <div>
        <Label>{ru ? "Объём двигателя, л" : "Dvigatel hajmi, l"}</Label>
        <div className="flex gap-2">
          <Select value={f.engineFrom} onChange={set("engineFrom")}>
            <option value="">{ru ? "от" : "dan"}</option>
            {ENGINE_VOLUMES.map((v) => <option key={v} value={v === "6.0+" ? "6" : v}>{v}</option>)}
          </Select>
          <Select value={f.engineTo} onChange={set("engineTo")}>
            <option value="">{ru ? "до" : "gacha"}</option>
            {ENGINE_VOLUMES.map((v) => <option key={v} value={v === "6.0+" ? "6" : v}>{v}</option>)}
          </Select>
        </div>
      </div>

      {/* Color */}
      <div>
        <Label>{ru ? "Цвет" : "Rang"}</Label>
        <div className="flex flex-wrap gap-1.5">
          {(["", ...COLORS] as string[]).map((c) => {
            const COLOR_HEX: Record<string, string> = {
              "Oq": "#ffffff", "Qora": "#1a1a1a", "Kumush": "#c0c0c0",
              "Kulrang": "#808080", "Qizil": "#dc2626", "Ko'k": "#2563eb",
              "Yashil": "#16a34a", "Sariq": "#ca8a04", "To'q sariq": "#ea580c",
              "Jigarrang": "#92400e",
            };
            if (c === "") {
              return (
                <button
                  key=""
                  onClick={() => set("color")("")}
                  className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${
                    f.color === "" ? "bg-blue-600 text-white border-blue-600" : "border-gray-200 text-gray-600 hover:border-blue-400"
                  }`}
                >
                  {ru ? "Любой" : "Har qanday"}
                </button>
              );
            }
            return (
              <button
                key={c}
                title={labelColor(c, locale)}
                onClick={() => set("color")(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  f.color === c ? "border-blue-600 scale-110 shadow-md" : "border-gray-200 hover:border-gray-400"
                } ${c === "Oq" ? "shadow-inner" : ""}`}
                style={{ backgroundColor: COLOR_HEX[c] || "#cccccc" }}
              />
            );
          })}
        </div>
        {f.color && (
          <p className="text-xs text-gray-500 mt-1">{labelColor(f.color, locale)}</p>
        )}
      </div>

      {/* Only verified */}
      <div>
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <div
            onClick={() => set("isVerified")(f.isVerified ? "" : "true")}
            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
              f.isVerified ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"
            }`}
          >
            {f.isVerified && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
          </div>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-700 font-medium">
              {ru ? "Только проверенные" : "Faqat tekshirilganlar"}
            </span>
          </div>
        </label>
      </div>

      <button
        onClick={apply}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        {ru ? "Показать результаты" : "Natijalarni ko'rsatish"}
      </button>
    </div>
  );
}
