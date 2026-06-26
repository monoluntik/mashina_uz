"use client";

import { useRouter } from "next/navigation";

interface QuickFilter {
  label: string;
  params: Record<string, string>;
}

const QUICK_RU: QuickFilter[] = [
  { label: "Chevrolet",    params: { brand: "Chevrolet" } },
  { label: "Toyota",       params: { brand: "Toyota" } },
  { label: "Hyundai",      params: { brand: "Hyundai" } },
  { label: "Kia",          params: { brand: "Kia" } },
  { label: "BMW",          params: { brand: "BMW" } },
  { label: "до 100 млн",   params: { priceTo: "100000000" } },
  { label: "до 200 млн",   params: { priceTo: "200000000" } },
  { label: "до 500 млн",   params: { priceTo: "500000000" } },
  { label: "Новые",        params: { condition: "new" } },
  { label: "Кроссоверы",   params: { bodyType: "SUV" } },
  { label: "Седаны",       params: { bodyType: "Sedan" } },
  { label: "Электро",      params: { fuelType: "Elektr" } },
];

const QUICK_UZ: QuickFilter[] = [
  { label: "Chevrolet",    params: { brand: "Chevrolet" } },
  { label: "Toyota",       params: { brand: "Toyota" } },
  { label: "Hyundai",      params: { brand: "Hyundai" } },
  { label: "Kia",          params: { brand: "Kia" } },
  { label: "BMW",          params: { brand: "BMW" } },
  { label: "100 mlngacha", params: { priceTo: "100000000" } },
  { label: "200 mlngacha", params: { priceTo: "200000000" } },
  { label: "500 mlngacha", params: { priceTo: "500000000" } },
  { label: "Yangi",        params: { condition: "new" } },
  { label: "Krossoverlar", params: { bodyType: "SUV" } },
  { label: "Sedanlar",     params: { bodyType: "Sedan" } },
  { label: "Elektr",       params: { fuelType: "Elektr" } },
];

export default function QuickFilters({
  locale,
  currentFilters,
}: {
  locale: string;
  currentFilters: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const filters = locale === "ru" ? QUICK_RU : QUICK_UZ;

  const isActive = (qf: QuickFilter) =>
    Object.entries(qf.params).every(([k, v]) => currentFilters[k] === v);

  const apply = (qf: QuickFilter) => {
    if (isActive(qf)) {
      router.push(`/${locale}/listings`);
      return;
    }
    const params = new URLSearchParams(qf.params);
    router.push(`/${locale}/listings?${params.toString()}`);
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {filters.map((qf) => (
        <button
          key={qf.label}
          onClick={() => apply(qf)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
            isActive(qf)
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
          }`}
        >
          {qf.label}
        </button>
      ))}
    </div>
  );
}
