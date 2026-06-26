"use client";

import { useState, useEffect, useCallback } from "react";

const KEY = "mashina_recent";
const MAX = 6;

export function useRecentlyViewed() {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored) setIds(JSON.parse(stored));
    } catch {}
  }, []);

  const push = useCallback((id: number) => {
    setIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, MAX);
      localStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { ids, push };
}
