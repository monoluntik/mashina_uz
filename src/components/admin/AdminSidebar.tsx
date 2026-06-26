"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  ListChecks,
  PlusCircle,
  Users,
  LogOut,
  Car,
  ShieldCheck,
  ClipboardList,
  Flag,
  Menu,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  name: string;
  role: string;
}

export default function AdminSidebar({ name, role }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const links = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/listings", icon: ListChecks, label: "Объявления" },
    { href: "/admin/listings/new", icon: PlusCircle, label: "Добавить авто" },
    { href: "/admin/inspections", icon: ClipboardList, label: "Заявки на осмотр" },
    { href: "/admin/reports", icon: Flag, label: "Жалобы" },
    ...(role === "admin"
      ? [{ href: "/admin/moderators", icon: Users, label: "Модераторы" }]
      : []),
  ];

  const navContent = (
    <>
      {/* Logo */}
      <div className="px-6 py-5 border-b border-gray-800">
        <Link href="/admin/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <div className="bg-blue-600 rounded-lg p-1.5">
            <Car className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold">
            Mashina<span className="text-blue-400">.uz</span>
          </span>
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-sm font-medium text-white truncate">{name}</div>
            <div className="text-xs text-gray-400">
              {role === "admin" ? "Администратор" : "Модератор"}
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => {
          const active = pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-blue-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <link.icon className="w-4 h-4 flex-shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Выйти
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded-lg"
        onClick={() => setOpen((v) => !v)}
        aria-label="Открыть меню"
      >
        {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-60 bg-gray-900 flex flex-col z-40 transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {navContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 min-h-screen bg-gray-900 flex-col">
        {navContent}
      </aside>
    </>
  );
}
