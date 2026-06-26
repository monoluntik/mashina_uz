"use client";

import { useState } from "react";
import { Bookmark, BookmarkCheck, Loader2 } from "lucide-react";
import { useUser } from "@/components/UserProvider";
import { toast } from "@/hooks/useToast";

export default function SaveSearchButton({ filters, locale }: { filters: string; locale: string }) {
  const { user } = useUser();
  const isRu = locale === "ru";
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!user) return null;

  const save = async () => {
    const name = prompt(isRu ? "Название поиска (например: Toyota до 200 млн):" : "Qidiruv nomi:");
    if (!name?.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, filters }),
      });
      if (!res.ok) {
        const d = await res.json();
        toast(d.error || (isRu ? "Ошибка" : "Xato"), "error");
      } else {
        setSaved(true);
        toast(isRu ? "Поиск сохранён" : "Qidiruv saqlandi", "success");
        setTimeout(() => setSaved(false), 3000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <button
      onClick={save}
      disabled={saving}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors disabled:opacity-50"
    >
      {saving ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : saved ? (
        <BookmarkCheck className="w-4 h-4 text-green-500" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      {isRu ? "Сохранить поиск" : "Qidiruvni saqlash"}
    </button>
  );
}
