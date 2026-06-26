import { getAdminSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminListingActions from "@/components/admin/AdminListingActions";
import { ShieldCheck, MapPin, Gauge, Calendar, Fuel, Settings, Eye } from "lucide-react";

export default async function AdminListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id: parseInt(id) } });
  if (!listing) notFound();

  const images = JSON.parse(listing.images || "[]");
  const mainImage =
    images[0] ||
    `https://placehold.co/600x400/e2e8f0/64748b?text=${encodeURIComponent(listing.brand)}`;

  const specs = [
    { label: "Год", value: listing.year },
    { label: "Пробег", value: `${listing.mileage.toLocaleString()} км` },
    { label: "Топливо", value: listing.fuelType },
    { label: "КПП", value: listing.transmission },
    { label: "Двигатель", value: `${listing.engineVolume} л` },
    { label: "Кузов", value: listing.bodyType },
    { label: "Привод", value: listing.driveType },
    { label: "Цвет", value: listing.color },
  ];

  return (
    <div className="flex min-h-screen">
      <AdminSidebar name={session.name} role={session.role} />
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-4xl">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
                {listing.isVerified && (
                  <ShieldCheck className="w-6 h-6 text-blue-500" />
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> {listing.city}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" /> {listing.views} просмотров
                </span>
                <span>#{listing.id}</span>
                <span>{new Date(listing.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {listing.price.toLocaleString("ru-RU")} сум
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left */}
            <div className="lg:col-span-2 space-y-5">
              {/* Image */}
              <div className="rounded-xl overflow-hidden bg-gray-100 h-64">
                <img src={mainImage} alt={listing.title} className="w-full h-full object-cover" />
              </div>

              {/* Specs */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-4">Характеристики</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {specs.map((s) => (
                    <div key={s.label} className="text-center p-2 bg-gray-50 rounded-lg">
                      <div className="text-xs text-gray-500">{s.label}</div>
                      <div className="font-semibold text-gray-900 mt-0.5">{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <h2 className="font-semibold text-gray-900 mb-2">Описание</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{listing.description}</p>
                </div>
              )}

              {/* Seller */}
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h2 className="font-semibold text-gray-900 mb-3">Продавец</h2>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {listing.sellerName[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{listing.sellerName}</div>
                    <div className="text-sm text-gray-500">{listing.sellerPhone}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div>
              <AdminListingActions
                listing={{
                  id: listing.id,
                  status: listing.status,
                  isVerified: listing.isVerified,
                  adminNote: listing.adminNote || "",
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
