import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";
import { Flag, ExternalLink } from "lucide-react";

const REASON_LABELS: Record<string, string> = {
  fake:         "Мошенничество",
  wrong_price:  "Неверная цена",
  already_sold: "Уже продан",
  duplicate:    "Дубликат",
  spam:         "Спам",
  other:        "Другое",
};

const STATUS_COLORS: Record<string, string> = {
  new:      "bg-yellow-100 text-yellow-700",
  reviewed: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  ignored:  "bg-gray-100 text-gray-500",
};

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { status } = await searchParams;
  const filter = status || "new";

  const reports = await prisma.listingReport.findMany({
    where: filter === "all" ? {} : { status: filter },
    include: {
      listing: { select: { id: true, brand: true, model: true, year: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const counts = await prisma.listingReport.groupBy({
    by: ["status"],
    _count: { id: true },
  });
  const countMap: Record<string, number> = {};
  counts.forEach((c) => (countMap[c.status] = c._count.id));

  const TABS = [
    { key: "new",      label: "Новые",       count: countMap.new || 0 },
    { key: "reviewed", label: "На проверке", count: countMap.reviewed || 0 },
    { key: "resolved", label: "Решены",      count: countMap.resolved || 0 },
    { key: "ignored",  label: "Игнор",       count: countMap.ignored || 0 },
    { key: "all",      label: "Все",         count: Object.values(countMap).reduce((a, b) => a + b, 0) },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar name={session.name} role={session.role} />
      <div className="flex-1 p-8">
        <div className="flex items-center gap-3 mb-6">
          <Flag className="w-6 h-6 text-red-500" />
          <h1 className="text-2xl font-bold text-gray-900">Жалобы на объявления</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 mb-6 w-fit flex-wrap">
          {TABS.map((tab) => (
            <Link
              key={tab.key}
              href={`/admin/reports${tab.key ? `?status=${tab.key}` : "?status=all"}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === tab.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filter === tab.key ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"}`}>
                  {tab.count}
                </span>
              )}
            </Link>
          ))}
        </div>

        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
            Жалоб нет
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500 font-medium">
                  <th className="px-5 py-3">Объявление</th>
                  <th className="px-5 py-3">Причина</th>
                  <th className="px-5 py-3">Подробности</th>
                  <th className="px-5 py-3">Контакт</th>
                  <th className="px-5 py-3">Статус</th>
                  <th className="px-5 py-3">Дата</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/listings/${r.listingId}`}
                        className="flex items-center gap-1.5 font-medium text-blue-600 hover:underline"
                      >
                        {r.listing.brand} {r.listing.model} {r.listing.year}
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className="bg-red-50 text-red-700 text-xs px-2 py-0.5 rounded-full">
                        {REASON_LABELS[r.reason] || r.reason}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-600 max-w-xs truncate">{r.details || "—"}</td>
                    <td className="px-5 py-3 text-gray-600">{r.contact || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[r.status] || "bg-gray-100 text-gray-500"}`}>
                        {r.status === "new" ? "Новая" : r.status === "reviewed" ? "На проверке" : r.status === "resolved" ? "Решена" : "Игнор"}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
