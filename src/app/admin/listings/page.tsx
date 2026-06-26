import { getAdminSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";
import { ShieldCheck, Clock, CheckCircle2, XCircle, PlusCircle, ChevronRight } from "lucide-react";

const STATUS_TABS = [
  { key: "", label: "Все" },
  { key: "pending", label: "На модерации" },
  { key: "active", label: "Активные" },
  { key: "rejected", label: "Отклонённые" },
];

const STATUS_BADGE: Record<string, { label: string; cls: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { label: "На модерации", cls: "bg-amber-100 text-amber-700", icon: Clock },
  active: { label: "Активно", cls: "bg-green-100 text-green-700", icon: CheckCircle2 },
  rejected: { label: "Отклонено", cls: "bg-red-100 text-red-700", icon: XCircle },
};

export default async function AdminListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const sp = await searchParams;
  const status = sp.status || "";
  const page = parseInt(sp.page || "1");
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar name={session.name} role={session.role} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Объявления</h1>
          <Link
            href="/admin/listings/new"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Добавить
          </Link>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-5 w-fit">
          {STATUS_TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/admin/listings${tab.key ? `?status=${tab.key}` : ""}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                status === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
          {listings.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <p>Объявлений не найдено</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 font-medium text-gray-500">ID</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Объявление</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Продавец</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Цена</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Статус</th>
                  <th className="text-left px-5 py-3 font-medium text-gray-500">Дата</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {listings.map((l) => {
                  const badge = STATUS_BADGE[l.status] || STATUS_BADGE.pending;
                  const BadgeIcon = badge.icon;
                  return (
                    <tr key={l.id} className="hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 text-gray-400 font-mono">#{l.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{l.title}</span>
                          {l.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-gray-400">{l.city}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="text-gray-700">{l.sellerName}</div>
                        <div className="text-gray-400">{l.sellerPhone}</div>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-gray-900">
                        {l.price.toLocaleString("ru-RU")}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.cls}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400">
                        {new Date(l.createdAt).toLocaleDateString("ru-RU")}
                      </td>
                      <td className="px-5 py-3.5">
                        <Link
                          href={`/admin/listings/${l.id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="flex justify-center gap-2 mt-5">
            {Array.from({ length: Math.ceil(total / limit) }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={`/admin/listings?${status ? `status=${status}&` : ""}page=${p}`}
                className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium ${
                  p === page ? "bg-blue-600 text-white" : "border border-gray-200 hover:border-blue-400"
                }`}
              >
                {p}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
