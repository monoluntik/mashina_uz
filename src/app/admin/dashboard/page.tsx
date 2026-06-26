import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { ListChecks, Clock, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const [total, pending, active, rejected, verified] = await Promise.all([
    prisma.listing.count(),
    prisma.listing.count({ where: { status: "pending" } }),
    prisma.listing.count({ where: { status: "active" } }),
    prisma.listing.count({ where: { status: "rejected" } }),
    prisma.listing.count({ where: { isVerified: true } }),
  ]);

  const recentPending = await prisma.listing.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Всего объявлений", value: total, icon: ListChecks, color: "bg-blue-500" },
    { label: "На модерации", value: pending, icon: Clock, color: "bg-amber-500", href: "/admin/listings?status=pending" },
    { label: "Активные", value: active, icon: CheckCircle2, color: "bg-green-500" },
    { label: "Отклонённые", value: rejected, icon: XCircle, color: "bg-red-500" },
    { label: "Проверено сайтом", value: verified, icon: ShieldCheck, color: "bg-purple-500" },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar name={session.name} role={session.role} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Добро пожаловать, {session.name}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`bg-white rounded-xl border border-gray-200 p-5 ${s.href ? "hover:border-blue-300 transition-colors" : ""}`}
            >
              {s.href ? (
                <Link href={s.href} className="block">
                  <StatContent {...s} />
                </Link>
              ) : (
                <StatContent {...s} />
              )}
            </div>
          ))}
        </div>

        {/* Pending listings */}
        {recentPending.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Ожидают модерации</h2>
              <Link href="/admin/listings?status=pending" className="text-sm text-blue-600 hover:underline">
                Все ({pending})
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {recentPending.map((l) => (
                <Link
                  key={l.id}
                  href={`/admin/listings/${l.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div>
                    <div className="font-medium text-gray-900">{l.title}</div>
                    <div className="text-sm text-gray-500">
                      {l.city} · {l.sellerName} · {l.sellerPhone}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">
                      {l.price.toLocaleString("ru-RU")} сум
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(l.createdAt).toLocaleDateString("ru-RU")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {pending === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-300" />
            <p>Нет объявлений на модерации</p>
          </div>
        )}
      </main>
    </div>
  );
}

function StatContent({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <>
      <div className={`w-9 h-9 ${color} rounded-lg flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </>
  );
}
