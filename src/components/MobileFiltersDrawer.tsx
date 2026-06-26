"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import FiltersPanel from "@/components/FiltersPanel";

interface Props {
  currentFilters: Record<string, string | undefined>;
  locale: string;
  activeCount: number;
}

export default function MobileFiltersDrawer({ currentFilters, locale, activeCount }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:border-blue-400 transition-colors lg:hidden"
      >
        <SlidersHorizontal className="w-4 h-4" />
        {locale === "ru" ? "Фильтры" : "Filtrlar"}
        {activeCount > 0 && (
          <span className="w-5 h-5 flex items-center justify-center bg-blue-600 text-white text-xs font-bold rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="font-semibold text-gray-900">
                {locale === "ru" ? "Фильтры" : "Filtrlar"}
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Закрыть"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-4" onClick={() => setOpen(false)}>
              <FiltersPanel currentFilters={currentFilters} locale={locale} onApply={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
