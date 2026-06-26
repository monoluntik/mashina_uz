"use client";

import { useEffect, useState } from "react";
import { subscribeToasts, ToastItem } from "@/hooks/useToast";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

const CONFIG = {
  success: { icon: CheckCircle2, cls: "bg-gray-900 text-white", iconCls: "text-green-400" },
  error:   { icon: XCircle,       cls: "bg-red-600 text-white",  iconCls: "text-white" },
  info:    { icon: Info,           cls: "bg-blue-600 text-white", iconCls: "text-white" },
};

export default function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => subscribeToasts(setToasts), []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const { icon: Icon, cls, iconCls } = CONFIG[t.type];
        return (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in-up ${cls}`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${iconCls}`} />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
