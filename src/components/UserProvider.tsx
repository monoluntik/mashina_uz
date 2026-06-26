"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface UserInfo {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
}

interface UserCtx {
  user: UserInfo | null;
  loading: boolean;
  refresh: () => void;
  logout: () => Promise<void>;
}

const Ctx = createContext<UserCtx>({ user: null, loading: true, refresh: () => {}, logout: async () => {} });

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  return <Ctx.Provider value={{ user, loading, refresh, logout }}>{children}</Ctx.Provider>;
}

export function useUser() {
  return useContext(Ctx);
}
