"use client";

import { useEffect, useState } from "react";
import { useFavorites } from "@/hooks/useFavorites";
import ListingCard from "@/components/ListingCard";
import { Listing } from "@/types";
import { Heart } from "lucide-react";
import Link from "next/link";

export default function FavoritesClient({ locale }: { locale: string }) {
  const { ids } = useFavorites();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false);
      return;
    }
    fetch(`/api/listings/batch?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data) => setListings(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ids.join(",")]);

  const title = locale === "ru" ? "Избранное" : "Sevimlilar";
  const empty =
    locale === "ru"
      ? "Вы ещё не добавили объявлений в избранное"
      : "Siz hali hech qanday e'lon qo'shmagansiz";
  const browse = locale === "ru" ? "Смотреть объявления" : "E'lonlarni ko'rish";

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Heart className="w-6 h-6 text-red-500 fill-red-500" />
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {ids.length > 0 && (
          <span className="bg-red-100 text-red-600 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {ids.length}
          </span>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-20">
          <Heart className="w-14 h-14 text-gray-200 mx-auto mb-4" />
          <p className="text-gray-500 mb-5">{empty}</p>
          <Link
            href={`/${locale}/listings`}
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            {browse}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
