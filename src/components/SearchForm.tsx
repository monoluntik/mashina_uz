"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import {
  CAR_BRANDS,
  UZBEKISTAN_CITIES,
  BODY_TYPES,
} from "@/types";

const YEARS = Array.from({ length: 35 }, (_, i) => 2024 - i);

export default function SearchForm() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const router = useRouter();

  const [filters, setFilters] = useState({
    brand: "",
    yearFrom: "",
    yearTo: "",
    priceFrom: "",
    priceTo: "",
    city: "",
    bodyType: "",
  });

  const handleSearch = () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.push(`/${locale}/listings?${params.toString()}`);
  };

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
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
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
