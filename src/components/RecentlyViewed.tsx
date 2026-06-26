"use client";

import { useEffect, useState } from "react";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import ListingCard from "@/components/ListingCard";
import { Listing } from "@/types";
import { Clock } from "lucide-react";

export default function RecentlyViewed({ locale }: { locale: string }) {
  const { ids } = useRecentlyViewed();
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (ids.length === 0) return;
    fetch(`/api/listings/batch?ids=${ids.join(",")}`)
      .then((r) => r.json())
      .then((data: Listing[]) => {
        // preserve order of ids
        const map = new Map(data.map((l) => [l.id, l]));
        setListings(ids.map((id) => map.get(id)).filter(Boolean) as Listing[]);
      });
  }, [ids.join(",")]);

  if (listings.length === 0) return null;

  const title = locale === "ru" ? "Недавно просмотренные" : "Yaqinda ko'rilgan";

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center gap-2 mb-5">
        <Clock className="w-5 h-5 text-gray-400" />
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {listings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    </section>
  );
}
