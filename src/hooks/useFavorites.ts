"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/components/UserProvider";
import { useLocale } from "next-intl";
import { toast } from "@/hooks/useToast";

const KEY = "mashina_favorites";

export function useFavorites() {
  const { user } = useUser();
  const locale = useLocale();
  const ru = locale === "ru";
  const [ids, setIds] = useState<number[]>([]);

  // Load from localStorage on mount (always)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setIds(JSON.parse(stored));
    } catch {}
  }, []);

  // When user logs in, load DB favorites
  useEffect(() => {
    if (!user) return;
    fetch("/api/user/favorites")
      .then((r) => r.json())
      .then((data: { id: number }[]) => {
        if (Array.isArray(data)) {
          const dbIds = data.map((l) => l.id);
          setIds(dbIds);
          localStorage.setItem(KEY, JSON.stringify(dbIds));
        }
      })
      .catch(() => {});
  }, [user?.id]);

  const toggle = useCallback(
    async (id: number) => {
      if (user) {
        const res = await fetch("/api/user/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId: id }),
        });
        const data = await res.json();
        setIds((prev) => {
          const next = data.isFav ? [...prev, id] : prev.filter((x) => x !== id);
          localStorage.setItem(KEY, JSON.stringify(next));
          toast(data.isFav ? (ru ? "Добавлено в избранное" : "Sevimlilarga qo'shildi") : (ru ? "Удалено из избранного" : "Sevimlilardan olib tashlandi"), data.isFav ? "success" : "info");
          return next;
        });
      } else {
        setIds((prev) => {
          const adding = !prev.includes(id);
          const next = adding ? [...prev, id] : prev.filter((x) => x !== id);
          localStorage.setItem(KEY, JSON.stringify(next));
          toast(adding ? (ru ? "Добавлено в избранное" : "Sevimlilarga qo'shildi") : (ru ? "Удалено из избранного" : "Sevimlilardan olib tashlandi"), adding ? "success" : "info");
          return next;
        });
      }
    },
    [user]
  );

  const isFav = useCallback((id: number) => ids.includes(id), [ids]);

  return { ids, toggle, isFav, count: ids.length };
}
