"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { MapPin, Gauge, Calendar, Fuel, Heart, ShieldCheck } from "lucide-react";
import { Listing } from "@/types";
import { useFavorites } from "@/hooks/useFavorites";

interface ListingCardProps {
  listing: Listing;
  priceBadge?: "low" | "fair" | "high" | null;
}

const BADGE_CONFIG = {
  low: { label: "🔥 Ниже рынка", cls: "bg-green-100 text-green-700" },
  fair: { label: "✓ Хорошая цена", cls: "bg-blue-100 text-blue-700" },
  high: { label: "↑ Выше рынка", cls: "bg-orange-100 text-orange-700" },
};

function getAgeBadge(createdAt: string, locale: string): string | null {
  const diff = Date.now() - new Date(createdAt).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return locale === "ru" ? "Сегодня" : "Bugun";
  if (days === 1) return locale === "ru" ? "Вчера" : "Kecha";
  if (days < 7) return locale === "ru" ? `${days} дн. назад` : `${days} kun oldin`;
  return null;
}

export default function ListingCard({ listing, priceBadge }: ListingCardProps) {
  const t = useTranslations("listing");
  const locale = useLocale();
  const { isFav, toggle } = useFavorites();
  const fav = isFav(listing.id);

  const imageUrl =
    listing.images[0] ||
    `https://placehold.co/400x280/e2e8f0/64748b?text=${encodeURIComponent(listing.brand + " " + listing.model)}`;

  const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const formattedPrice = fmt(listing.price);
  const badge = priceBadge ? BADGE_CONFIG[priceBadge] : null;
  const ageBadge = getAgeBadge(listing.createdAt, locale);

  return (
    <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md hover:border-blue-300 transition-all group">
      {/* Favorite button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggle(listing.id);
        }}
        className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
        aria-label="Избранное"
      >
        <Heart
          className={`w-4 h-4 transition-colors ${fav ? "fill-red-500 text-red-500" : "text-gray-400"}`}
        />
      </button>

      <Link href={`/${locale}/listings/${listing.id}`} className="block">
        {/* Image */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          <img
            src={imageUrl}
            alt={`${listing.brand} ${listing.model} ${listing.year}`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://placehold.co/400x280/e2e8f0/64748b?text=${encodeURIComponent(listing.brand + " " + listing.model)}`;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {listing.condition === "new" && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {t("new")}
            </span>
          )}
          {listing.condition !== "new" && ageBadge && (
            <span className="absolute top-2 left-2 bg-gray-900/70 text-white text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
              {ageBadge}
            </span>
          )}
          {listing.isVerified && (
            <span className="absolute bottom-2 left-2 flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
              <ShieldCheck className="w-3 h-3" />
              {locale === "ru" ? "Проверено" : "Tekshirilgan"}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1 group-hover:text-blue-600 transition-colors">
            {listing.title}
          </h3>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl font-bold text-blue-600">
              {formattedPrice} {t("sum")}
            </span>
            {badge && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.cls}`}>
                {badge.label}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{listing.year}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{fmt(listing.mileage)} {t("km")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Fuel className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{listing.fuelType}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{listing.city}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
