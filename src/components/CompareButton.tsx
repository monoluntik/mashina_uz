"use client";

import { useComparison } from "@/hooks/useComparison";
import { GitCompareArrows } from "lucide-react";

export default function CompareButtonClient({ listingId, locale }: { listingId: number; locale: string }) {
  const { toggle, isComparing, isFull } = useComparison();
  const active = isComparing(listingId);
  const isRu = locale === "ru";

  return (
    <button
      onClick={() => toggle(listingId, locale)}
      disabled={!active && isFull}
      className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-colors ${
        active
          ? "bg-blue-50 border-blue-300 text-blue-700"
          : isFull
          ? "border-gray-200 text-gray-400 cursor-not-allowed"
          : "border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600"
      }`}
    >
      <GitCompareArrows className="w-4 h-4" />
      {active
        ? isRu ? "В сравнении ✓" : "Taqqoslamada ✓"
        : isFull
        ? isRu ? "Максимум 3 авто" : "Maksimal 3 ta"
        : isRu ? "Добавить к сравнению" : "Taqqoslashga qo'shish"}
    </button>
  );
}
