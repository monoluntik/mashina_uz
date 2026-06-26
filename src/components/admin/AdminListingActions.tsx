"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ShieldCheck, Shield, Loader2, Trash2 } from "lucide-react";

interface Props {
  listing: {
    id: number;
    status: string;
    isVerified: boolean;
    adminNote: string;
  };
}

export default function AdminListingActions({ listing }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(listing.status);
  const [isVerified, setIsVerified] = useState(listing.isVerified);
  const [note, setNote] = useState(listing.adminNote);
  const [loading, setLoading] = useState<string | null>(null);

  const patch = async (data: Record<string, unknown>, action: string) => {
    setLoading(action);
    try {
      const res = await fetch(`/api/admin/listings/${listing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setStatus(updated.status);
        setIsVerified(updated.isVerified);
        router.refresh();
      }
    } finally {
      setLoading(null);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Удалить объявление? Это действие необратимо.")) return;
    setLoading("delete");
    try {
      const res = await fetch(`/api/admin/listings/${listing.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Ошибка при удалении");
        return;
      }
      router.push("/admin/listings");
    } finally {
      setLoading(null);
    }
  };

  const statusBadge = {
    pending: "bg-amber-100 text-amber-700 border-amber-200",
    active: "bg-green-100 text-green-700 border-green-200",
    rejected: "bg-red-100 text-red-700 border-red-200",
  }[status] || "bg-gray-100 text-gray-700";

  const statusLabel = { pending: "На модерации", active: "Активно", rejected: "Отклонено" }[status] || status;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 sticky top-8">
      <h2 className="font-semibold text-gray-900">Действия</h2>

      {/* Current status */}
      <div>
        <div className="text-xs text-gray-500 mb-1">Текущий статус</div>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${statusBadge}`}>
          {statusLabel}
        </span>
      </div>

      {/* Moderation buttons */}
      {status === "pending" && (
        <div className="space-y-2">
          <button
            onClick={() => patch({ status: "active" }, "approve")}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Одобрить
          </button>
          <button
            onClick={() => patch({ status: "rejected", adminNote: note }, "reject")}
            disabled={!!loading}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {loading === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Отклонить
          </button>
        </div>
      )}

      {status === "active" && (
        <button
          onClick={() => patch({ status: "rejected" }, "reject")}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 border border-red-300 text-red-600 py-2.5 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {loading === "reject" ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
          Снять с публикации
        </button>
      )}

      {status === "rejected" && (
        <button
          onClick={() => patch({ status: "active" }, "approve")}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {loading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Восстановить
        </button>
      )}

      {/* Verified toggle */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={() => patch({ isVerified: !isVerified }, "verify")}
          disabled={!!loading}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${
            isVerified
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "border border-blue-300 text-blue-600 hover:bg-blue-50"
          }`}
        >
          {loading === "verify" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isVerified ? (
            <ShieldCheck className="w-4 h-4" />
          ) : (
            <Shield className="w-4 h-4" />
          )}
          {isVerified ? "✓ Проверено сайтом" : "Отметить «Проверено»"}
        </button>
      </div>

      {/* Admin note */}
      <div className="border-t border-gray-100 pt-4">
        <label className="block text-xs font-medium text-gray-500 mb-1">Заметка (для отклонения)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Причина отклонения..."
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <button
          onClick={() => patch({ adminNote: note }, "note")}
          disabled={!!loading}
          className="mt-2 w-full text-sm border border-gray-200 py-2 rounded-lg hover:border-blue-400 transition-colors disabled:opacity-50"
        >
          {loading === "note" ? "Сохраняю..." : "Сохранить заметку"}
        </button>
      </div>

      {/* Delete */}
      <div className="border-t border-gray-100 pt-4">
        <button
          onClick={handleDelete}
          disabled={!!loading}
          className="w-full flex items-center justify-center gap-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          {loading === "delete" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          Удалить объявление
        </button>
      </div>
    </div>
  );
}
