import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminInspectionActions from "@/components/admin/AdminInspectionActions";
import Link from "next/link";
import { ArrowLeft, User, Phone, Mail, Car, MessageSquare, CalendarClock } from "lucide-react";

export default async function InspectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const req = await prisma.inspectionRequest.findUnique({
    where: { id: parseInt(id) },
  });
  if (!req) notFound();

  // load existing report if linked listing
  const report = req.listingId
    ? await prisma.inspectionReport.findUnique({ where: { listingId: req.listingId } })
    : null;

  // load listings for linking
  const listings = await prisma.listing.findMany({
    select: { id: true, brand: true, model: true, year: true, sellerName: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const STATUS_COLOR: Record<string, string> = {
    new: "bg-yellow-100 text-yellow-700",
    scheduled: "bg-blue-100 text-blue-700",
    inspected: "bg-green-100 text-green-700",
    cancelled: "bg-gray-100 text-gray-500",
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar name={session.name} role={session.role} />
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <Link href="/admin/inspections" className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
            <ArrowLeft className="w-4 h-4" /> Назад к заявкам
          </Link>

          <div className="flex items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Заявка #{req.id}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLOR[req.status] || STATUS_COLOR.new}`}>
              {req.status === "new" ? "Новая" : req.status === "scheduled" ? "Запланировано" : req.status === "inspected" ? "Проверен" : "Отменено"}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Info */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Информация о клиенте</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">{req.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <a href={`tel:${req.phone}`} className="text-blue-600 hover:underline">{req.phone}</a>
                  </div>
                  {req.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <a href={`mailto:${req.email}`} className="text-blue-600 hover:underline">{req.email}</a>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Автомобиль</h2>
                <div className="flex items-center gap-3">
                  <Car className="w-10 h-10 text-gray-300" />
                  <div>
                    <div className="font-semibold text-gray-900">{req.carBrand} {req.carModel}</div>
                    <div className="text-sm text-gray-500">{req.carYear} г.</div>
                  </div>
                </div>
              </div>

              {req.message && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" /> Комментарий клиента
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{req.message}</p>
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-200 p-6 text-sm text-gray-500">
                <div>Заявка создана: <span className="text-gray-700">{new Date(req.createdAt).toLocaleString("ru-RU")}</span></div>
                {req.scheduledAt && (
                  <div className="flex items-center gap-1 mt-1 text-blue-600">
                    <CalendarClock className="w-4 h-4" />
                    Дата записи: {new Date(req.scheduledAt).toLocaleString("ru-RU")}
                  </div>
                )}
                {req.listingId && (
                  <div className="mt-2">
                    Связанное объявление:{" "}
                    <Link href={`/admin/listings/${req.listingId}`} className="text-blue-600 hover:underline">
                      #{req.listingId}
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Actions sidebar */}
            <div>
              <AdminInspectionActions
                request={{
                  id: req.id,
                  status: req.status,
                  scheduledAt: req.scheduledAt?.toISOString() || null,
                  listingId: req.listingId || null,
                }}
                listings={listings}
                existingReport={
                  report
                    ? {
                        ...report,
                        bodyPanels: JSON.parse(report.bodyPanels || "{}"),
                        inspectedAt: report.inspectedAt.toISOString(),
                      }
                    : null
                }
                inspectorName={session.name}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
