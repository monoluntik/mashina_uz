import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import SearchForm from "@/components/SearchForm";
import RecentlyViewed from "@/components/RecentlyViewed";
import { Listing } from "@/types";
import { CheckCircle, Phone, TrendingUp } from "lucide-react";

const POPULAR_BRANDS = [
  { name: "Chevrolet", emoji: "🚗" },
  { name: "Toyota", emoji: "🚙" },
  { name: "Hyundai", emoji: "🚘" },
  { name: "Kia", emoji: "🏎️" },
  { name: "Daewoo", emoji: "🚗" },
  { name: "Nexia", emoji: "🚙" },
  { name: "BMW", emoji: "🏎️" },
  { name: "Mercedes-Benz", emoji: "🚘" },
  { name: "Audi", emoji: "🚗" },
  { name: "Honda", emoji: "🚙" },
  { name: "Lada", emoji: "🚗" },
  { name: "BYD", emoji: "⚡" },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("home");
  const tHero = await getTranslations("hero");
  const tListing = await getTranslations("listing");

  const recentListings = await prisma.listing.findMany({
    where: { isActive: true, status: "active" },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const totalListings = await prisma.listing.count({ where: { isActive: true, status: "active" } });

  const parsedListings: Listing[] = recentListings.map((l) => ({
    ...l,
    images: JSON.parse(l.images || "[]"),
    createdAt: l.createdAt.toISOString(),
    updatedAt: l.updatedAt.toISOString(),
  }));

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-800 text-white py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight">
              {tHero("title")}
            </h1>
            <p className="text-blue-100 text-lg mb-10">
              {tHero("subtitle")}
            </p>
            <SearchForm />
          </div>
        </section>

        {/* Stats */}
        <section className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600">
                  {totalListings.toLocaleString()}+
                </div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {t("stats.listings")}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">25+</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {t("stats.brands")}
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">15</div>
                <div className="text-sm text-gray-500 mt-0.5">
                  {t("stats.cities")}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Listings */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {t("featuredListings")}
            </h2>
            <Link
              href={`/${locale}/listings`}
              className="text-blue-600 font-medium hover:underline text-sm"
            >
              {t("viewAll")} →
            </Link>
          </div>

          {parsedListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {parsedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <p>{tListing("noListings")}</p>
            </div>
          )}
        </section>

        {/* Recently Viewed */}
        <RecentlyViewed locale={locale} />

        {/* Popular Brands */}
        <section className="bg-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {t("popularBrands")}
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {POPULAR_BRANDS.map((brand) => (
                <Link
                  key={brand.name}
                  href={`/${locale}/listings?brand=${encodeURIComponent(brand.name)}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                >
                  <span className="text-2xl">{brand.emoji}</span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 text-center leading-tight">
                    {brand.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            {t("howItWorks")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                {t("step1Title")}
              </h3>
              <p className="text-gray-500 text-sm">{t("step1Desc")}</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                {t("step2Title")}
              </h3>
              <p className="text-gray-500 text-sm">{t("step2Desc")}</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">
                {t("step3Title")}
              </h3>
              <p className="text-gray-500 text-sm">{t("step3Desc")}</p>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-blue-600 py-12 px-4">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-3xl font-bold mb-3">
              {locale === "ru"
                ? "Продайте свой автомобиль быстро"
                : "Avtomobilingizni tez soting"}
            </h2>
            <p className="text-blue-100 mb-6">
              {locale === "ru"
                ? "Разместите бесплатное объявление и получайте звонки уже сегодня"
                : "Bepul e'lon joylashtiring va bugunoq qo'ng'iroqlar oling"}
            </p>
            <Link
              href={`/${locale}/sell`}
              className="inline-block bg-white text-blue-600 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors"
            >
              {locale === "ru" ? "Подать объявление" : "E'lon berish"}
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
