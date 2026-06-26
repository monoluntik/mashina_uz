"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useComparison } from "@/hooks/useComparison";
import { useEffect, useState } from "react";
import { GitCompareArrows, X, ArrowRight } from "lucide-react";

type CarInfo = { id: number; brand: string; model: string; year: number };

export default function CompareBar() {
  const locale = useLocale();
  const { ids, remove, clear, count } = useComparison();
  const isRu = locale === "ru";
  const [cars, setCars] = useState<Record<number, CarInfo>>({});

  useEffect(() => {
    ids.forEach((id) => {
      if (cars[id]) return;
      fetch(`/api/listings/${id}`)
        .then((r) => r.json())
        .then((data) => {
          if (data?.id) {
            setCars((prev) => ({ ...prev, [id]: { id: data.id, brand: data.brand, model: data.model, year: data.year } }));
          }
        })
        .catch(() => {});
    });
  }, [ids]);

  if (count === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-lg px-4">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-3 flex items-center gap-3">
        <GitCompareArrows className="w-5 h-5 text-blue-400 flex-shrink-0" />
        <div className="flex-1 flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-400">
            {isRu ? `${count}/3` : `${count}/3`}
          </span>
          {ids.map((id) => {
            const car = cars[id];
            return (
              <span key={id} className="inline-flex items-center gap-1 bg-gray-700 rounded-lg px-2 py-0.5 text-xs font-medium">
                {car ? `${car.brand} ${car.model} ${car.year}` : `#${id}`}
                <button
                  onClick={() => remove(id)}
                  className="text-gray-400 hover:text-white ml-0.5"
                  aria-label={`Убрать ${car?.brand || id} из сравнения`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={clear} className="text-xs text-gray-400 hover:text-white whitespace-nowrap">
            {isRu ? "Очистить" : "Tozalash"}
          </button>
          <Link
            href={`/${locale}/compare?ids=${ids.join(",")}`}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap"
          >
            {isRu ? "Сравнить" : "Taqqoslash"}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
