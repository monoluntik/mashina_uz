import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import Link from "next/link";
import { ClipboardList, Clock, CheckCircle2, XCircle, CalendarClock } from "lucide-react";

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: "Новая", color: "bg-yellow-100 text-yellow-700" },
  scheduled: { label: "Запланировано", color: "bg-blue-100 text-blue-700" },
  inspected: { label: "Проверен", color: "bg-green-100 text-green-700" },
  cancelled: { label: "Отменено", color: "bg-gray-100 text-gray-500" },
};

export default async function InspectionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { status } = await searchParams;

  const requests = await prisma.inspectionRequest.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });

  const counts = await prisma.inspectionRequest.groupBy({
    by: ["status"],
    _count: { id: true },
  });
  const countMap: Record<string, number> = {};
  counts.forEach((c) => (countMap[c.status] = c._count.id));
  const total = Object.values(countMap).reduce((a, b) => a + b, 0);

  const TABS = [
    { key: "", label: "Все", count: total },
    { key: "new", label: "Новые", count: countMap.new || 0 },
    { key: "scheduled", label: "Запланировано", count: countMap.scheduled || 0 },
    { key: "inspected", label: "Проверено", count: countMap.inspected || 0 },
    { key: "cancelled", label: "Отменено", count: countMap.cancelled || 0 },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar name={session.name} role={session.role} />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <ClipboardList className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">Заявки на проверку</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-6 overflow-x-auto">
            {TABS.map((tab) => (
              <Link
                key={tab.key}
                href={tab.key ? `/admin/inspections?status=${tab.key}` : "/admin/inspections"}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  (status || "") === tab.key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                    (status || "") === tab.key ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600"
                  }`}>{tab.count}</span>
                )}
              </Link>
            ))}
          </div>

          {requests.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
              <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Заявок не найдено</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Клиент</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Автомобиль</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Статус</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Дата</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {requests.map((r) => {
                    const st = STATUS_LABELS[r.status] || STATUS_LABELS.new;
                    return (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{r.name}</div>
                          <div className="text-xs text-gray-500">{r.phone}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{r.carBrand} {r.carModel}</div>
                          <div className="text-xs text-gray-500">{r.carYear} г.</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${st.color}`}>
                            {st.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {new Date(r.createdAt).toLocaleDateString("ru-RU")}
                          {r.scheduledAt && (
                            <div className="flex items-center gap-1 text-blue-600 mt-0.5">
                              <CalendarClock className="w-3 h-3" />
                              {new Date(r.scheduledAt).toLocaleDateString("ru-RU")}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/admin/inspections/${r.id}`}
                            className="text-blue-600 hover:text-blue-700 font-medium text-xs"
                          >
                            Открыть →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
