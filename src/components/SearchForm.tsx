"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ChevronDown, ShieldCheck } from "lucide-react";
import {
  CAR_BRANDS,
  UZBEKISTAN_CITIES,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSIONS,
  MILEAGE_STEPS,
} from "@/types";
import { labelBody, labelFuel, labelTransmission } from "@/lib/carLabels";

const YEARS = Array.from({ length: 35 }, (_, i) => 2024 - i);

export default function SearchForm() {
  const t = useTranslations("hero");
  const tFilters = useTranslations("filters");
  const locale = useLocale();
  const router = useRouter();

  const [showAdvanced, setShowAdvanced] = useState(false);

  const [filters, setFilters] = useState({
    brand: "",
    yearFrom: "",
    yearTo: "",
    priceFrom: "",
    priceTo: "",
    city: "",
    bodyType: "",
    fuelType: "",
    transmission: "",
    mileageTo: "",
    isVerified: "",
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/${locale}/listings?${params.toString()}`);
  };

  const selectClass =
    "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white";

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Brand */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("allBrands")}
          </label>
          <select
            value={filters.brand}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            className={selectClass}
          >
            <option value="">{t("allBrands")}</option>
            {CAR_BRANDS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* City */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("anyCity")}
          </label>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className={selectClass}
          >
            <option value="">{t("anyCity")}</option>
            {UZBEKISTAN_CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Year From */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("yearFrom")}
          </label>
          <select
            value={filters.yearFrom}
            onChange={(e) =>
              setFilters({ ...filters, yearFrom: e.target.value })
            }
            className={selectClass}
          >
            <option value="">{t("anyYear")}</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Price To */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            {t("priceTo")}
          </label>
          <input
            type="number"
            placeholder="50 000 000"
            value={filters.priceTo}
            onChange={(e) =>
              setFilters({ ...filters, priceTo: e.target.value })
            }
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Advanced toggle */}
      <button
        type="button"
        onClick={() => setShowAdvanced((v) => !v)}
        className="mt-3 flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
      >
        <ChevronDown
          className={`w-4 h-4 transition-transform ${showAdvanced ? "rotate-180" : ""}`}
        />
        {showAdvanced ? t("hideAdvanced") : t("advancedSearch")}
      </button>

      {/* Advanced fields */}
      {showAdvanced && (
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {tFilters("bodyType")}
            </label>
            <select
              value={filters.bodyType}
              onChange={(e) => setFilters({ ...filters, bodyType: e.target.value })}
              className={selectClass}
            >
              <option value="">—</option>
              {BODY_TYPES.map((b) => (
                <option key={b} value={b}>{labelBody(b, locale)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {tFilters("fuelType")}
            </label>
            <select
              value={filters.fuelType}
              onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
              className={selectClass}
            >
              <option value="">—</option>
              {FUEL_TYPES.map((f) => (
                <option key={f} value={f}>{labelFuel(f, locale)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {tFilters("transmission")}
            </label>
            <select
              value={filters.transmission}
              onChange={(e) => setFilters({ ...filters, transmission: e.target.value })}
              className={selectClass}
            >
              <option value="">—</option>
              {TRANSMISSIONS.map((tr) => (
                <option key={tr} value={tr}>{labelTransmission(tr, locale)}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              {t("mileageTo")}
            </label>
            <select
              value={filters.mileageTo}
              onChange={(e) => setFilters({ ...filters, mileageTo: e.target.value })}
              className={selectClass}
            >
              <option value="">—</option>
              {MILEAGE_STEPS.map((m) => (
                <option key={m.value} value={m.value}>{locale === "ru" ? m.ru : m.uz}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer group sm:col-span-2 lg:col-span-4">
            <div
              onClick={() => setFilters({ ...filters, isVerified: filters.isVerified ? "" : "true" })}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors flex-shrink-0 ${
                filters.isVerified ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"
              }`}
            >
              {filters.isVerified && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-gray-700 font-medium">{t("onlyVerified")}</span>
            </div>
          </label>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSearch}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          <Search className="w-4 h-4" />
          {t("search")}
        </button>
      </div>
    </div>
  );
}
