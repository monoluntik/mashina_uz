"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useUser } from "@/components/UserProvider";
import ListingCard from "@/components/ListingCard";
import {
  User, ClipboardList, Heart, Clock, Settings,
  Loader2, ShieldCheck, CheckCircle2, XCircle, Eye, Hourglass, Search, Trash2,
} from "lucide-react";
import { Listing } from "@/types";

type Tab = "listings" | "favorites" | "history" | "searches" | "settings";

interface SavedSearch { id: number; name: string; filters: string; createdAt: string }

const STATUS_MAP: Record<string, { ru: string; uz: string; icon: typeof CheckCircle2; color: string }> = {
  active:   { ru: "Активно",        uz: "Faol",             icon: CheckCircle2, color: "text-green-600" },
  pending:  { ru: "На модерации",   uz: "Moderatsiyada",    icon: Hourglass,    color: "text-yellow-600" },
  rejected: { ru: "Отклонено",      uz: "Rad etilgan",      icon: XCircle,      color: "text-red-500" },
};

export default function ProfileClient({ locale, initialTab }: { locale: string; initialTab: string }) {
  const isRu = locale === "ru";
  const router = useRouter();
  const { user, loading, refresh, logout } = useUser();
  const [tab, setTab] = useState<Tab>((initialTab as Tab) || "listings");

  const [myListings, setMyListings] = useState<(Listing & { status: string })[]>([]);
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [history, setHistory] = useState<Listing[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");

  // Settings form
  const [settings, setSettings] = useState({ name: "", phone: "", email: "", currentPassword: "", newPassword: "", confirmPassword: "" });
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) router.push(`/${locale}/login`);
  }, [user, loading, locale, router]);

  useEffect(() => {
    if (user) setSettings((p) => ({ ...p, name: user.name, phone: user.phone || "", email: user.email || "" }));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    setDataLoading(true);
    setDataError("");

    const load = async () => {
      try {
        if (tab === "listings") {
          const r = await fetch("/api/user/listings");
          if (!r.ok) throw new Error();
          setMyListings(await r.json());
        } else if (tab === "favorites") {
          const r = await fetch("/api/user/favorites");
          if (!r.ok) throw new Error();
          setFavorites(await r.json());
        } else if (tab === "history") {
          const r = await fetch("/api/user/history");
          if (!r.ok) throw new Error();
          setHistory(await r.json());
        } else if (tab === "searches") {
          const r = await fetch("/api/user/saved-searches");
          if (!r.ok) throw new Error();
          setSavedSearches(await r.json());
        }
      } catch {
        setDataError(isRu ? "Не удалось загрузить данные. Попробуйте обновить страницу." : "Ma'lumotlarni yuklab bo'lmadi. Sahifani yangilang.");
      } finally {
        setDataLoading(false);
      }
    };

    load();
  }, [tab, user]);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings.newPassword && settings.newPassword !== settings.confirmPassword) {
      setSettingsMsg(isRu ? "Пароли не совпадают" : "Parollar mos kelmaydi");
      return;
    }
    setSettingsSaving(true);
    setSettingsMsg("");
    const body: Record<string, string> = { name: settings.name };
    if (settings.phone) body.phone = settings.phone;
    if (settings.email) body.email = settings.email;
    if (settings.newPassword) {
      body.newPassword = settings.newPassword;
      body.currentPassword = settings.currentPassword;
    }
    const res = await fetch("/api/auth/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setSettingsMsg(isRu ? "Сохранено!" : "Saqlandi!");
      refresh();
    } else {
      const data = await res.json();
      setSettingsMsg(
        data.error === "wrong_password"
          ? isRu ? "Текущий пароль неверный" : "Joriy parol noto'g'ri"
          : isRu ? "Ошибка сохранения" : "Saqlash xatosi"
      );
    }
    setSettingsSaving(false);
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const TABS = [
    { key: "listings" as Tab, icon: ClipboardList, label: isRu ? "Мои объявления" : "Mening e'lonlarim" },
    { key: "favorites" as Tab, icon: Heart, label: isRu ? "Избранное" : "Sevimlilar" },
    { key: "history" as Tab, icon: Clock, label: isRu ? "История" : "Tarix" },
    { key: "searches" as Tab, icon: Search, label: isRu ? "Поиски" : "Qidiruvlar" },
    { key: "settings" as Tab, icon: Settings, label: isRu ? "Настройки" : "Sozlamalar" },
  ];

  return (
    <div>
      {/* Profile header */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 flex items-center gap-5">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {user.name[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
          <div className="text-sm text-gray-500 mt-0.5 space-x-3">
            {user.phone && <span>{user.phone}</span>}
            {user.email && <span>{user.email}</span>}
          </div>
        </div>
        <button
          onClick={async () => { await logout(); router.push(`/${locale}`); }}
          className="text-sm text-red-500 hover:text-red-600 font-medium"
        >
          {isRu ? "Выйти" : "Chiqish"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              tab === t.key ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {dataLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        </div>
      ) : dataError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600 text-sm">
          {dataError}
        </div>
      ) : (
        <>
          {/* My listings */}
          {tab === "listings" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold text-gray-900">
                  {isRu ? "Мои объявления" : "Mening e'lonlarim"} ({myListings.length})
                </h2>
                <Link href={`/${locale}/sell`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  + {isRu ? "Добавить" : "Qo'shish"}
                </Link>
              </div>
              {myListings.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">{isRu ? "У вас ещё нет объявлений" : "Sizda hali e'lonlar yo'q"}</p>
                  <Link href={`/${locale}/sell`} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    {isRu ? "Подать объявление" : "E'lon berish"}
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {myListings.map((l) => {
                    const st = STATUS_MAP[l.status] || STATUS_MAP.pending;
                    return (
                      <div key={l.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
                        <div className="w-20 h-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                          {l.images?.[0] ? (
                            <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              {l.brand}
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="font-medium text-gray-900 truncate">{l.title}</div>
                            <div className={`flex items-center gap-1 text-xs font-medium whitespace-nowrap ${st.color}`}>
                              <st.icon className="w-3.5 h-3.5" />
                              {isRu ? st.ru : st.uz}
                            </div>
                          </div>
                          <div className="text-blue-600 font-semibold text-sm mt-1">
                            {l.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} {isRu ? "сум" : "so'm"}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                            <span>{l.city}</span>
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {l.views}
                            </span>
                            {l.isVerified && (
                              <span className="flex items-center gap-1 text-blue-600">
                                <ShieldCheck className="w-3 h-3" />
                                {isRu ? "Проверено" : "Tekshirilgan"}
                              </span>
                            )}
                          </div>
                        </div>
                        {l.status === "active" && (
                          <Link
                            href={`/${locale}/listings/${l.id}`}
                            className="text-xs text-blue-600 hover:underline self-center flex-shrink-0"
                          >
                            {isRu ? "Открыть" : "Ochish"}
                          </Link>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Favorites */}
          {tab === "favorites" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                {isRu ? "Избранное" : "Sevimlilar"} ({favorites.length})
              </h2>
              {favorites.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">{isRu ? "Нет избранных объявлений" : "Sevimli e'lonlar yo'q"}</p>
                  <Link href={`/${locale}/listings`} className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors">
                    {isRu ? "Смотреть объявления" : "E'lonlarni ko'rish"}
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favorites.map((l) => <ListingCard key={l.id} listing={l} />)}
                </div>
              )}
            </div>
          )}

          {/* History */}
          {tab === "history" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                {isRu ? "История просмотров" : "Ko'rish tarixi"} ({history.length})
              </h2>
              {history.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                  <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">{isRu ? "История просмотров пуста" : "Ko'rish tarixi bo'sh"}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {history.map((l) => <ListingCard key={l.id} listing={l} />)}
                </div>
              )}
            </div>
          )}

          {/* Saved Searches */}
          {tab === "searches" && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                {isRu ? "Сохранённые поиски" : "Saqlangan qidiruvlar"} ({savedSearches.length})
              </h2>
              {savedSearches.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">{isRu ? "Нет сохранённых поисков" : "Saqlangan qidiruvlar yo'q"}</p>
                  <p className="text-sm text-gray-400">{isRu ? "В каталоге настройте фильтры и нажмите «Сохранить поиск»" : "Katalogda filtrlarni sozlang va «Qidiruvni saqlash» tugmasini bosing"}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedSearches.map((s) => {
                    const params = new URLSearchParams(s.filters);
                    const chips = Array.from(params.entries()).map(([k, v]) => `${v}`).filter(Boolean).slice(0, 5);
                    return (
                      <div key={s.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 mb-1">{s.name}</div>
                          <div className="flex flex-wrap gap-1.5">
                            {chips.map((chip, i) => (
                              <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{chip}</span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a
                            href={`/${locale}/listings?${s.filters}`}
                            className="text-sm text-blue-600 font-medium hover:underline"
                          >
                            {isRu ? "Открыть" : "Ochish"}
                          </a>
                          <button
                            onClick={async () => {
                              await fetch("/api/user/saved-searches", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: s.id }) });
                              setSavedSearches((prev) => prev.filter((x) => x.id !== s.id));
                            }}
                            className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {tab === "settings" && (
            <div className="bg-white rounded-2xl border border-gray-200 p-8 max-w-lg">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {isRu ? "Настройки профиля" : "Profil sozlamalari"}
              </h2>
              <form onSubmit={saveSettings} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRu ? "Имя" : "Ism"} *
                  </label>
                  <input
                    value={settings.name}
                    onChange={(e) => setSettings((p) => ({ ...p, name: e.target.value }))}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {isRu ? "Телефон" : "Telefon"}
                  </label>
                  <input
                    value={settings.phone}
                    onChange={(e) => setSettings((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+998 90 000 00 00"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => setSettings((p) => ({ ...p, email: e.target.value }))}
                    placeholder="email@example.com"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    {isRu ? "Изменить пароль (необязательно)" : "Parolni o'zgartirish (ixtiyoriy)"}
                  </p>
                  <div className="space-y-3">
                    <input
                      type="password"
                      value={settings.currentPassword}
                      onChange={(e) => setSettings((p) => ({ ...p, currentPassword: e.target.value }))}
                      placeholder={isRu ? "Текущий пароль" : "Joriy parol"}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <input
                      type="password"
                      value={settings.newPassword}
                      onChange={(e) => setSettings((p) => ({ ...p, newPassword: e.target.value }))}
                      placeholder={isRu ? "Новый пароль" : "Yangi parol"}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                    <input
                      type="password"
                      value={settings.confirmPassword}
                      onChange={(e) => setSettings((p) => ({ ...p, confirmPassword: e.target.value }))}
                      placeholder={isRu ? "Подтвердите новый пароль" : "Yangi parolni tasdiqlang"}
                      className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                {settingsMsg && (
                  <div className={`text-sm px-4 py-3 rounded-xl ${
                    settingsMsg.includes("!") || settingsMsg.includes("ldi")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                    {settingsMsg}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={settingsSaving}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {settingsSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isRu ? "Сохранить изменения" : "O'zgarishlarni saqlash"}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </div>
  );
}
