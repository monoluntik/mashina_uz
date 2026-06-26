import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import { ShieldCheck, GitCompareArrows } from "lucide-react";

export async function generateMetadata() {
  return { title: "Сравнение автомобилей" };
}

const SPECS = [
  { key: "price",        label: { ru: "Цена (сум)", uz: "Narx (so'm)" }, fmt: (v: number) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") },
  { key: "year",         label: { ru: "Год выпуска", uz: "Ishlab chiqarilgan yil" } },
  { key: "mileage",      label: { ru: "Пробег (км)", uz: "Yurgan masofasi (km)" }, fmt: (v: number) => v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") },
  { key: "engineVolume", label: { ru: "Объём двигателя", uz: "Dvigatel hajmi" }, fmt: (v: number) => `${v} л` },
  { key: "fuelType",     label: { ru: "Топливо", uz: "Yoqilg'i" } },
  { key: "transmission", label: { ru: "КПП", uz: "Uzatmalar qutisi" } },
  { key: "driveType",    label: { ru: "Привод", uz: "Yetkazib berish" } },
  { key: "bodyType",     label: { ru: "Тип кузова", uz: "Kuzov turi" } },
  { key: "color",        label: { ru: "Цвет", uz: "Rang" } },
  { key: "condition",    label: { ru: "Состояние", uz: "Holat" }, fmt: (v: string) => v === "new" ? "Новый" : "Б/у" },
  { key: "city",         label: { ru: "Город", uz: "Shahar" } },
];

export default async function ComparePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ids?: string }>;
}) {
  const { locale } = await params;
  const { ids: idsParam } = await searchParams;
  const isRu = locale === "ru";

  const ids = (idsParam || "")
    .split(",")
    .map((x) => parseInt(x))
    .filter((n) => !isNaN(n))
    .slice(0, 3);

  const rawListings = ids.length > 0
    ? await prisma.listing.findMany({
        where: { id: { in: ids }, status: "active", isActive: true },
      })
    : [];

  const listings = rawListings.map((l) => ({
    ...l,
    images: JSON.parse(l.images || "[]") as string[],
  }));

  const getBest = (key: string) => {
    if (key === "price" || key === "mileage") {
      const vals = listings.map((l) => (l as Record<string, unknown>)[key] as number);
      return Math.min(...vals);
    }
    if (key === "year") {
      const vals = listings.map((l) => l.year);
      return Math.max(...vals);
    }
    return null;
  };

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <GitCompareArrows className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {isRu ? "Сравнение автомобилей" : "Avtomobillarni taqqoslash"}
            </h1>
          </div>

          {listings.length < 2 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
              <GitCompareArrows className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-700 mb-2">
                {isRu ? "Выберите минимум 2 автомобиля" : "Kamida 2 ta avtomobil tanlang"}
              </h2>
              <p className="text-gray-500 mb-6">
                {isRu
                  ? "На странице объявления нажмите «Сравнить», чтобы добавить авто"
                  : "E'lon sahifasida «Taqqoslash» tugmasini bosing"}
              </p>
              <Link
                href={`/${locale}/listings`}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
              >
                {isRu ? "Смотреть объявления" : "E'lonlarni ko'rish"}
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Cars header */}
              <div className="grid border-b border-gray-100" style={{ gridTemplateColumns: `200px repeat(${listings.length}, 1fr)` }}>
                <div className="p-4 bg-gray-50" />
                {listings.map((l) => (
                  <div key={l.id} className="p-4 border-l border-gray-100">
                    <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 mb-3">
                      {l.images[0] ? (
                        <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">Нет фото</div>
                      )}
                    </div>
                    <Link href={`/${locale}/listings/${l.id}`} className="font-semibold text-gray-900 hover:text-blue-600 text-sm leading-tight block mb-1">
                      {l.brand} {l.model} {l.year}
                    </Link>
                    {l.isVerified && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {isRu ? "Проверено" : "Tekshirilgan"}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Spec rows */}
              {SPECS.map((spec, i) => {
                const best = getBest(spec.key);
                return (
                  <div
                    key={spec.key}
                    className={`grid border-b border-gray-50 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}
                    style={{ gridTemplateColumns: `200px repeat(${listings.length}, 1fr)` }}
                  >
                    <div className="p-4 text-sm font-medium text-gray-600 flex items-center">
                      {spec.label[isRu ? "ru" : "uz"]}
                    </div>
                    {listings.map((l) => {
                      const raw = (l as Record<string, unknown>)[spec.key];
                      const val = spec.fmt ? spec.fmt(raw as number & string) : String(raw ?? "—");
                      const isBest = best !== null && raw === best;
                      return (
                        <div
                          key={l.id}
                          className={`p-4 border-l border-gray-100 text-sm flex items-center ${isBest ? "text-green-700 font-semibold" : "text-gray-800"}`}
                        >
                          {isBest && <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 flex-shrink-0" />}
                          {val}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Actions */}
              <div className="grid" style={{ gridTemplateColumns: `200px repeat(${listings.length}, 1fr)` }}>
                <div className="p-4 bg-gray-50" />
                {listings.map((l) => (
                  <div key={l.id} className="p-4 border-l border-gray-100">
                    <Link
                      href={`/${locale}/listings/${l.id}`}
                      className="block text-center bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
                    >
                      {isRu ? "Открыть" : "Ochish"}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
