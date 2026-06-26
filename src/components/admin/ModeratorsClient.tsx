"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Plus, Loader2, ShieldCheck, Shield } from "lucide-react";

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export default function ModeratorsClient({ users: initialUsers, currentId }: { users: User[]; currentId: number }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "moderator" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async (id: number) => {
    if (!confirm("Удалить пользователя?")) return;
    setLoading(id);
    try {
      const res = await fetch("/api/admin/moderators", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== id));
      }
    } finally {
      setLoading(null);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/moderators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Ошибка");
      } else {
        setUsers((prev) => [...prev, data]);
        setForm({ name: "", email: "", password: "", role: "moderator" });
        setShowForm(false);
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Users list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3 font-medium text-gray-500">Пользователь</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Роль</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Добавлен</th>
              <th />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50/50">
                <td className="px-5 py-3.5">
                  <div className="font-medium text-gray-900">{u.name}</div>
                  <div className="text-gray-400">{u.email}</div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    u.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                  }`}>
                    {u.role === "admin" ? <ShieldCheck className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
                    {u.role === "admin" ? "Администратор" : "Модератор"}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-400">
                  {new Date(u.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-5 py-3.5">
                  {u.id !== currentId && (
                    <button
                      onClick={() => handleDelete(u.id)}
                      disabled={loading === u.id}
                      className="text-red-400 hover:text-red-600 disabled:opacity-50"
                    >
                      {loading === u.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add user */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Добавить пользователя
        </button>
      ) : (
        <form onSubmit={handleAdd} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h3 className="font-semibold text-gray-900">Новый пользователь</h3>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              ["Имя", "name", "text"],
              ["Email", "email", "email"],
              ["Пароль", "password", "password"],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label} *</label>
                <input
                  required
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Роль</label>
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="moderator">Модератор</option>
                <option value="admin">Администратор</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Добавить
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border border-gray-200 rounded-xl font-medium hover:border-gray-300 transition-colors"
            >
              Отмена
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
