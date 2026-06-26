"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Car, Menu, X, Heart, User, ChevronDown, LogOut, ClipboardList, Settings } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import { useUser } from "@/components/UserProvider";

export default function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { count } = useFavorites();
  const { user, loading, logout } = useUser();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    router.push(`/${locale}`);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { href: `/${locale}/listings`, label: t("buy") },
    { href: `/${locale}/sell`, label: t("sell") },
    { href: `/${locale}/inspection`, label: t("inspection") },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5">
              <Car className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">
              Mashina<span className="text-blue-600">.uz</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5 text-sm font-medium">
              <button
                onClick={() => switchLocale("ru")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  locale === "ru" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                RU
              </button>
              <button
                onClick={() => switchLocale("uz")}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  locale === "uz" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                UZ
              </button>
            </div>

            {/* Favorites */}
            <Link
              href={`/${locale}/favorites`}
              className="relative p-2 text-gray-500 hover:text-red-500 transition-colors"
              aria-label="Избранное"
            >
              <Heart className={`w-5 h-5 ${count > 0 ? "fill-red-500 text-red-500" : ""}`} />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {/* Auth */}
            {!loading && (
              user ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="hidden md:flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                  >
                    <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.name[0]?.toUpperCase()}
                    </div>
                    <span className="max-w-20 truncate">{user.name}</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  {dropdownOpen && (
                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
                      <Link
                        href={`/${locale}/profile`}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="w-4 h-4 text-gray-400" />
                        {locale === "ru" ? "Профиль" : "Profil"}
                      </Link>
                      <Link
                        href={`/${locale}/profile?tab=listings`}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ClipboardList className="w-4 h-4 text-gray-400" />
                        {locale === "ru" ? "Мои объявления" : "Mening e'lonlarim"}
                      </Link>
                      <Link
                        href={`/${locale}/profile?tab=settings`}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="w-4 h-4 text-gray-400" />
                        {locale === "ru" ? "Настройки" : "Sozlamalar"}
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          {locale === "ru" ? "Выйти" : "Chiqish"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href={`/${locale}/login`}
                  className="hidden md:flex items-center gap-1.5 text-gray-600 hover:text-blue-600 text-sm font-medium transition-colors"
                >
                  <User className="w-4 h-4" />
                  {locale === "ru" ? "Войти" : "Kirish"}
                </Link>
              )
            )}

            <Link
              href={`/${locale}/sell`}
              className="hidden md:flex items-center gap-1.5 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              + {t("postAd")}
            </Link>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-2 py-2.5 text-gray-700 hover:text-blue-600 font-medium"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href={`/${locale}/favorites`}
              className="block px-2 py-2.5 text-gray-700 hover:text-red-500 font-medium"
              onClick={() => setMobileOpen(false)}
            >
              ♡ {locale === "ru" ? "Избранное" : "Sevimlilar"}
              {count > 0 && ` (${count})`}
            </Link>
            {user ? (
              <>
                <Link href={`/${locale}/profile`} className="block px-2 py-2.5 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>
                  👤 {user.name}
                </Link>
                <button onClick={handleLogout} className="block w-full text-left px-2 py-2.5 text-red-500 font-medium">
                  {locale === "ru" ? "Выйти" : "Chiqish"}
                </button>
              </>
            ) : (
              <Link href={`/${locale}/login`} className="block px-2 py-2.5 text-gray-700 font-medium" onClick={() => setMobileOpen(false)}>
                {locale === "ru" ? "Войти" : "Kirish"}
              </Link>
            )}
            <Link
              href={`/${locale}/sell`}
              className="block mt-2 text-center bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium"
              onClick={() => setMobileOpen(false)}
            >
              + {t("postAd")}
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
