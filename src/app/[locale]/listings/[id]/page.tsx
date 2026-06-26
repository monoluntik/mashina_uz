import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import ViewTracker from "@/components/ViewTracker";

const BASE = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9000";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  const raw = await prisma.listing.findUnique({
    where: { id: parseInt(id) },
    select: { brand: true, model: true, year: true, price: true, city: true, description: true, images: true },
  });
  if (!raw) return { title: "Mashina.uz" };

  const title = `${raw.brand} ${raw.model} ${raw.year} — ${raw.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} сум | Mashina.uz`;
  const description = raw.description?.slice(0, 155) || `${raw.brand} ${raw.model} ${raw.year}, ${raw.city}`;
  const images = JSON.parse(raw.images || "[]") as string[];
  const ogImage = images[0] ? (images[0].startsWith("http") ? images[0] : `${BASE}${images[0]}`) : undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE}/${locale}/listings/${id}`,
      siteName: "Mashina.uz",
      ...(ogImage && { images: [{ url: ogImage, width: 800, height: 500, alt: title }] }),
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description, ...(ogImage && { images: [ogImage] }) },
  };
}
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import ImageGallery from "@/components/ImageGallery";
import ListingDetailClient from "@/components/ListingDetailClient";
import ShareButtonsClient from "@/components/ShareButtons";
import CompareButtonClient from "@/components/CompareButton";
import ReportModal from "@/components/ReportModal";
import { Listing } from "@/types";
import {
  ShieldCheck,
  MapPin,
  Gauge,
  Calendar,
  Fuel,
  Settings,
  Palette,
  Car,
  Zap,
  Eye,
  Phone,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const SCORE_COLOR = (s: number) =>
  s >= 5 ? "bg-green-500" : s >= 4 ? "bg-blue-500" : s >= 3 ? "bg-yellow-400" : s >= 2 ? "bg-orange-400" : "bg-red-500";
const SCORE_LABEL_RU: Record<number, string> = { 1: "Плохое", 2: "Удовл.", 3: "Среднее", 4: "Хорошее", 5: "Отличное" };

const BODY_LABELS: Record<string, string> = {
  hood: "Капот", roof: "Крыша", frontBumper: "Пер. бампер", rearBumper: "Задн. бампер",
  trunkLid: "Крышка багаж.", frontLeftDoor: "Пер. лев. дверь", frontRightDoor: "Пер. прав. дверь",
  rearLeftDoor: "Задн. лев. дверь", rearRightDoor: "Задн. прав. дверь",
  frontLeftFender: "Пер. лев. крыло", frontRightFender: "Пер. прав. крыло",
};

type ReportType = {
  engine: number; transmission: number; suspension: number;
  brakes: number; electrical: number; interior: number; tires: number;
  bodyPanels: Record<string, number>;
  hasAccident: boolean; accidentDetails?: string | null;
  mileageVerified: boolean; inspectorNotes: string;
  inspectorName: string; inspectedAt: string;
};

function InspectionReportBlock({ report, locale }: { report: ReportType; locale: string }) {
  const isRu = locale === "ru";
  const components = [
    { key: "engine", label: isRu ? "Двигатель" : "Dvigatel" },
    { key: "transmission", label: isRu ? "КПП" : "Uzatmalar qutisi" },
    { key: "suspension", label: isRu ? "Подвеска" : "Osma" },
    { key: "brakes", label: isRu ? "Тормоза" : "Tormozlar" },
    { key: "electrical", label: isRu ? "Электрика" : "Elektr tizimi" },
    { key: "interior", label: isRu ? "Салон" : "Salon" },
    { key: "tires", label: isRu ? "Шины/диски" : "Shinalar" },
  ];

  const overallScore = Math.round(
    components.reduce((sum, c) => sum + (report[c.key as keyof ReportType] as number), 0) / components.length * 20
  );

  return (
    <div className="bg-white rounded-xl border border-blue-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-white" />
          <div className="text-white font-semibold">
            {isRu ? "Отчёт проверки Mashina.uz" : "Mashina.uz tekshiruv hisoboti"}
          </div>
        </div>
        <div className="text-right">
          <div className="text-white font-bold text-lg">{overallScore}/100</div>
          <div className="text-blue-200 text-xs">
            {isRu ? "Общая оценка" : "Umumiy baho"}
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Overall score bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{isRu ? "Общее состояние" : "Umumiy holat"}</span>
            <span className="font-semibold text-gray-900">{overallScore}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${overallScore >= 80 ? "bg-green-500" : overallScore >= 60 ? "bg-blue-500" : overallScore >= 40 ? "bg-yellow-400" : "bg-red-500"}`}
              style={{ width: `${overallScore}%` }}
            />
          </div>
        </div>

        {/* Component scores */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {isRu ? "Состояние узлов" : "Tugunlar holati"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {components.map((c) => {
              const score = report[c.key as keyof ReportType] as number;
              return (
                <div key={c.key} className="flex items-center gap-3">
                  <div className="w-24 text-xs text-gray-600 flex-shrink-0">{c.label}</div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${SCORE_COLOR(score)}`}
                      style={{ width: `${score * 20}%` }}
                    />
                  </div>
                  <div className="text-xs font-medium text-gray-500 w-14 text-right">
                    {SCORE_LABEL_RU[score]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Body panels */}
        {Object.keys(report.bodyPanels).length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {isRu ? "Состояние кузова" : "Kuzov holati"}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(report.bodyPanels).map(([key, score]) => (
                <div key={key} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <span className="text-xs text-gray-600">{BODY_LABELS[key] ?? key}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((v) => (
                      <div
                        key={v}
                        className={`w-2 h-2 rounded-full ${v <= score ? SCORE_COLOR(score) : "bg-gray-200"}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Accident + mileage */}
        <div className="flex flex-wrap gap-3">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${report.hasAccident ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600"}`}>
            {report.hasAccident ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            {isRu
              ? report.hasAccident ? "Следы ДТП обнаружены" : "Следов ДТП нет"
              : report.hasAccident ? "Avaria izlari topildi" : "Avaria izlari yo'q"}
          </div>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${report.mileageVerified ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
            <CheckCircle2 className="w-4 h-4" />
            {isRu
              ? report.mileageVerified ? "Пробег подтверждён" : "Пробег не подтверждён"
              : report.mileageVerified ? "Yurish tasdiqlangan" : "Yurish tasdiqlanmagan"}
          </div>
        </div>

        {report.hasAccident && report.accidentDetails && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-sm text-red-700">
            <strong>{isRu ? "Детали ДТП:" : "Avaria tafsilotlari:"}</strong> {report.accidentDetails}
          </div>
        )}

        {report.inspectorNotes && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-semibold text-gray-500 mb-1">
              {isRu ? "Заметки инспектора" : "Inspektor izohlari"}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">{report.inspectorNotes}</p>
          </div>
        )}

        <div className="text-xs text-gray-400 flex items-center justify-between pt-2 border-t border-gray-100">
          <span>
            {isRu ? "Инспектор:" : "Inspektor:"} <span className="text-gray-600">{report.inspectorName}</span>
          </span>
          <span>
            {new Date(report.inspectedAt).toLocaleDateString(isRu ? "ru-RU" : "uz-UZ")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations("listing");

  const raw = await prisma.listing.findUnique({
    where: { id: parseInt(id) },
    include: { inspectionReport: true },
  });

  if (!raw || !raw.isActive || raw.status !== "active") notFound();

  const listing: Listing = {
    ...raw,
    images: JSON.parse(raw.images || "[]"),
    createdAt: raw.createdAt.toISOString(),
    updatedAt: raw.updatedAt.toISOString(),
  };

  const inspectionReport = raw.inspectionReport
    ? {
        ...raw.inspectionReport,
        bodyPanels: JSON.parse(raw.inspectionReport.bodyPanels || "{}") as Record<string, number>,
        inspectedAt: raw.inspectionReport.inspectedAt.toISOString(),
      }
    : null;

  // Similar listings
  const similarRaw = await prisma.listing.findMany({
    where: {
      isActive: true,
      status: "active",
      brand: listing.brand,
      NOT: { id: listing.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const similar: Listing[] = similarRaw.map((l) => ({
    ...l,
    images: JSON.parse(l.images || "[]"),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  const specs = [
    { icon: Calendar, label: t("year"), value: listing.year.toString() },
    {
      icon: Gauge,
      label: t("mileage"),
      value: `${listing.mileage.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} ${t("km")}`,
    },
    { icon: Fuel, label: t("fuel"), value: listing.fuelType },
    { icon: Settings, label: t("transmission"), value: listing.transmission },
    { icon: Palette, label: t("color"), value: listing.color },
    { icon: Car, label: t("body"), value: listing.bodyType },
    {
      icon: Zap,
      label: t("engine"),
      value: `${listing.engineVolume} ${t("liters")}`,
    },
    { icon: Car, label: t("drive"), value: listing.driveType },
  ];

  const dateStr = new Date(listing.createdAt).toLocaleDateString(
    locale === "ru" ? "ru-RU" : "uz-UZ",
    { day: "numeric", month: "long", year: "numeric" }
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.images.map((img: string) => img.startsWith("http") ? img : `${BASE}${img}`),
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "UZS",
      availability: "https://schema.org/InStock",
      url: `${BASE}/${locale}/listings/${listing.id}`,
    },
    brand: { "@type": "Brand", name: listing.brand },
  };

  return (
    <>
      <ViewTracker listingId={listing.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Gallery + specs */}
            <div className="lg:col-span-2 space-y-6">
              <ImageGallery
                images={listing.images}
                alt={listing.title}
                brand={listing.brand}
                model={listing.model}
              />

              {/* Title & price (mobile) */}
              <div className="lg:hidden">
                <h1 className="text-2xl font-bold text-gray-900">
                  {listing.title}
                </h1>
                <div className="text-3xl font-bold text-blue-600 mt-2">
                  {listing.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} {t("sum")}
                </div>
              </div>

              {/* Specs grid */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">{t("specs")}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {specs.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="text-center">
                      <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                        <Icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-xs text-gray-500">{label}</div>
                      <div className="text-sm font-semibold text-gray-900 mt-0.5">
                        {value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="font-semibold text-gray-900 mb-3">
                    {t("description")}
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {listing.description}
                  </p>
                </div>
              )}

              {/* Inspection Report */}
              {inspectionReport && (
                <InspectionReportBlock report={inspectionReport} locale={locale} />
              )}
            </div>

            {/* Right: Price + contact */}
            <div className="space-y-5">
              {/* Title & Price */}
              <div className="hidden lg:block bg-white rounded-xl border border-gray-200 p-6">
                <h1 className="text-xl font-bold text-gray-900">
                  {listing.title}
                </h1>
                <div className="text-3xl font-bold text-blue-600 mt-3">
                  {listing.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} {t("sum")}
                </div>
                {(() => {
                  const ph = JSON.parse((raw as { priceHistory?: string }).priceHistory || "[]") as { price: number; date: string }[];
                  if (ph.length === 0) return null;
                  const oldest = ph[0];
                  const diff = oldest.price - listing.price;
                  if (diff <= 0) return null;
                  const pct = Math.round((diff / oldest.price) * 100);
                  return (
                    <div className="inline-flex items-center gap-1.5 mt-1 bg-green-50 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      ↓ {locale === "ru" ? `Цена снижена на ${pct}%` : `Narx ${pct}% pastladi`}
                    </div>
                  );
                })()}
                <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-2">
                  <MapPin className="w-4 h-4" />
                  {listing.city}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-2">
                  <span>
                    <Eye className="w-3.5 h-3.5 inline mr-1" />
                    {listing.views} {t("views")}
                  </span>
                  <span>
                    {t("postedOn")} {dateStr}
                  </span>
                </div>
              </div>

              {/* Seller */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">
                  {t("contact")}
                </h2>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold">
                    {listing.sellerName[0]?.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900">{listing.sellerName}</div>
                    {raw.userId ? (
                      <a
                        href={`/${locale}/sellers/${raw.userId}`}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        {locale === "ru" ? "Все объявления продавца →" : "Barcha e'lonlar →"}
                      </a>
                    ) : (
                      <div className="text-xs text-gray-500">
                        {locale === "ru" ? "Частное лицо" : "Jismoniy shaxs"}
                      </div>
                    )}
                  </div>
                </div>
                <a
                  href={`tel:${listing.sellerPhone}`}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  {listing.sellerPhone}
                </a>
                <p className="text-xs text-center text-gray-400 mt-2">
                  {t("callSeller")}
                </p>
                <div className="mt-3 flex justify-center">
                  <ReportModal listingId={listing.id} locale={locale} />
                </div>
              </div>

              {/* Verified badge */}
              {listing.isVerified && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <div className="text-sm font-semibold text-blue-700">
                      {locale === "ru" ? "Проверено сайтом" : "Sayt tomonidan tekshirilgan"}
                    </div>
                    <div className="text-xs text-blue-500">
                      {locale === "ru"
                        ? "Это объявление проверено командой Mashina.uz"
                        : "Ushbu e'lon Mashina.uz jamoasi tomonidan tekshirilgan"}
                    </div>
                  </div>
                </div>
              )}

              {/* Condition badge */}
              <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${listing.condition === "new" ? "bg-green-500" : "bg-amber-500"}`}
                />
                <span className="text-sm font-medium text-gray-700">
                  {t("condition")}:{" "}
                  <span className="text-gray-900">
                    {listing.condition === "new" ? t("new") : t("used")}
                  </span>
                </span>
              </div>

              {/* Share + Compare buttons */}
              <ShareButtonsClient
                title={listing.title}
                price={listing.price}
                locale={locale}
              />
              <CompareButtonClient listingId={listing.id} locale={locale} />

              {/* Loan Calculator + Recently Viewed tracker */}
              <ListingDetailClient
                listingId={listing.id}
                price={listing.price}
                locale={locale}
              />
            </div>
          </div>

          {/* Similar listings */}
          {similar.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-bold text-gray-900 mb-5">
                {t("similar")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {similar.map((l) => (
                  <ListingCard key={l.id} listing={l} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

