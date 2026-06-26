import React from "react";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import FiltersPanel from "@/components/FiltersPanel";
import MobileFiltersDrawer from "@/components/MobileFiltersDrawer";
import SaveSearchButton from "@/components/SaveSearchButton";
import QuickFilters from "@/components/QuickFilters";
import { Listing } from "@/types";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SearchParams {
  [key: string]: string | undefined;
  brand?: string;
  model?: string;
  yearFrom?: string;
  yearTo?: string;
  priceFrom?: string;
  priceTo?: string;
  mileageFrom?: string;
  mileageTo?: string;
  city?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  driveType?: string;
  engineFrom?: string;
  engineTo?: string;
  color?: string;
  condition?: string;
  isVerified?: string;
  sort?: string;
  page?: string;
}

const PAGE_SIZE = 12;

export default async function ListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations("listing");
  const tf = await getTranslations("filters");

  const page = parseInt(sp.page || "1");
  const sort = sp.sort || "newest";

  const where: Record<string, unknown> = { isActive: true, status: "active" };
  if (sp.brand)        where.brand        = sp.brand;
  if (sp.model)        where.model        = { contains: sp.model };
  if (sp.city)         where.city         = sp.city;
  if (sp.bodyType)     where.bodyType     = sp.bodyType;
  if (sp.fuelType)     where.fuelType     = sp.fuelType;
  if (sp.transmission) where.transmission = sp.transmission;
  if (sp.driveType)    where.driveType    = sp.driveType;
  if (sp.color)        where.color        = sp.color;
  if (sp.condition)    where.condition    = sp.condition;
  if (sp.isVerified === "true") where.isVerified = true;
  if (sp.yearFrom || sp.yearTo) {
    where.year = {};
    if (sp.yearFrom) (where.year as Record<string, unknown>).gte = parseInt(sp.yearFrom);
    if (sp.yearTo)   (where.year as Record<string, unknown>).lte = parseInt(sp.yearTo);
  }
  if (sp.priceFrom || sp.priceTo) {
    where.price = {};
    if (sp.priceFrom) (where.price as Record<string, unknown>).gte = parseInt(sp.priceFrom);
    if (sp.priceTo)   (where.price as Record<string, unknown>).lte = parseInt(sp.priceTo);
  }
  if (sp.mileageFrom || sp.mileageTo) {
    where.mileage = {};
    if (sp.mileageFrom) (where.mileage as Record<string, unknown>).gte = parseInt(sp.mileageFrom);
    if (sp.mileageTo)   (where.mileage as Record<string, unknown>).lte = parseInt(sp.mileageTo);
  }
  if (sp.engineFrom || sp.engineTo) {
    where.engineVolume = {};
    if (sp.engineFrom) (where.engineVolume as Record<string, unknown>).gte = parseFloat(sp.engineFrom);
    if (sp.engineTo)   (where.engineVolume as Record<string, unknown>).lte = parseFloat(sp.engineTo);
  }

  const orderBy =
    sort === "priceAsc"
      ? { price: "asc" as const }
      : sort === "priceDesc"
      ? { price: "desc" as const }
      : { createdAt: "desc" as const };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
  ]);

  const parsedListings: Listing[] = listings.map((l) => ({
    ...l,
    images: JSON.parse(l.images || "[]"),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  // Compute price badges — one query per unique brand (not per listing)
  const uniqueBrands = [...new Set(listings.map((l) => l.brand))];
  const avgByKey: Record<string, number> = {};
  if (uniqueBrands.length > 0) {
    const peerRows = await prisma.listing.findMany({
      where: { brand: { in: uniqueBrands }, isActive: true, status: "active" },
      select: { brand: true, price: true },
      take: 2000,
    });
    const pricesByBrand: Record<string, number[]> = {};
    for (const r of peerRows) {
      (pricesByBrand[r.brand] ||= []).push(r.price);
    }
    for (const l of listings) {
      const prices = pricesByBrand[l.brand] || [];
      if (prices.length >= 2) {
        avgByKey[`${l.brand}||${l.model}`] = prices.reduce((s, p) => s + p, 0) / prices.length;
      }
    }
  }

  const priceBadges: Record<number, "low" | "fair" | "high"> = {};
  for (const l of listings) {
    const avg = avgByKey[`${l.brand}||${l.model}`];
    if (!avg) continue;
    const ratio = l.price / avg;
    priceBadges[l.id] = ratio < 0.92 ? "low" : ratio > 1.08 ? "high" : "fair";
  }

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const FILTER_KEYS = ["brand", "model", "yearFrom", "yearTo", "priceFrom", "priceTo", "mileageFrom", "mileageTo", "city", "bodyType", "fuelType", "transmission", "driveType", "engineFrom", "engineTo", "color", "condition", "isVerified"];
  const activeFilterCount = FILTER_KEYS.filter((k) => sp[k]).length;

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams(sp as Record<string, string>);
    params.set("page", String(p));
    return `/${locale}/listings?${params.toString()}`;
  };

  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex gap-6">
            {/* Sidebar filters */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <FiltersPanel currentFilters={sp} locale={locale} />
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              {/* Quick filters */}
              <div className="mb-4">
                <QuickFilters locale={locale} currentFilters={sp} />
              </div>

              {/* Header bar */}
              <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {sp.brand ? sp.brand : locale === "ru" ? "Все автомобили" : "Barcha avtomobillar"}
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {total} {locale === "ru" ? "объявлений" : "e'lon"}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <MobileFiltersDrawer currentFilters={sp} locale={locale} activeCount={activeFilterCount} />
                  {activeFilterCount > 0 && (
                    <SaveSearchButton
                      filters={new URLSearchParams(Object.fromEntries(Object.entries(sp).filter(([,v]) => v)) as Record<string, string>).toString()}
                      locale={locale}
                    />
                  )}

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 hidden sm:block">{tf("sortBy")}:</span>
                  <div className="flex gap-1">
                    {[
                      { key: "newest", label: tf("newest") },
                      { key: "priceAsc", label: tf("priceAsc") },
                      { key: "priceDesc", label: tf("priceDesc") },
                    ].map((s) => {
                      const params = new URLSearchParams(sp as Record<string, string>);
                      params.set("sort", s.key);
                      params.delete("page");
                      return (
                        <Link
                          key={s.key}
                          href={`/${locale}/listings?${params.toString()}`}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            sort === s.key
                              ? "bg-blue-600 text-white"
                              : "bg-white border border-gray-200 text-gray-600 hover:border-blue-400"
                          }`}
                        >
                          {s.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
                </div>
              </div>

              {/* Listing grid */}
              {parsedListings.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {parsedListings.map((listing) => (
                      <ListingCard key={listing.id} listing={listing} priceBadge={priceBadges[listing.id] ?? null} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                      <Link
                        href={buildPageUrl(page - 1)}
                        aria-disabled={page <= 1}
                        className={`p-2 rounded-lg border border-gray-200 transition-colors ${
                          page <= 1
                            ? "pointer-events-none opacity-40"
                            : "hover:border-blue-400"
                        }`}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Link>

                      {(() => {
                        const visible = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
                          (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2
                        );
                        const items: React.ReactNode[] = [];
                        visible.forEach((p, idx) => {
                          if (idx > 0 && visible[idx - 1] !== p - 1) {
                            items.push(
                              <span key={`ellipsis-${p}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm select-none">
                                …
                              </span>
                            );
                          }
                          items.push(
                            <Link
                              key={p}
                              href={buildPageUrl(p)}
                              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                                p === page
                                  ? "bg-blue-600 text-white"
                                  : "border border-gray-200 hover:border-blue-400 text-gray-700"
                              }`}
                            >
                              {p}
                            </Link>
                          );
                        });
                        return items;
                      })()}

                      <Link
                        href={buildPageUrl(page + 1)}
                        aria-disabled={page >= totalPages}
                        className={`p-2 rounded-lg border border-gray-200 transition-colors ${
                          page >= totalPages
                            ? "pointer-events-none opacity-40"
                            : "hover:border-blue-400"
                        }`}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-20 text-gray-400">
                  <div className="text-5xl mb-4">🔍</div>
                  <p className="text-lg font-medium text-gray-700 mb-2">{t("noListings")}</p>
                  <p className="text-sm text-gray-400 mb-6">
                    {locale === "ru" ? "Попробуйте изменить фильтры или сбросить поиск" : "Filtrlarni o'zgartirib ko'ring"}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Link
                      href={`/${locale}/listings`}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      {locale === "ru" ? "Сбросить фильтры" : "Filtrlarni tozalash"}
                    </Link>
                    <Link
                      href={`/${locale}/sell`}
                      className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      {locale === "ru" ? "Разместить объявление" : "E'lon joylash"}
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
