"use client";

import { useState, useEffect, useCallback } from "react";
import { Listing } from "@/types";
import { toast } from "@/hooks/useToast";

const KEY = "compare_ids";
const MAX = 3;

export function useComparison() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || "[]");
      setIds(Array.isArray(stored) ? stored : []);
    } catch {
      setIds([]);
    }
  }, []);

  const save = (next: number[]) => {
    setIds(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  };

  const toggle = useCallback((id: number, locale = "ru") => {
    const ru = locale === "ru";
    setIds((prev) => {
      const adding = !prev.includes(id);
      if (adding && prev.length >= MAX) {
        toast(ru ? "Максимум 3 авто для сравнения" : "Taqqoslash uchun maksimal 3 ta", "error");
        return prev;
      }
      const next = adding ? [...prev, id] : prev.filter((x) => x !== id);
      localStorage.setItem(KEY, JSON.stringify(next));
      toast(adding ? (ru ? "Добавлено к сравнению" : "Taqqoslashga qo'shildi") : (ru ? "Убрано из сравнения" : "Taqqoslamadan olib tashlandi"), adding ? "success" : "info");
      return next;
    });
  }, []);

  const remove = useCallback((id: number) => {
    setIds((prev) => {
      const next = prev.filter((x) => x !== id);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clear = useCallback(() => save([]), []);

  const isComparing = (id: number) => ids.includes(id);

  return { ids, toggle, remove, clear, isComparing, count: ids.length, isFull: ids.length >= MAX };
}
